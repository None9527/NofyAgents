//! Bounds-checked ELF64 dynamic dependency inventory; never executes a source.
use super::*;
fn bytes(data: &[u8], offset: u64, size: u64) -> Result<&[u8]> {
    let end = offset
        .checked_add(size)
        .filter(|end| *end <= data.len() as u64)
        .ok_or_else(|| invalid("ELF range exceeds file"))?;
    Ok(&data[offset as usize..end as usize])
}
fn u64_at(data: &[u8], offset: u64) -> Result<u64> {
    Ok(u64::from_le_bytes(
        bytes(data, offset, 8)?.try_into().unwrap(),
    ))
}
pub(super) fn needed(data: &[u8]) -> Result<Vec<String>> {
    if !data.starts_with(b"\x7fELF") {
        return Ok(Vec::new());
    }
    if data.len() < 64 || data[4] != 2 || data[5] != 1 {
        return Err(invalid("image contains incompatible ELF format"));
    }
    let kind = u16::from_le_bytes([data[16], data[17]]);
    if kind == 1 {
        return Ok(Vec::new());
    }
    elf(data, false)?;
    let offset = u64_at(data, 32)?;
    let stride = u16::from_le_bytes([data[54], data[55]]) as u64;
    let count = u16::from_le_bytes([data[56], data[57]]) as u64;
    let mut segments = Vec::new();
    let mut dynamic = None;
    for index in 0..count {
        // The program header table offset comes from the untrusted image, so
        // every derived address is checked like the rest of this parser.
        let header = index
            .checked_mul(stride)
            .and_then(|delta| offset.checked_add(delta))
            .ok_or_else(|| invalid("ELF program header offset overflow"))?;
        let field = |delta: u64| {
            header
                .checked_add(delta)
                .ok_or_else(|| invalid("ELF program header offset overflow"))
        };
        let kind = u32::from_le_bytes(bytes(data, header, 4)?.try_into().unwrap());
        let file_offset = u64_at(data, field(8)?)?;
        let virtual_address = u64_at(data, field(16)?)?;
        let size = u64_at(data, field(32)?)?;
        if kind == 1 {
            segments.push((virtual_address, file_offset, size));
        }
        if kind == 2 {
            dynamic = Some(bytes(data, file_offset, size)?);
        }
    }
    let Some(dynamic) = dynamic else {
        return Ok(Vec::new());
    };
    if dynamic.len() % 16 != 0 || dynamic.len() > 1024 * 1024 {
        return Err(invalid("invalid ELF dynamic section"));
    }
    let mut string_address = None;
    let mut string_size = None;
    let mut required = Vec::new();
    let mut terminated = false;
    for entry in dynamic.chunks_exact(16) {
        let tag = u64::from_le_bytes(entry[..8].try_into().unwrap());
        let value = u64::from_le_bytes(entry[8..].try_into().unwrap());
        match tag {
            0 => {
                terminated = true;
                break;
            }
            1 => required.push(value),
            5 => string_address = Some(value),
            10 => string_size = Some(value),
            _ => {}
        }
    }
    if !terminated || required.len() > 256 {
        return Err(invalid("invalid ELF dynamic dependency table"));
    }
    if required.is_empty() {
        return Ok(Vec::new());
    }
    let address = string_address.ok_or_else(|| invalid("ELF string table missing"))?;
    let size = string_size
        .filter(|size| *size <= 16 * 1024 * 1024)
        .ok_or_else(|| invalid("ELF string table invalid"))?;
    let offset = segments
        .into_iter()
        .find_map(|(start, offset, len)| {
            let relative = address.checked_sub(start)?;
            if relative.checked_add(size)? <= len {
                offset.checked_add(relative)
            } else {
                None
            }
        })
        .ok_or_else(|| invalid("ELF string table is not file-backed"))?;
    let table = bytes(data, offset, size)?;
    required
        .into_iter()
        .map(|offset| {
            let value = table
                .get(offset as usize..)
                .ok_or_else(|| invalid("ELF dependency string out of range"))?;
            let end = value
                .iter()
                .position(|b| *b == 0)
                .filter(|end| *end > 0 && *end <= 256)
                .ok_or_else(|| invalid("ELF dependency name invalid"))?;
            std::str::from_utf8(&value[..end])
                .map(str::to_owned)
                .map_err(|_| invalid("ELF dependency name is not UTF-8"))
        })
        .collect()
}

#[cfg(test)]
mod overflow_tests {
    use super::*;

    fn image(table_offset: u64, count: u16, stride: u16) -> Vec<u8> {
        let mut data = vec![0u8; 64];
        data[..4].copy_from_slice(b"\x7fELF");
        data[4] = 2;
        data[5] = 1;
        data[16..18].copy_from_slice(&3u16.to_le_bytes());
        data[32..40].copy_from_slice(&table_offset.to_le_bytes());
        data[54..56].copy_from_slice(&stride.to_le_bytes());
        data[56..58].copy_from_slice(&count.to_le_bytes());
        data
    }

    #[test]
    fn hostile_program_header_offsets_are_rejected_without_overflow() {
        // offset + index * stride and the field deltas must not wrap.
        for (offset, count, stride) in [
            (u64::MAX, 2, 56),
            (u64::MAX - 10, 1, 56),
            (u64::MAX - 100, 3, 56),
        ] {
            assert!(
                needed(&image(offset, count, stride)).is_err(),
                "{offset} {count} {stride}"
            );
        }
    }
}
