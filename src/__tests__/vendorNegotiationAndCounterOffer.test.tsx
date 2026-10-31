import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { VendorCounterOfferTactic } from '../features/vendors/VendorCounterOfferTactic';
import { VendorNegotiationModal } from '../features/vendors/VendorNegotiationModal';
import { Vendor } from '../types/vendor';

describe('Vendor Negotiation Studio & Counter-Offer Tactic Builder', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  const mockVendor: Vendor = {
    id: 'v-101',
    name: 'Heritage Palace Mandap Decor',
    category: 'decor',
    status: 'shortlisted',
    estimatedPrice: 200000,
    contractedPrice: 0,
    paidAmount: 0,
    contactName: 'Ramesh Sharma',
    phone: '+91 98200 11111',
    email: 'ramesh@heritagepalace.in',
    rating: 4.8,
    ratingCount: 24,
    location: 'Udaipur, Rajasthan',
    notes: 'Premium floral partner',
    deliverables: ['Mandap florals', 'Stage backdrop'],
  };

  it('VendorCounterOfferTactic recalculates counter-offer and copies generated script', async () => {
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText');

    render(
      <VendorCounterOfferTactic
        vendorName="Heritage Palace Mandap Decor"
        category="decor"
        quotedPrice={200000}
        currency="INR"
      />
    );

    expect(screen.getByText(/Tactical Counter-Offer & Concession Builder/i)).toBeInTheDocument();

    // Toggle a concession
    const concessionLabel = screen.getByText(/Flexible milestone schedule/i);
    fireEvent.click(concessionLabel);

    // Copy script
    const copyBtn = screen.getByRole('button', { name: /Copy counter-offer/i });
    fireEvent.click(copyBtn);

    expect(clipboardSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText(/Copied script/i)).toBeInTheDocument();
    });
  });

  it('VendorNegotiationModal loads AI vetting questions and scripts', async () => {
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText');
    const handleClose = vi.fn();

    render(
      <VendorNegotiationModal
        vendor={mockVendor}
        currency="INR"
        onClose={handleClose}
      />
    );

    // Verify modal title
    expect(screen.getByText(/AI Negotiation & Vetting Studio: Heritage Palace Mandap Decor/i)).toBeInTheDocument();

    // Wait for async vetting generation
    await waitFor(() => {
      expect(screen.getByText(/Ready-to-Copy WhatsApp Direct Outreach/i)).toBeInTheDocument();
      expect(screen.getByText(/5 Critical Vetting Questions/i)).toBeInTheDocument();
      expect(screen.getByText(/Category Hidden-Cost Red Flags/i)).toBeInTheDocument();
    });

    // Copy WhatsApp script
    const copyButtons = screen.getAllByRole('button', { name: /^Copy$/i });
    expect(copyButtons.length).toBeGreaterThan(0);
    fireEvent.click(copyButtons[0]);
    expect(clipboardSpy).toHaveBeenCalled();
  });

  it('VendorNegotiationModal returns null when vendor is null', () => {
    const { container } = render(
      <VendorNegotiationModal vendor={null} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });
});
