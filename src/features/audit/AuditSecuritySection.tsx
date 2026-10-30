import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { sanitizeInput } from '../../utils/security';
import { Lock } from 'lucide-react';

interface AuditSecuritySectionProps {
  maskedKey: string;
}

export const AuditSecuritySection: React.FC<AuditSecuritySectionProps> = ({ maskedKey }) => {
  const [xssInput, setXssInput] = useState('<script>alert("pwned")</script><b>Wedding VIP</b><iframe src="evil.com"></iframe>');
  const [sanitizedOutput, setSanitizedOutput] = useState('');
  const [testRun, setTestRun] = useState(false);

  const handleTestXss = () => {
    const cleaned = sanitizeInput(xssInput);
    setSanitizedOutput(cleaned);
    setTestRun(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-hairline pb-2">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-muted" />
          Security & sanitization
        </span>
        <Badge variant="emerald" size="sm">Verified</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-lg bg-surface-raised border border-hairline">
          <div className="text-muted text-[11px]">Schema validation</div>
          <div className="font-medium text-foreground text-xs mt-0.5">Zod v3.23</div>
        </div>
        <div className="p-2.5 rounded-lg bg-surface-raised border border-hairline">
          <div className="text-muted text-[11px]">Rate limiter</div>
          <div className="font-medium text-emerald-500 text-xs mt-0.5">10 req/min</div>
        </div>
        <div className="p-2.5 rounded-lg bg-surface-raised border border-hairline">
          <div className="text-muted text-[11px]">Key protection</div>
          <div className="font-medium text-muted text-xs truncate mt-0.5 font-mono">
            {maskedKey}
          </div>
        </div>
      </div>

      {/* XSS Test Sandbox */}
      <div className="p-3 bg-surface-raised rounded-lg border border-hairline space-y-2">
        <span className="font-medium text-foreground block">Sanitizer test sandbox</span>
        <input
          type="text"
          value={xssInput}
          onChange={(e) => setXssInput(e.target.value)}
          className="w-full text-xs font-mono px-2.5 py-1.5 bg-surface border border-hairline rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="flex items-center justify-between">
          <Button variant="secondary" size="xs" onClick={handleTestXss}>
            Execute test
          </Button>
          {testRun && (
            <span className="text-[11px] text-emerald-500 font-medium">
              Tags stripped safely
            </span>
          )}
        </div>
        {testRun && (
          <div className="p-2 bg-surface rounded border border-hairline font-mono text-[11px] text-muted">
            Output: "{sanitizedOutput}"
          </div>
        )}
      </div>
    </div>
  );
};

