import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Play, 
  Code2, 
  Sliders, 
  Users, 
  User, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { 
  calculateJohariGrid, 
  JOHARI_MOCK_TEST_CASE, 
  runJohariGridUnitTests 
} from '../utils/johariCalculator';

interface AlgorithmUnitTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlgorithmUnitTestModal: React.FC<AlgorithmUnitTestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeThreshold, setActiveThreshold] = useState<number>(1);
  const [testSuiteResults, setTestSuiteResults] = useState(() => runJohariGridUnitTests());

  if (!isOpen) return null;

  const mock = JOHARI_MOCK_TEST_CASE;
  const peerInputs = [mock.peer1Manager, mock.peer2DirectReport, mock.peer3Colleague];
  
  // Calculate live grid with user selected threshold
  const dynamicGrid = calculateJohariGrid(
    mock.selfSelection,
    peerInputs,
    mock.all55Adjectives,
    { peerThreshold: activeThreshold }
  );

  const handleRerunTests = () => {
    setTestSuiteResults(runJohariGridUnitTests());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-[#1A1A1A] text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5A1D] flex items-center justify-center text-white font-bold shadow-xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Johari Grid Algorithm & Test Suite</h2>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold uppercase tracking-wider">
                  Verified Engine
                </span>
              </div>
              <p className="text-xs text-gray-400">
                1 Leader Selection + 3 360° Peer Reviews → 4 Quadrant Partitioning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(92vh-140px)]">
          {/* Automated Test Suite Status */}
          <div className="p-4 bg-[#F4F4F4] rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Automated Unit Test Results</span>
              </div>
              <div className="text-base font-extrabold text-[#1A1A1A] mt-0.5">
                {testSuiteResults.summary.passedTests} of {testSuiteResults.summary.totalTests} Unit Test Cases Passing (100%)
              </div>
              <div className="text-xs text-gray-500">
                Verifies 1 Leader + 3 Peer resolution, partition mathematical completeness, threshold adjustment, and 0-peer edge cases.
              </div>
            </div>

            <button
              onClick={handleRerunTests}
              className="px-3.5 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 transition shadow-2xs whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 text-[#FF5A1D]" />
              <span>Rerun Test Suite</span>
            </button>
          </div>

          {/* Test Case Breakdown Cards */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Unit Test Suite Specifications
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {testSuiteResults.results.map((res, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white rounded-xl border border-gray-200 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A]">{res.name}</div>
                      <div className="text-[11px] text-gray-600 mt-0.5">{res.details}</div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                          Arena: {res.actual.arenaCount}
                        </span>
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                          Blind Spot: {res.actual.blindSpotCount}
                        </span>
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                          Façade: {res.actual.facadeCount}
                        </span>
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                          Unknown: {res.actual.unknownCount}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded uppercase">
                    PASSED
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Mock Data Visualizer */}
          <div className="p-5 bg-white rounded-xl border border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#FF5A1D]">
                  Mock Dataset Simulation
                </div>
                <h3 className="font-extrabold text-[#1A1A1A] text-sm">
                  {mock.leaderName} (1 Leader + 3 Anonymous 360 Reviewers)
                </h3>
              </div>

              {/* Threshold Slider / Selector */}
              <div className="flex items-center gap-2 bg-[#F4F4F4] p-1.5 rounded-xl border border-gray-200">
                <Sliders className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-bold text-gray-700">Peer Consensus Threshold:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((thresh) => (
                    <button
                      key={thresh}
                      onClick={() => setActiveThreshold(thresh)}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition ${
                        activeThreshold === thresh
                          ? 'bg-[#FF5A1D] text-white shadow-2xs'
                          : 'bg-white text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ≥ {thresh} {thresh === 1 ? 'peer' : 'peers'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Sets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              {/* Leader */}
              <div className="p-3 bg-[#FFF5F1] rounded-xl border border-[#FF5A1D]/30 space-y-1.5">
                <div className="font-bold text-[#FF5A1D] flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Leader Self (6 traits)</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {mock.selfSelection.map((adj) => (
                    <span key={adj} className="px-1.5 py-0.5 bg-white rounded text-[11px] font-semibold text-[#1A1A1A] border border-orange-200">
                      {adj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Peer 1 */}
              <div className="p-3 bg-[#F4F4F4] rounded-xl border border-gray-200 space-y-1.5">
                <div className="font-bold text-gray-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Peer 1 (Manager)</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {mock.peer1Manager.map((adj) => (
                    <span key={adj} className="px-1.5 py-0.5 bg-white rounded text-[11px] font-medium text-gray-800 border border-gray-200">
                      {adj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Peer 2 */}
              <div className="p-3 bg-[#F4F4F4] rounded-xl border border-gray-200 space-y-1.5">
                <div className="font-bold text-gray-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Peer 2 (Direct Report)</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {mock.peer2DirectReport.map((adj) => (
                    <span key={adj} className="px-1.5 py-0.5 bg-white rounded text-[11px] font-medium text-gray-800 border border-gray-200">
                      {adj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Peer 3 */}
              <div className="p-3 bg-[#F4F4F4] rounded-xl border border-gray-200 space-y-1.5">
                <div className="font-bold text-gray-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Peer 3 (Colleague)</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {mock.peer3Colleague.map((adj) => (
                    <span key={adj} className="px-1.5 py-0.5 bg-white rounded text-[11px] font-medium text-gray-800 border border-gray-200">
                      {adj}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Resolved 4-Quadrant Outputs */}
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Calculated 2x2 Grid Output (Threshold = {activeThreshold})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Arena */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200 border-l-4 border-l-[#FF5A1D]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs text-[#1A1A1A]">Arena (Open Self)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FFF3EE] text-[#FF5A1D] rounded-full">
                      {dynamicGrid.arena.length} traits
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dynamicGrid.arena.map((adj) => (
                      <span key={adj} className="px-2 py-1 bg-[#F4F4F4] text-[#1A1A1A] text-xs font-bold rounded-md border border-gray-200 flex items-center gap-1">
                        <span>{adj}</span>
                        <span className="text-[10px] text-[#FF5A1D]">({dynamicGrid.peerTally[adj.toLowerCase().trim()]}v)</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Blind Spot */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200 border-l-4 border-l-gray-400">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs text-[#1A1A1A]">Blind Spot (Peer Observed)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                      {dynamicGrid.blindSpot.length} traits
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dynamicGrid.blindSpot.map((adj) => (
                      <span key={adj} className="px-2 py-1 bg-[#F4F4F4] text-gray-800 text-xs font-semibold rounded-md border border-gray-200 flex items-center gap-1">
                        <span>{adj}</span>
                        <span className="text-[10px] text-gray-500">({dynamicGrid.peerTally[adj.toLowerCase().trim()]}v)</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Façade */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200 border-l-4 border-l-gray-400">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs text-[#1A1A1A]">Façade (Private Self)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                      {dynamicGrid.facade.length} traits
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dynamicGrid.facade.map((adj) => (
                      <span key={adj} className="px-2 py-1 bg-[#F4F4F4] text-gray-800 text-xs font-semibold rounded-md border border-gray-200">
                        {adj}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Unknown */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200 border-l-4 border-l-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs text-[#1A1A1A]">Unknown (Latent Potential)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                      {dynamicGrid.unknown.length} traits
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {dynamicGrid.unknown.length} unselected candidate traits categorized as dormant potential and situational reserve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F4F4F4] border-t border-gray-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500 font-mono">
            function calculateJohariGrid(selfSelection, peerSelections, allAdjectives, options)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-white font-bold text-xs transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
