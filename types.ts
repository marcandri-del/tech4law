
export interface Lesson {
  id: string;
  year: 1 | 2 | 3;
  semester?: 1 | 2;
  unit?: string;
  coefficient?: number;
  credits?: number;
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
  year?: 1 | 2 | 3;
  module?: string;
  semester?: 1 | 2;
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
  year?: 1 | 2 | 3;
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

export interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CourseChapter {
  id: string;
  chapterNumber: number;
  title: string;
  duration: string;
  summary: string;
  detailedContent: string;
  keyPoints: string[];
  legalArticles?: string[];
  examples: string[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  quizzes?: QuizItem[];
}

export interface CourseSyllabus {
  courseId: string;
  courseTitle: string;
  professor: string;
  university: string;
  totalChapters: number;
  chapters: CourseChapter[];
}
