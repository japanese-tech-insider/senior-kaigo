export interface FAQItem {
  question: string;
  answer: string;
}

export interface ArticleData {
  id: string;
  topicId?: string;
  slug: string;
  title: string;
  body: string; // Markdown
  metaTitle: string;
  metaDescription: string;
  status: 'pending_review' | 'published' | 'rejected';
  gmailThreadId?: string;
  gmailMessageId?: string;
  reviewIteration?: number; // Optionalに変更
  feedbackNotes?: string;
  category: string; // マルチサイト対応のためstringへ拡張
  summaryList: string[]; // 冒頭3行の要点結論
  faqList: FAQItem[];
  createdAt: string;
  publishedAt?: string;
  readingTimeMinutes?: number;
}

export interface TopicData {
  id: string;
  keyword: string;
  angle: string;
  status: 'unused' | 'used';
  createdAt: string;
}
