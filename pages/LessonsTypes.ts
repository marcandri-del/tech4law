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
  quizzes?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface CourseSyllabus {
  courseId: string;
  courseTitle: string;
  professor: string;
  university: string;
  totalChapters: number;
  chapters: CourseChapter[];
}
