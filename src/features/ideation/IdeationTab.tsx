import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ThemeIdea } from '../../types/ideation';
import { ThemeConceptCard } from './ThemeConceptCard';
import { PersonalizedActivitiesView, PersonalizedActivity } from './PersonalizedActivitiesView';
import { generateThemeIdea } from '../../services/geminiService';
import { getLocalThemeIdea } from '../../services/deterministicFallback';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { logger } from '../../utils/logger';
import { RefreshCw, Loader2, GitCompare } from 'lucide-react';

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
      <PageHeader
        title="Personalized AI Ideation Studio & Theme Engine"
        subtitle="Synthesizes color swatches, culinary pairings, and experiential moments with 1-click plan injection"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCopilotOpen(true)}
            icon={<GitCompare />}
          >
            Open "What-If" Ripple Simulator
          </Button>
        }
      />

      {/* Generator Prompt Bar */}
      <div className="flex gap-2 p-2 bg-stone-50/50 dark:bg-white/[0.02] rounded-xl border border-stone-200/80 dark:border-white/[0.08]">
        <input
          type="text"
          value={vibePrompt}
          onChange={(e) => setVibePrompt(e.target.value)}
          placeholder="Describe your design preference, seasonal vibe, or cultural nuance..."
          className="flex-1 text-xs px-3 py-2 bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-white/[0.08] rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-[#6E79F5]"
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
        <div className="py-20 flex flex-col items-center justify-center space-y-2 text-xs text-stone-500 dark:text-[#8B8B93]">
          <Loader2 className="w-6 h-6 animate-spin text-[#6E79F5]" />
          <p>Synthesizing color palettes, decor concepts, and experiential moments...</p>
        </div>
      ) : idea ? (
        <ThemeConceptCard
          idea={idea}
          currency={currency}
          onAddToPlan={handleAddToPlan}
        />
      ) : null}

      {/* Curated Experiential Moments */}
      <PersonalizedActivitiesView
        eventType={state.event.type}
        currency={currency}
        onAddToTimeline={handleAddActivityToTimeline}
        onAddToBudget={handleAddActivityToBudget}
      />
    </div>
  );
};
