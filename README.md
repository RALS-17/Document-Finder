# Document Finder

A personal document library built with **React + TypeScript**.  
Upload PDFs, images, text files, spreadsheets and more. Search by name, tags or content. Everything is stored locally in your browser (IndexedDB).

## Features

- 📂 Upload multiple files (drag & drop or file picker)
- 🔍 Instant search across filename, tags, description and text content
- 🏷️ Tags + optional description per upload
- 📁 Filter by file type (PDF, Image, Text, Spreadsheet…)
- 🖼️ Grid / List view
- 👁️ In-browser preview for images, PDFs and text files
- ⬇️ Download any file
- 💾 Persistent storage with IndexedDB (survives page reloads)

## Quick start

```bash
cd document-finder
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## Tech stack

- React 18 + TypeScript
- Vite
- Lucide React (icons)
- IndexedDB for local file + metadata storage

## Notes

- Files stay in **your browser only** — nothing is uploaded to a server.
- Text works best on text files (full content is indexed). For PDFs/images the filename + tags are used.
- Large files are fine (IndexedDB typically allows hundreds of MB depending on the browser).
