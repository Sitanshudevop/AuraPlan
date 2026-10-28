import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ThemeIdea } from '../../types/ideation';
import { ThemeConceptCard } from './ThemeConceptCard';
import { PersonalizedActivitiesView, PersonalizedActivity } from './PersonalizedActivitiesView';
import { generateThemeIdea } from '../../services/geminiService';
import { getLocalThemeIdea } from '../../services/deterministicFallback';
import { Button } from '../../components/ui/Button';
import { logger } from '../../utils/logger';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';

export const IdeationTab: React.FC = () => {
  const {
    state,
    currency,
    addBudgetItem,
    addMacroTask,
    addDayOfActivity,
    setCopilotOpen,
    announce,
  } = useWorkspace();

  const [idea, setIdea] = useState<ThemeIdea | null>(() =>
    getLocalThemeIdea(state.event.type, state.event.culturalPreferences)
  );
  const [loading, setLoading] = useState(false);
  const [vibePrompt, setVibePrompt] = useState(state.event.culturalPreferences || '');

  const loadTheme = async (vibe: string) => {
    setLoading(true);
    try {
      const result = await generateThemeIdea(state.event.type, vibe);
      setIdea(result);
    } catch (err) {
      logger.error('Theme generation failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setVibePrompt(state.event.culturalPreferences || '');
    setIdea(getLocalThemeIdea(state.event.type, state.event.culturalPreferences));
  }, [state.event.type, state.event.id]);

  const handleAddToPlan = (
    title: string,
    cost: number,
    category: 'decor' | 'av_photo' | 'venue' | 'catering',
    timelineTask: string
  ) => {
    addBudgetItem({
      id: `b-idea-${Date.now()}`,
      category,
      name: title,
      allocated: cost,
      vendorQuote: cost,
      actualContracted: 0,
      amountPaid: 0,
      isLocked: false,
    });

    addMacroTask({
      id: `mt-idea-${Date.now()}`,
      horizon: '1_week',
      title: timelineTask,
      category: 'Design & Concept',
      priority: 'high',
      assignee: 'Production Lead',
      dueDate: state.event.date,
      completed: false,
    });

    announce(`Injected "${title}" into Budget and Timeline`);
  };

  const handleAddActivityToTimeline = (act: PersonalizedActivity) => {
    addDayOfActivity({
      id: `act-day-${Date.now()}`,
      startTime: '19:00',
      endTime: '20:30',
      title: act.title,
      durationMinutes: act.durationMinutes,
      locationZone: act.location,
      poc: act.poc,
      notes: act.description,
    });
    announce(`Scheduled "${act.title}" in Day-Of Run-of-Show`);
  };

  const handleAddActivityToBudget = (act: PersonalizedActivity) => {
    addBudgetItem({
      id: `b-act-${Date.now()}`,
      category: act.category,
      name: act.title,
      allocated: act.estimatedCost,
      vendorQuote: act.estimatedCost,
      actualContracted: 0,
      amountPaid: 0,
      isLocked: false,
      notes: act.description,
    });
    announce(`Allocated budget for "${act.title}"`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Ripple Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#18181B] dark:text-[#FAFAFA] tracking-tight">
            Personalized AI Ideation Studio & Theme Engine
          </h2>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Synthesizes hex palettes, decor concepts, and experiential activity moments with 1-click plan injection
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCopilotOpen(true)}
          icon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
        >
          Open "What-If" Ripple Simulator
        </Button>
      </div>

      {/* Generator Prompt Bar */}
      <div className="flex gap-2 p-3 bg-stone-100/70 dark:bg-zinc-900/60 rounded-xl border border-stone-200 dark:border-zinc-800">
        <input
          type="text"
          value={vibePrompt}
          onChange={(e) => setVibePrompt(e.target.value)}
          placeholder="Describe your design preference, seasonal mood, or cultural nuances..."
          className="flex-1 text-xs px-3 py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none dark:text-white"
        />
        <Button
          variant="secondary"
          size="sm"
          disabled={loading}
          onClick={() => loadTheme(vibePrompt)}
          icon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        >
          {loading ? 'Synthesizing...' : 'Regenerate'}
        </Button>
      </div>

      {/* Render AI Concept Card */}
      {loading && !idea ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-stone-800 dark:text-zinc-200" />
          <p className="text-xs font-mono text-stone-500">
            Synthesizing color swatches, culinary pairings, and experiential moments...
          </p>
        </div>
      ) : idea ? (
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-stone-50/60 dark:bg-zinc-950/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-full shadow-sm">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span className="text-xs font-medium text-stone-700 dark:text-zinc-300">
                  Refreshing theme concepts...
                </span>
              </div>
            </div>
          )}
          <ThemeConceptCard
            idea={idea}
            currency={currency}
            onAddToPlan={handleAddToPlan}
          />
        </div>
      ) : null}

      {/* Curated Experiential Moments & Activities */}
      <PersonalizedActivitiesView
        eventType={state.event.type}
        currency={currency}
        onAddToTimeline={handleAddActivityToTimeline}
        onAddToBudget={handleAddActivityToBudget}
      />
    </div>
  );
};
