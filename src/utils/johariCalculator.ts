import {
  AdjectiveSelection,
  DetailedJohariAnalysis,
  JohariQuadrantResults,
  AdjectiveStat,
  CompetencyCategory,
  JohariGridResult,
  JohariGridCalculationOptions,
  UnknownQuadrantContextGuide,
  JohariUnitTestResult,
} from '../types/johari';
import { JOHARI_ADJECTIVES, getJohariAdjective } from '../data/johariAdjectives';

/**
 * Psychological and developmental context guide for Quadrant 4: "The Unknown"
 * 
 * Prevents The Unknown from being perceived as a "trash bin" or deficit pile.
 * Reframes unselected traits into strategic, dormant, or emergent leadership frontiers.
 */
export const UNKNOWN_QUADRANT_CONTEXT_GUIDE: UnknownQuadrantContextGuide = {
  title: 'The Developmental Frontier (Quadrant 4: The Unknown)',
  subtitle: 'Reframing Unselected Attributes as Latent Potential, Not a Discard Pile',
  reframeConcept:
    'In classical Johari Window psychology (Luft & Ingham, 1955), the Unknown quadrant represents material that is neither within present conscious self-awareness nor exhibited in current observable behaviors. In modern executive coaching, this is not a "trash bin"—it is the reservoir of future adaptability, dormant situational mastery, and untapped leadership potential.',
  perspectives: [
    {
      category: 'undiscovered_potential',
      heading: '1. Undiscovered & Emergent Potential',
      description:
        'Leadership capabilities untested because current organizational responsibilities have not yet required them. For example, high-stakes turnaround crisis agility, board stewardship, or global market entry.',
      actionableAdvice:
        'Seek out novel stretch mandates, cross-functional crisis taskforces, or external advisory boards to test and awaken latent competencies.',
    },
    {
      category: 'dormant_contextual',
      heading: '2. Dormant / Context-Specific Behaviors',
      description:
        'Attributes intentionally held in reserve. A leader may possess profound patience or diplomacy, but operate in a high-velocity execution cycle where decisive assertiveness is prioritized.',
      actionableAdvice:
        'Recognize that leadership range is situational. You do not need to display all 55 traits daily; adaptively summon dormant traits when operating environments shift.',
    },
    {
      category: 'role_boundary',
      heading: '3. Role Boundaries & Intentional Specialization',
      description:
        'Attributes non-applicable or counter to your primary functional craft. An engineering executive or creative director may naturally leave traits like "Complex" or "Extroverted" unselected without it indicating any deficiency.',
      actionableAdvice:
        'Embrace healthy domain focus. Great leadership is defined by complementary teams, not an individual attempting to be all things to all stakeholders.',
    },
    {
      category: 'growth_frontier',
      heading: '4. Unconscious Competencies & Future Chapters',
      description:
        'Intuitive skills so deeply ingrained that you and your colleagues take them for granted, or deliberate developmental vectors for your next 3–5 year career trajectory.',
      actionableAdvice:
        'Review the Unknown list quarterly. Choose 1–2 target attributes (e.g. "Inspiring", "Wise") to consciously experiment with in upcoming quarters.',
    },
  ],
  reflectionPrompts: [
    'Which 2–3 traits in the Unknown quadrant would generate the highest strategic leverage if brought into your Open Arena over the next 12 months?',
    'Are there organizational constraints or cultural norms currently suppressing these attributes from surfacing?',
    'What new leadership environment or challenge would force you to unlock these latent capabilities?',
  ],
  executiveSummary:
    'Executive effectiveness is not about having 55 active traits in the Arena. It is about knowing your verified signature assets, understanding how peers perceive your impact, and drawing intentionally from the Unknown when scaling scope.',
};

