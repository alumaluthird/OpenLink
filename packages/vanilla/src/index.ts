export { OpenLinkVanilla as OpenLink } from './openlink-vanilla';
export { createWalletButton, createWalletModal } from './ui-components';
export type { ButtonOptions, ModalOptions } from './ui-components';

// Re-export core utilities
export { verifySignature, truncatePublicKey, isValidPublicKey } from '@openlink/core';

// Default export for CDN usage
import { OpenLinkVanilla } from './openlink-vanilla';
export default OpenLinkVanilla;

