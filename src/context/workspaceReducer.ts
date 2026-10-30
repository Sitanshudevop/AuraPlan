import { rootWorkspaceReducer } from '../state/rootReducer';

export { type WorkspaceAction } from '../state/types';

/**
 * Root workspace reducer facade delegated to domain slices.
 */
export const workspaceReducer = rootWorkspaceReducer;
