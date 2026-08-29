export interface ReferenceItem {
  id: string;
  title: string;
  authors?: string;
  year?: string | number;
  doi?: string;
  isbn?: string;
  journal?: string;
  book?: string;
  url?: string;
}

export interface RelatedKnowledgeItem {
  type: string;
  target: string;
}

export type EvidenceLevel = 'established' | 'moderate' | 'limited' | 'hypothesis' | 'contested';

export type EvidenceBasisType = 'peer_reviewed' | 'systematic_review' | 'primary_studies' | 'consensus' | 'expert_assessment' | string;

export interface ArticleMetadata {
  title?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  difficulty?: 'basic' | 'intermediate' | 'advanced' | string;
  readingTimeMin?: number;
  evidenceLevel?: EvidenceLevel | string;
  evidenceBasis?: EvidenceBasisType[];
  datePublished?: string;
  lastReviewed?: string;
  authors?: string;
  referenceCount?: number;
  references?: ReferenceItem[];
  related_knowledge?: RelatedKnowledgeItem[];
}
