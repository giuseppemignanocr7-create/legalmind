declare module '@tiptap/react' {
  import { FC, ReactNode } from 'react'
  export interface EditorOptions {
    extensions?: any[]
    content?: string
    editable?: boolean
    onUpdate?: (props: { editor: any }) => void
    editorProps?: Record<string, any>
  }
  export function useEditor(options: EditorOptions, deps?: any[]): any
  export const EditorContent: FC<{ editor: any; className?: string }>
  export const BubbleMenu: FC<{ editor: any; tippyOptions?: any; children?: ReactNode }>
}

declare module '@tiptap/starter-kit' {
  const StarterKit: any
  export default StarterKit
}

declare module '@tiptap/extension-underline' {
  const Underline: any
  export default Underline
}

declare module '@tiptap/extension-text-align' {
  const TextAlign: { configure: (opts: any) => any }
  export default TextAlign
}

declare module '@tiptap/extension-highlight' {
  const Highlight: any
  export default Highlight
}

declare module '@tiptap/extension-placeholder' {
  const Placeholder: { configure: (opts: any) => any }
  export default Placeholder
}
