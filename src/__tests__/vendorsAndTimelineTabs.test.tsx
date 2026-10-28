import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VendorsTab } from '../features/vendors/VendorsTab';
import { TimelineTab } from '../features/timeline/TimelineTab';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { clearPersistedState } from '../utils/storage';

describe('VendorsTab and TimelineTab Comprehensive Integration', () => {
  beforeEach(() => {
    clearPersistedState();
    localStorage.clear();
  });

  describe('VendorsTab Layout & Interactions', () => {
    it('renders category checklist by default and allows switching to kanban and table layouts', () => {
      render(
        <WorkspaceProvider>
          <VendorsTab />
        </WorkspaceProvider>
      );

      expect(screen.getByText(/Vendor CRM, Checklist & AI Negotiation Studio/i)).toBeInTheDocument();

      // Switch to Kanban Pipeline
      const kanbanBtn = screen.getByRole('button', { name: /Kanban Pipeline/i });
      fireEvent.click(kanbanBtn);
      expect(screen.getByText(/Contract Signed/i)).toBeInTheDocument();

      // Switch to Side-by-Side Table
      const tableBtn = screen.getByRole('button', { name: /Side-by-Side Table/i });
      fireEvent.click(tableBtn);
      expect(screen.getByText(/Vendor & Category/i)).toBeInTheDocument();
      expect(screen.getByText(/Contracted Price/i)).toBeInTheDocument();
    });

    it('filters vendor table and kanban by category', () => {
      render(
        <WorkspaceProvider>
          <VendorsTab />
        </WorkspaceProvider>
      );

      // Switch to Table layout where category filters appear
      const tableBtn = screen.getByRole('button', { name: /Side-by-Side Table/i });
      fireEvent.click(tableBtn);

      const allCatBtn = screen.getByRole('button', { name: /All Categories/i });
      expect(allCatBtn).toBeInTheDocument();

      const cateringBtns = screen.getAllByRole('button', { name: /CATERING/i });
      expect(cateringBtns.length).toBeGreaterThan(0);
      fireEvent.click(cateringBtns[0]);
    });
  });

  describe('TimelineTab Dual-Horizon & Run-of-Show', () => {
    it('renders macro countdown and toggles to Day-Of Run-of-Show', () => {
      render(
        <WorkspaceProvider>
          <TimelineTab />
        </WorkspaceProvider>
      );

      expect(screen.getByText(/Dual-Horizon Timeline & "Day-Of" Run-of-Show/i)).toBeInTheDocument();

      // Switch to Day-Of Run-of-Show
      const runOfShowBtn = screen.getByRole('button', { name: /Day-Of Run-of-Show/i });
      fireEvent.click(runOfShowBtn);

      expect(screen.getByText(/Minute-by-Minute Run-of-Show/i)).toBeInTheDocument();
      expect(screen.getByText(/Synchronized cues for coordinators/i)).toBeInTheDocument();
    });

    it('triggers ICS calendar export button without errors', () => {
      window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      window.URL.revokeObjectURL = vi.fn();
      const clickMock = vi.fn();
      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const el = origCreateElement(tagName);
        if (tagName === 'a') {
          el.click = clickMock;
        }
        return el;
      });

      render(
        <WorkspaceProvider>
          <TimelineTab />
        </WorkspaceProvider>
      );

      const exportBtn = screen.getByRole('button', { name: /Export \.ics/i });
      fireEvent.click(exportBtn);

      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      vi.restoreAllMocks();
    });
  });
});
