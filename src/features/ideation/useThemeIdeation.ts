import { useState, useEffect } from 'react';
import { ThemeIdea } from '../../types/ideation';
import { EventWorkspaceState } from '../../types/state';
import { PersonalizedActivity } from './PersonalizedActivitiesView';
import { generateThemeIdea } from '../../services/geminiService';
import { getLocalThemeIdea } from '../../services/deterministicFallback';
import { logger } from '../../utils/logger';

interface UseThemeIdeationProps {
  state: EventWorkspaceState;
  addBudgetItem: (item: EventWorkspaceState['budgetItems'][0]) => void;
  addMacroTask: (task: EventWorkspaceState['macroTasks'][0]) => void;
  addDayOfActivity: (act: EventWorkspaceState['dayOfActivities'][0]) => void;
  announce: (msg: string) => void;
}

export function useThemeIdeation({
  state,
  addBudgetItem,
  addMacroTask,
  addDayOfActivity,
  announce,
}: UseThemeIdeationProps) {
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

  return {
    idea,
    loading,
    vibePrompt,
    setVibePrompt,
    loadTheme,
    handleAddToPlan,
    handleAddActivityToTimeline,
    handleAddActivityToBudget,
  };
}
