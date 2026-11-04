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
        let header = offset + index * stride;
        let kind = u32::from_le_bytes(bytes(data, header, 4)?.try_into().unwrap());
        let file_offset = u64_at(data, header + 8)?;
        let virtual_address = u64_at(data, header + 16)?;
        let size = u64_at(data, header + 32)?;
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
