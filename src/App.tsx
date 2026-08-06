import { useState, useMemo } from 'react';
import {
  Search,
  Upload,
  LayoutGrid,
  List,
  Library,
  FileText,
  FileImage,
  FileSpreadsheet,
  Presentation,
  File,
  Files,
} from 'lucide-react';
import { useDocuments } from './hooks/useDocuments';
import { DocumentCard } from './components/DocumentCard';
import { UploadModal } from './components/UploadModal';
import { PreviewModal } from './components/PreviewModal';
import { TagsModal } from './components/TagsModal';
import type { DocumentMeta, FileType } from './types/document';

const TYPE_FILTERS: { key: FileType | 'all'; label: string; icon: typeof File }[] = [
  { key: 'all', label: 'All files', icon: Files },
  { key: 'pdf', label: 'PDFs', icon: FileText },
  { key: 'image', label: 'Images', icon: FileImage },
  { key: 'text', label: 'Text', icon: FileText },
  { key: 'spreadsheet', label: 'Spreadsheets', icon: FileSpreadsheet },
  { key: 'presentation', label: 'Presentations', icon: Presentation },
  { key: 'other', label: 'Other', icon: File },
];

export default function App() {
  const {
    documents,
    loading,
    addFiles,
    removeDocument,
    updateTags,
    getBlob,
    download,
  } = useDocuments();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FileType | 'all'>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentMeta | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [tagsDoc, setTagsDoc] = useState<DocumentMeta | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((d) => {
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.searchableText.includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q)) ||
        d.description.toLowerCase().includes(q)
      );
    });
  }, [documents, query, typeFilter]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: documents.length };
    for (const d of documents) {
      counts[d.type] = (counts[d.type] || 0) + 1;
    }
    return counts;
  }, [documents]);

  const handlePreview = async (doc: DocumentMeta) => {
    setPreviewDoc(doc);
    setPreviewBlob(null);
    const blob = await getBlob(doc.id);
    setPreviewBlob(blob);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this document from your library?')) {
      removeDocument(id);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <img src="/logo.svg" alt="GCare" className="logo-img" />
          GCare File Finder
        </div>

        <div className="search-wrap">
          <Search size={18} />
          <input
            className="search-input"
            placeholder="Search by name, tags, content…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setUploadOpen(true)}>
            <Upload size={18} />
            Add files
          </button>
        </div>
      </header>

      <div className="main">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>Library</h3>
            <ul className="filter-list">
              {TYPE_FILTERS.map(({ key, label, icon: Icon }) => (
                <li
                  key={key}
                  className={`filter-item ${typeFilter === key ? 'active' : ''}`}
                  onClick={() => setTypeFilter(key)}
                >
                  <Icon size={17} />
                  {label}
                  <span className="count">{typeCounts[key] || 0}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="content">
          <div className="toolbar">
            <div className="results-info">
              {loading
                ? 'Loading…'
                : `${filtered.length} document${filtered.length !== 1 ? 's' : ''}${
                    query || typeFilter !== 'all' ? ' found' : ''
                  }`}
            </div>
            <div className="view-toggle">
              <button
                className={view === 'grid' ? 'active' : ''}
                onClick={() => setView('grid')}
                title="Grid view"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                className={view === 'list' ? 'active' : ''}
                onClick={() => setView('list')}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {!loading && filtered.length === 0 ? (
            <div className="empty">
              <Library size={56} />
              <h2>
                {documents.length === 0
                  ? 'Your library is empty'
                  : 'No matching documents'}
              </h2>
              <p>
                {documents.length === 0
                  ? 'Upload PDFs, images, text files and more to get started.'
                  : 'Try a different search or filter.'}
              </p>
              {documents.length === 0 && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 8 }}
                  onClick={() => setUploadOpen(true)}
                >
                  <Upload size={18} /> Add your first files
                </button>
              )}
            </div>
          ) : (
            <div className={view === 'grid' ? 'doc-grid' : 'doc-list'}>
              {filtered.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  view={view}
                  onDownload={download}
                  onDelete={handleDelete}
                  onPreview={handlePreview}
                  onEditTags={setTagsDoc}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={async (files, tags, desc) => {
          await addFiles(files, tags, desc);
        }}
      />

      <PreviewModal
        doc={previewDoc}
        blob={previewBlob}
        onClose={() => {
          setPreviewDoc(null);
          setPreviewBlob(null);
        }}
        onDownload={download}
      />

      <TagsModal
        doc={tagsDoc}
        onClose={() => setTagsDoc(null)}
        onSave={updateTags}
      />
    </div>
  );
}
