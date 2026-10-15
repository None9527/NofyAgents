use anyhow::{Context, Result, bail, ensure};
use nofy_release::{
    artifact, version,
    workspace::{Workspace, apply_changes},
};
use std::path::PathBuf;

struct Args(Vec<String>);
impl Args {
    fn flag(&mut self, name: &str) -> bool {
        if let Some(i) = self.0.iter().position(|v| v == name) {
            self.0.remove(i);
            true
        } else {
            false
        }
    }
    fn value(&mut self, name: &str) -> Result<Option<String>> {
        if let Some(i) = self.0.iter().position(|v| v == name) {
            self.0.remove(i);
            ensure!(
                i < self.0.len() && !self.0[i].starts_with("--"),
                "{name} needs a value"
            );
            Ok(Some(self.0.remove(i)))
        } else {
            Ok(None)
        }
    }
    fn required(&mut self, name: &str) -> Result<String> {
        self.value(name)?.with_context(|| format!("missing {name}"))
    }
    fn finish(self) -> Result<()> {
        ensure!(self.0.is_empty(), "unexpected arguments: {:?}", self.0);
        Ok(())
    }
}

fn run() -> Result<()> {
    let mut raw: Vec<String> = std::env::args().skip(1).collect();
    if raw.is_empty() || raw == ["--help"] {
        println!(
            "nofy-release check [--root PATH]\nnofy-release compare CURRENT CANDIDATE\nnofy-release bump revision|baseline [--version V --commit SHA] --notes TEXT [--apply] [--root PATH]\nnofy-release package --out DIR [--binary PATH] [--profile dev|release] [--snapshot --allow-dirty] [--root PATH]\nnofy-release verify --manifest PATH\nnofy-release install --manifest PATH --dest PATH [--reinstall]"
        );
        return Ok(());
    }
    let command = raw.remove(0);
    let mut args = Args(raw);
    match command.as_str() {
        "compare" => {
            ensure!(args.0.len() == 2, "compare requires CURRENT CANDIDATE");
            let order =
                version::compare_versions(&args.0[0], &args.0[1]).map_err(anyhow::Error::msg)?;
            println!(
                "{}",
                match order {
                    std::cmp::Ordering::Less => "newer",
                    std::cmp::Ordering::Equal => "equal",
                    std::cmp::Ordering::Greater => "older",
                }
            );
        }
        "verify" | "install" => {
            let manifest = PathBuf::from(args.required("--manifest")?);
            if command == "verify" {
                args.finish()?;
                artifact::verify(&manifest)?;
                println!("verified");
            } else {
                let dest = PathBuf::from(args.required("--dest")?);
                let reinstall = args.flag("--reinstall");
                args.finish()?;
                let backup = artifact::install(&manifest, &dest, reinstall)?;
                println!("installed {}", dest.display());
                if let Some(backup) = backup {
                    println!("backup {}", backup.display());
                }
            }
        }
        "check" | "bump" | "package" => {
            let start = args
                .value("--root")?
                .map(PathBuf::from)
                .unwrap_or(std::env::current_dir()?);
            let ws = Workspace::discover(&start)?;
            if command == "check" {
                args.finish()?;
                println!("{}: consistent", ws.check()?.version);
            } else if command == "bump" {
                ensure!(!args.0.is_empty(), "bump requires revision or baseline");
                let kind = args.0.remove(0);
                let baseline = if kind == "baseline" {
                    Some((args.required("--version")?, args.required("--commit")?))
                } else {
                    ensure!(kind == "revision", "unknown bump kind");
                    None
                };
                let notes = args.required("--notes")?;
                let apply = args.flag("--apply");
                args.finish()?;
                let changes = ws.plan_bump(
                    baseline.as_ref().map(|(v, c)| (v.as_str(), c.as_str())),
                    &notes,
                )?;
                for change in &changes {
                    println!("{}", change.path.strip_prefix(&ws.root)?.display());
                }
                println!(
                    "new metadata:\n{}",
                    String::from_utf8_lossy(&changes[0].after)
                );
                if apply {
                    apply_changes(&changes)?;
                    ws.check()?;
                    println!("applied");
                } else {
                    println!("preview only; pass --apply to write");
                }
            } else {
                let out = PathBuf::from(args.required("--out")?);
                let binary = args.value("--binary")?.map(PathBuf::from);
                let profile = args.value("--profile")?.unwrap_or_else(|| "release".into());
                let snapshot = args.flag("--snapshot");
                let allow_dirty = args.flag("--allow-dirty");
                args.finish()?;
                println!(
                    "{}",
                    artifact::package(
                        &ws,
                        binary.as_deref(),
                        &out,
                        &profile,
                        snapshot,
                        allow_dirty
                    )?
                    .display()
                );
            }
        }
        _ => bail!("unknown command; use --help"),
    }
    Ok(())
}

fn main() {
    if let Err(error) = run() {
        eprintln!("nofy-release: {error:#}");
        std::process::exit(1);
    }
}
