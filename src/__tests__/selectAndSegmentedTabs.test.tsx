import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Select } from '../components/ui/Select';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';

describe('Select and SegmentedTabs Keyboard & Interaction Behaviors', () => {
  afterEach(() => {
    cleanup();
  });

  const options = [
    { value: 'opt1', label: 'Option 1', dotColor: 'bg-emerald-500' },
    { value: 'opt2', label: 'Option 2', dotColor: 'bg-indigo-500' },
    { value: 'opt3', label: 'Option 3' },
  ];

  it('toggles Select dropdown on button click and selects option on click', () => {
    const handleChange = vi.fn();
    render(<Select value="opt1" onChange={handleChange} options={options} ariaLabel="Test Select" />);

    const button = screen.getByRole('button', { name: /Test Select/i });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const opt2 = screen.getByRole('option', { name: /Option 2/i });
    fireEvent.click(opt2);

    expect(handleChange).toHaveBeenCalledWith('opt2');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('navigates options via keyboard: ArrowDown, ArrowUp, Space/Enter, and Escape', () => {
    const handleChange = vi.fn();
    render(<Select value="opt1" onChange={handleChange} options={options} ariaLabel="Test Select" />);

    const button = screen.getByRole('button', { name: /Test Select/i });

    // Open via ArrowDown
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Navigate down and up
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    fireEvent.keyDown(button, { key: 'ArrowUp' });

    // Close via Escape
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    // Reopen via Enter and select with Space
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleChange).toHaveBeenCalled();
  });

  it('closes Select dropdown when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside Area</div>
        <Select value="opt1" onChange={vi.fn()} options={options} />
      </div>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('supports compact and ghost variants and disabled state', () => {
    const { rerender } = render(<Select value="opt1" onChange={vi.fn()} options={options} variant="compact" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Select value="opt1" onChange={vi.fn()} options={options} variant="ghost" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Select value="opt1" onChange={vi.fn()} options={options} disabled />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders SegmentedTabs in underline and segmented variants with counts', () => {
    const handleTabChange = vi.fn();
    const tabs = [
      { id: 'tab1', label: 'First Tab', count: 5 },
      { id: 'tab2', label: 'Second Tab', count: 12 },
    ];

    const { rerender } = render(
      <SegmentedTabs tabs={tabs} activeTab="tab1" onChange={handleTabChange} variant="underline" />
    );
    expect(screen.getByText('First Tab')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Second Tab'));
    expect(handleTabChange).toHaveBeenCalledWith('tab2');

    rerender(
      <SegmentedTabs tabs={tabs} activeTab="tab2" onChange={handleTabChange} variant="segmented" />
    );
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});

