// Advanced AI-powered project management features

export interface UserSkillProfile {
  id: string;
  userId: string;
  skillLevel: 'novice' | 'intermediate' | 'expert';
  learningStyle: 'visual' | 'hands-on' | 'detailed' | 'quick-reference';
  completionTimes: Record<string, number>; // stepId -> minutes taken
  clarifyingQuestions: number; // count of help requests
  mistakePatterns: string[]; // common errors made
  preferredInstructionLength: 'brief' | 'detailed' | 'comprehensive';
  confidence: Record<string, number>; // category -> confidence score 1-5
  lastUpdated: string;
}

export interface DelayDetection {
  projectId: string;
  actualProgress: number;
  expectedProgress: number;
  delayRisk: 'low' | 'medium' | 'high' | 'critical';
  predictedDelay: number; // days behind schedule
  interventions: DelayIntervention[];
  factors: DelayFactor[];
  lastAnalyzed: string;
}

export interface DelayIntervention {
  id: string;
  type: 'parallel-task' | 'resource-reorder' | 'schedule-adjust' | 'help-request';
  title: string;
  description: string;
  impact: string; // expected time savings
  difficulty: 'easy' | 'moderate' | 'complex';
  priority: number; // 1-5
}

export interface DelayFactor {
  type: 'weather' | 'supply-chain' | 'skill-gap' | 'tool-missing' | 'complexity';
  description: string;
  impact: number; // days of delay
  probability: number; // 0-1
}

export interface WeatherAlert {
  id: string;
  projectId: string;
  weatherType: 'rain' | 'snow' | 'extreme-cold' | 'extreme-heat' | 'high-winds';
  severity: 'watch' | 'warning' | 'advisory';
  startTime: string;
  endTime: string;
  affectedPhases: string[]; // phases that would be impacted
  recommendations: string[];
  created: string;
}

export interface FeedbackPattern {
  stepId: string;
  issueType: string;
  frequency: number; // how often this issue occurs
  userTypes: string[]; // which skill levels encounter this
  suggestedImprovement: string;
  implementationPriority: number; // 1-5
  lastUpdated: string;
}

export interface WorkflowOptimization {
  id: string;
  projectId: string;
  optimizationType: 'step-reorder' | 'tool-consolidation' | 'material-batching' | 'time-reduction';
  description: string;
  timeSavings: number; // minutes
  difficultyReduction: number; // 1-5 scale
  adoptionRate: number; // percentage of users who follow suggestion
  effectiveDate: string;
}

export interface KnowledgeUpdate {
  id: string;
  category: string;
  title: string;
  content: string;
  source: string;
  relevanceScore: number; // 0-1
  applicableProjects: string[];
  tipType: 'shortcut' | 'safety' | 'quality' | 'troubleshoot';
  dateAdded: string;
  userRating: number; // 1-5
}

export interface UserCalendar {
  id: string;
  userId: string;
  availableDays: {
    [key: string]: { // date string
      available: boolean;
      timeSlots: TimeSlot[];
      notes?: string;
    };
  };
  recurringSchedule: {
    [key: string]: TimeSlot[]; // dayOfWeek (0-6) -> time slots
  };
  blackoutDates: string[]; // dates unavailable for projects
  preferences: {
    preferredStartTime: string;
    maxHoursPerDay: number;
    preferredDays: number[]; // 0-6, Sunday to Saturday
    breakDuration: number; // minutes between work sessions
  };
}

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  projectId?: string; // if allocated to a project
  type: 'work' | 'break' | 'blocked';
}

export interface PersonalizedProject {
  id: string;
  userId: string;
  templateProjectId: string;
  skillLevelAdjustments: {
    [stepId: string]: {
      instructionDetail: 'minimal' | 'standard' | 'detailed' | 'comprehensive';
      visualAids: boolean;
      safetyReminders: boolean;
      estimatedTime: number; // adjusted for user's skill level
    };
  };
  scheduleOptimization: {
    workDays: string[];
    dailyHours: number;
    breaksBetweenPhases: boolean;
    weatherConsiderations: boolean;
  };
  realTimeAdjustments: {
    currentDifficulty: 'too-easy' | 'just-right' | 'too-hard';
    paceAdjustment: number; // multiplier for time estimates
    lastAdjustment: string;
  };
}