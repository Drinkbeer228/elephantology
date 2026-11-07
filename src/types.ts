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
  type?: string;
  source?: string;
}

export type StructuredReference = ReferenceItem;

export interface RelatedKnowledgeItem {
  type: string;
  target: string;
}

export type EvidenceLevel = 'established' | 'moderate' | 'limited' | 'hypothesis' | 'contested';

export type ConfidenceLevel = 'high' | 'moderate' | 'low';

export type ReviewStatus = 'verified' | 'reviewed' | 'draft';

export type EvidenceBasisType =
  | 'peer_reviewed'
  | 'systematic_review'
  | 'primary_studies'
  | 'consensus'
  | 'expert_assessment'
  | string;

export interface Contributor {
  name: string;
  role: string;
  affiliation: string | null;
  orcid: string | null;
  url: string | null;
}

export interface ArticleMetadata {
  title?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  difficulty?: 'basic' | 'intermediate' | 'advanced' | string;
  readingTime?: string;
  readingTimeMin?: number;
  epoch?: string;
  period?: string;
  evidenceLevel?: EvidenceLevel | string;
  evidenceBasis?: EvidenceBasisType[];
  datePublished?: string;
  lastReviewed?: string;
  authors?: string;
  contributors: Contributor[];
  contributorsText?: string;
  referenceCount?: number;
  references?: ReferenceItem[];
  structuredReferences?: StructuredReference[];
  keyFindings?: string[];
  confidenceLevel?: ConfidenceLevel;
  reviewStatus?: ReviewStatus;
  uncertaintyNotes?: string;
  related_knowledge?: Array<RelatedKnowledgeItem | string>;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface ArticleSummary {
  path: string;
  filename: string;
  title: string;
  category: string;
  size?: number;
  excerpt?: string;
  snippet?: string;
  tags?: string[];
  readingTime?: string;
  reading_time_min?: number;
  content?: string;
  evidenceLevel?: string;
  evidence_level?: string;
  difficulty?: string;
  lastReviewed?: string;
  related_knowledge?: Array<RelatedKnowledgeItem | string>;
}

export interface PreparedArticleDocument {
  path: string;
  slug: string;
  filename: string;
  category: string;
  categoryTitle: string;
  title: string;
  excerpt: string;
  shouldShowLead: boolean;
  tags: string[];
  readingTime: string;
  readingTimeMin: number;
  evidenceLevel?: string;
  evidenceBasis?: string[];
  difficulty?: string;
  lastReviewed?: string;
  keyFindings: string[];
  confidenceLevel?: ConfidenceLevel;
  reviewStatus?: ReviewStatus;
  uncertaintyNotes?: string;
  bodyMarkdown: string;
  toc: TocItem[];
  references: StructuredReference[];
  relatedArticles: ArticleSummary[];
  siblingArticles: ArticleSummary[];
  currentIndexInCategory: number;
  prevArticle: ArticleSummary | null;
  nextArticle: ArticleSummary | null;
}

export interface DisciplineSubCluster {
  id: string;
  labelRu: string;
  labelEn: string;
  keywords: string[];
}

export interface DisciplineCollection {
  id: string;
  indexNumber: string;
  title: string;
  description: string;
  articles: ArticleSummary[];
  subClusters: DisciplineSubCluster[];
}

export interface FoundationalMonograph {
  path: string;
  code: string;
  title: string;
  summary: string;
}

export interface GlossaryTermEntry {
  key: string;
  term: string;
  fullRu: string;
  fullEn: string;
  defRu: string;
  defEn: string;
  categoryRu: string;
  categoryEn: string;
}

export interface EcosystemProject {
  id: string;
  nameRu: string;
  nameEn: string;
  roleBadgeRu: string;
  roleBadgeEn: string;
  descriptionRu: string;
  descriptionEn: string;
  url: string;
  isCurrent?: boolean;
}
