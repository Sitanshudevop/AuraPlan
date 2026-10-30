import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { EventModalFormFields } from './EventModalFormFields';
import { useEditEventForm } from './useEditEventForm';

export const EditEventModal: React.FC = () => {
  const { state, updateEvent, isEditEventModalOpen, setEditEventModalOpen, currency, announce } = useWorkspace();

  const form = useEditEventForm({
    isOpen: isEditEventModalOpen,
    event: state.event,
    onUpdateEvent: updateEvent,
    onClose: () => setEditEventModalOpen(false),
    announce,
  });

  return (
    <Modal
      isOpen={isEditEventModalOpen}
      onClose={() => setEditEventModalOpen(false)}
      title="Edit event parameters"
      description="Update target budget, date, attendee count, and destination."
      maxWidth="lg"
    >
      <form onSubmit={form.handleSubmit} className="space-y-4">
        <EventModalFormFields
          name={form.name}
          setName={form.setName}
          type={form.type}
          setType={form.setType}
          date={form.date}
          setDate={form.setDate}
          city={form.city}
          setCity={form.setCity}
          guestCount={form.guestCount}
          setGuestCount={form.setGuestCount}
          targetBudget={form.targetBudget}
          setTargetBudget={form.setTargetBudget}
          currency={currency}
          setting={form.setting}
          setSetting={form.setSetting}
          culturalPreferences={form.culturalPreferences}
          setCulturalPreferences={form.setCulturalPreferences}
          hasError={false}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-hairline">
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditEventModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