/**
 * Pure helper function to calculate the 2x2 Johari Window Grid
 * 
 * Takes:
 * - selfSelection: Array of adjective strings selected by the leader (e.g. ['Adaptable', 'Bold', ...])
 * - peerSelections: Array of arrays of adjective strings from anonymous 360 reviewers (e.g. [['Adaptable', ...], ['Calm', ...]])
 * - allAdjectives: Full universe of candidate adjectives (e.g. 55 canonical Johari adjectives)
 * - options: Configurable options including peerThreshold (defaults to 1, meaning selected by >= 1 peer)
 * 
 * Returns:
 * - arena: Selected by both self AND peers (meeting threshold)
 * - blindSpot: Selected by peers (meeting threshold), but NOT by self
 * - facade: Selected by self, but NOT by peers (below threshold)
 * - unknown: Selected by NEITHER self nor peers (below threshold)
 * - peerTally: Frequency count for every peer-voted adjective
 * - totalPeers: Total number of peer reviewers
 * - thresholdUsed: The threshold applied
 * - unknownContextGuide: The supplementary psychological guide for Quadrant 4
 */
export function calculateJohariGrid(
  selfSelection: string[] = [],
  peerSelections: string[][] = [],
  allAdjectives: string[] = [],
  options: JohariGridCalculationOptions = {}
): JohariGridResult {
  const threshold = Math.max(1, options.peerThreshold ?? 1);
  const totalPeers = peerSelections.length;

  // Normalize self selection for case-insensitive lookup
  const selfNormalizedMap = new Map<string, string>();
  for (const item of selfSelection) {
    if (item && typeof item === 'string') {
      selfNormalizedMap.set(item.toLowerCase().trim(), item);
    }
  }

  // 1. Aggregate all peer selections to find frequency tallies
  const peerTally: Record<string, number> = {};
  const peerNormalizedMap = new Map<string, string>();

  for (const reviewerSelection of peerSelections) {
    if (!Array.isArray(reviewerSelection)) continue;
    // Deduplicate within a single reviewer's submission so 1 reviewer can't inflate counts
    const seenByReviewer = new Set<string>();

    for (const rawAdj of reviewerSelection) {
      if (!rawAdj || typeof rawAdj !== 'string') continue;
      const key = rawAdj.toLowerCase().trim();
      if (seenByReviewer.has(key)) continue;
      seenByReviewer.add(key);

      peerTally[key] = (peerTally[key] || 0) + 1;
      if (!peerNormalizedMap.has(key)) {
        peerNormalizedMap.set(key, rawAdj);
      }
    }
  }

  // Build adjective pool: if allAdjectives provided, use it; otherwise combine self + peer keys
  let targetPool: string[] = [];
  if (allAdjectives && allAdjectives.length > 0) {
    targetPool = allAdjectives;
  } else {
    // Collect unique names preserving casing
    const unionMap = new Map<string, string>();
    for (const [key, original] of selfNormalizedMap.entries()) {
      unionMap.set(key, original);
    }
    for (const [key, original] of peerNormalizedMap.entries()) {
      if (!unionMap.has(key)) {
        unionMap.set(key, original);
      }
    }
    targetPool = Array.from(unionMap.values());
  }

  const arena: string[] = [];
  const blindSpot: string[] = [];
  const facade: string[] = [];
  const unknown: string[] = [];

  // 2. Categorize each adjective into one of the 4 mutually exclusive quadrants
  for (const adjective of targetPool) {
    const key = adjective.toLowerCase().trim();
    const isSelf = selfNormalizedMap.has(key);
    const peerVoteCount = peerTally[key] || 0;
    const isPeer = peerVoteCount >= threshold;

    if (isSelf && isPeer) {
      // Arena (Open): Selected by both self AND peers
      arena.push(adjective);
    } else if (!isSelf && isPeer) {
      // Blind Spot: Selected by peers, but NOT by self
      blindSpot.push(adjective);
    } else if (isSelf && !isPeer) {
      // Façade (Hidden): Selected by self, but NOT by peers
      facade.push(adjective);
    } else {
      // Unknown: Selected by NEITHER self nor peers
      unknown.push(adjective);
    }
  }

  // Sort arena and blindSpot by peer tally frequency descending, then alphabetically
  const sortByFrequencyThenName = (a: string, b: string) => {
    const countA = peerTally[a.toLowerCase().trim()] || 0;
    const countB = peerTally[b.toLowerCase().trim()] || 0;
    if (countB !== countA) return countB - countA;
    return a.localeCompare(b);
  };

  arena.sort(sortByFrequencyThenName);
  blindSpot.sort(sortByFrequencyThenName);
  facade.sort((a, b) => a.localeCompare(b));
  unknown.sort((a, b) => a.localeCompare(b));

  return {
    arena,
    blindSpot,
    facade,
    unknown,
    peerTally,
    totalPeers,
    thresholdUsed: threshold,
    unknownContextGuide: UNKNOWN_QUADRANT_CONTEXT_GUIDE,
  };
}

