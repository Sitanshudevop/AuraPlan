import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ThemeConceptCard } from './ThemeConceptCard';
import { PersonalizedActivitiesView } from './PersonalizedActivitiesView';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { RefreshCw, Loader2, GitCompare } from 'lucide-react';
import { useThemeIdeation } from './useThemeIdeation';

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

  const {
    idea,
    loading,
    vibePrompt,
    setVibePrompt,
    loadTheme,
    handleAddToPlan,
    handleAddActivityToTimeline,
    handleAddActivityToBudget,
  } = useThemeIdeation({
    state,
    addBudgetItem,
    addMacroTask,
    addDayOfActivity,
    announce,
  });

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
