# AuraPlan (Vow & Venue) — Architecture & Project Roadmap

## 1. System Overview & Architectural Manifesto

AuraPlan (Vow & Venue) is an offline-first, high-precision event synthesis and orchestration platform designed for multi-stakeholder wedding, corporate, and private celebrations. The system synthesizes complex event logistics, dynamic multi-tier budgets with statutory tax modeling, modality-specific milestone countdowns, run-of-show conflict detection, and an AI-augmented vendor CRM pipeline.

### Architectural Philosophy
1. **Anti-AI Design System (Linear + Notion + Luma Aesthetic)**:
   - Zero generic AI tropes: No purple-to-blue neon gradients, no floating glowing blobs, no marketing hero fluff, and no heavy drop shadows (`shadow-2xl`).
   - Surfaces use crisp 1px hairline borders (`border-stone-200` light / `border-zinc-800` dark) on warm alabaster (`#FAF9F6`) or carbon obsidian (`#09090B`).
   - Accent is a high-contrast obsidian paired with a single refined indigo interactive token (`#4F46E5`), with semantic indicators strictly bounded to Emerald (`#059669`), Amber (`#D97706`), and Rose (`#E11D48`).
   - Metrics, currency, percentages, and timestamps strictly utilize `JetBrains Mono` with `font-mono tabular-nums` for pixel-perfect vertical alignment.
2. **Offline-First & Deterministic Parity**:
   - The application functions seamlessly in air-gapped or keyless environments. All AI workflows (Theme Ideation, Vendor Vetting, Ripple What-If Simulation, Planning Assistant) feature a 100% deterministic local fallback engine that mirrors Gemini Flash schemas and outputs.
3. **Zero-Latency State & Decoupled Persistence**:
   - State management is unified under an event-driven `useReducer` architecture with an immutable unidirectional data flow.
   - Persistence to versioned `localStorage` is completely decoupled through a 300ms debounced synchronization pipeline (`useWorkspacePersistence`), ensuring typing in input fields never triggers synchronous I/O thrashing.
4. **Strict Safety & Accessibility Invariants**:
   - Zero `any` types across the entire codebase (`strict: true`).
   - 100% runtime validation of user inputs and AI outputs via `zod`.
   - Multi-pass recursive sanitization (`sanitizeText` / `sanitizeInput`) against nested XSS payloads.
   - Zero `dangerouslySetInnerHTML`, zero `eval()`, zero `document.write`.
   - Full WCAG 2.1 AA compliance: contrast ratios $\ge 4.5:1$, zero sub-12px micro-copy, semantic landmarks, and keyboard focus containment (`useFocusTrap`).

---

## 2. Code Layout & Modular Architecture

The repository enforces a strict, modular directory layout. Source code, tests, and configuration files are cleanly segregated. Files are capped at a maximum of 250 lines (with a target of $\le 180$ lines for all UI components).

