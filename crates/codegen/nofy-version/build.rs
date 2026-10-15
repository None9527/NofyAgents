#[path = "build_support.rs"]
mod build_support;

fn main() {
    build_support::emit(false);
}
