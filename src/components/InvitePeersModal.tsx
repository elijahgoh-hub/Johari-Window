import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  ShieldCheck, 
  Mail, 
  MessageSquare, 
  Users
} from 'lucide-react';
import { sessionStore } from '../utils/sessionStore';

interface InvitePeersModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  leaderName: string;
  leaderTitle?: string;
  peerCount: number;
}

export const InvitePeersModal: React.FC<InvitePeersModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  leaderName,
  leaderTitle = 'Executive Leader',
  peerCount,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  // Carries the session id only — no owner token, so peers cannot open the dashboard.
  const inviteUrl = sessionStore.getPeerInviteUrl(sessionId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const emailSubject = `360° Johari Window Feedback Request for ${leaderName}`;
  const emailBody = `Hi,\n\nI am conducting a 360° Johari Window leadership assessment to understand my leadership strengths, communication style, and blind spots.\n\nCould you please take 2-3 minutes to provide anonymous feedback by selecting 6 adjectives that best describe how you observe my leadership?\n\n👉 Peer Review Link: ${inviteUrl}\n\nYour feedback is 100% anonymous—I will only see aggregated group counts across all peers. Thank you for your support!\n\nBest regards,\n${leaderName}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#300266] text-white flex items-center justify-between border-b border-[#46098c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#801ED7] flex items-center justify-center text-white font-bold shadow-md shadow-[#801ED7]/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Invite Peers to Assess You</h2>
              <p className="text-xs text-[#C9C4FF]">Share your private, anonymous 360° feedback link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#46098c] flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Peer Counter Badge */}
          <div className="p-4 bg-[#FAFAFD] rounded-xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C9C4FF] text-[#300266] flex items-center justify-center font-black text-xs">
                {peerCount}
              </div>
              <div>
                <div className="text-xs font-bold text-[#300266]">
                  {peerCount === 0 ? 'Awaiting Peer Responses' : `${peerCount} Peer Assessment${peerCount > 1 ? 's' : ''} Completed`}
                </div>
                <div className="text-[11px] text-gray-500">
                  Recommended: 3 to 5 peer reviews for high-confidence consensus
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3" />
                100% Anonymous
              </span>
            </div>
          </div>

          {/* Unique Link Input Card */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#300266]">
              Your Unique Peer Review Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 px-3.5 py-2.5 bg-[#FAFAFD] border border-gray-300 rounded-xl text-xs font-mono text-[#300266] select-all focus:outline-none focus:ring-2 focus:ring-[#801ED7]"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-[#300266] hover:bg-[#801ED7] text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Email Invitation Template Action */}
          <div className="space-y-2">
            <button
              onClick={handleCopyEmail}
              className="w-full p-3.5 bg-white hover:bg-[#FAFAFD] border border-gray-200 hover:border-[#801ED7]/40 rounded-xl flex items-center justify-between text-xs font-bold text-[#300266] transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#801ED7]" />
                <div>
                  <div className="text-xs font-bold text-[#300266]">
                    {copiedEmail ? 'Email Invitation Copied to Clipboard!' : 'Copy Ready-to-Send Email Invitation'}
                  </div>
                  <div className="text-[11px] text-gray-500 font-normal">
                    Includes invitation wording, instructions, and your unique peer review link
                  </div>
                </div>
              </div>
              <span className="text-xs text-[#801ED7] font-bold">
                {copiedEmail ? 'Copied!' : 'Copy'}
              </span>
            </button>
          </div>

          {/* Psychological Safety Guarantee Box */}
          <div className="p-4 rounded-xl bg-[#FAFAFD] border border-[#C9C4FF] space-y-1.5">
            <div className="text-xs font-bold text-[#300266] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#801ED7]" />
              <span>How Peer Feedback Works</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              When peers open this link, they see your name, select their relationship to you, and pick 6 adjectives from the 55 Johari list. They cannot access your dashboard, and you will never see individual names or submissions.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAFAFD] border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#300266] hover:bg-[#801ED7] text-white text-xs font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
