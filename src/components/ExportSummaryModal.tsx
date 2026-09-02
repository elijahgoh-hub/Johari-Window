import React, { useState } from 'react';
import { DetailedJohariAnalysis, UserSession, CompetencyCategory } from '../types/johari';
import { 
  Download, 
  Copy, 
  Check, 
  X, 
  FileText, 
  Printer, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  BarChart3, 
  Eye, 
  Lock, 
  Layers
} from 'lucide-react';
import { LEADERSHIP_COMPETENCIES, getJohariAdjective } from '../data/johariAdjectives';

interface ExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  analysis: DetailedJohariAnalysis;
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
  isOpen,
  onClose,
  session,
  analysis,
}) => {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'markdown'>('pdf');

  if (!isOpen) return null;

  const { quadrants, totalPeers, keyTakeaways, competencyDistribution, adjectiveStats } = analysis;
  const categories = Object.keys(LEADERSHIP_COMPETENCIES) as CompetencyCategory[];

  const generateMarkdownReport = () => {
    return `# BRAZE 360° JOHARI WINDOW & EXECUTIVE LEADERSHIP REPORT
Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Leader: ${session.leaderName} (${session.leaderTitle || 'Executive Leader'})
Organization / Cohort: ${session.organization || 'Executive Leadership'}
Total Anonymous Reviewers: ${totalPeers} Peers

================================================================================
EXECUTIVE SUMMARY & COACHING PRIORITY
================================================================================
Priority Action: "${keyTakeaways.recommendedAction}"

Core Arena Expansion Strategy:
1. Feedback Solicitation (Shrink Blind Spot):
   - Observed Peer Traits: ${quadrants.blindSpot.join(', ') || 'None'}
   - Inquiry Action: Solicit context from colleagues on these traits to turn them into active, conscious strengths.

2. Disclosure & Authenticity (Shrink Façade):
   - Internal / Undercommunicated Traits: ${quadrants.facade.join(', ') || 'None'}
   - Disclosure Action: Express and demonstrate these core values more visibly in team operations and strategic meetings.

================================================================================
1. THE 4-QUADRANT JOHARI WINDOW MATRIX
================================================================================
[QUADRANT 1: THE ARENA] - Known to Self & Known to Others (${quadrants.arena.length} Traits)
${quadrants.arena.length > 0 ? quadrants.arena.map((a) => `• ${a} (${adjectiveStats[a]?.peerCount || 0} peer affirmations)`).join('\n') : '• No shared traits identified'}

[QUADRANT 2: THE BLIND SPOT] - Known to Others & Not Claimed in Self-Image (${quadrants.blindSpot.length} Traits)
${quadrants.blindSpot.length > 0 ? quadrants.blindSpot.map((b) => `• ${b} (${adjectiveStats[b]?.peerCount || 0} peer affirmations)`).join('\n') : '• No blind spot traits identified'}

[QUADRANT 3: THE FAÇADE] - Known to Self & Not Observed by Peers (${quadrants.facade.length} Traits)
${quadrants.facade.length > 0 ? quadrants.facade.map((f) => `• ${f} (Self-selected)`).join('\n') : '• No hidden traits identified'}

[QUADRANT 4: THE UNKNOWN] - Latent Potential (${quadrants.unknown.length} Traits)
${quadrants.unknown.length} Canonical traits remaining for future executive growth and developmental stretch.

================================================================================
2. LEADERSHIP COMPETENCY MAPPING (LCM 360°)
================================================================================
${categories
  .map((catKey) => {
    const comp = LEADERSHIP_COMPETENCIES[catKey];
    const score = competencyDistribution[catKey] || { total: 0, arena: 0, blindSpot: 0, facade: 0 };
    return `• ${comp?.name || catKey}: ${score.total} Total Alignment Points (Arena: ${score.arena}, Blind Spot: ${score.blindSpot}, Façade: ${score.facade})`;
  })
  .join('\n')}

================================================================================
3. 30-DAY EXECUTIVE DEVELOPMENT MILESTONES
================================================================================
• Week 1-2: Review Blind Spot traits (${quadrants.blindSpot.slice(0, 3).join(', ') || 'identified traits'}) with a trusted sponsor or peer.
• Week 3-4: Intentionally demonstrate 1 Façade trait (${quadrants.facade.slice(0, 2).join(', ') || 'core strength'}) in an enterprise forum.
• Ongoing: Maintain high psychological safety to foster transparent upward feedback.
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([generateMarkdownReport()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `Johari_360_Report_${session.leaderName.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Executive Johari Window 360° Debrief - ${session.leaderName}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 14mm 16mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #300266;
              background: #ffffff;
              line-height: 1.45;
              font-size: 11px;
              margin: 0;
              padding: 0;
            }
            .header-banner {
              border-bottom: 2px solid #300266;
              padding-bottom: 12px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .title {
              font-size: 22px;
              font-weight: 900;
              letter-spacing: -0.5px;
              color: #300266;
              margin: 0 0 4px 0;
            }
            .subtitle {
              font-size: 12px;
              color: #801ED7;
              font-weight: 600;
              margin: 0;
            }
            .badge {
              background: #300266;
              color: #FFA524;
              font-weight: bold;
              font-size: 10px;
              padding: 3px 8px;
              border-radius: 4px;
              display: inline-block;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
              background: #FAFAFD;
              border: 1px solid #C9C4FF;
              border-radius: 6px;
              padding: 10px;
              margin-bottom: 16px;
            }
            .meta-item label {
              display: block;
              font-size: 9px;
              text-transform: uppercase;
              color: #801ED7;
              font-weight: bold;
            }
            .meta-item span {
              font-size: 12px;
              font-weight: bold;
              color: #300266;
            }
            .section-title {
              font-size: 13px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 1px solid #C9C4FF;
              padding-bottom: 4px;
              margin: 16px 0 10px 0;
              color: #300266;
            }
            .coaching-card {
              background: #FAFAFD;
              border: 1px solid #FFD4BC;
              border-left: 4px solid #FFA524;
              border-radius: 6px;
              padding: 10px 14px;
              margin-bottom: 16px;
            }
            .coaching-card h4 {
              margin: 0 0 4px 0;
              color: #300266;
              font-size: 11px;
              text-transform: uppercase;
              font-weight: bold;
            }
            .coaching-card p {
              margin: 0;
              font-size: 12px;
              font-weight: 600;
              color: #300266;
            }
            .matrix-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-bottom: 16px;
              page-break-inside: avoid;
            }
            .quadrant-box {
              border: 1px solid #e0e0e0;
              border-radius: 6px;
              padding: 10px;
              background: #ffffff;
            }
            .quadrant-box.arena { border-top: 3px solid #300266; }
            .quadrant-box.blind { border-top: 3px solid #801ED7; }
            .quadrant-box.facade { border-top: 3px solid #FFA524; }
            .quadrant-box.unknown { border-top: 3px solid #9ca3af; }
            .quadrant-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            }
            .quadrant-title {
              font-size: 12px;
              font-weight: 800;
              color: #300266;
            }
            .quadrant-tag {
              font-size: 9px;
              font-weight: bold;
              padding: 2px 6px;
              border-radius: 3px;
              background: #FAFAFD;
              color: #801ED7;
            }
            .trait-pills {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
            }
            .trait-pill {
              font-size: 10px;
              font-weight: 700;
              padding: 3px 7px;
              border-radius: 4px;
              background: #FAFAFD;
              border: 1px solid #C9C4FF;
              color: #300266;
            }
            .trait-pill.arena-pill {
              background: #300266;
              border-color: #801ED7;
              color: #ffffff;
            }
            .competency-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              font-size: 10px;
            }
            .competency-table th {
              background: #FAFAFD;
              text-align: left;
              padding: 6px 8px;
              font-weight: bold;
              border-bottom: 1px solid #C9C4FF;
              text-transform: uppercase;
              font-size: 9px;
              color: #300266;
            }
            .competency-table td {
              padding: 6px 8px;
              border-bottom: 1px solid #E5E2FA;
            }
            .footer-note {
              margin-top: 24px;
              border-top: 1px solid #C9C4FF;
              padding-top: 8px;
              font-size: 9px;
              color: #801ED7;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <span class="badge">360° EXECUTIVE DEBRIEF</span>
              <h1 class="title">${session.leaderName}</h1>
              <p class="subtitle">${session.leaderTitle || 'Executive Leader'} • Johari Window & LCM Analysis</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; color: #801ED7;">Assessment Date</div>
              <div style="font-size: 12px; font-weight: bold; color: #300266;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <label>Reviewer Cohort</label>
              <span>${totalPeers} Peer Reviews</span>
            </div>
            <div class="meta-item">
              <label>Arena Size</label>
              <span>${quadrants.arena.length} Shared Traits</span>
            </div>
            <div class="meta-item">
              <label>Blind Spot Count</label>
              <span>${quadrants.blindSpot.length} Peer Observed</span>
            </div>
            <div class="meta-item">
              <label>Façade Count</label>
              <span>${quadrants.facade.length} Internal Traits</span>
            </div>
          </div>

          <div class="coaching-card">
            <h4>Priority Executive Coaching Focus</h4>
            <p>"${keyTakeaways.recommendedAction}"</p>
          </div>

          <div class="section-title">1. The 4-Quadrant Johari Window</div>
          <div class="matrix-grid">
            <!-- Arena -->
            <div class="quadrant-box arena">
              <div class="quadrant-header">
                <span class="quadrant-title">Quadrant 1: Arena</span>
                <span class="quadrant-tag">${quadrants.arena.length} Known to Self & Others</span>
              </div>
              <div class="trait-pills">
                ${quadrants.arena.length > 0 
                  ? quadrants.arena.map(t => `<span class="trait-pill arena-pill">${t} (${adjectiveStats[t]?.peerCount || 0}★)</span>`).join('') 
                  : '<span style="color:#999;font-style:italic;">No shared traits</span>'}
              </div>
            </div>

            <!-- Blind Spot -->
            <div class="quadrant-box blind">
              <div class="quadrant-header">
                <span class="quadrant-title">Quadrant 2: Blind Spot</span>
                <span class="quadrant-tag">${quadrants.blindSpot.length} Observed by Peers</span>
              </div>
              <div class="trait-pills">
                ${quadrants.blindSpot.length > 0 
                  ? quadrants.blindSpot.map(t => `<span class="trait-pill">${t} (${adjectiveStats[t]?.peerCount || 0} peers)</span>`).join('') 
                  : '<span style="color:#999;font-style:italic;">No blind spot traits</span>'}
              </div>
            </div>

            <!-- Facade -->
            <div class="quadrant-box facade">
              <div class="quadrant-header">
                <span class="quadrant-title">Quadrant 3: Façade</span>
                <span class="quadrant-tag">${quadrants.facade.length} Private / Unseen</span>
              </div>
              <div class="trait-pills">
                ${quadrants.facade.length > 0 
                  ? quadrants.facade.map(t => `<span class="trait-pill">${t} (Self)</span>`).join('') 
                  : '<span style="color:#999;font-style:italic;">No private traits</span>'}
              </div>
            </div>

            <!-- Unknown -->
            <div class="quadrant-box unknown">
              <div class="quadrant-header">
                <span class="quadrant-title">Quadrant 4: Unknown</span>
                <span class="quadrant-tag">${quadrants.unknown.length} Latent Potential</span>
              </div>
              <p style="margin: 0; font-size: 10px; color: #666;">
                ${quadrants.unknown.length} attributes available for ongoing developmental stretch.
              </p>
            </div>
          </div>

          <div class="section-title">2. Leadership Competency Alignment</div>
          <table class="competency-table">
            <thead>
              <tr>
                <th>Competency Domain</th>
                <th>Total Alignment Points</th>
                <th>Arena Matches</th>
                <th>Blind Spot Observations</th>
                <th>Façade Values</th>
              </tr>
            </thead>
            <tbody>
              ${categories.map((catKey) => {
                const comp = LEADERSHIP_COMPETENCIES[catKey];
                const score = competencyDistribution[catKey] || { total: 0, arena: 0, blindSpot: 0, facade: 0 };
                return `
                  <tr>
                    <td><strong>${comp?.name || catKey}</strong></td>
                    <td><strong>${score.total} pts</strong></td>
                    <td>${score.arena}</td>
                    <td>${score.blindSpot}</td>
                    <td>${score.facade}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="section-title">3. Actionable Development Strategy</div>
          <div style="font-size: 10.5px; line-height: 1.5; color: #300266;">
            <p><strong>• Feedback Solicitation:</strong> Engage peers to uncover context behind Blind Spot traits (${quadrants.blindSpot.slice(0, 3).join(', ') || 'observed strengths'}) to formalize them into your intentional leadership toolkit.</p>
            <p><strong>• Disclosure & Expression:</strong> Bring Façade traits (${quadrants.facade.slice(0, 3).join(', ') || 'internal values'}) into strategic discussions and team operating principles.</p>
          </div>

          <div class="footer-note">
            <span>Johari Window 360° Platform &bull; Confidential Executive Debrief</span>
            <span>Generated for ${session.leaderName}</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#300266] text-white flex items-center justify-between border-b border-[#46098c] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#801ED7] flex items-center justify-center text-white font-bold shadow-md shadow-[#801ED7]/20">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Executive Debrief Export</h2>
              <p className="text-xs text-[#C9C4FF]">Johari Window & LCM 360° Summary for {session.leaderName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#46098c] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="p-3.5 sm:p-4 bg-[#FAFAFD] border-b border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExportFormat('pdf')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                exportFormat === 'pdf'
                  ? 'bg-[#300266] text-white shadow-xs'
                  : 'bg-white text-[#300266] border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-[#FFA524]" />
              <span>Print / Export PDF</span>
            </button>

            <button
              onClick={() => setExportFormat('markdown')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                exportFormat === 'markdown'
                  ? 'bg-[#300266] text-white shadow-xs'
                  : 'bg-white text-[#300266] border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#FFA524]" />
              <span>Markdown Report (.md)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {exportFormat === 'pdf' ? (
              <button
                onClick={handlePrintPdf}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#300266] hover:bg-[#801ED7] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#FFA524]" />
                <span>Save as PDF / Print</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleCopyMarkdown}
                  className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-[#300266] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                  <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
                </button>
                <button
                  onClick={handleDownloadMarkdown}
                  className="px-4 py-2 rounded-xl bg-[#300266] hover:bg-[#801ED7] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#FFA524]" />
                  <span>Download .md</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Body: PDF Visual Preview or Markdown Raw View */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[55vh] bg-[#FAFAFD]">
          {exportFormat === 'pdf' ? (
            <div id="printable-executive-report" className="bg-white rounded-xl p-5 sm:p-7 border border-gray-200 shadow-xs space-y-6 text-[#300266]">
              
              {/* Document Header */}
              <div className="border-b-2 border-[#300266] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#C9C4FF] text-[#300266] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3 text-[#801ED7]" />
                    <span>Executive Johari Debrief</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-[#300266]">
                    {session.leaderName}
                  </h1>
                  <p className="text-xs text-[#801ED7] font-semibold">
                    {session.leaderTitle || 'Executive Leader'} &bull; 360° Feedback Summary
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs">
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Assessment Date</span>
                  <span className="font-bold text-[#300266]">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Metrics Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAFAFD] p-3 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Reviewers</span>
                  <span className="text-base font-extrabold text-[#300266]">{totalPeers} Peers</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Arena</span>
                  <span className="text-base font-extrabold text-emerald-700">{quadrants.arena.length} Traits</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#801ED7] block">Blind Spot</span>
                  <span className="text-base font-extrabold text-[#801ED7]">{quadrants.blindSpot.length} Traits</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#91186E] block">Façade</span>
                  <span className="text-base font-extrabold text-[#91186E]">{quadrants.facade.length} Traits</span>
                </div>
              </div>

              {/* Priority Coaching Recommendation */}
              <div className="p-4 rounded-xl bg-[#FFD4BC]/40 border border-[#FFA524]/50 text-xs space-y-1">
                <div className="font-extrabold uppercase text-[#300266] text-[10px] tracking-wider">
                  Priority Action Recommendation
                </div>
                <p className="font-bold text-[#300266] leading-relaxed">
                  "{keyTakeaways.recommendedAction}"
                </p>
              </div>

              {/* 4 Quadrants Capture */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#300266] border-b border-gray-200 pb-1">
                  1. The 4-Quadrant Matrix
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Arena */}
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>Quadrant 1: Arena (Open)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {quadrants.arena.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {quadrants.arena.length > 0 ? (
                        quadrants.arena.map((t) => (
                          <span key={t} className="px-2 py-1 bg-white border border-emerald-300 text-emerald-800 font-bold text-[11px] rounded-lg shadow-2xs">
                            {t} ({adjectiveStats[t]?.peerCount || 0}★)
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No shared arena traits yet</span>
                      )}
                    </div>
                  </div>

                  {/* Blind Spot */}
                  <div className="p-3.5 rounded-xl border border-[#C9C4FF] bg-[#FAFAFD] space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#801ED7]">
                      <span>Quadrant 2: Blind Spot</span>
                      <span className="text-[10px] bg-[#C9C4FF] text-[#300266] px-2 py-0.5 rounded-full">
                        {quadrants.blindSpot.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {quadrants.blindSpot.length > 0 ? (
                        quadrants.blindSpot.map((t) => (
                          <span key={t} className="px-2 py-1 bg-white border border-[#C9C4FF] text-[#801ED7] font-bold text-[11px] rounded-lg shadow-2xs">
                            {t} ({adjectiveStats[t]?.peerCount || 0} peers)
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No blind spot traits</span>
                      )}
                    </div>
                  </div>

                  {/* Facade */}
                  <div className="p-3.5 rounded-xl border border-[#F8D3E8] bg-[#FAFAFD] space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#91186E]">
                      <span>Quadrant 3: Façade (Hidden)</span>
                      <span className="text-[10px] bg-[#F8D3E8] text-[#91186E] px-2 py-0.5 rounded-full">
                        {quadrants.facade.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {quadrants.facade.length > 0 ? (
                        quadrants.facade.map((t) => (
                          <span key={t} className="px-2 py-1 bg-white border border-[#F8D3E8] text-[#91186E] font-bold text-[11px] rounded-lg shadow-2xs">
                            {t} (Self)
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No hidden traits</span>
                      )}
                    </div>
                  </div>

                  {/* Unknown */}
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                      <span>Quadrant 4: Unknown (Latent)</span>
                      <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                        {quadrants.unknown.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {quadrants.unknown.length} attributes remaining for future exploration and developmental stretch.
                    </p>
                  </div>
                </div>
              </div>

              {/* Competencies Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#300266] border-b border-gray-200 pb-1">
                  2. Leadership Competency Alignment
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                    <thead className="bg-[#FAFAFD] text-[#300266] uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-2.5">Domain</th>
                        <th className="p-2.5">Score</th>
                        <th className="p-2.5">Arena</th>
                        <th className="p-2.5">Blind Spot</th>
                        <th className="p-2.5">Façade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {categories.map((catKey) => {
                        const comp = LEADERSHIP_COMPETENCIES[catKey];
                        const score = competencyDistribution[catKey] || { total: 0, arena: 0, blindSpot: 0, facade: 0 };
                        return (
                          <tr key={catKey} className="hover:bg-[#FAFAFD]">
                            <td className="p-2.5 font-bold text-[#300266]">{comp?.name || catKey}</td>
                            <td className="p-2.5 font-extrabold text-[#801ED7]">{score.total} pts</td>
                            <td className="p-2.5 text-emerald-700 font-semibold">{score.arena}</td>
                            <td className="p-2.5 text-[#801ED7] font-semibold">{score.blindSpot}</td>
                            <td className="p-2.5 text-[#91186E] font-semibold">{score.facade}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <pre className="p-4 bg-[#300266] text-[#C9C4FF] rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed select-all border border-[#46098c]">
              {generateMarkdownReport()}
            </pre>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAFAFD] border-t border-gray-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Confidential 360° leadership summary</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#300266] hover:bg-[#801ED7] text-white font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
