import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AddBudgetItemModal } from '../features/budget/AddBudgetItemModal';
import { AddVendorModal } from '../features/vendors/AddVendorModal';
import { AddGuestModal } from '../features/guests/AddGuestModal';
import { AddMacroTaskModal } from '../features/timeline/AddMacroTaskModal';
import { AddActivityModal } from '../features/timeline/AddActivityModal';

describe('Modal Forms Direct Input & Submit Tests', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

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
