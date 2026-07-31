import { useState, useRef, useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onUpload: (files: FileList | File[], tags: string[], description: string) => Promise<void>;
}

export function UploadModal({ open, onClose, onUpload }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    setFiles(Array.from(list));
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleSubmit = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await onUpload(files, tagList, description.trim());
      setFiles([]);
      setTags('');
      setDescription('');
      onClose();
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Add Documents</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div
          className={`dropzone ${dragging ? 'active' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={36} />
          <p style={{ fontWeight: 500, marginBottom: 4 }}>
            Drop files here or click to browse
          </p>
          <p style={{ fontSize: '0.85rem' }}>
            PDF, images, text, spreadsheets, presentations…
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {files.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </p>
            <ul style={{ fontSize: '0.9rem', maxHeight: 120, overflow: 'auto' }}>
              {files.map((f) => (
                <li key={f.name + f.size} style={{ padding: '2px 0' }}>
                  {f.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. work, invoice, 2024"
          />
        </div>

        <div className="form-group">
          <label>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Short note about these files…"
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!files.length || uploading}
          >
            {uploading ? 'Uploading…' : 'Add to library'}
          </button>
        </div>
      </div>
    </div>
  );
}
