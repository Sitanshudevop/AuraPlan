import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { VendorNegotiationModal } from '../features/vendors/VendorNegotiationModal';
import * as geminiService from '../services/geminiService';
import * as deterministicFallback from '../services/deterministicFallback';
import { Vendor, VendorVetQuestions } from '../types/vendor';

const mockVendor: Vendor = {
  id: 'v-test-1',
  name: 'Royal Heritage Decorators',
  category: 'decor',
  status: 'contacted',
  contractedPrice: 200000,
  estimatedPrice: 220000,
  paidAmount: 50000,
  rating: 4.8,
  ratingCount: 12,
  location: 'Jaipur',
  deliverables: ['Mandap setup'],
  contactName: 'Rajesh Sharma',
  phone: '+91 98765 43210',
  email: 'rajesh@royalheritage.com',
  notes: 'Initial quote received',
};

describe('VendorNegotiationModal UI Resilience (F6)', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('renders loading state with aria-busy and accessible status while synthesizing', async () => {
    vi.spyOn(geminiService, 'generateVendorVet').mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <VendorNegotiationModal
        vendor={mockVendor}
        currency="INR"
        onClose={vi.fn()}
      />
    );

    const loadingStatus = screen.getByRole('status');
    expect(loadingStatus).toBeInTheDocument();
    expect(loadingStatus).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText(/Synthesizing commercial negotiation posture/i)).toBeInTheDocument();
  });

  it('renders success state when primary AI succeeds', async () => {
    vi.spyOn(geminiService, 'generateVendorVet').mockResolvedValue({
      whatsappOutreachScript: 'Hello from AI test outreach',
      emailOutreachScript: 'Formal RFP body text',
      vettingQuestions: ['Question 1', 'Question 2'],
      hiddenCostRedFlags: ['Generator diesel charges'],
    });

    render(
      <VendorNegotiationModal
        vendor={mockVendor}
        currency="INR"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Hello from AI test outreach')).toBeInTheDocument();
      expect(screen.getByText('Formal RFP & Commercial Review Email')).toBeInTheDocument();
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });
  });

  it('on primary AI failure, falls back to deterministic suggestions with subtle notice', async () => {
    vi.spyOn(geminiService, 'generateVendorVet').mockRejectedValue(new Error('Network offline'));
    vi.spyOn(deterministicFallback, 'getLocalVendorVet').mockReturnValue({
      whatsappOutreachScript: 'Fallback WhatsApp template',
      emailOutreachScript: 'Fallback Email template',
      vettingQuestions: ['Fallback Q1'],
      hiddenCostRedFlags: ['Fallback flag'],
    });

    render(
      <VendorNegotiationModal
        vendor={mockVendor}
        currency="INR"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Showing deterministic offline suggestions')).toBeInTheDocument();
      expect(screen.getByText('Fallback WhatsApp template')).toBeInTheDocument();
    });
  });

  it('when both primary and fallback generation fail, displays role="alert" with "Try again" button', async () => {
    vi.spyOn(geminiService, 'generateVendorVet').mockRejectedValue(new Error('Network error'));
    vi.spyOn(deterministicFallback, 'getLocalVendorVet').mockImplementation(() => {
      throw new Error('Fatal fallback error');
    });

    render(
      <VendorNegotiationModal
        vendor={mockVendor}
        currency="INR"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(screen.getByText(/Unable to synthesize commercial vetting checklist/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
    });

    // Verify retry recovery: next call succeeds
    vi.spyOn(geminiService, 'generateVendorVet').mockResolvedValue({
      whatsappOutreachScript: 'Recovered WhatsApp Script',
      emailOutreachScript: 'Recovered Email Script',
      vettingQuestions: ['Recovered Q1'],
      hiddenCostRedFlags: [],
    });

    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

    await waitFor(() => {
      expect(screen.getByText('Recovered WhatsApp Script')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('unmounting mid-request cancels updates without throwing warnings', () => {
    let resolvePromise: (val: VendorVetQuestions) => void = () => {};
    vi.spyOn(geminiService, 'generateVendorVet').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { unmount } = render(
      <VendorNegotiationModal
        vendor={mockVendor}
        currency="INR"
        onClose={vi.fn()}
      />
    );

    // Unmount before promise resolves
    unmount();

    // Resolve after unmount
    expect(() => {
      resolvePromise({
        whatsappOutreachScript: 'Late response',
        emailOutreachScript: 'Late response',
        vettingQuestions: [],
        hiddenCostRedFlags: [],
      });
    }).not.toThrow();
  });
});