/**
 * Unit-test style Mock Dataset demonstrating:
 * 1 Leader selection and 3 Peer selections resolving into 4 quadrants
 */
export const JOHARI_MOCK_TEST_CASE = {
  leaderName: 'Sarah Jenkins (VP of Product)',
  all55Adjectives: JOHARI_ADJECTIVES.map((a) => a.name),
  selfSelection: [
    'Adaptable',
    'Bold',
    'Calm',
    'Clever',
    'Empathetic',
    'Knowledgeable',
  ],
  peer1Manager: [
    'Adaptable',
    'Bold',
    'Dependable',
    'Logical',
    'Organized',
  ],
  peer2DirectReport: [
    'Calm',
    'Empathetic',
    'Helpful',
    'Patient',
    'Trustworthy',
  ],
  peer3Colleague: [
    'Adaptable',
    'Clever',
    'Energetic',
    'Logical',
    'Warm',
  ],
  expectedResolution: {
    // Overlaps:
    // 'Adaptable' (Self + P1 + P3) => Arena (2 votes)
    // 'Bold' (Self + P1) => Arena (1 vote)
    // 'Calm' (Self + P2) => Arena (1 vote)
    // 'Clever' (Self + P3) => Arena (1 vote)
    // 'Empathetic' (Self + P2) => Arena (1 vote)
    arena: ['Adaptable', 'Bold', 'Calm', 'Clever', 'Empathetic'],
    
    // Peers only (not self):
    // 'Dependable' (P1), 'Energetic' (P3), 'Helpful' (P2), 'Logical' (P1, P3), 
    // 'Organized' (P1), 'Patient' (P2), 'Trustworthy' (P2), 'Warm' (P3)
    blindSpot: [
      'Logical',      // 2 votes
      'Dependable',   // 1 vote
      'Energetic',    // 1 vote
      'Helpful',      // 1 vote
      'Organized',    // 1 vote
      'Patient',      // 1 vote
      'Trustworthy',  // 1 vote
      'Warm',         // 1 vote
    ],

    // Self only (not peers):
    // 'Knowledgeable' (0 peer votes) => Façade
    facade: ['Knowledgeable'],

    // Remaining 41 adjectives out of 55 => Unknown
    unknownCount: 41,
    totalUniverseCount: 55,
  },
};

/**
 * Runs automated unit tests on the Johari Window grid calculation logic
 */
