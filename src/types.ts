export interface ReferenceItem {
  id: string;
  title: string;
  authors?: string;
  year?: string | number;
  doi?: string;
  isbn?: string;
  journal?: string;
  book?: string;
}

export interface RelatedKnowledgeItem {
  type: string;
  target: string;
}

export interface ArticleMetadata {
  title?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  difficulty?: string;
  readingTimeMin?: number;
  evidenceLevel?: 'established' | 'moderate' | 'limited' | 'hypothesis' | 'contested' | string;
  lastReviewed?: string;
  referenceCount?: number;
  references?: ReferenceItem[];
  related_knowledge?: RelatedKnowledgeItem[];
}
