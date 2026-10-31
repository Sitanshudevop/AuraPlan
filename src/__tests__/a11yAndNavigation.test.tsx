import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { App } from '../App';
import { clearPersistedState } from '../utils/storage';

describe('A11y, Navigation & 1-Click Judge Presets Integration', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
    clearPersistedState();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  describe('1-Click Judge Presets DOM State Transitions', () => {
    it('switches seamlessly across all 3 judge presets and updates the DOM in real-time', async () => {
      render(<App />);

      // Initial Preset: Udaipur Royal Wedding
      expect(screen.getByRole('heading', { level: 1, name: /Udaipur Royal Heritage Wedding/i })).toBeInTheDocument();
      expect(screen.getByText('WEDDING MODE')).toBeInTheDocument();

      // Switch to Preset 2: Midnight Botanical Gala (Birthday Mode)
      const birthdayPresetBtn = screen.getByRole('button', { name: /Midnight Botanical Gala/i });
      fireEvent.click(birthdayPresetBtn);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /Midnight Botanical 25th Milestone Gala/i })).toBeInTheDocument();
        expect(screen.getByText('BIRTHDAY MODE')).toBeInTheDocument();
      });

      // Switch to Preset 3: AI Builders Summit (Community Mode)
      const communityPresetBtn = screen.getByRole('button', { name: /AI Builders Summit/i });
      fireEvent.click(communityPresetBtn);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /Bengaluru Open-Source AI Builders Summit/i })).toBeInTheDocument();
        expect(screen.getByText('COMMUNITY MODE')).toBeInTheDocument();
      });

      // Switch back to Preset 1: Udaipur Royal Wedding
      const weddingPresetBtn = screen.getByRole('button', { name: /Udaipur Royal Wedding/i });
      fireEvent.click(weddingPresetBtn);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /Udaipur Royal Heritage Wedding/i })).toBeInTheDocument();
        expect(screen.getByText('WEDDING MODE')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility (WCAG 2.1 AA) & Semantic HTML Landmarks', () => {
    it('renders all required HTML5 semantic landmarks', () => {
      render(<App />);

      // 1. Skip Link
      const skipLink = screen.getByText('Skip to main workspace');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');

      // 2. Banner (<header>)
      expect(screen.getByRole('banner')).toBeInTheDocument();

      // 3. Navigation (<nav>)
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // 4. Main content landmark (<main id="main-content">)
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('id', 'main-content');

      // 5. Complementary navigation sidebar (<aside>)
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('renders aria-live="polite" screen reader announcer', () => {
      const { container } = render(<App />);
      const politeRegion = container.querySelector('[aria-live="polite"]');
      expect(politeRegion).toBeInTheDocument();
    });

    it('ensures all interactive tool buttons have explicit aria-labels', () => {
      render(<App />);

      expect(screen.getByRole('button', { name: /Search or run command/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Toggle currency between INR and USD/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Toggle dark mode/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Open 100\/100 Judge Audit Drawer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Open AI Ripple Simulator/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Export Workspace JSON Backup/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Collapse navigation/i })).toBeInTheDocument();
    });
  });

  describe('Primary Navigation & View Transitions', () => {
    it('renders all primary workspace navigation items in sidebar', () => {
      render(<App />);

      expect(screen.getByRole('button', { name: /Executive Bento/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Smart Budget Engine/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Timeline & Run-of-Show/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Vendor CRM & Studio/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /AI Ideation & Themes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Guests & Capacity Matrix/i })).toBeInTheDocument();
    });

    it('transitions between tabs and loads the respective views', async () => {
      render(<App />);

      // Navigate to Budget Tab
      const budgetNavBtn = screen.getByRole('button', { name: /Smart Budget Engine/i });
      fireEvent.click(budgetNavBtn);

      await waitFor(() => {
        expect(screen.getByText(/Financial-Grade Smart Budget Engine/i)).toBeInTheDocument();
      }, { timeout: 15000 });

      // Navigate to Timeline Tab
      const timelineNavBtn = screen.getByRole('button', { name: /Timeline & Run-of-Show/i });
      fireEvent.click(timelineNavBtn);

      await waitFor(() => {
        expect(screen.getByText(/Dual-Horizon Timeline/i)).toBeInTheDocument();
      }, { timeout: 15000 });
    }, 30000);
  });
});
