"use client"

import { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import { ListBulletsIcon, ArrowCounterClockwiseIcon, ArrowClockwiseIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type Props = {
  name: string
  defaultValue?: string
  placeholder?: string
  maxLength?: number
  onChange?: () => void
  "aria-invalid"?: boolean
}

export function RichTextEditor({
  name,
  defaultValue = "",
  placeholder = "Start typing…",
  maxLength,
  onChange,
  "aria-invalid": ariaInvalid,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      ...(maxLength ? [CharacterCount.configure({ limit: maxLength })] : []),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[120px] w-full rounded-none px-3 py-2 text-sm focus:outline-none",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
          "[&_strong]:font-semibold [&_em]:italic",
        ),
      },
    },
    onUpdate: onChange ? () => onChange() : undefined,
    immediatelyRender: false,
  })

  // Keep hidden input in sync
  const html = editor?.getHTML() ?? defaultValue

  useEffect(() => {
    return () => { editor?.destroy() }
  }, [editor])

  const btn = (active: boolean) =>
    cn(
      "p-1.5 rounded hover:bg-accent transition-colors",
      active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
    )

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring overflow-hidden",
        ariaInvalid && "border-destructive ring-1 ring-destructive/20",
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input px-2 py-1.5 bg-muted/40">
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={btn(!!editor?.isActive("bold"))} title="Bold">
          <strong className="text-xs leading-none">B</strong>
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={btn(!!editor?.isActive("italic"))} title="Italic">
          <em className="text-xs leading-none not-italic font-serif">I</em>
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={btn(!!editor?.isActive("bulletList"))} title="Bullet list">
          <ListBulletsIcon size={14} />
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={btn(!!editor?.isActive("orderedList"))} title="Numbered list">
          <span className="text-xs leading-none font-medium">1.</span>
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={btn(!!editor?.isActive("blockquote"))} title="Blockquote">
          <span className="text-xs leading-none font-serif">"</span>
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} className={btn(false)} title="Undo">
          <ArrowCounterClockwiseIcon size={14} />
        </button>
        <button type="button" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} className={btn(false)} title="Redo">
          <ArrowClockwiseIcon size={14} />
        </button>
        {maxLength && (
          <span className="ml-auto text-xs text-muted-foreground pr-1">
            {editor?.storage.characterCount.characters() ?? 0}/{maxLength}
          </span>
        )}
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Hidden input submits with the form */}
      <input type="hidden" name={name} value={html} />
    </div>
  )
}
