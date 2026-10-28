import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DashboardTab } from '../features/dashboard/DashboardTab';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import { clearPersistedState } from '../utils/storage';

const PresetSwitcher = ({ targetPreset }: { targetPreset: string }) => {
  const { switchPreset } = useWorkspace();
  return (
    <button data-testid="switch-btn" onClick={() => switchPreset(targetPreset)}>
      Switch
    </button>
  );
};

describe('DashboardTab & Adaptive Modality Widgets', () => {
  beforeEach(() => {
    clearPersistedState();
    localStorage.clear();
  });

  it('renders WelcomeHero with wedding greeting, progress summary, and stat tiles', () => {
    render(
      <WorkspaceProvider>
        <DashboardTab />
      </WorkspaceProvider>
    );

    expect(screen.getByText(/Namaste/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Udaipur Royal Heritage Wedding/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Target Budget/i)).toBeInTheDocument();
    expect(screen.getByText(/Per-Guest Cost/i)).toBeInTheDocument();
    expect(screen.getByText(/Vendor Contracts/i)).toBeInTheDocument();
    expect(screen.getByText(/Tasks Done/i)).toBeInTheDocument();
  });

  it('renders AdaptiveWeddingWidget, allows event switching, and toggles VIP ritual verification', () => {
    render(
      <WorkspaceProvider>
        <DashboardTab />
      </WorkspaceProvider>
    );

    expect(screen.getByText(/Wedding Itinerary & Cultural Ceremonies/i)).toBeInTheDocument();
    const ceremonyTabs = screen.getAllByRole('button');
    const mehendiTab = ceremonyTabs.find((b) => /Mehendi/i.test(b.textContent || ''));
    expect(mehendiTab).toBeDefined();

    if (mehendiTab) {
      fireEvent.click(mehendiTab);
    }

    // Ritual Verification checklist toggle
    const toggleRitualBtn = screen.getByRole('button', { name: /Show all rituals/i });
    expect(toggleRitualBtn).toBeInTheDocument();
    fireEvent.click(toggleRitualBtn);
    expect(screen.getByRole('button', { name: /Show fewer/i })).toBeInTheDocument();
  });

  it('renders AdaptiveBirthdayWidget when workspace is switched to birthday mode', () => {
    render(
      <WorkspaceProvider>
        <PresetSwitcher targetPreset="preset-birthday-botanical" />
        <DashboardTab />
      </WorkspaceProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('switch-btn'));
    });

    expect(screen.getAllByText(/Midnight Botanical 25th Milestone Gala/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Milestone Soirée Experience Customizer/i)).toBeInTheDocument();
  });

  it('renders AdaptiveCommunityWidget when workspace is switched to community mode', () => {
    render(
      <WorkspaceProvider>
        <PresetSwitcher targetPreset="preset-community-builders" />
        <DashboardTab />
      </WorkspaceProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('switch-btn'));
    });

    expect(screen.getAllByText(/Bengaluru Open-Source AI Builders Summit/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Sponsorship Inflow & Community Operations Matrix/i)).toBeInTheDocument();
  });

  it('displays upcoming payment milestones with status chips', () => {
    render(
      <WorkspaceProvider>
        <DashboardTab />
      </WorkspaceProvider>
    );

    expect(screen.getByText(/Upcoming Milestones/i)).toBeInTheDocument();
    expect(screen.getByText(/Next vendor tranche release deadlines/i)).toBeInTheDocument();
  });
});
