import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddVendorForm } from '../features/vendors/useAddVendorForm';
import { useAddMacroTaskForm } from '../features/timeline/useAddMacroTaskForm';
import { useAddBudgetItemForm } from '../features/budget/useAddBudgetItemForm';
import { useAddActivityForm } from '../features/timeline/useAddActivityForm';

describe('Feature Form Hooks & Input Sanitization', () => {
  it('useAddVendorForm collects, validates, sanitizes, and submits new vendor', () => {
    const onAddVendor = vi.fn();
    const onClose = vi.fn();

    const { result } = renderHook(() =>
      useAddVendorForm({ onAddVendor, onClose })
    );

    act(() => {
      result.current.setName('  Royal Florist & Decor  ');
      result.current.setEstimatedPrice(75000);
      result.current.setCategory('decor');
      result.current.setContactName('Vikram Singh');
      result.current.setPhone('+91 98765 43210');
      result.current.setEmail('vikram@royaldecor.com');
      result.current.setDeliverables('Mandap floral, Entrance arch');
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    expect(onAddVendor).toHaveBeenCalledTimes(1);
    const addedVendor = onAddVendor.mock.calls[0][0];
    expect(addedVendor.name).toBe('Royal Florist & Decor');
    expect(addedVendor.estimatedPrice).toBe(75000);
    expect(addedVendor.deliverables).toHaveLength(2);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('useAddMacroTaskForm handles task creation with horizon and status', () => {
    const onAddTask = vi.fn();
    const onClose = vi.fn();

    const { result } = renderHook(() =>
      useAddMacroTaskForm({ onAddTask, onClose })
    );

    act(() => {
      result.current.setTitle('Book luxury bridal suite');
      result.current.setCategory('Venue');
      result.current.setPriority('high');
      result.current.setAssignee('Planner');
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    expect(onAddTask).toHaveBeenCalledTimes(1);
    const task = onAddTask.mock.calls[0][0];
    expect(task.title).toBe('Book luxury bridal suite');
    expect(task.priority).toBe('high');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('useAddBudgetItemForm creates budget line with allocated amounts', () => {
    const onAddBudgetItem = vi.fn();
    const onClose = vi.fn();

    const { result } = renderHook(() =>
      useAddBudgetItemForm({ onAddBudgetItem, onClose })
    );

    act(() => {
      result.current.setName('Artisanal Gin Bar Station');
      result.current.setCategory('catering');
      result.current.setAllocated(60000);
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    expect(onAddBudgetItem).toHaveBeenCalledTimes(1);
    const item = onAddBudgetItem.mock.calls[0][0];
    expect(item.name).toBe('Artisanal Gin Bar Station');
    expect(item.allocated).toBe(60000);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('useAddActivityForm creates day-of schedule activity with duration', () => {
    const onAddActivity = vi.fn();
    const onClose = vi.fn();

    const { result } = renderHook(() =>
      useAddActivityForm({ onAddActivity, onClose })
    );

    act(() => {
      result.current.setTitle('Grand Couple Entrance & Cake Cutting');
      result.current.setStartTime('20:00');
      result.current.setEndTime('20:45');
      result.current.setLocationZone('Ballroom Center Stage');
      result.current.setPoc('Lead Emcee & Stage Manager');
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    expect(onAddActivity).toHaveBeenCalledTimes(1);
    const activity = onAddActivity.mock.calls[0][0];
    expect(activity.title).toBe('Grand Couple Entrance & Cake Cutting');
    expect(activity.durationMinutes).toBe(45);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
