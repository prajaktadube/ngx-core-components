export interface RAGSource {
  id: string;
  title: string;
  sourceType: 'pdf' | 'docx' | 'txt' | 'csv' | 'web' | 'other';
  score: number; // between 0 and 1, representing similarity
  snippet: string;
  metadata?: {
    pageNumber?: number;
    filePath?: string;
    author?: string;
    publishDate?: string;
    chunkIndex?: number;
    [key: string]: any;
  };
}