```
auraplan/
├── .agents/
│   └── teamwork/                      # Agent coordination metadata ONLY (no code)
├── src/
│   ├── __tests__/                     # Vitest unit and integration test suites
│   │   ├── accessibilityAndKeyboard.test.tsx
│   │   ├── auditDrawerAndModals.test.tsx
│   │   ├── budgetAndFormulas.test.tsx
│   │   ├── efficiencyAndMemoization.test.tsx
│   │   ├── errorBoundariesAndFallbacks.test.tsx   [M5]
│   │   ├── kanbanDnDAndAdvancement.test.tsx       [M5]
│   │   ├── problemStatementAlignment.test.tsx
│   │   ├── vendorComparisonAndNegotiation.test.tsx [M5]
│   │   └── ...
│   ├── components/
│   │   ├── layout/                    # App shell, navigation, header, palette
│   │   │   ├── Header.tsx             # Sticky top context bar & command trigger
│   │   │   ├── HeaderActionsMenu.tsx   # Subcomponent: theme & export triggers [M1]
│   │   │   ├── Sidebar.tsx            # Collapsible navigation rail & countdown
│   │   │   ├── CommandPalette.tsx     # Cmd+K quick search & action dialog
│   │   │   ├── commandPaletteItems.tsx# Static & dynamic palette definitions
│   │   │   └── PresetDropdown.tsx     # Scenario preset selector
│   │   ├── modals/                    # Workspace parameter dialogs
│   │   │   ├── Modal.tsx              # Base accessible modal with useFocusTrap
│   │   │   ├── NewEventModal.tsx      # Create custom event modal
│   │   │   ├── EditEventModal.tsx     # Edit event parameters modal
│   │   │   └── EventModalFormFields.tsx # Shared form fields for event modals
│   │   └── ui/                        # Reusable atomic UI design system tokens
│   │       ├── Badge.tsx              # Semantic pill badges (emerald, amber, etc.)
│   │       ├── Button.tsx             # Standard, ghost, outline, subtle buttons
│   │       ├── Card.tsx               # Hairline surface container with hover tokens
│   │       ├── ErrorBoundary.tsx      # Accessible crash containment fallback
│   │       ├── Input.tsx              # Hairline text & number inputs
│   │       ├── SegmentedTabs.tsx      # Pill-style view switcher
│   │       ├── Select.tsx             # Hairline native select wrapper
│   │       ├── Skeleton.tsx           # Accessible loading placeholders
│   │       └── StatusDot.tsx          # 6px semantic indicator dot
│   ├── context/                       # Global state management & storage
│   │   ├── WorkspaceContext.tsx       # Root context provider & announcer
│   │   ├── workspaceReducer.ts        # Action reducers with budget-vendor sync
│   │   ├── workspaceTypes.ts          # Action types and context state interfaces
│   │   └── workspaceStorageSync.ts    # 300ms debounced localStorage persistence
│   ├── data/                          # Seed datasets, presets & checklists
│   │   ├── defaultPresets.ts          # Udaipur Wedding, Bangalore Gala, Techfest
│   │   └── modalityChecklists.ts      # Domain-specific ritual & vendor tasks
│   ├── features/                      # Domain feature modules
│   │   ├── audit/                     # 100/100 Rubric diagnostic drawer
│   │   │   ├── AuditDrawer.tsx        # System telemetry & compliance monitor
│   │   │   └── SanitizerSandbox.tsx   # Subcomponent: interactive XSS sandbox [M1]
│   │   ├── budget/                    # Financial ledger & tax calculator
│   │   │   ├── BudgetTab.tsx          # Master budget container & summary
│   │   │   ├── BudgetActionMenu.tsx   # Subcomponent: CSV & print actions [M1]
│   │   │   ├── BudgetTableFooter.tsx  # Subcomponent: subtotals & tax strip [M1]
│   │   │   ├── CategoryRow.tsx        # Cost allocation slider & row
│   │   │   ├── CategoryRowDetails.tsx # Subcomponent: expandable accordion details [M1]
│   │   │   ├── AddBudgetItemModal.tsx # Add budget item dialog
│   │   │   ├── BudgetItemCostFields.tsx # Subcomponent: quote & paid inputs [M1]
│   │   │   ├── TaxAndCateringCalc.tsx # Per-plate catering & GST multiplier
│   │   │   ├── MilestoneTracker.tsx   # Payment milestone schedule table
│   │   │   └── budgetExport.ts        # RFC 4180 compliant CSV export engine
│   │   ├── copilot/                   # AI Planning Assistant & conversational drawer
│   │   │   ├── PlanningAssistantDrawer.tsx # Slide-over chat drawer
│   │   │   ├── AssistantHeader.tsx    # Drawer top bar & status dot
│   │   │   ├── AssistantMessageList.tsx # Subcomponent: chat bubbles & actions [M1]
│   │   │   ├── AssistantChipBar.tsx   # Quick suggestion prompts
│   │   │   ├── FormattedAssistantMessage.tsx # Safe Markdown token renderer
│   │   │   └── assistantActionHandler.ts # Plan modification dispatcher
│   │   ├── dashboard/                 # Executive bento grid & modality widgets
│   │   │   ├── DashboardTab.tsx       # 12-column Bento canvas
│   │   │   ├── AdaptiveWeddingWidget.tsx # Ritual tracker & sub-event schedule
│   │   │   ├── AdaptiveBirthdayWidget.tsx # Experience & playlist manager
│   │   │   └── AdaptiveCommunityWidget.tsx # Sponsorship & volunteer manager
│   │   ├── guests/                    # Attendee ledger, RSVP, dietary matrix
│   │   │   ├── GuestsTab.tsx          # Master guest list view container
│   │   │   ├── GuestTable.tsx         # Attendee table with RSVP & dietary tags
│   │   │   ├── GuestTableRow.tsx      # Subcomponent: memoized attendee row [M1, M2]
│   │   │   ├── AddGuestModal.tsx      # Add attendee dialog
│   │   │   ├── DietarySummaryBar.tsx  # Dietary distribution visual breakdown
│   │   │   └── ZoneCapacityMeters.tsx # Zone occupancy safety meters
│   │   ├── ideation/                  # What-If Ripple Simulator & theme generator
│   │   │   ├── IdeationTab.tsx        # Theme concept gallery container
│   │   │   ├── RippleSimulatorDrawer.tsx # Slide-over stress test simulation drawer
│   │   │   ├── RippleScenarioSelector.tsx # Subcomponent: scenario button grid [M1]
│   │   │   ├── RippleDiffSummary.tsx  # Impact badge & change comparison lists
│   │   │   └── ThemeConceptCard.tsx   # Palette & decor concept card
│   │   ├── timeline/                  # Milestone countdown & run-of-show
│   │   │   ├── TimelineTab.tsx        # Master timeline view container
│   │   │   ├── MacroCountdownView.tsx # Multi-horizon countdown schedule
│   │   │   ├── MacroTaskItem.tsx      # Subcomponent: memoized milestone item [M1, M2]
│   │   │   ├── DayOfRunOfShowView.tsx # Minute-by-minute itinerary
│   │   │   ├── DayOfActivityRow.tsx   # Subcomponent: memoized activity row [M1, M2]
│   │   │   ├── ConflictAlertBanner.tsx # Subcomponent: schedule collision banner [M1]
│   │   │   └── AddMacroTaskModal.tsx  # Add milestone task dialog
│   │   └── vendors/                   # Vendor CRM, comparison & negotiation studio
│   │       ├── VendorsTab.tsx         # Master vendor pipeline container
│   │       ├── VendorKanban.tsx       # 5-stage drag-and-drop pipeline
│   │       ├── VendorKanbanCard.tsx   # Memoized pipeline card with quick-advance
│   │       ├── VendorCardActionsMenu.tsx # Subcomponent: card kebab dropdown [M1]
│   │       ├── VendorQuoteTable.tsx   # Side-by-side comparison table
│   │       ├── VendorQuoteTableRow.tsx # Subcomponent: memoized vendor row [M1, M2]
│   │       ├── VendorChecklistView.tsx# Modality requirement tracker
│   │       ├── AddVendorModal.tsx     # Add vendor partner dialog
│   │       ├── VendorCommercialFields.tsx # Subcomponent: name & pricing inputs [M1]
│   │       ├── VendorContactFields.tsx# Subcomponent: POC & deliverables
│   │       ├── VendorNegotiationModal.tsx # AI Negotiation & Vetting Studio
│   │       └── VendorCounterOfferSimulator.tsx # Subcomponent: 4-posture simulator [M4]
│   ├── hooks/                         # Reusable custom React hooks
│   │   ├── useFocusTrap.ts            # Accessible modal/drawer focus containment
│   │   ├── useKeyboardShortcut.ts     # Global hotkey binding (Cmd+K, Escape)
│   │   └── useWorkspace.ts            # Type-safe context accessor
│   ├── schemas/                       # Strict Zod schemas with sanitization
│   │   ├── aiSchemas.ts               # Theme, vendor vet, ripple & assistant schemas [M7]
│   │   └── eventSchemas.ts            # Domain entity schemas with sanitizedString
│   ├── services/                      # Intelligence, simulation & network services
│   │   ├── assistantResponses.ts      # Contextual deterministic assistant logic
│   │   ├── deterministicFallback.ts   # Local theme & vendor vetting generators
│   │   ├── geminiService.ts           # Gemini Flash integration with rate limiter
│   │   ├── planningAssistantService.ts# Assistant dispatcher with Zod parsing [M7]
│   │   ├── planSynthesizer.ts         # Deterministic custom workspace generator
│   │   └── rippleEngine.ts            # Deterministic arithmetic simulation engine
│   ├── types/                         # TypeScript interfaces and domain models
│   │   ├── ai.ts                      # AI response types & assistant action contracts
│   │   └── event.ts                   # Core domain types (Budget, Vendor, Guest, Task)
│   ├── utils/                         # Pure utility functions & security
│   │   ├── budgetCalculations.ts      # Financial aggregation & auto-balancing
│   │   ├── formatters.ts              # Currency & date formatting helpers
│   │   ├── logger.ts                  # Structured browser console logger
│   │   ├── sanitizer.ts               # Input sanitization bridge
│   │   └── security.ts                # Multi-pass HTML stripping & rate limiter
│   ├── App.tsx                        # Root layout, dynamic tabs & overlays
│   ├── index.css                      # Tailwind base, components & utilities
│   └── main.tsx                       # React DOM entry point
├── GEMINI.md                          # Mandatory 100/100 engineering & UI rubric
├── PRECISION_AUDIT_PLAN.md            # Master 100/100 precision implementation plan
├── PROJECT.md                         # Architecture, roadmap & interface contracts
├── tsconfig.json                      # Strict compiler configuration
└── vite.config.ts                     # Vite bundle and Vitest test config
```

