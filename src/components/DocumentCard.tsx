import { Download, Trash2, Eye, Tag } from 'lucide-react';
import type { DocumentMeta } from '../types/document';
import { FileIcon } from './FileIcon';
import { formatFileSize, formatDate } from '../utils/fileUtils';

interface Props {
  doc: DocumentMeta;
  view: 'grid' | 'list';
  onDownload: (doc: DocumentMeta) => void;
  onDelete: (id: string) => void;
  onPreview: (doc: DocumentMeta) => void;
  onEditTags: (doc: DocumentMeta) => void;
}

export function DocumentCard({
  doc,
  view,
  onDownload,
  onDelete,
  onPreview,
  onEditTags,
}: Props) {
  const tags = Array.isArray(doc.tags) ? doc.tags : [];

  if (view === 'list') {
    return (
      <div className="doc-row">
        <FileIcon type={doc.type} size={18} />
        <div className="doc-title" title={doc.name}>
          {doc.name}
        </div>
        <div className="doc-meta">
          <span>{formatFileSize(doc.size)}</span>
          <span>{formatDate(doc.createdAt)}</span>
        </div>
        {tags.length > 0 && (
          <div className="tags">
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="doc-actions" style={{ border: 'none', padding: 0, margin: 0 }}>
          <button title="Preview" onClick={() => onPreview(doc)}>
            <Eye size={16} />
          </button>
          <button title="Download" onClick={() => onDownload(doc)}>
            <Download size={16} />
          </button>
          <button title="Tags" onClick={() => onEditTags(doc)}>
            <Tag size={16} />
          </button>
          <button title="Delete" className="btn-danger" onClick={() => onDelete(doc.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-card">
      <div className="doc-card-header">
        <FileIcon type={doc.type} />
        <div className="doc-title" title={doc.name}>
          {doc.name}
        </div>
      </div>
      <div className="doc-meta">
        <span>{formatFileSize(doc.size)}</span>
        <span>{formatDate(doc.createdAt)}</span>
      </div>
      {tags.length > 0 && (
        <div className="tags">
          {tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}
      {doc.description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {doc.description}
        </p>
      )}
      <div className="doc-actions">
        <button title="Preview" onClick={() => onPreview(doc)}>
          <Eye size={15} /> Preview
        </button>
        <button title="Download" onClick={() => onDownload(doc)}>
          <Download size={15} />
        </button>
        <button title="Tags" onClick={() => onEditTags(doc)}>
          <Tag size={15} />
        </button>
        <button
          title="Delete"
          className="btn-danger"
          onClick={() => onDelete(doc.id)}
          style={{ marginLeft: 'auto' }}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}