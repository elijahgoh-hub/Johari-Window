import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Shield, 
  Users, 
  ArrowRight, 
  Compass, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Trash2, 
  KeyRound,
  Bookmark
} from 'lucide-react';
import { sessionStore, StoredSessionData } from '../utils/sessionStore';

interface StartAssessmentViewProps {
  onStart: (leaderName: string, leaderTitle: string) => void | Promise<void>;
  onResumeSession?: (sessionId: string, ownerToken?: string) => void;
}

export const StartAssessmentView: React.FC<StartAssessmentViewProps> = ({ 
  onStart,
  onResumeSession 
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualSessionId, setManualSessionId] = useState('');
  const [savedSessions, setSavedSessions] = useState<StoredSessionData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSavedSessions(sessionStore.getAllSavedSessions());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onStart(name.trim(), title.trim() || 'Executive Leader');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the session.');
      setIsSubmitting(false);
    }
  };

  /**
   * Accepts a full dashboard URL or a bare session id. Resuming needs the
   * owner token, so a pasted link is the reliable path — a bare id only works
   * if this browser already holds the token.
   */
  const handleResumeManual = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = manualSessionId.trim();
    if (!raw) return;

    let sessionId = raw;
    let ownerToken: string | undefined;

    const query = raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : raw;
    const params = new URLSearchParams(query);
    if (params.get('session')) {
      sessionId = params.get('session') as string;
      ownerToken = params.get('token') || undefined;
    }

    if (!sessionId) return;
    onResumeSession?.(sessionId, ownerToken);
  };

  const handleDeleteSaved = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await sessionStore.deleteSession(id);
    setSavedSessions(sessionStore.getAllSavedSessions());
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-[#FAFAFD]">
      <div className="max-w-2xl w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-9 border border-gray-200 shadow-xl space-y-6">
          {/* Header Icon & Title */}
          <div className="text-center space-y-2.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FFA524] rounded-2xl flex items-center justify-center text-[#300266] mx-auto shadow-lg shadow-[#FFA524]/25">
              <Compass className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD4BC] text-[#300266] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#801ED7]" />
              <span>Private 360° Johari Platform</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#300266] tracking-tight">
              Leadership Johari Window
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
              Evaluate your self-perception, invite anonymous peer feedback, and discover your Arena, Blind Spots, and Hidden Strengths.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div>
              <label htmlFor="leader-name-input" className="block text-xs font-bold uppercase tracking-wider text-[#300266] mb-1.5">
                Your Full Name <span className="text-[#FFA524]">*</span>
              </label>
              <input
                id="leader-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-4 py-3 bg-[#FAFAFD] border border-gray-300 rounded-xl text-sm font-medium text-[#300266] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#801ED7] focus:bg-white transition"
              />
            </div>

            <div>
              <label htmlFor="leader-title-input" className="block text-xs font-bold uppercase tracking-wider text-[#300266] mb-1.5">
                Your Leadership Title / Role <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                id="leader-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. VP of Product / Engineering Lead"
                className="w-full px-4 py-3 bg-[#FAFAFD] border border-gray-300 rounded-xl text-sm font-medium text-[#300266] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#801ED7] focus:bg-white transition"
              />
            </div>

            {/* Assessment Checklist */}
            <div className="p-3.5 bg-[#FAFAFD] rounded-xl border border-[#C9C4FF] space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#300266] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#801ED7]" />
                <span>How the Assessment Works</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1.5 leading-relaxed">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#801ED7] shrink-0" />
                  <span><strong>Step 1:</strong> Select 6 leadership traits describing yourself.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#801ED7] shrink-0" />
                  <span><strong>Step 2:</strong> Share your private link for anonymous peer reviews.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#801ED7] shrink-0" />
                  <span><strong>Step 3:</strong> Uncover blind spots and generate coaching insights.</span>
                </li>
              </ul>
            </div>

            {error && (
              <p className="text-xs font-semibold text-[#E9371F] bg-[#FFF6F0] border border-[#FFA524] rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              id="btn-start-assessment"
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-[#FFA524] hover:bg-[#E9371F] disabled:opacity-50 disabled:cursor-not-allowed text-[#300266] hover:text-white font-extrabold text-sm transition shadow-lg shadow-[#FFA524]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Generating Session...' : 'Start Assessment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Existing Saved Sessions & Re-Access Section */}
        {savedSessions.length > 0 && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#801ED7]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#300266]">
                  Resume Previous Assessment on this Device
                </h2>
              </div>
              <span className="text-[11px] text-gray-400">{savedSessions.length} saved</span>
            </div>

            <div className="space-y-2">
              {savedSessions.map((item) => (
                <div
                  key={item.session.id}
                  onClick={() => onResumeSession && onResumeSession(item.session.id)}
                  className="p-3.5 bg-[#FAFAFD] hover:bg-[#C9C4FF]/20 border border-gray-200 hover:border-[#801ED7]/40 rounded-xl cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-[#300266] group-hover:text-[#801ED7] transition">
                      {item.session.leaderName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{item.session.leaderTitle || 'Leader'}</span>
                      <span>&bull;</span>
                      <span className="font-semibold text-[#801ED7]">
                        {item.peerSelections?.length || 0} peer reviews
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSaved(e, item.session.id)}
                      title="Remove from saved"
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-white rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="px-3 py-1 bg-[#300266] group-hover:bg-[#801ED7] text-white text-xs font-bold rounded-lg transition flex items-center gap-1">
                      <span>Resume</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Access info footer */}
        <div className="p-4 bg-white/70 rounded-xl border border-gray-200 text-xs text-gray-500 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#300266]">
            <Bookmark className="w-3.5 h-3.5 text-[#FFA524]" />
            <span>How to access your assessment anytime</span>
          </div>
          <p className="leading-relaxed">
            Your assessment URL is permanent (e.g. <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800 text-[11px]">?session=xyz</code>). You can bookmark the page or click <strong>&ldquo;Copy My Link&rdquo;</strong> in the top navbar to return to your dashboard whenever you want.
          </p>
        </div>

      </div>
    </div>
  );
};