---

## 3. Milestones Roadmap (M1 – M6)

The project executes across six targeted, non-breaking milestones designed to elevate the precision audit score from **98.5/100 to 100/100**:

| Milestone | Code Name | Primary Focus | Key Deliverables | Audit Parameter | Target Metric |
|---|---|---|---|---|---|
| **M1** | Code Quality & Modularization | Refactor oversized components & preserve compiler hygiene | Extract subcomponents for `PlanningAssistantDrawer`, `AddVendorModal`, `RippleSimulatorDrawer`, and 12 other files; strictly preserve `eventName` in `AssistantHeader.tsx` (rendered on line 29); maintain 0 TS errors, 0 ESLint warnings (`strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`). | Code Quality | 100% files $\le 180$ lines (hard cap $< 250$ lines); 0 TS errors, 0 ESLint warnings. |
| **M2** | Efficiency & Memoization | Render boundaries & card/row memoization | Fix `VendorKanbanCard` comparator; memoize `VendorQuoteTableRow` (including `onDeleteVendor` equality) and `GuestTableRow`; stabilize `VendorsTab` callbacks; optimize `VendorKanban` stage grouping; memoize `Modal.tsx`. | Efficiency & Performance | Zero unnecessary re-renders on unrelated state changes; 300ms persistence invariant intact. |
| **M3** | Accessibility & Micro-Copy | WCAG 2.1 AA typography & landmarks | Elevate all 55 sub-12px micro-copy locations across 24 files to 12px `text-xs text-stone-500 dark:text-[#8B8B93]`; provide mathematical contrast proofs ($\ge 4.5:1$ in both light and dark modes, repairing `TaxAndCateringCalc.tsx` to 5.53:1) and empirical 0px layout shift proof; add `<section>` landmarks; attach `useFocusTrap` to `CommandPalette`. | Accessibility | 100% compliance with WCAG 2.1 AA contrast $\ge 4.5:1$; 0 sub-12px elements; 0 layout shifts. |
| **M4** | Problem Statement Alignment | Interactive Counter-Offer Tactic Simulator | Add `VendorCounterOfferSimulator.tsx` ($\le 100$ lines) within `VendorNegotiationModal.tsx` featuring 4 commercial negotiation postures (Balanced 10%, Aggressive 15%, Scope Trade 8%, Payment Terms 5%), dynamic price recalculation, live script generation, typed callbacks (`onSelectTactic`, `onApplyTargetPrice`), and backward-compatible re-export in `VendorCounterOfferTactic.tsx`. | Problem Statement Alignment | 100/100 domain alignment; zero schema modifications; 100% existing test compatibility. |
| **M5** | Testing & Verification Expansion | Vitest test suite additions | Author/harmonize 3 comprehensive test suites: `kanbanDnDAndAdvancement.test.tsx` (7 tests), `vendorComparisonAndNegotiation.test.tsx` (6 tests), and `errorBoundariesAndFallbacks.test.tsx` (augmented to 11 tests); line coverage elevated from verified baseline 83.43% (18 test files, 125 tests) to $> 90.5\%$. | Testing & Verification | 100% tests pass (135+ tests, 0 failures); line coverage elevated from 83.43% to $> 90.5\%$. |
| **M6** | Precision Audit Gate & Attestation | Final verification & validation | Execute automated verification matrix: TypeScript check (0 errors), ESLint check (0 errors/warnings), line count audit ($\le 180$ lines), Vitest coverage report ($> 90.5\%$), security grep verification (0 unsafe DOM injections), and anti-AI design audit. | Audit Attestation | 100/100 across all 6 parameters; publication-grade audit report. |

