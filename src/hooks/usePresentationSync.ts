/**
 * Re-export usePresentationEngine as usePresentationSync for backward compatibility
 */
export {
  usePresentationEngine as usePresentationSync,
  getPresentationEngine,
  PresentationEngine,
  createDefaultPresentationState,
  createDefaultPresentationState as getInitialPresentationState,
} from '../engine/PresentationEngine';
