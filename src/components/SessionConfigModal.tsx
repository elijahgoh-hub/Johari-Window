import React, { useState } from 'react';
import { UserSession } from '../types/johari';
import { PlusCircle, X, Compass, Check } from 'lucide-react';

interface SessionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (session: UserSession) => void;
}

export const SessionConfigModal: React.FC<SessionConfigModalProps> = ({
  isOpen,
  onClose,
  onCreateSession,
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [focusArea, setFocusArea] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSession: UserSession = {
      id: `session-${Date.now()}`,
      leaderName: name.trim(),
      leaderTitle: title.trim() || 'Executive Leader',
      organization: organization.trim() || 'Enterprise Leadership Cohort',
      focusArea: focusArea.trim() || 'Executive Self-Awareness & 360 Feedback',
      createdTimestamp: Date.now(),
    };

    onCreateSession(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5A1D] flex items-center justify-center text-white font-bold shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#1A1A1A] text-lg">Start New Assessment</h3>
              <p className="text-xs text-gray-500">Configure participant leadership profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Leader Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-3.5 py-2.5 bg-[#F4F4F4] border border-gray-300 rounded-xl text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF5A1D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Role / Executive Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. VP of Product Strategy"
              className="w-full px-3.5 py-2.5 bg-[#F4F4F4] border border-gray-300 rounded-xl text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF5A1D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Organization / Department
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Braze Enterprise Growth"
              className="w-full px-3.5 py-2.5 bg-[#F4F4F4] border border-gray-300 rounded-xl text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF5A1D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Leadership Focus Mandate
            </label>
            <input
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="e.g. Cross-Functional Influence & Strategic Scaling"
              className="w-full px-3.5 py-2.5 bg-[#F4F4F4] border border-gray-300 rounded-xl text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF5A1D]"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-[#1A1A1A] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#FF5A1D] hover:bg-[#E04E17] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#FF5A1D]/20 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Initialize Session</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
