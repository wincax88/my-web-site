export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export type LessonType = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  order: number;
  duration?: number; // 预计学习时长（分钟）
  published: boolean;
  courseId: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseType = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  level: CourseLevel;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  lessons?: LessonType[];
  lessonsCount?: number;
  totalDuration?: number; // 总学习时长（分钟）
};

export type LessonProgressType = {
  lessonId: string;
  completed: boolean;
  progress: number; // 0-100
};

export type CourseProgressType = {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  lessonProgress: Record<string, LessonProgressType>;
};

// 难度等级映射
export const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
};

export const LEVEL_COLORS: Record<CourseLevel, string> = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediate:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