export function runJohariGridUnitTests(): {
  allPassed: boolean;
  results: JohariUnitTestResult[];
  summary: { totalTests: number; passedTests: number; failedTests: number };
} {
  const results: JohariUnitTestResult[] = [];
  const all55 = JOHARI_MOCK_TEST_CASE.all55Adjectives;

  // Test 1: Standard 1 Leader + 3 Peers resolution (threshold = 1)
  {
    const peerSelections = [
      JOHARI_MOCK_TEST_CASE.peer1Manager,
      JOHARI_MOCK_TEST_CASE.peer2DirectReport,
      JOHARI_MOCK_TEST_CASE.peer3Colleague,
    ];
    const grid = calculateJohariGrid(
      JOHARI_MOCK_TEST_CASE.selfSelection,
      peerSelections,
      all55,
      { peerThreshold: 1 }
    );

    const expected = JOHARI_MOCK_TEST_CASE.expectedResolution;
    const arenaMatch =
      grid.arena.length === expected.arena.length &&
      expected.arena.every((a) => grid.arena.includes(a));
    const blindSpotMatch =
      grid.blindSpot.length === expected.blindSpot.length &&
      expected.blindSpot.every((a) => grid.blindSpot.includes(a));
    const facadeMatch =
      grid.facade.length === expected.facade.length &&
      expected.facade.every((a) => grid.facade.includes(a));
    const unknownCountMatch = grid.unknown.length === expected.unknownCount;

    const passed = arenaMatch && blindSpotMatch && facadeMatch && unknownCountMatch;

    results.push({
      name: '1 Leader + 3 360° Reviewers Quadrant Resolution',
      passed,
      expected: {
        arenaCount: expected.arena.length,
        blindSpotCount: expected.blindSpot.length,
        facadeCount: expected.facade.length,
        unknownCount: expected.unknownCount,
        arena: expected.arena,
        blindSpot: expected.blindSpot,
        facade: expected.facade,
      },
      actual: {
        arenaCount: grid.arena.length,
        blindSpotCount: grid.blindSpot.length,
        facadeCount: grid.facade.length,
        unknownCount: grid.unknown.length,
        arena: grid.arena,
        blindSpot: grid.blindSpot,
        facade: grid.facade,
      },
      details: passed
        ? 'Successfully resolved 5 Arena, 8 Blind Spot, 1 Façade, and 41 Unknown traits with accurate frequency ranking.'
        : 'Mismatch in quadrant resolution arrays or counts.',
    });
  }

  // Test 2: Invariant Check — No Trait Lost or Duplicated across the 4 Quadrants
  {
    const peerSelections = [
      JOHARI_MOCK_TEST_CASE.peer1Manager,
      JOHARI_MOCK_TEST_CASE.peer2DirectReport,
      JOHARI_MOCK_TEST_CASE.peer3Colleague,
    ];
    const grid = calculateJohariGrid(
      JOHARI_MOCK_TEST_CASE.selfSelection,
      peerSelections,
      all55
    );

    const totalCalculated =
      grid.arena.length +
      grid.blindSpot.length +
      grid.facade.length +
      grid.unknown.length;
    
    // Check mutual exclusivity: set intersection between all 4 must be 0
    const unionSet = new Set([
      ...grid.arena,
      ...grid.blindSpot,
      ...grid.facade,
      ...grid.unknown,
    ]);

    const passed = totalCalculated === 55 && unionSet.size === 55;

    results.push({
      name: 'Mathematical Partition Invariant (Mutual Exclusivity & Completeness)',
      passed,
      expected: {
        arenaCount: 5,
        blindSpotCount: 8,
        facadeCount: 1,
        unknownCount: 41,
        arena: [],
        blindSpot: [],
        facade: [],
      },
      actual: {
        arenaCount: grid.arena.length,
        blindSpotCount: grid.blindSpot.length,
        facadeCount: grid.facade.length,
        unknownCount: grid.unknown.length,
        arena: [],
        blindSpot: [],
        facade: [],
      },
      details: passed
        ? 'All 55 adjectives accounted for across the 4 quadrants with zero duplicate overlap (Set Size = 55).'
        : `Invariant failed: Total items = ${totalCalculated}, Unique Set Size = ${unionSet.size}`,
    });
  }

  // Test 3: Configurable Peer Threshold (threshold = 2 peer votes)
  {
    const peerSelections = [
      JOHARI_MOCK_TEST_CASE.peer1Manager,
      JOHARI_MOCK_TEST_CASE.peer2DirectReport,
      JOHARI_MOCK_TEST_CASE.peer3Colleague,
    ];
    // With threshold = 2:
    // Only 'Adaptable' (P1, P3) and 'Logical' (P1, P3) have >= 2 peer votes
    // Self has: 'Adaptable', 'Bold', 'Calm', 'Clever', 'Empathetic', 'Knowledgeable'
    // Arena (Self + >=2 votes): ['Adaptable']
    // Blind Spot (Not self + >=2 votes): ['Logical']
    // Façade (Self + <2 votes): ['Bold', 'Calm', 'Clever', 'Empathetic', 'Knowledgeable'] (5 traits)
    // Unknown: 55 - 1 - 1 - 5 = 48 traits
    const gridThreshold2 = calculateJohariGrid(
      JOHARI_MOCK_TEST_CASE.selfSelection,
      peerSelections,
      all55,
      { peerThreshold: 2 }
    );

    const passed =
      gridThreshold2.arena.length === 1 &&
      gridThreshold2.arena[0] === 'Adaptable' &&
      gridThreshold2.blindSpot.length === 1 &&
      gridThreshold2.blindSpot[0] === 'Logical' &&
      gridThreshold2.facade.length === 5 &&
      gridThreshold2.unknown.length === 48;

    results.push({
      name: 'Configurable Consensus Threshold Filtering (peerThreshold = 2)',
      passed,
      expected: {
        arenaCount: 1,
        blindSpotCount: 1,
        facadeCount: 5,
        unknownCount: 48,
        arena: ['Adaptable'],
        blindSpot: ['Logical'],
        facade: ['Bold', 'Calm', 'Clever', 'Empathetic', 'Knowledgeable'],
      },
      actual: {
        arenaCount: gridThreshold2.arena.length,
        blindSpotCount: gridThreshold2.blindSpot.length,
        facadeCount: gridThreshold2.facade.length,
        unknownCount: gridThreshold2.unknown.length,
        arena: gridThreshold2.arena,
        blindSpot: gridThreshold2.blindSpot,
        facade: gridThreshold2.facade,
      },
      details: passed
        ? 'Successfully filtered peer consensus so only attributes with 2+ peer votes qualified as known to others.'
        : 'Threshold filtering failed to adjust quadrant membership.',
    });
  }

  // Test 4: Zero Peers Edge Case
  {
    const gridZeroPeers = calculateJohariGrid(
      JOHARI_MOCK_TEST_CASE.selfSelection,
      [],
      all55
    );

    // With 0 peers:
    // Arena = 0
    // Blind Spot = 0
    // Façade = all 6 self traits
    // Unknown = remaining 49 traits
    const passed =
      gridZeroPeers.arena.length === 0 &&
      gridZeroPeers.blindSpot.length === 0 &&
      gridZeroPeers.facade.length === 6 &&
      gridZeroPeers.unknown.length === 49;

    results.push({
      name: 'Zero Reviewers Baseline State',
      passed,
      expected: {
        arenaCount: 0,
        blindSpotCount: 0,
        facadeCount: 6,
        unknownCount: 49,
        arena: [],
        blindSpot: [],
        facade: JOHARI_MOCK_TEST_CASE.selfSelection,
      },
      actual: {
        arenaCount: gridZeroPeers.arena.length,
        blindSpotCount: gridZeroPeers.blindSpot.length,
        facadeCount: gridZeroPeers.facade.length,
        unknownCount: gridZeroPeers.unknown.length,
        arena: gridZeroPeers.arena,
        blindSpot: gridZeroPeers.blindSpot,
        facade: gridZeroPeers.facade,
      },
      details: passed
        ? 'Correctly defaults all self traits into Façade and all other traits into Unknown when no peer reviews exist.'
        : 'Zero reviewer edge case handling failed.',
    });
  }

  const passedTests = results.filter((r) => r.passed).length;
  return {
    allPassed: passedTests === results.length,
    results,
    summary: {
      totalTests: results.length,
      passedTests,
      failedTests: results.length - passedTests,
    },
  };
}

