export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface Book {
  id: string;
  title: string;
  category: string;
  progress: number;
  totalChapters: number;
  currentChapter: number;
  cover?: string;
}

export interface ReadingProgress {
  bookId: string;
  chapterProgress: number;
  totalProgress: number;
  lastReadAt: Date;
}

export type Theme = 'light' | 'dark'; 