import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import type { DocumentMeta } from '../types/document';

interface Props {
  doc: DocumentMeta | null;
  blob: Blob | null;
  onClose: () => void;
  onDownload: (doc: DocumentMeta) => void;
}

export function PreviewModal({ doc, blob, onClose, onDownload }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    if (!blob || !doc) {
      setUrl(null);
      setTextContent(null);
      return;
    }

    if (doc.type === 'text' || doc.mimeType.startsWith('text/') || doc.name.endsWith('.csv') || doc.name.endsWith('.json') || doc.name.endsWith('.md')) {
      blob.text().then(setTextContent);
      setUrl(null);
    } else {
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
      setTextContent(null);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [blob, doc]);

  if (!doc) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {doc.name}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => onDownload(doc)} style={{ padding: '0.4rem 0.7rem' }}>
              <Download size={16} /> Download
            </button>
            <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 4 }}>
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="preview-body">
          {!blob && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
          {textContent !== null && <pre>{textContent}</pre>}
          {url && doc.type === 'image' && <img src={url} alt={doc.name} />}
          {url && doc.type === 'pdf' && (
            <iframe src={url} title={doc.name} />
          )}
          {url && doc.type !== 'image' && doc.type !== 'pdf' && textContent === null && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>Preview not available for this file type.</p>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => onDownload(doc)}>
                Download to open
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
