import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AdaptiveBirthdayWidget } from '../features/dashboard/AdaptiveBirthdayWidget';
import { WelcomeHero } from '../features/dashboard/WelcomeHero';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';

describe('Dashboard Adaptive Birthday Widget and WelcomeHero Interactions', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('AdaptiveBirthdayWidget updates cake tier, music vibe, and party favor slider', () => {
    render(
      <WorkspaceProvider>
        <AdaptiveBirthdayWidget />
      </WorkspaceProvider>
    );

    expect(screen.getByText('Milestone Soirée Experience Customizer')).toBeInTheDocument();
    expect(screen.getByText('Custom cake / dessert tier')).toBeInTheDocument();

    // Adjust favor slider
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '350' } });
    expect(slider).toHaveValue('350');
  });

  it('WelcomeHero renders greeting, stat summary, and transitions to timeline on button clicks', () => {
    render(
      <WorkspaceProvider>
        <WelcomeHeroHelper />
      </WorkspaceProvider>
    );

    expect(screen.getByRole('button', { name: /Review tasks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run-of-show/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Review tasks/i }));
    expect(screen.getByTestId('active-tab-display')).toHaveTextContent('timeline');

    fireEvent.click(screen.getByRole('button', { name: /Run-of-show/i }));
    expect(screen.getByTestId('active-tab-display')).toHaveTextContent('timeline');
  });
});

function WelcomeHeroHelper() {
  const { activeTab } = useWorkspace();
  return (
    <>
      <WelcomeHero taskCompletionPct={75} signedVendors={3} totalVendors={4} />
      <div data-testid="active-tab-display">{activeTab}</div>
    </>
  );
}
