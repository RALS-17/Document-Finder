export type FileType = 'pdf' | 'image' | 'text' | 'spreadsheet' | 'presentation' | 'other';

export interface DocumentMeta {
  id: string;
  name: string;
  type: FileType;
  mimeType: string;
  size: number; // bytes
  tags: string[];
  description: string;
  createdAt: number;
  updatedAt: number;
  // For searchability we keep a simple text extract / searchable text
  searchableText: string;
}

export interface StoredDocument extends DocumentMeta {
  // Base64 data URL for small files, or we use IndexedDB for blobs
  dataUrl?: string;
}
