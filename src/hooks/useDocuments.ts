import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { DocumentMeta, FileType } from '../types/document'
import { getFileType, generateId, extractSearchableText } from '../utils/fileUtils'

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const docs: DocumentMeta[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type as FileType,
        mimeType: row.mime_type,
        size: row.size,
        tags: Array.isArray(row.tags) ? row.tags : [],
        description: row.description || '',
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.created_at).getTime(),
        searchableText: row.searchable_text || '',
      }))

      setDocuments(docs)
      setError(null)
    } catch (e) {
      console.error(e)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const addFiles = useCallback(
    async (files: FileList | File[], tags: string[] = [], description = '') => {
      const fileArray = Array.from(files)
      const added: DocumentMeta[] = []

      for (const file of fileArray) {
        try {
          const id = generateId()
          const type = getFileType(file.type, file.name)
          const searchableText = await extractSearchableText(file)
          const storagePath = `${id}/${file.name}`

          // 1. Upload file to Storage
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(storagePath, file)

          if (uploadError) throw uploadError

          // 2. Save metadata to table
          const { data, error: insertError } = await supabase
            .from('documents')
            .insert({
              id,
              name: file.name,
              type,
              mime_type: file.type || 'application/octet-stream',
              size: file.size,
              tags,
              description,
              storage_path: storagePath,
              searchable_text: `${file.name} ${searchableText} ${tags.join(' ')} ${description}`.toLowerCase(),
            })
            .select()
            .single()

          if (insertError) throw insertError

          const meta: DocumentMeta = {
            id: data.id,
            name: data.name,
            type: data.type,
            mimeType: data.mime_type,
            size: data.size,
            tags: Array.isArray(data.tags) ? data.tags : [],
            description: data.description || '',
            createdAt: new Date(data.created_at).getTime(),
            updatedAt: new Date(data.created_at).getTime(),
            searchableText: data.searchable_text || '',
          }

          added.push(meta)
        } catch (e) {
          console.error('Failed to upload', file.name, e)
        }
      }

      if (added.length) {
        setDocuments((prev) => [...added, ...prev])
      }
      return added
    },
    []
  )

  const removeDocument = useCallback(async (id: string) => {
    // Get storage path first
    const { data } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (data?.storage_path) {
      await supabase.storage.from('documents').remove([data.storage_path])
    }

    await supabase.from('documents').delete().eq('id', id)
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const updateTags = useCallback(async (id: string, tags: string[]) => {
    await supabase
      .from('documents')
      .update({ tags })
      .eq('id', id)

    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, tags } : d))
    )
  }, [])

  const getBlob = useCallback(async (id: string) => {
    const { data: row } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (!row?.storage_path) return null

    const { data, error } = await supabase.storage
      .from('documents')
      .download(row.storage_path)

    if (error) {
      console.error(error)
      return null
    }
    return data
  }, [])

  const download = useCallback(
    async (doc: DocumentMeta) => {
      const blob = await getBlob(doc.id)
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.name
      a.click()
      URL.revokeObjectURL(url)
    },
    [getBlob]
  )

  return {
    documents,
    loading,
    error,
    addFiles,
    removeDocument,
    updateTags,
    getBlob,
    download,
    refresh: load,
  }
}