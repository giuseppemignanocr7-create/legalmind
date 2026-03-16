import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Heading1, Heading2, Heading3, Highlighter, Undo, Redo, Code } from 'lucide-react'

interface RichTextEditorProps {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
  editable?: boolean
  className?: string
}

function ToolbarButton({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-gold-400/20 text-gold-400' : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'}`}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ content = '', onChange, placeholder = 'Inizia a scrivere...', editable = true, className = '' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-text-primary',
      },
    },
  })

  if (!editor) return null

  return (
    <div className={`border border-border-medium rounded-xl overflow-hidden bg-bg-secondary ${className}`}>
      {editable && (
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border-subtle bg-bg-tertiary flex-wrap">
          <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Grassetto">
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Corsivo">
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Sottolineato">
            <UnderlineIcon size={14} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Barrato">
            <Strikethrough size={14} />
          </ToolbarButton>

          <div className="w-px h-5 bg-border-subtle mx-1" />

          <ToolbarButton active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Titolo 1">
            <Heading1 size={14} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Titolo 2">
            <Heading2 size={14} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Titolo 3">
            <Heading3 size={14} />
          </ToolbarButton>

          <div className="w-px h-5 bg-border-subtle mx-1" />

          <ToolbarButton active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Allinea a sinistra">
            <AlignLeft size={14} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Centra">
            <AlignCenter size={14} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Allinea a destra">
            <AlignRight size={14} />
          </ToolbarButton>

          <div className="w-px h-5 bg-border-subtle mx-1" />

          <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Elenco puntato">
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Elenco numerato">
            <ListOrdered size={14} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Evidenzia">
            <Highlighter size={14} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Blocco codice">
            <Code size={14} />
          </ToolbarButton>

          <div className="w-px h-5 bg-border-subtle mx-1" />

          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Annulla">
            <Undo size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Ripristina">
            <Redo size={14} />
          </ToolbarButton>
        </div>
      )}

      {editor && editable && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex items-center gap-0.5 bg-bg-elevated border border-border-medium rounded-lg px-1 py-0.5 shadow-card">
            <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold size={12} />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic size={12} />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <UnderlineIcon size={12} />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
              <Highlighter size={12} />
            </ToolbarButton>
          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  )
}
