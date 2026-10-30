import { useState, useCallback } from 'react';

/**
 * Manages modal dialog and drawer overlay visibility flags.
 */
export function useWorkspaceOverlays() {
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isAuditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [isCopilotOpen, setCopilotOpen] = useState(false);
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [isNewEventModalOpen, setNewEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setEditEventModalOpen] = useState(false);

  const closeAllOverlays = useCallback((): void => {
    setCommandPaletteOpen(false);
    setAuditDrawerOpen(false);
    setCopilotOpen(false);
    setAssistantOpen(false);
    setNewEventModalOpen(false);
    setEditEventModalOpen(false);
  }, []);

  const toggleCommandPalette = useCallback((): void => {
    setCommandPaletteOpen((p) => !p);
  }, []);

  return {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    isAuditDrawerOpen,
    setAuditDrawerOpen,
    isCopilotOpen,
    setCopilotOpen,
    isAssistantOpen,
    setAssistantOpen,
    isNewEventModalOpen,
    setNewEventModalOpen,
    isEditEventModalOpen,
    setEditEventModalOpen,
    closeAllOverlays,
    toggleCommandPalette,
  };
}
