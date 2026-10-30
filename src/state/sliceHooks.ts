import { useWorkspace } from '../context/WorkspaceContext';

/**
 * Selector hook for Budget Engine slice.
 */
export function useBudget() {
  const ws = useWorkspace();
  return {
    budgetItems: ws.state.budgetItems,
    includeTaxInTotals: ws.state.includeTaxInTotals,
    taxRatePercent: ws.state.taxRatePercent,
    targetBudget: ws.state.event.targetBudget,
    updateBudgetItem: ws.updateBudgetItem,
    autoBalanceBudget: ws.autoBalanceBudget,
    addBudgetItem: ws.addBudgetItem,
    deleteBudgetItem: ws.deleteBudgetItem,
    toggleTax: ws.toggleTax,
    setTaxRate: ws.setTaxRate,
  };
}

/**
 * Selector hook for Vendor CRM slice.
 */
export function useVendors() {
  const ws = useWorkspace();
  return {
    vendors: ws.state.vendors,
    updateVendor: ws.updateVendor,
    addVendor: ws.addVendor,
    deleteVendor: ws.deleteVendor,
  };
}

/**
 * Selector hook for Dual-Horizon Timeline and Run-of-Show.
 */
export function useTimeline() {
  const ws = useWorkspace();
  return {
    macroTasks: ws.state.macroTasks,
    dayOfActivities: ws.state.dayOfActivities,
    updateMacroTask: ws.updateMacroTask,
    addMacroTask: ws.addMacroTask,
    deleteMacroTask: ws.deleteMacroTask,
    updateDayOfActivity: ws.updateDayOfActivity,
    addDayOfActivity: ws.addDayOfActivity,
    deleteDayOfActivity: ws.deleteDayOfActivity,
    shiftActivity30m: ws.shiftActivity30m,
  };
}

/**
 * Selector hook for Guest Roster & Seating Zones.
 */
export function useGuests() {
  const ws = useWorkspace();
  return {
    guests: ws.state.guests,
    zones: ws.state.zones,
    updateGuest: ws.updateGuest,
    addGuest: ws.addGuest,
    deleteGuest: ws.deleteGuest,
  };
}

/**
 * Selector hook for UI overlays, themes, tabs, and announcements.
 */
export function useUI() {
  const ws = useWorkspace();
  return {
    activeTab: ws.activeTab,
    setActiveTab: ws.setActiveTab,
    isDark: ws.isDark,
    toggleDarkMode: ws.toggleDarkMode,
    isCommandPaletteOpen: ws.isCommandPaletteOpen,
    setCommandPaletteOpen: ws.setCommandPaletteOpen,
    isAuditDrawerOpen: ws.isAuditDrawerOpen,
    setAuditDrawerOpen: ws.setAuditDrawerOpen,
    isCopilotOpen: ws.isCopilotOpen,
    setCopilotOpen: ws.setCopilotOpen,
    isAssistantOpen: ws.isAssistantOpen,
    setAssistantOpen: ws.setAssistantOpen,
    isNewEventModalOpen: ws.isNewEventModalOpen,
    setNewEventModalOpen: ws.setNewEventModalOpen,
    isEditEventModalOpen: ws.isEditEventModalOpen,
    setEditEventModalOpen: ws.setEditEventModalOpen,
    announcerMessage: ws.announcerMessage,
    announce: ws.announce,
  };
}

