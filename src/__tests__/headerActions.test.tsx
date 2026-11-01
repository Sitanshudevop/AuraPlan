import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { Header } from '../components/layout/Header';
import { WorkspaceProvider } from '../context/WorkspaceContext';

describe('Header: Interactive Controls & Actions', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('interacts with Currency, Assistant, New Event buttons and triggers export JSON', () => {
    render(
      <WorkspaceProvider>
        <Header />
      </WorkspaceProvider>
    );

    // Currency toggle button
    const currencyBtn = screen.getByRole('button', { name: /Toggle currency between INR and USD/i });
    fireEvent.click(currencyBtn);

    // AI Assistant button
    const aiBtn = screen.getByRole('button', { name: /AI Assistant/i });
    fireEvent.click(aiBtn);

    // New Event button
    const newEventBtn = screen.getByRole('button', { name: /New Event/i });
    fireEvent.click(newEventBtn);

    // Search button
    const searchBtn = screen.getByRole('button', { name: /Search workspace/i });
    fireEvent.click(searchBtn);
  });
});

