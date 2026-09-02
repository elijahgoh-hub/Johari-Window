import { UserSession, AdjectiveSelection } from '../types/johari';

export interface SampleProfile {
  session: UserSession;
  selfSelection: AdjectiveSelection;
  peerSelections: AdjectiveSelection[];
  description: string;
}

export const SAMPLE_PROFILES: SampleProfile[] = [
  {
    session: {
      id: 'session-alex-chen',
      leaderName: 'Alex Chen',
      leaderTitle: 'VP of Product Engineering',
      organization: 'Braze Enterprise Core',
      focusArea: 'Transitioning from Tactical Lead to Enterprise Executive',
      createdTimestamp: Date.now() - 86400000 * 3,
    },
    description: 'Tech VP with strong logical execution; team perceives higher empathy and warmth than Alex credits themselves for.',
    selfSelection: {
      userId: 'alex-chen-self',
      source: 'self',
      selectedAdjectives: ['Able', 'Logical', 'Organized', 'Dependable', 'Independent', 'Knowledgeable'],
      notes: 'I focus on rigorous technical excellence, reliable delivery, and strategic systems thinking.',
    },
    peerSelections: [
      {
        userId: 'peer-1',
        source: 'peer',
        peerName: 'Elena Rostova',
        peerRole: 'Direct Report',
        selectedAdjectives: ['Able', 'Logical', 'Calm', 'Empathetic', 'Dependable', 'Trustworthy'],
        notes: 'Alex is always steady during Sev-1 incidents and listens with great empathy.',
      },
      {
        userId: 'peer-2',
        source: 'peer',
        peerName: 'Marcus Vance',
        peerRole: 'Peer / Colleague',
        selectedAdjectives: ['Able', 'Organized', 'Dependable', 'Patient', 'Warm', 'Trustworthy'],
        notes: 'Remarkable cross-functional partner. Patient when navigating conflicting roadmap priorities.',
      },
      {
        userId: 'peer-3',
        source: 'peer',
        peerName: 'David Kim',
        peerRole: 'Manager',
        selectedAdjectives: ['Logical', 'Knowledgeable', 'Bold', 'Dependable', 'Trustworthy', 'Sensible'],
        notes: 'Highly trusted executive operator with razor-sharp judgment on technical architecture.',
      },
      {
        userId: 'peer-4',
        source: 'peer',
        peerName: 'Priya Sharma',
        peerRole: 'Cross-functional Partner',
        selectedAdjectives: ['Able', 'Calm', 'Empathetic', 'Dependable', 'Helpful', 'Organized'],
        notes: 'Always helpful, brings calm resolution to complex stakeholder negotiations.',
      },
    ],
  },
  {
    session: {
      id: 'session-clara-monroe',
      leaderName: 'Clara Monroe',
      leaderTitle: 'Senior Director of Global Customer Success',
      organization: 'Braze Client Services',
      focusArea: 'Building High-Trust Multi-Regional Teams',
      createdTimestamp: Date.now() - 86400000 * 2,
    },
    description: 'Charismatic relational leader; peers see her as bold and strategic, while she perceives herself as humble & quiet.',
    selfSelection: {
      userId: 'clara-monroe-self',
      source: 'self',
      selectedAdjectives: ['Empathetic', 'Friendly', 'Giving', 'Modest', 'Quiet', 'Patient'],
      notes: 'I aim to support my team from behind the scenes and foster empathy.',
    },
    peerSelections: [
      {
        userId: 'peer-c1',
        source: 'peer',
        peerName: 'Taylor Scott',
        peerRole: 'Direct Report',
        selectedAdjectives: ['Empathetic', 'Friendly', 'Bold', 'Inspiring', 'Confident', 'Energetic'],
        notes: 'Clara has enormous executive presence and champions our team boldly.',
      },
      {
        userId: 'peer-c2',
        source: 'peer',
        peerName: 'Jordan Lee',
        peerRole: 'Peer / Colleague',
        selectedAdjectives: ['Friendly', 'Powerful', 'Confident', 'Empathetic', 'Strategic', 'Warm'],
        notes: 'Clara is a powerhouse in customer escalations.',
      },
      {
        userId: 'peer-c3',
        source: 'peer',
        peerName: 'Sofia Mendez',
        peerRole: 'Manager',
        selectedAdjectives: ['Confident', 'Bold', 'Wise', 'Empathetic', 'Friendly', 'Trustworthy'],
        notes: 'Visionary leadership and inspiring interpersonal energy.',
      },
    ],
  },
];
