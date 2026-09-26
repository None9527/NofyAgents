//! Channel adapter contract (FR8.6, HM-F12): an extension SLOT, not 22
//! channels.
//!
//! The product does not build every messaging channel; it defines the
//! CONTRACT every channel adapter must satisfy, and registers adapters
//! against it. A channel that cannot state its semantics (inbound
//! normalization, outbound formatting, ack semantics) cannot register.

use std::collections::BTreeMap;

/// Delivery-ack semantics a channel must declare.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AckSemantics {
    /// Redelivers until acknowledged (the ledger discipline).
    AtLeastOnce,
    /// Best effort; no redelivery.
    AtMostOnce,
}

/// The adapter contract descriptor.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ChannelAdapterContract {
    pub channel_id: String,
    /// The adapter normalizes inbound messages to the common shape.
    pub normalizes_inbound: bool,
    /// The adapter formats outbound cards/messages.
    pub formats_outbound: bool,
    pub ack_semantics: AckSemantics,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ContractError {
    EmptyChannelId,
    /// An adapter that neither normalizes nor formats is a no-op — refuse.
    IncompleteContract,
    DuplicateChannel(String),
}

/// The adapter registry (the extension slot).
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct AdapterRegistry {
    adapters: BTreeMap<String, ChannelAdapterContract>,
}

impl AdapterRegistry {
    /// Register an adapter against the contract.
    pub fn register(&mut self, contract: ChannelAdapterContract) -> Result<(), ContractError> {
        if contract.channel_id.trim().is_empty() {
            return Err(ContractError::EmptyChannelId);
        }
        if !contract.normalizes_inbound && !contract.formats_outbound {
            return Err(ContractError::IncompleteContract);
        }
        if self.adapters.contains_key(&contract.channel_id) {
            return Err(ContractError::DuplicateChannel(contract.channel_id));
        }
        self.adapters.insert(contract.channel_id.clone(), contract);
        Ok(())
    }

    pub fn get(&self, channel_id: &str) -> Option<&ChannelAdapterContract> {
        self.adapters.get(channel_id)
    }

    pub fn len(&self) -> usize {
        self.adapters.len()
    }

    pub fn is_empty(&self) -> bool {
        self.adapters.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn contract(id: &str) -> ChannelAdapterContract {
        ChannelAdapterContract {
            channel_id: id.into(),
            normalizes_inbound: true,
            formats_outbound: true,
            ack_semantics: AckSemantics::AtLeastOnce,
        }
    }

    #[test]
    fn complete_contracts_register() {
        let mut registry = AdapterRegistry::default();
        registry.register(contract("slack")).unwrap();
        assert_eq!(registry.len(), 1);
        assert_eq!(
            registry.get("slack").unwrap().ack_semantics,
            AckSemantics::AtLeastOnce
        );
    }

    #[test]
    fn no_op_adapters_refused() {
        let mut registry = AdapterRegistry::default();
        let noop = ChannelAdapterContract {
            channel_id: "noop".into(),
            normalizes_inbound: false,
            formats_outbound: false,
            ack_semantics: AckSemantics::AtMostOnce,
        };
        assert_eq!(
            registry.register(noop),
            Err(ContractError::IncompleteContract)
        );
        assert!(registry.is_empty());
    }

    #[test]
    fn one_direction_is_enough() {
        let mut registry = AdapterRegistry::default();
        let outbound_only = ChannelAdapterContract {
            channel_id: "pager".into(),
            normalizes_inbound: false,
            formats_outbound: true,
            ack_semantics: AckSemantics::AtMostOnce,
        };
        assert!(registry.register(outbound_only).is_ok());
    }

    #[test]
    fn duplicates_and_empty_refused() {
        let mut registry = AdapterRegistry::default();
        registry.register(contract("x")).unwrap();
        assert_eq!(
            registry.register(contract("x")),
            Err(ContractError::DuplicateChannel("x".into()))
        );
        assert_eq!(
            registry.register(contract("  ")),
            Err(ContractError::EmptyChannelId)
        );
    }

    #[test]
    fn the_slot_is_open_without_building_channels() {
        // The registry is the extension point: registering a contract does
        // not build the channel — it records the shape. (This test
        // documents the FR8.6 boundary.)
        let mut registry = AdapterRegistry::default();
        for id in ["feishu", "telegram", "matrix"] {
            registry.register(contract(id)).unwrap();
        }
        assert_eq!(
            registry.len(),
            3,
            "contracts registered, channels not built"
        );
    }
}
