import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, FileText, Image, Trash2, Download, Eye } from 'lucide-react'
import { supabase } from '@/config/supabase'
import { formatFileSize } from '@/lib/utils/formatters'
import { toast } from 'sonner'

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  path: string
  url?: string
  uploaded_at: string
}

interface FileUploadProps {
  bucket?: string
  folder?: string
  maxSize?: number
  accept?: string[]
  multiple?: boolean
  files?: UploadedFile[]
  onUpload?: (file: UploadedFile) => void
  onDelete?: (fileId: string) => void
  className?: string
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image
  if (type === 'application/pdf') return FileText
  return File
}

export function FileUpload({
  bucket = 'documenti',
  folder = '',
  maxSize = 50 * 1024 * 1024,
  accept = ['application/pdf', 'image/png', 'image/jpeg'],
  multiple = true,
  files = [],
  onUpload,
  onDelete,
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const arr = Array.from(fileList)
    for (const file of arr) {
      if (file.size > maxSize) { toast.error(`${file.name} troppo grande`); continue }
      setUploading(true)
      try {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = folder ? `${folder}/${Date.now()}_${safeName}` : `${Date.now()}_${safeName}`
        const { data, error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false })
        if (error) throw error
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
        onUpload?.({ id: data.path, name: file.name, size: file.size, type: file.type, path: data.path, url: urlData.publicUrl, uploaded_at: new Date().toISOString() })
        toast.success(`${file.name} caricato`)
      } catch (err: any) { toast.error(`Errore: ${err.message}`) }
      setUploading(false)
    }
    if (inputRef.current) inputRef.current.value = ''
  }, [bucket, folder, maxSize, onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }, [handleFiles])

  const handleDelete = async (fileId: string) => {
    try { await supabase.storage.from(bucket).remove([fileId]); onDelete?.(fileId); toast.success('Eliminato') } catch { toast.error('Errore') }
  }

  return (
    <div className={className}>
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-gold-400 bg-gold-400/5' : 'border-border-medium hover:border-border-strong hover:bg-bg-tertiary'}`}
      >
        <input ref={inputRef} type="file" multiple={multiple} accept={accept.join(',')} onChange={e => e.target.files && handleFiles(e.target.files)} className="hidden" />
        <Upload size={32} className={`mx-auto mb-3 ${isDragging ? 'text-gold-400' : 'text-text-muted'}`} />
        <p className="text-sm text-text-primary font-medium">{uploading ? 'Caricamento...' : 'Trascina file o clicca'}</p>
        <p className="text-xs text-text-muted mt-1">PDF, immagini — max {formatFileSize(maxSize)}</p>
      </div>
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2">
            {files.map(file => {
              const Icon = getFileIcon(file.type)
              return (
                <motion.div key={file.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg border border-border-subtle group">
                  <div className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0"><Icon size={16} className="text-gold-400" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{file.name}</p>
                    <p className="text-[10px] text-text-muted">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.url && <button onClick={e => { e.stopPropagation(); window.open(file.url, '_blank') }} className="p-1.5 text-text-muted hover:text-accent-blue"><Eye size={14} /></button>}
                    <button onClick={e => { e.stopPropagation(); handleDelete(file.id) }} className="p-1.5 text-text-muted hover:text-accent-red"><Trash2 size={14} /></button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