/**
 * Calculates the comprehensive 4 Johari Window quadrants and LCM analytics
 */
export function calculateJohariResults(
  selfSelection: AdjectiveSelection | null,
  peerSelections: AdjectiveSelection[],
  options: JohariGridCalculationOptions = {}
): DetailedJohariAnalysis {
  const selfArray = selfSelection?.selectedAdjectives || [];
  const validPeers = peerSelections.filter((p) => p.source === 'peer');
  const peerArrays = validPeers.map((p) => p.selectedAdjectives || []);
  const all55Names = JOHARI_ADJECTIVES.map((a) => a.name);

  // Compute 2x2 Grid with core helper function
  const grid = calculateJohariGrid(selfArray, peerArrays, all55Names, options);

  const selfSet = new Set<string>(selfArray.map((a) => a.toLowerCase().trim()));
  const totalPeers = validPeers.length;

  // Build peer detail metadata per adjective
  const peerMetadata: Record<string, { count: number; peers: string[] }> = {};
  for (const peer of validPeers) {
    const peerIdentifier = peer.peerName || peer.userId || 'Colleague';
    for (const rawAdj of peer.selectedAdjectives) {
      const key = rawAdj.toLowerCase().trim();
      if (!peerMetadata[key]) {
        peerMetadata[key] = { count: 0, peers: [] };
      }
      peerMetadata[key].count += 1;
      peerMetadata[key].peers.push(peerIdentifier);
    }
  }

  const adjectiveStats: Record<string, AdjectiveStat> = {};

  const emptyCompetencyData = () => ({
    arena: 0,
    blindSpot: 0,
    facade: 0,
    unknown: 0,
    total: 0,
  });

  const competencyDistribution: Record<
    CompetencyCategory,
    { arena: number; blindSpot: number; facade: number; unknown: number; total: number }
  > = {
    'Build Capability and Capacity': emptyCompetencyData(),
    'Shape the Future': emptyCompetencyData(),
    'Execute with Excellence': emptyCompetencyData(),
    'Seek the Truth & Make Sound Decisions': emptyCompetencyData(),
    'Lead with Empathy & Inclusivity': emptyCompetencyData(),
    'Inspire, Influence & Collaborate': emptyCompetencyData(),
  };

  for (const item of JOHARI_ADJECTIVES) {
    const key = item.name.toLowerCase().trim();
    const isSelf = selfSet.has(key);
    const peerData = peerMetadata[key] || { count: 0, peers: [] };
    const peerPercentage = totalPeers > 0 ? Math.round((peerData.count / totalPeers) * 100) : 0;

    adjectiveStats[item.name] = {
      adjective: item.name,
      definition: item.definition,
      competency: item.competency,
      isSelf,
      peerCount: peerData.count,
      peerPercentage,
      selectedByPeers: peerData.peers,
    };

    competencyDistribution[item.competency].total += 1;

    if (grid.arena.includes(item.name)) {
      competencyDistribution[item.competency].arena += 1;
    } else if (grid.blindSpot.includes(item.name)) {
      competencyDistribution[item.competency].blindSpot += 1;
    } else if (grid.facade.includes(item.name)) {
      competencyDistribution[item.competency].facade += 1;
    } else {
      competencyDistribution[item.competency].unknown += 1;
    }
  }

  const quadrants: JohariQuadrantResults = {
    arena: grid.arena,
    blindSpot: grid.blindSpot,
    facade: grid.facade,
    unknown: grid.unknown,
  };

  // Metrics
  const selfCount = selfSet.size;
  const validatedSelfTraits = grid.arena.length;
  const opennessScore = selfCount > 0 ? Math.round((validatedSelfTraits / selfCount) * 100) : 0;
  const feedbackReceptivityScore = grid.blindSpot.length;
  const blindSpotRatio =
    totalPeers > 0 ? Number((grid.blindSpot.length / Math.max(1, grid.arena.length)).toFixed(2)) : 0;
  const hiddenStrengthsCount = grid.facade.length;

  // Key takeaways generator
  const coreSignatureStrengths = grid.arena.slice(0, 4);
  const potentialBlindSpots = grid.blindSpot.slice(0, 4);
  const underleveragedStrengths = grid.facade.slice(0, 4);

  let recommendedAction = '';
  if (totalPeers === 0) {
    recommendedAction =
      'Collect peer assessments to populate your Blind Spot and validate your Arena strengths.';
  } else if (grid.arena.length >= 4 && grid.blindSpot.length <= 2) {
    recommendedAction =
      'High congruence! Your leadership self-perception aligns tightly with your peers. Continue modeling transparent leadership.';
  } else if (grid.blindSpot.length > grid.arena.length) {
    recommendedAction =
      'Your colleagues observe distinct leadership strengths (or traits) that you undervalue. Inquire with peers to expand self-awareness.';
  } else if (grid.facade.length >= 3) {
    recommendedAction =
      'You perceive key traits in yourself that peers do not yet see in action. Increase visible demonstration and intentional communication of these values.';
  } else {
    recommendedAction =
      'Expand your Open Arena through active feedback solicitation and intentional vulnerability in team forums.';
  }

  return {
    quadrants,
    adjectiveStats,
    totalPeers,
    selfSelectionCount: selfCount,
    competencyDistribution,
    arenaExpansionMetrics: {
      opennessScore,
      feedbackReceptivityScore,
      blindSpotRatio,
      hiddenStrengthsCount,
    },
    keyTakeaways: {
      coreSignatureStrengths,
      potentialBlindSpots,
      underleveragedStrengths,
      recommendedAction,
    },
  };
}

