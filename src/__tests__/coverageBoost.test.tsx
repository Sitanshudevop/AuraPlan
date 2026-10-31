
import { AddBudgetItemModal } from '../features/budget/AddBudgetItemModal';
import { AddVendorModal } from '../features/vendors/AddVendorModal';
import { AddGuestModal } from '../features/guests/AddGuestModal';
import { AddMacroTaskModal } from '../features/timeline/AddMacroTaskModal';
import { AddActivityModal } from '../features/timeline/AddActivityModal';
import { VendorsTab } from '../features/vendors/VendorsTab';
import { RippleSimulatorDrawer } from '../features/ideation/RippleSimulatorDrawer';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act, cleanup, waitFor } from '@testing-library/react';
import React, { useState } from 'react';
import { buildBasePaletteItems, buildDynamicPaletteItems, BuildBaseItemsParams } from '../components/layout/commandPaletteItems';
import { Header } from '../components/layout/Header';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import { VendorContactFields } from '../features/vendors/VendorContactFields';
import { BudgetItemFinancialFields } from '../features/budget/BudgetItemFinancialFields';
import { EventBasicInfoFields } from '../components/modals/EventBasicInfoFields';
import { EventLogisticsFields } from '../components/modals/EventLogisticsFields';
import { useThemeIdeation } from '../features/ideation/useThemeIdeation';
import { askPlanningAssistant } from '../services/planningAssistantService';
import * as geminiClient from '../services/geminiClient';
import * as geminiService from '../services/geminiService';
import { eventReducer } from '../state/eventReducer';
import { INITIAL_PRESETS } from '../data/presets';
import { Vendor } from '../types/vendor';
import { BudgetCategory } from '../types/budget';
import { MacroTask } from '../types/timeline';

