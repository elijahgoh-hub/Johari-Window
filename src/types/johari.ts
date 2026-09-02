/**
 * Core Johari Window & Leadership Competency Model (LCM) TypeScript Definitions
 */

export type CompetencyCategory = 
  | 'Build Capability and Capacity'
  | 'Shape the Future'
  | 'Execute with Excellence'
  | 'Seek the Truth & Make Sound Decisions'
  | 'Lead with Empathy & Inclusivity'
  | 'Inspire, Influence & Collaborate';

export interface LeadershipCompetency {
  id: CompetencyCategory;
  name: string;
  description: string;
  badgeColor: string;
  textColor: string;
  bgLight: string;
  borderColor: string;
}

export interface JohariAdjective {
  id: string;
  name: string;
  definition: string;
  competency: CompetencyCategory;
  leadershipContext: string;
  tags?: string[];
}

/**
 * 1. UserSession
 * Represents a leadership participant's active Johari Window assessment session
 */
export interface UserSession {
  id: string;
  leaderName: string;
  leaderTitle?: string;
  organization?: string;
  focusArea?: string;
  createdTimestamp: number;
}

/**
 * 2. AdjectiveSelection
 * Represents an adjective selection event from either the leader (self) or a peer
 */
export interface AdjectiveSelection {
  userId: string;
  source: 'self' | 'peer';
  selectedAdjectives: string[];
  peerName?: string;
  peerRole?: 'Manager' | 'Peer / Colleague' | 'Direct Report' | 'Cross-functional Partner' | 'Stakeholder' | 'Other';
  submittedAt?: number;
  notes?: string;
}

export interface AdjectiveStat {
  adjective: string;
  definition: string;
  competency: CompetencyCategory;
  isSelf: boolean;
  peerCount: number;
  peerPercentage: number;
  selectedByPeers: string[];
}

export interface UnknownPerspective {
  heading: string;
  category: 'undiscovered_potential' | 'dormant_contextual' | 'role_boundary' | 'growth_frontier';
  description: string;
  actionableAdvice: string;
}

export interface UnknownQuadrantContextGuide {
  title: string;
  subtitle: string;
  reframeConcept: string;
  perspectives: UnknownPerspective[];
  reflectionPrompts: string[];
  executiveSummary: string;
}

export interface JohariGridCalculationOptions {
  /**
   * Minimum number of peer votes required to consider an adjective "known to others"
   * Defaults to 1 (at least ONE peer)
   */
  peerThreshold?: number;
}

export interface JohariGridResult {
  arena: string[];     // Known to self AND peers
  blindSpot: string[]; // Known to peers, NOT known to self
  facade: string[];    // Known to self, NOT known to peers
  unknown: string[];   // Known to NEITHER self nor peers
  peerTally: Record<string, number>;
  totalPeers: number;
  thresholdUsed: number;
  unknownContextGuide: UnknownQuadrantContextGuide;
}

export interface JohariUnitTestResult {
  name: string;
  passed: boolean;
  expected: {
    arenaCount: number;
    blindSpotCount: number;
    facadeCount: number;
    unknownCount: number;
    arena: string[];
    blindSpot: string[];
    facade: string[];
  };
  actual: {
    arenaCount: number;
    blindSpotCount: number;
    facadeCount: number;
    unknownCount: number;
    arena: string[];
    blindSpot: string[];
    facade: string[];
  };
  details: string;
}

/**
 * 3. JohariQuadrantResults
 * The calculated 4-quadrant outcome based on self and peer inputs
 */
export interface JohariQuadrantResults {
  arena: string[];     // Known to Self & Known to Others (Open Area)
  blindSpot: string[]; // Not Known to Self & Known to Others (Blind Area)
  facade: string[];    // Known to Self & Not Known to Others (Hidden Area)
  unknown: string[];   // Not Known to Self & Not Known to Others (Unknown Area)
}

export interface DetailedJohariAnalysis {
  quadrants: JohariQuadrantResults;
  adjectiveStats: Record<string, AdjectiveStat>;
  totalPeers: number;
  selfSelectionCount: number;
  competencyDistribution: Record<CompetencyCategory, {
    arena: number;
    blindSpot: number;
    facade: number;
    unknown: number;
    total: number;
  }>;
  arenaExpansionMetrics: {
    opennessScore: number;       // Percentage of self traits validated by peers
    feedbackReceptivityScore: number; // Peer traits outside self-image
    blindSpotRatio: number;
    hiddenStrengthsCount: number;
  };
  keyTakeaways: {
    coreSignatureStrengths: string[];
    potentialBlindSpots: string[];
    underleveragedStrengths: string[];
    recommendedAction: string;
  };
}
