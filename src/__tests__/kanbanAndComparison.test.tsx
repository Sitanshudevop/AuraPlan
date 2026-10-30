import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VendorKanban } from '../features/vendors/VendorKanban';
import { VendorQuoteTable } from '../features/vendors/VendorQuoteTable';
import { Vendor } from '../types/vendor';

const mockVendors: Vendor[] = [
  {
    id: 'v-test-1',
    name: 'Premier Sound Works',
    category: 'av_photo',
    status: 'shortlisted',
    estimatedPrice: 45000,
    contractedPrice: 0,
    paidAmount: 0,
    contactName: 'Rahul Mehta',
    phone: '+91 98111 22333',
    email: 'rahul@premiersound.com',
    rating: 4.9,
    ratingCount: 12,
    location: 'Bandra, Mumbai',
    notes: 'Premium audio vendor',
    deliverables: ['Line array sound system', 'Wireless microphones'],
  },
  {
    id: 'v-test-2',
    name: 'Artisan Floral Collective',
    category: 'decor',
    status: 'contract_signed',
    estimatedPrice: 80000,
    contractedPrice: 75000,
    paidAmount: 25000,
    contactName: 'Ananya Roy',
    phone: '+91 98222 33444',
    email: 'ananya@artisanfloral.com',
    rating: 4.8,
    ratingCount: 8,
    location: 'Worli, Mumbai',
    notes: 'Florals for main stage',
    deliverables: ['Mandap florals', 'Table centerpieces'],
  },
];

describe('Vendor Kanban & Comparison Matrix Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all 5 Kanban stages with vendor count headers', () => {
    const handleUpdate = vi.fn();
    const handleDelete = vi.fn();
    const handleNegotiate = vi.fn();

    render(
      <VendorKanban
        vendors={mockVendors}
        currency="INR"
        onUpdateVendor={handleUpdate}
        onDeleteVendor={handleDelete}
        onOpenNegotiation={handleNegotiate}
      />
    );

    expect(screen.getAllByText(/Shortlisted/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Contacted/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Quote Received/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Contract Signed/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Paid in Full/i).length).toBeGreaterThan(0);

    // Premier Sound Works is rendered
    expect(screen.getAllByText('Premier Sound Works').length).toBeGreaterThan(0);
    // Artisan Floral Collective is rendered
    expect(screen.getAllByText('Artisan Floral Collective').length).toBeGreaterThan(0);
  });

  it('allows opening the card action menu and advancing stage', () => {
    const handleUpdate = vi.fn();
    const handleDelete = vi.fn();
    const handleNegotiate = vi.fn();

    render(
      <VendorKanban
        vendors={mockVendors}
        currency="INR"
        onUpdateVendor={handleUpdate}
        onDeleteVendor={handleDelete}
        onOpenNegotiation={handleNegotiate}
      />
    );

    // Click the "⋯" action menu on Premier Sound Works
    const actionButtons = screen.getAllByRole('button', { name: /Actions for/i });
    expect(actionButtons.length).toBeGreaterThan(0);
    fireEvent.click(actionButtons[0]);

    // Menu should display advance button
    const advanceButton = screen.getByRole('button', { name: /Advance stage/i });
    expect(advanceButton).toBeInTheDocument();
    fireEvent.click(advanceButton);

    expect(handleUpdate).toHaveBeenCalledWith(
      'v-test-1',
      expect.objectContaining({ status: 'contacted' })
    );
  });

  it('allows triggering vendor deletion from card action menu', () => {
    const handleUpdate = vi.fn();
    const handleDelete = vi.fn();
    const handleNegotiate = vi.fn();

    render(
      <VendorKanban
        vendors={mockVendors}
        currency="INR"
        onUpdateVendor={handleUpdate}
        onDeleteVendor={handleDelete}
        onOpenNegotiation={handleNegotiate}
      />
    );

    const actionButtons = screen.getAllByRole('button', { name: /Actions for/i });
    fireEvent.click(actionButtons[0]);

    const deleteButton = screen.getByRole('button', { name: /Delete vendor/i });
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith('v-test-1');
  });

  it('renders side-by-side vendor quote table and allows opening negotiation', () => {
    const handleUpdate = vi.fn();
    const handleNegotiate = vi.fn();

    render(
      <VendorQuoteTable
        vendors={mockVendors}
        currency="INR"
        onUpdateVendor={handleUpdate}
        onOpenNegotiation={handleNegotiate}
      />
    );

    expect(screen.getByText('Premier Sound Works')).toBeInTheDocument();
    expect(screen.getByText('Artisan Floral Collective')).toBeInTheDocument();

    // Click Vet & negotiate
    const vetButtons = screen.getAllByRole('button', { name: /Vet & negotiate/i });
    expect(vetButtons.length).toBeGreaterThan(0);
    fireEvent.click(vetButtons[0]);

    expect(handleNegotiate).toHaveBeenCalled();
  });
});
