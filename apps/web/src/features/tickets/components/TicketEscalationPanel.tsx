import React, { useState } from 'react';
import { ticketsApi } from '../../../api/tickets';
import { ApiError } from '../../../api/client';

interface TicketEscalationPanelProps {
  ticketId: int;
  isCritical: boolean;
  isOpen: boolean;
  onEscalated: () => void;
}

export const TicketEscalationPanel: React.FC<TicketEscalationPanelProps> = ({
  ticketId,
  isCritical,
  isOpen,
  onEscalated,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isCritical || !isOpen) {
    return <p className="text-sm text-gray-500 italic">This ticket cannot be escalated.</p>;
  }

  const handleEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5 || reason.trim().length > 500) {
      setError('Escalation reason must be between 5 and 500 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await ticketsApi.escalateTicket(ticketId, { reason: reason.trim() });
      setReason('');
      onEscalated();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to escalate ticket.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleEscalate} className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Escalate Ticket</h3>
      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
      <textarea
        className="w-full p-2 border border-gray-300 rounded text-sm mb-2"
        rows={3}
        placeholder="Reason for escalation (5-500 characters)..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={isSubmitting || reason.trim().length < 5}
        className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Escalating...' : 'Escalate Ticket'}
      </button>
    </form>
  );
};
