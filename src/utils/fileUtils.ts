import type { FileType } from '../types/document';

export function getFileType(mimeType: string, name: string): FileType {
  const lower = name.toLowerCase();
  if (mimeType === 'application/pdf' || lower.endsWith('.pdf')) return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (
    mimeType.startsWith('text/') ||
    lower.endsWith('.txt') ||
    lower.endsWith('.md') ||
    lower.endsWith('.json') ||
    lower.endsWith('.csv')
  )
    return 'text';
  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    lower.endsWith('.xlsx') ||
    lower.endsWith('.xls') ||
    lower.endsWith('.csv')
  )
    return 'spreadsheet';
  if (
    mimeType.includes('presentation') ||
    mimeType.includes('powerpoint') ||
    lower.endsWith('.pptx') ||
    lower.endsWith('.ppt')
  )
    return 'presentation';
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateId(): string {
  return crypto.randomUUID()
}

/** Read a File as data URL (base64). Good for small files. */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Extract plain text from text-like files for search. */
export async function extractSearchableText(file: File): Promise<string> {
  const type = getFileType(file.type, file.name);
  if (type === 'text' || file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.csv')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
  // For PDFs / images we just use the filename + tags later
  return file.name;
}