---

## 4. Feature Inventory & Mapping to Milestones

| Feature Module | Core Capabilities | Relevant Files | Associated Milestone |
|---|---|---|---|
| **Executive Bento Dashboard** | High-level budget burn, countdown days, ritual tracker, and modality bento cards. | `DashboardTab.tsx`, `AdaptiveWeddingWidget.tsx`, `AdaptiveBirthdayWidget.tsx`, `AdaptiveCommunityWidget.tsx` | M1, M3 |
| **Smart Budget & Tax Engine** | Category allocation sliders, auto-balancing algorithm, statutory GST calculator, milestone timetable, and RFC 4180 CSV export. | `BudgetTab.tsx`, `CategoryRow.tsx`, `AddBudgetItemModal.tsx`, `TaxAndCateringCalc.tsx`, `MilestoneTracker.tsx`, `budgetExport.ts` | M1, M2, M3, M5 |
| **Vendor CRM & Negotiation Studio** | Modality requirements checklist, 5-stage drag-and-drop Kanban, side-by-side quote comparison, automated budget sync on contract signing, AI vetting, and counter-offer simulator. | `VendorsTab.tsx`, `VendorKanban.tsx`, `VendorKanbanCard.tsx`, `VendorQuoteTable.tsx`, `VendorChecklistView.tsx`, `AddVendorModal.tsx`, `VendorNegotiationModal.tsx`, `VendorCounterOfferSimulator.tsx` | M1, M2, M3, M4, M5 |
| **Timeline & Run-of-Show** | Multi-horizon countdown milestones (6m to day-before), minute-by-minute itinerary, and automated schedule collision detection. | `TimelineTab.tsx`, `MacroCountdownView.tsx`, `DayOfRunOfShowView.tsx`, `AddMacroTaskModal.tsx` | M1, M2, M3, M5 |
| **Attendee & Seating Matrix** | Guest roster, RSVP tracking, plus-ones counter, dietary restriction visual breakdown, and zone capacity overflow warnings. | `GuestsTab.tsx`, `GuestTable.tsx`, `AddGuestModal.tsx`, `DietarySummaryBar.tsx`, `ZoneCapacityMeters.tsx` | M1, M2, M3 |
| **What-If Ripple Simulator** | Macro-scenario stress tests (+25% guest surge, -15% budget cut, monsoon alert) with diff visualization and 1-click apply/undo. | `RippleSimulatorDrawer.tsx`, `RippleScenarioSelector.tsx`, `RippleDiffSummary.tsx`, `rippleEngine.ts` | M1, M2, M3, M5 |
| **AI Planning Assistant** | Natural language copilot for plan mutations, suggested action chips, and contextual offline fallback. | `PlanningAssistantDrawer.tsx`, `AssistantHeader.tsx`, `AssistantMessageList.tsx`, `planningAssistantService.ts` | M1, M2, M3, M7 |
| **Audit & Governance** | Live 100/100 rubric compliance monitor, XSS sanitizer sandbox, memory footprint calculator, and shortcut index. | `AuditDrawer.tsx`, `SanitizerSandbox.tsx` | M1, M3 |

