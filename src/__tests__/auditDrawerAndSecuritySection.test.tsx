import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AuditSecuritySection } from '../features/audit/AuditSecuritySection';
import { AuditDrawer } from '../features/audit/AuditDrawer';
import { WorkspaceProvider } from '../context/WorkspaceContext';

describe('AuditDrawer and AuditSecuritySection Diagnostic Behaviors', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('AuditSecuritySection renders masked key and interactive XSS sanitizer sandbox', () => {
    render(<AuditSecuritySection maskedKey="AIzaSy...DEMO" />);

    expect(screen.getByText('AIzaSy...DEMO')).toBeInTheDocument();
    expect(screen.getByText('Security & sanitization')).toBeInTheDocument();

    const input = screen.getByDisplayValue(/<script>alert\("pwned"\)<\/script>/i);
    expect(input).toBeInTheDocument();

    const testBtn = screen.getByRole('button', { name: /Execute test/i });
    fireEvent.click(testBtn);

    expect(screen.getByText(/Tags stripped safely/i)).toBeInTheDocument();
    expect(screen.getByText(/Wedding VIP/i)).toBeInTheDocument();
  });

  it('AuditSecuritySection allows custom malicious inputs in XSS sandbox', () => {
    render(<AuditSecuritySection maskedKey="KEY_MOCK" />);

    const input = screen.getByDisplayValue(/<script>alert\("pwned"\)<\/script>/i);
    fireEvent.change(input, {
      target: { value: '<img src=x onerror=alert(1)>Custom Clean Text' },
    });

    const testBtn = screen.getByRole('button', { name: /Execute test/i });
    fireEvent.click(testBtn);

    expect(screen.getByText(/Tags stripped safely/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom Clean Text/i)).toBeInTheDocument();
  });

  it('AuditDrawer renders diagnostic metrics and handles reset to factory defaults', () => {
    render(
      <WorkspaceProvider>
        <AuditDrawerTriggerHelper />
      </WorkspaceProvider>
    );

    // Open audit drawer
    const openBtn = screen.getByRole('button', { name: /Open Audit/i });
    fireEvent.click(openBtn);

    expect(screen.getByRole('dialog', { name: /System health & audit/i })).toBeInTheDocument();
    expect(screen.getByText(/Accessibility \(WCAG 2.1 AA\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Performance & storage/i)).toBeInTheDocument();

    // Trigger reset button
    const resetBtn = screen.getByRole('button', { name: /Reset data to factory presets/i });
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);

    // Close drawer
    const closeBtn = screen.getByRole('button', { name: /Close audit drawer/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog', { name: /System health & audit/i })).not.toBeInTheDocument();
  });
});

import { useWorkspace } from '../context/WorkspaceContext';

function AuditDrawerTriggerHelper() {
  const { setAuditDrawerOpen } = useWorkspace();
  return (
    <>
      <button onClick={() => setAuditDrawerOpen(true)}>Open Audit</button>
      <AuditDrawer />
    </>
  );
}
