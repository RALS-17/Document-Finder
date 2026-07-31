import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { DocumentMeta } from '../types/document';

interface Props {
  doc: DocumentMeta | null;
  onClose: () => void;
  onSave: (id: string, tags: string[]) => void;
}

export function TagsModal({ doc, onClose, onSave }: Props) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (doc) setValue(doc.tags.join(', '));
  }, [doc]);

  if (!doc) return null;

  const handleSave = () => {
    const tags = value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onSave(doc.id, tags);
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Edit tags</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          {doc.name}
        </p>
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="work, personal, invoice…"
            autoFocus
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
