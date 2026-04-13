
export interface Lesson {
  id: string;
  year: 1 | 2 | 3;
  title: string;
  summary: string;
  keyPoints: string[];
  examples: string[];
  examQuestions: string[];
}

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  lawReference: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  recommendation?: string; // New field for study advice
}

export interface QuizCategory {
  id: string;
  name: string;
  questions: QuizQuestion[];
}

export interface ResearchTopic {
  id: string;
  title: string;
  description: string;
  category: string;
}

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: Date;
}

export interface DailyTip {
  id: string;
  category: string;
  title: string;
  content: string;
  reference?: string;
}
