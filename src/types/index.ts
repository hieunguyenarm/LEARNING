export interface PracticeProblem {
  name: string;
  oj: string;
  diff: 'Dễ' | 'Trung bình' | 'Khó' | 'Nâng cao' | 'HSGQG';
  linkHint: string;
  url?: string;
}

export interface LessonTheory {
  intuition: string;
  mathInvariant: string;
  steps: string[];
  complexity: {
    time: string;
    space: string;
    notes?: string;
  };
  pitfalls: string[];
  practiceProblems: PracticeProblem[];
}

export interface Lesson {
  id: string;
  title: string;
  xp: number;
  subtitle: string;
  theory: string; // Brief summary for backward compatibility
  theoryDeep: LessonTheory;
  code: string;
}

export interface RoadmapModule {
  key: string;
  title: string;
  icon: string;
  description: string;
  lessons: Lesson[];
}

export interface ProblemSample {
  input: string;
  output: string;
  explanation: string;
}

export interface ProblemTestCase {
  input: string;
  expected: string;
}

export interface Problem {
  id: string;
  name: string;
  category: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao' | 'HSGQG';
  timeLimit: string;
  memLimit: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  samples: ProblemSample[];
  hints: string[];
  starter: string;
  solutionExplanation?: string;
  testCases: ProblemTestCase[];
}

export interface UserSubmission {
  id: string;
  problemId: string;
  problemName: string;
  timestamp: string;
  verdict: 'AC' | 'WA' | 'TLE' | 'CE';
  passed: number;
  total: number;
  runtime: string;
  memory: string;
}

export interface UserState {
  userName: string;
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  completed: string[];
  acCount: number;
  activity: Record<string, number>;
  submissions: UserSubmission[];
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
  cond: (s: UserState) => boolean;
}
