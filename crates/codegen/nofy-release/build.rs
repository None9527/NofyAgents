fn main() {
    println!(
        "cargo:rustc-env=NOFY_RELEASE_HOST={}",
        std::env::var("TARGET").unwrap()
    );
}
