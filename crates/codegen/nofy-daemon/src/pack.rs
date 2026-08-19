//! Pack composition (FR10, DS-P2/DS-P4): the types and validation live
//! in `nofy-packcore` since integration batch Q0a (the shared base that
//! breaks the core→daemon dependency cycle). This module is a re-export:
//! every existing `nofy_daemon::pack::*` call site keeps working.

pub use nofy_packcore::*;
