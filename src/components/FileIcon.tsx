import {
  FileText,
  FileImage,
  FileSpreadsheet,
  Presentation,
  File,
  FileType,
} from 'lucide-react';
import type { FileType as FT } from '../types/document';

const iconMap: Record<FT, typeof File> = {
  pdf: FileType,
  image: FileImage,
  text: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  other: File,
};

interface Props {
  type: FT;
  size?: number;
  className?: string;
}

export function FileIcon({ type, size = 22, className = '' }: Props) {
  const Icon = iconMap[type] || File;
  return (
    <div className={`file-icon ${type} ${className}`}>
      <Icon size={size} strokeWidth={1.75} />
    </div>
  );
}