---

## 5. Interface Contracts & Domain Models

### 5.1 Domain Schemas (`src/types/event.ts`)
```typescript
export type EventModality = 'wedding' | 'birthday' | 'community' | 'general';
export type BudgetCategory = 'venue' | 'catering' | 'decor' | 'av_photo' | 'entertainment' | 'logistics' | 'buffer';
export type VendorStatus = 'shortlisted' | 'contacted' | 'quote_received' | 'contract_signed' | 'paid';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface Vendor {
  id: string;
  name: string;
  category: BudgetCategory;
  status: VendorStatus;
  contactName?: string;
  phone?: string;
  email?: string;
  location?: string;
  rating?: number;
  ratingCount?: number;
  estimatedPrice: number;
  contractedPrice: number;
  paidAmount?: number;
  notes?: string;
  deliverables: string[];
  quoteItems?: { description: string; amount: number }[];
}

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  allocated: number;
  vendorQuote: number;
  actualContracted: number;
  amountPaid: number;
  locked?: boolean;
  notes?: string;
}
```

### 5.2 AI Payload Contracts (`src/schemas/aiSchemas.ts`)
```typescript
export interface AssistantAction {
  type: 'add_task' | 'add_budget' | 'add_vendor';
  label: string;
  payload: {
    task?: {
      title: string;
      horizon: '6_months' | '3_months' | '1_month' | '1_week' | 'day_before';
      category: string;
      priority: 'critical' | 'high' | 'normal';
    };
    budget?: {
      name: string;
      category: BudgetCategory;
      allocated: number;
    };
    vendor?: {
      name: string;
      category: BudgetCategory;
      estimatedPrice: number;
      deliverables: string[];
    };
  };
}

export interface AssistantResponse {
  content: string;
  suggestedActions?: AssistantAction[];
}
```

