//! Reusable source packages. Acquisition and execution are separate host work.
mod compose;
mod files;
mod package;
mod store;
pub use compose::verify_package_sources;
pub use compose::{Import, imports, package_file, resolve_reference, unuse_package, use_package};
pub(crate) use compose::{expand_cached, imported_factory, imported_modules};
pub use files::{
    RepositoryIndex, load_package_directory, load_repository_directory, package_from_reader,
};
pub(crate) use package::parameter_validator;
pub use package::{PackageManifest, PackageView, RepositoryOrigin, RepositoryView, is_expression};
pub use store::ModuleStore;
