import React from 'react';

interface FormattedAssistantMessageProps {
  content: string;
  isUser?: boolean;
}

function isBoldItalic(part: string): boolean {
  return part.startsWith('***') && part.endsWith('***') && part.length >= 6;
}

function isBold(part: string): boolean {
  return part.startsWith('**') && part.endsWith('**') && part.length >= 4;
}

function isItalic(part: string): boolean {
  return part.startsWith('*') && part.endsWith('*') && part.length >= 2;
}

function renderFormattedPart(part: string, index: number, isUser?: boolean): React.ReactNode {
  if (isBoldItalic(part)) {
    return (
      <strong
        key={index}
        className={
          isUser
            ? 'font-bold underline underline-offset-2 italic'
            : 'font-semibold italic text-stone-900 dark:text-white'
        }
      >
        {part.slice(3, -3)}
      </strong>
    );
  }
  if (isBold(part)) {
    return (
      <strong
        key={index}
        className={
          isUser
            ? 'font-bold underline underline-offset-2'
            : 'font-semibold text-stone-900 dark:text-white'
        }
      >
        {part.slice(2, -2)}
      </strong>
    );
  }
  if (isItalic(part)) {
    return (
      <em
        key={index}
        className={
          isUser
            ? 'italic'
            : 'italic text-stone-800 dark:text-zinc-200'
        }
      >
        {part.slice(1, -1)}
      </em>
    );
  }
  return <span key={index}>{part}</span>;
}

const renderInlineSpans = (text: string, isUser?: boolean): React.ReactNode[] => {
  const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*[^*]+?\*)/g);
  return parts.map((part, index) => renderFormattedPart(part, index, isUser));
};

export const FormattedAssistantMessage: React.FC<FormattedAssistantMessageProps> = ({
  content,
  isUser = false,
}) => {
  const paragraphs = content.split('\n\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {paragraphs.map((paragraph, pIdx) => {
        const lines = paragraph.split('\n');

        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Check numbered list: e.g. "1. ..."
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 ml-1">
                    <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 shrink-0 select-none">
                      {numMatch[1]}.
                    </span>
                    <span className="flex-1">
                      {renderInlineSpans(numMatch[2], isUser)}
                    </span>
                  </div>
                );
              }

              // Check bullet list: e.g. "• ..." or "- ..."
              const bulletMatch = trimmed.match(/^[•\-*]\s+(.*)/);
              if (bulletMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 ml-1">
                    <span className="text-amber-500 font-bold shrink-0 select-none">
                      •
                    </span>
                    <span className="flex-1">
                      {renderInlineSpans(bulletMatch[1], isUser)}
                    </span>
                  </div>
                );
              }

              return (
                <p key={lIdx}>
                  {renderInlineSpans(trimmed, isUser)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