### 5.3 Extracted Subcomponent Prop Contracts (M1 & M4)
```typescript
// Vendor Counter-Offer Simulator (M4)
export interface CommercialPosture {
  id: 'balanced' | 'aggressive' | 'scope_trade' | 'payment_terms';
  title: string;
  discountPercent: number;
  badgeLabel: string;
  leverageAngle: string;
  tradeOff: string;
}

export interface VendorCounterOfferSimulatorProps {
  vendorName: string;
  category: BudgetCategory;
  quotedPrice: number;
  currency: Currency;
  onSelectTactic?: (tacticId: string, targetPrice: number, savings: number) => void;
  onApplyTargetPrice?: (targetPrice: number) => void;
}

// Backward-compatible alias export in src/features/vendors/VendorCounterOfferTactic.tsx:
// export { VendorCounterOfferSimulator as VendorCounterOfferTactic } from './VendorCounterOfferSimulator';

// Vendor Commercial Fields (M1)
export interface VendorCommercialFieldsProps {
  name: string;
  setName: (val: string) => void;
  category: BudgetCategory;
  setCategory: (val: BudgetCategory) => void;
  status: VendorStatus;
  setStatus: (val: VendorStatus) => void;
  estimatedPrice: number;
  setEstimatedPrice: (val: number) => void;
  contractedPrice: number;
  setContractedPrice: (val: number) => void;
  currency: Currency;
}

// Ripple Scenario Selector (M1)
export interface RippleScenarioSelectorProps {
  selectedPreset: RipplePresetId;
  customPrompt: string;
  loading: boolean;
  onSelectPreset: (id: RipplePresetId) => void;
  onCustomPromptChange: (val: string) => void;
  onSimulateCustom: () => void;
}

// Assistant Message List (M1)
export interface AssistantMessageListProps {
  messages: AssistantMessage[];
  loading: boolean;
  executedLabels: Set<string>;
  onExecuteAction: (action: AssistantAction) => void;
}
```

---

## 6. Verification & Attestation Protocols

To ensure uncompromising engineering quality, every change is validated against the following execution gate:

```bash
# 1. Full Vitest Test Suite Execution
cmd.exe /c "npm test"
# Verified Baseline: 18 test files passed (18/18), 125 tests passed (125/125), 0 failures.
# Requirement: 100% tests pass (expanding to 135+ tests upon M5 completion).

# 2. Vitest Line & Branch Coverage Gate
cmd.exe /c "npm run test:coverage"
# Verified Baseline: 83.43% line coverage (3,120 / 3,740 executed lines).
# Requirement: Statement & line coverage > 90.0% across expanded denominator (3,840 lines).

# 3. TypeScript Strict Compiler Validation
cmd.exe /c "npx tsc --noEmit"
# Verified Baseline: Exit code 0, 0 type errors, noUnusedLocals / noUnusedParameters clean.
# Requirement: Exit code 0, zero type errors.

# 4. ESLint Code Quality Inspection
cmd.exe /c "npm run lint"
# Verified Baseline: Exit code 0, 0 warnings, 0 errors.
# Requirement: Exit code 0, 0 warnings, 0 errors.

# 5. File Line Count Compliance Audit
powershell -Command "Get-ChildItem -Path src -Include *.ts,*.tsx -Recurse | Where-Object { (Get-Content $_.FullName).Length -gt 180 } | Select-Object FullName"
# Requirement: All UI components <= 180 lines, zero files > 250 lines.

# 6. Security Injection Grep Audit
powershell -Command "Select-String -Path src/**/*.ts,src/**/*.tsx -Pattern 'dangerouslySetInnerHTML|eval\(|document\.write' -AllMatches"
# Verified Baseline: Zero matches.
# Requirement: Zero matches.
```

---

## 7. Operational Invariants & Safeguards

1. **Visual Invariant**: Tailwind classes must not be changed to introduce non-neutral dark tokens, colored glowing borders, or heavy drop shadows. All cards maintain `border border-hairline bg-surface`.
2. **State Invariant**: Existing data schemas (`EventWorkspaceState`, `Vendor`, `BudgetItem`) must not be broken or altered in a way that invalidates existing `localStorage` persisted states.
3. **Storage Invariant**: Debounced persistence (`useWorkspacePersistence`) must remain decoupled at 300ms, operating solely on `state`, `activePresetId`, and `isDark`.
4. **Test Invariant**: None of the 116 existing tests may be deleted, commented out, or loosened. New tests are strictly additive.