describe('Coverage Boost Suite for Files under 80% (F9)', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  describe('commandPaletteItems: Base and Dynamic Palette Items Execution', () => {
    it('executes all base actions in commandPaletteItems', () => {
      const state = INITIAL_PRESETS['preset-wedding-udaipur'];
      const setActiveTab = vi.fn();
      const switchPreset = vi.fn();
      const setCurrency = vi.fn();
      const toggleDarkMode = vi.fn();
      const setAuditDrawerOpen = vi.fn();
      const setCopilotOpen = vi.fn();
      const setAssistantOpen = vi.fn();
      const setNewEventModalOpen = vi.fn();
      const autoBalanceBudget = vi.fn();
      const resetToFactoryDefaults = vi.fn();
      const announce = vi.fn();

      const params: BuildBaseItemsParams = {
        state,
        currency: 'INR',
        isDark: false,
        setActiveTab,
        switchPreset,
        setCurrency,
        toggleDarkMode,
        setAuditDrawerOpen,
        setCopilotOpen,
        setAssistantOpen,
        setNewEventModalOpen,
        autoBalanceBudget,
        resetToFactoryDefaults,
        announce,
      };

      const baseItems = buildBasePaletteItems(params);
      expect(baseItems.length).toBeGreaterThan(10);

      // Execute each action
      baseItems.forEach((item) => {
        item.action();
      });

      expect(setActiveTab).toHaveBeenCalledWith('dashboard');
      expect(setActiveTab).toHaveBeenCalledWith('budget');
      expect(setActiveTab).toHaveBeenCalledWith('timeline');
      expect(setActiveTab).toHaveBeenCalledWith('vendors');
      expect(setActiveTab).toHaveBeenCalledWith('ideation');
      expect(setActiveTab).toHaveBeenCalledWith('guests');
      expect(switchPreset).toHaveBeenCalledWith('preset-wedding-udaipur');
      expect(setAssistantOpen).toHaveBeenCalledWith(true);
      expect(setCopilotOpen).toHaveBeenCalledWith(true);
      expect(setAuditDrawerOpen).toHaveBeenCalledWith(true);
      expect(setNewEventModalOpen).toHaveBeenCalledWith(true);
      expect(autoBalanceBudget).toHaveBeenCalled();
      expect(setCurrency).toHaveBeenCalledWith('USD');
      expect(toggleDarkMode).toHaveBeenCalled();
      expect(resetToFactoryDefaults).toHaveBeenCalled();
      expect(announce).toHaveBeenCalled();
    });

    it('builds and executes dynamic palette items for vendors and tasks', () => {
      const setActiveTab = vi.fn();
      const mockVendors: Vendor[] = [
        {
          id: 'v-dyn-1',
          name: 'Dyn Vendor',
          category: 'catering',
          status: 'contacted',
          estimatedPrice: 100000,
          contractedPrice: 95000,
          paidAmount: 20000,
          contactName: 'Chef Roy',
          phone: '1234567890',
          email: 'roy@test.com',
          rating: 4.9,
          ratingCount: 10,
          location: 'Delhi',
          notes: '',
          deliverables: ['Dinner'],
        },
      ];
      const mockTasks: MacroTask[] = [
        {
          id: 't-dyn-1',
          title: 'Finalize Menu Tasting',
          category: 'Catering',
          horizon: '1_month',
          priority: 'high',
                    completed: false,
          dueDate: '2026-11-01',
          assignee: 'Chef Roy',
        },
      ];

      const dynamicItems = buildDynamicPaletteItems(mockVendors, mockTasks, setActiveTab);
      expect(dynamicItems.length).toBe(2);

      dynamicItems[0].action();
      expect(setActiveTab).toHaveBeenCalledWith('vendors');

      dynamicItems[1].action();
      expect(setActiveTab).toHaveBeenCalledWith('timeline');
    });
  });

  describe('Header: Interactive Controls & Actions', () => {
    it('interacts with Currency, Assistant, New Event buttons and triggers export JSON', () => {
      render(
        <WorkspaceProvider>
          <Header />
        </WorkspaceProvider>
      );

      // Currency toggle button
      const currencyBtn = screen.getByRole('button', { name: /Toggle currency between INR and USD/i });
      fireEvent.click(currencyBtn);

      // AI Assistant button
      const aiBtn = screen.getByRole('button', { name: /AI Assistant/i });
      fireEvent.click(aiBtn);

      // New Event button
      const newEventBtn = screen.getByRole('button', { name: /New Event/i });
      fireEvent.click(newEventBtn);

      // Search button
      const searchBtn = screen.getByRole('button', { name: /Search workspace/i });
      fireEvent.click(searchBtn);
    });
  });

  describe('VendorContactFields: Input Handlers', () => {
    function Wrapper() {
      const [contactName, setContactName] = useState('');
      const [phone, setPhone] = useState('');
      const [email, setEmail] = useState('');
      const [deliverables, setDeliverables] = useState('');

      return (
        <VendorContactFields
          contactName={contactName}
          setContactName={setContactName}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          deliverables={deliverables}
          setDeliverables={setDeliverables}
        />
      );
    }

    it('updates contactName, phone, email, and deliverables on input change', () => {
      render(<Wrapper />);

      const contactInput = screen.getByLabelText(/Contact person/i);
      fireEvent.change(contactInput, { target: { value: 'Deepak Verma' } });
      expect(contactInput).toHaveValue('Deepak Verma');

      const phoneInput = screen.getByLabelText(/Phone number/i);
      fireEvent.change(phoneInput, { target: { value: '+91 99999 88888' } });
      expect(phoneInput).toHaveValue('+91 99999 88888');

      const emailInput = screen.getByLabelText(/Email address/i);
      fireEvent.change(emailInput, { target: { value: 'deepak@test.com' } });
      expect(emailInput).toHaveValue('deepak@test.com');

      const delivInput = screen.getByLabelText(/Deliverables/i);
      fireEvent.change(delivInput, { target: { value: 'Sound setup, 4 mics' } });
      expect(delivInput).toHaveValue('Sound setup, 4 mics');
    });
  });

  describe('BudgetItemFinancialFields: Input Handlers', () => {
    function Wrapper() {
      const [category, setCategory] = useState<BudgetCategory>('venue');
      const [allocated, setAllocated] = useState(100000);
      const [vendorQuote, setVendorQuote] = useState(120000);
      const [actualContracted, setActualContracted] = useState(110000);
      const [amountPaid, setAmountPaid] = useState(50000);

      return (
        <BudgetItemFinancialFields
          category={category}
          onCategoryChange={setCategory}
          categoryOptions={[
            { value: 'venue', label: 'Venue' },
            { value: 'catering', label: 'Catering' },
          ]}
          allocated={allocated}
          onAllocatedChange={setAllocated}
          vendorQuote={vendorQuote}
          onVendorQuoteChange={setVendorQuote}
          actualContracted={actualContracted}
          onActualContractedChange={setActualContracted}
          amountPaid={amountPaid}
          onAmountPaidChange={setAmountPaid}
          currency="INR"
        />
      );
    }

    it('updates financial numbers on input changes', () => {
      render(<Wrapper />);

      const allocInput = screen.getByLabelText(/Target allocation/i);
      fireEvent.change(allocInput, { target: { value: '150000' } });
      expect(allocInput).toHaveValue(150000);

      const quoteInput = screen.getByLabelText(/Vendor quote/i);
      fireEvent.change(quoteInput, { target: { value: '140000' } });
      expect(quoteInput).toHaveValue(140000);

      const contractedInput = screen.getByLabelText(/Contracted cost/i);
      fireEvent.change(contractedInput, { target: { value: '135000' } });
      expect(contractedInput).toHaveValue(135000);

      const paidInput = screen.getByLabelText(/Amount paid/i);
      fireEvent.change(paidInput, { target: { value: '70000' } });
      expect(paidInput).toHaveValue(70000);
    });
  });

  describe('EventBasicInfoFields & EventLogisticsFields', () => {
    it('exercises EventBasicInfoFields inputs', () => {
      const setName = vi.fn();
      const setType = vi.fn();
      const setSetting = vi.fn();
      const setCulturalPreferences = vi.fn();

      render(
        <EventBasicInfoFields
          name="Gala"
          setName={setName}
          type="wedding"
          setType={setType}
          setting="indoor"
          setSetting={setSetting}
          culturalPreferences="Traditional"
          setCulturalPreferences={setCulturalPreferences}
          hasError={false}
        />
      );

      fireEvent.change(screen.getByLabelText(/Event name/i), { target: { value: 'Grand Gala' } });
      expect(setName).toHaveBeenCalledWith('Grand Gala');

      fireEvent.change(screen.getByLabelText(/Styling & dietary notes/i), { target: { value: 'Modern' } });
      expect(setCulturalPreferences).toHaveBeenCalledWith('Modern');
    });

    it('exercises EventLogisticsFields inputs', () => {
      const setDate = vi.fn();
      const setCity = vi.fn();
      const setGuestCount = vi.fn();
      const setTargetBudget = vi.fn();

      render(
        <EventLogisticsFields
          date="2026-12-01"
          setDate={setDate}
          city="Mumbai"
          setCity={setCity}
          guestCount={100}
          setGuestCount={setGuestCount}
          targetBudget={500000}
          setTargetBudget={setTargetBudget}
          currency="INR"
          hasError={false}
        />
      );

      fireEvent.change(screen.getByLabelText(/Event date/i), { target: { value: '2026-12-15' } });
      expect(setDate).toHaveBeenCalledWith('2026-12-15');

      fireEvent.change(screen.getByLabelText(/City \/ destination/i), { target: { value: 'Pune' } });
      expect(setCity).toHaveBeenCalledWith('Pune');

      fireEvent.change(screen.getByLabelText(/Guest count/i), { target: { value: '150' } });
      expect(setGuestCount).toHaveBeenCalledWith(150);

      fireEvent.change(screen.getByLabelText(/Target budget/i), { target: { value: '600000' } });
      expect(setTargetBudget).toHaveBeenCalledWith(600000);
    });
  });

  describe('planningAssistantService: Remote Gemini Proxy & Error Fallback', () => {
    it('calls callGeminiProxy when API key is provided and returns parsed response', async () => {
      vi.spyOn(geminiService, 'getActiveApiKey').mockReturnValue('AIzaSyD-ACTIVE-TEST-KEY');
      const spyProxy = vi.spyOn(geminiClient, 'callGeminiProxy').mockResolvedValue({
        content: 'AI proxy tactical response content',
        suggestedActions: [
          {
            type: 'add_task',
            label: 'Schedule AV rehearsal',
            payload: {
              task: {
                title: 'Rehearse Sound',
                horizon: '1_week',
                category: 'AV',
                priority: 'high',
              },
            },
          },
        ],
      });

      const event = INITIAL_PRESETS['preset-wedding-udaipur'].event;
      const state = INITIAL_PRESETS['preset-wedding-udaipur'];
      
      const res = await askPlanningAssistant('How to manage rain?', event, state);
      expect(spyProxy).toHaveBeenCalled();
      expect(res.content).toBe('AI proxy tactical response content');
      expect(res.suggestedActions?.length).toBe(1);
    });

    it('falls back to smart local response when callGeminiProxy rejects', async () => {
      vi.spyOn(geminiService, 'getActiveApiKey').mockReturnValue('AIzaSyD-ACTIVE-TEST-KEY');
      vi.spyOn(geminiClient, 'callGeminiProxy').mockRejectedValue(new Error('Proxy network failure'));

      const event = INITIAL_PRESETS['preset-wedding-udaipur'].event;
      const state = INITIAL_PRESETS['preset-wedding-udaipur'];

      const res = await askPlanningAssistant('What about catering buffer?', event, state);
      expect(res).toBeDefined();
      expect(res.content).toBeDefined();
    });
  });

  describe('eventReducer: default branch behavior', () => {
    it('returns untouched state on unrecognized action', () => {
      const state = INITIAL_PRESETS['preset-wedding-udaipur'].event;
      const untouched = eventReducer(state, { type: 'UNKNOWN' as unknown as 'UPDATE_EVENT', payload: {} });
      expect(untouched).toBe(state);
    });
  });

  describe('useThemeIdeation: actions and loadTheme execution', () => {
    it('calls loadTheme, handleAddToPlan, and handleInjectActivity', async () => {
      const state = INITIAL_PRESETS['preset-wedding-udaipur'];
      const addBudgetItem = vi.fn();
      const addMacroTask = vi.fn();
      const addDayOfActivity = vi.fn();
      const announce = vi.fn();

      vi.spyOn(geminiService, 'generateThemeIdea').mockResolvedValue({
        id: 'theme-mock',
        title: 'Mock Emerald Heritage',
        vibe: 'Royal',
        description: 'Mock Theme Description',
        colors: [{ name: 'Emerald', hex: '#059669', role: 'Primary' }],
        decorConcepts: [
          {
            id: 'd-1',
            title: 'Floral Canopy',
            description: 'Canopy with marigold',
            estimatedCost: 35000,
            timelineTask: 'Setup canopy',
            category: 'decor',
          },
        ],
        menuItems: [],
        activities: [],
      });

      const { result } = renderHook(() =>
        useThemeIdeation({
          state,
          addBudgetItem,
          addMacroTask,
          addDayOfActivity,
          announce,
        })
      );

      await act(async () => {
        await result.current.loadTheme('Contemporary Chic');
      });

      expect(result.current.idea?.title).toBe('Mock Emerald Heritage');

      act(() => {
        result.current.handleAddToPlan('Floral Canopy', 35000, 'decor', 'Setup canopy');
      });

      expect(addBudgetItem).toHaveBeenCalled();
      expect(addMacroTask).toHaveBeenCalled();
      expect(announce).toHaveBeenCalled();

      act(() => {
        result.current.handleAddActivityToTimeline({
          id: 'act-1',
          title: 'Royal Welcome Ritual',
          category: 'decor',
          description: 'Aarti and welcome drinks',
          estimatedCost: 15000,
                    durationMinutes: 30,
          location: 'Main Gate',
          poc: 'Event Host',
        });
      });

      expect(addDayOfActivity).toHaveBeenCalled();
      expect(announce).toHaveBeenCalled();

      act(() => {
        result.current.handleAddActivityToBudget({
          id: 'act-1',
          title: 'Royal Welcome Ritual',
          category: 'decor',
          description: 'Aarti and welcome drinks',
          estimatedCost: 15000,
                    durationMinutes: 30,
          location: 'Main Gate',
          poc: 'Event Host',
        });
      });
    });
  
  describe('geminiService: Remote Proxy execution & Catch Fallbacks', () => {
    it('executes generateThemeIdea via callGeminiProxy with custom key', async () => {
      geminiService.setCustomApiKey('AIzaSyD-CUSTOM-KEY-THEME');
      const spyProxy = vi.spyOn(geminiClient, 'callGeminiProxy').mockResolvedValue({
        id: 'theme-custom',
        title: 'Custom Royal Rajasthani',
        vibe: 'heritage',
        description: 'Cohesive heritage celebration',
        colors: [{ name: 'Saffron', hex: '#FF9933', role: 'Primary' }],
        decorConcepts: [],
        menuItems: [],
        activities: [],
      });

      const res = await geminiService.generateThemeIdea('wedding', 'heritage-unique-vibe-test');
      expect(spyProxy).toHaveBeenCalled();
      expect(res.title).toBe('Custom Royal Rajasthani');
      geminiService.removeCustomApiKey();
    });

    it('falls back to local theme idea when callGeminiProxy fails', async () => {
      geminiService.setCustomApiKey('AIzaSyD-CUSTOM-KEY-ERR');
      vi.spyOn(geminiClient, 'callGeminiProxy').mockRejectedValue(new Error('Proxy error'));

      const res = await geminiService.generateThemeIdea('birthday', 'disco-retro-unique-test');
      expect(res).toBeDefined();
      expect(res.vibe).toBeDefined();
      geminiService.removeCustomApiKey();
    });

    it('executes generateVendorVet via callGeminiProxy with custom key', async () => {
      geminiService.setCustomApiKey('AIzaSyD-CUSTOM-KEY-VET');
      const spyProxy = vi.spyOn(geminiClient, 'callGeminiProxy').mockResolvedValue({
        whatsappOutreachScript: 'Hello vendor, interested in your package',
        emailOutreachScript: 'Dear vendor, please share quotation',
        vettingQuestions: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
        hiddenCostRedFlags: ['Flag1', 'Flag2', 'Flag3', 'Flag4'],
      });

      const res = await geminiService.generateVendorVet('Royal Caterers Unique 99', 'Catering', 200000);
      expect(spyProxy).toHaveBeenCalled();
      expect(res.vettingQuestions.length).toBe(5);
      geminiService.removeCustomApiKey();
    });

    it('falls back to local vendor vet when callGeminiProxy fails', async () => {
      geminiService.setCustomApiKey('AIzaSyD-CUSTOM-KEY-VET-ERR');
      vi.spyOn(geminiClient, 'callGeminiProxy').mockRejectedValue(new Error('Proxy error'));

      const res = await geminiService.generateVendorVet('Fallback Caterers Unique 99', 'Catering', 250000);
      expect(res).toBeDefined();
      expect(res.vettingQuestions.length).toBeGreaterThan(0);
      geminiService.removeCustomApiKey();
    });
  });

  describe('Modal Forms Direct Input & Submit Tests', () => {
    it('exercises AddBudgetItemModal input fields and submission', () => {
      const onAdd = vi.fn();
      const onClose = vi.fn();

      render(
        <AddBudgetItemModal
          isOpen={true}
          onClose={onClose}
          onAddBudgetItem={onAdd}
          currency="INR"
          remainingBudget={100000}
        />
      );

      fireEvent.change(screen.getByLabelText(/Item name \/ scope/i), { target: { value: 'Fireworks Show' } });
      fireEvent.click(screen.getByLabelText(/Lock from auto-balancing algorithms/i));

      const form = screen.getByRole('dialog').querySelector('form');
      if (form) fireEvent.submit(form);

      expect(onAdd).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('exercises AddVendorModal input fields and submission', () => {
      const onAdd = vi.fn();
      const onClose = vi.fn();

      render(
        <AddVendorModal
          isOpen={true}
          onClose={onClose}
          onAddVendor={onAdd}
          currency="INR"
        />
      );

      fireEvent.change(screen.getByLabelText(/Vendor name/i), { target: { value: 'Royal Photo Studio' } });
      fireEvent.change(screen.getByLabelText(/Contracted price/i), { target: { value: '95000' } });

      const form = screen.getByRole('dialog').querySelector('form');
      if (form) fireEvent.submit(form);

      expect(onAdd).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('exercises AddGuestModal input fields and submission', () => {
      const onAdd = vi.fn();
      const onClose = vi.fn();

      render(
        <AddGuestModal
          isOpen={true}
          onClose={onClose}
          onAddGuest={onAdd}
          zones={[{ id: 'z1', name: 'Courtyard', maxCapacity: 200, assignedCount: 50, type: 'zone' }]}
        />
      );

      fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: 'Dr. Sharma & Family' } });
      fireEvent.change(screen.getByLabelText(/Plus-ones/i), { target: { value: '4' } });

      const form = screen.getByRole('dialog').querySelector('form');
      if (form) fireEvent.submit(form);

      expect(onAdd).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('exercises AddMacroTaskModal input fields and submission', () => {
      const onAdd = vi.fn();
      const onClose = vi.fn();

      render(
        <AddMacroTaskModal
          isOpen={true}
          onClose={onClose}
          onAddTask={onAdd}
          defaultDate="2026-12-01"
        />
      );

      fireEvent.change(screen.getByLabelText(/Milestone title/i), { target: { value: 'Final Venue Inspection' } });
      fireEvent.change(screen.getByLabelText(/Assignee/i), { target: { value: 'Operations Lead' } });

      const form = screen.getByRole('dialog').querySelector('form');
      if (form) fireEvent.submit(form);

      expect(onAdd).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('exercises AddActivityModal input fields and submission', () => {
      const onAdd = vi.fn();
      const onClose = vi.fn();

      render(
        <AddActivityModal
          isOpen={true}
          onClose={onClose}
          onAddActivity={onAdd}
        />
      );

      fireEvent.change(screen.getByLabelText(/Activity \/ Ritual Title/i), { target: { value: 'Welcome Aarti' } });
      fireEvent.change(screen.getByLabelText(/Start Time \(24h\)/i), { target: { value: '18:00' } });

      const form = screen.getByRole('dialog').querySelector('form');
      if (form) fireEvent.submit(form);

      expect(onAdd).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('VendorsTab & RippleSimulatorDrawer Interactions', () => {
    it('exercises VendorsTab layout buttons and modal triggers', () => {
      render(
        <WorkspaceProvider>
          <VendorsTab />
        </WorkspaceProvider>
      );

      const addBtn = screen.getByRole('button', { name: /Add Vendor/i });
      fireEvent.click(addBtn);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: /Close modal/i });
      fireEvent.click(closeBtn);

      const kanbanBtn = screen.getByRole('button', { name: /Kanban/i });
      fireEvent.click(kanbanBtn);

      const tableBtn = screen.getByRole('button', { name: /Table/i });
      fireEvent.click(tableBtn);
    });

    it('exercises RippleSimulatorDrawer open, simulation, and apply', async () => {
      const TestRippleApp: React.FC = () => {
        const { setCopilotOpen } = useWorkspace();
        return (
          <div>
            <button onClick={() => setCopilotOpen(true)}>Open Ripple</button>
            <RippleSimulatorDrawer />
          </div>
        );
      };

      render(
        <WorkspaceProvider>
          <TestRippleApp />
        </WorkspaceProvider>
      );

      fireEvent.click(screen.getByText('Open Ripple'));

      // Find preset button '+25% Guest Surge' and click it to run simulation
      const surgeBtn = screen.getByText('+25% Guest Surge');
      await act(async () => {
        fireEvent.click(surgeBtn);
      });

      // Find apply button and click it
      const applyBtn = screen.getByRole('button', { name: /Apply to plan/i });
      await waitFor(() => { expect(applyBtn).not.toBeDisabled(); });
      act(() => {
        fireEvent.click(applyBtn);
      });
    });
  });
});
});
