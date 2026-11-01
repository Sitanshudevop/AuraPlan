import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { VendorsTab } from '../features/vendors/VendorsTab';
import { WorkspaceProvider } from '../context/WorkspaceContext';

describe('Vendor Kanban Pipeline and Layout Switching (F7)', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('exercises VendorsTab layout buttons, tab switching, and modal triggers', () => {
    render(
      <WorkspaceProvider>
        <VendorsTab />
      </WorkspaceProvider>
    );

    const addBtn = screen.getByRole('button', { name: /Add Vendor/i });
    fireEvent.click(addBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close modal/i });
    fireEvent.click(closeBtn);

    const kanbanBtn = screen.getByRole('button', { name: /Kanban/i });
    fireEvent.click(kanbanBtn);

    const tableBtn = screen.getByRole('button', { name: /Table/i });
    fireEvent.click(tableBtn);
  });
});

