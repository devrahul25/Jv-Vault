"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect, useRef } from 'react';

export default function NotionEditor({
  value,
  onChange,
  onCommit,
  onCancel,
  autoFocus = false,
  isSingleLine = false,
}: {
  value: string;
  onChange: (val: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  autoFocus?: boolean;
  isSingleLine?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
            class: 'text-accent-400 hover:underline cursor-pointer',
        }
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // In single line mode, if user hits enter and it creates a new <p>, we could intercept, 
      // but it's simpler to just save HTML.
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none text-sm text-ink-100 min-h-[20px] w-full break-words [&_a]:text-accent-400 [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_code]:bg-ink-700 [&_code]:px-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-accent-300 [&_p]:m-0',
      },
      handleKeyDown: (view, event) => {
        if (event.key === "Escape") {
           onCancel();
           return true; 
        }
        if (event.key === "Enter") {
           if (isSingleLine || event.metaKey || event.ctrlKey) {
             onCommit();
             return true;
           }
        }
      }
    }
  });

  useEffect(() => {
    if (editor && autoFocus) {
      editor.commands.focus('end');
    }
  }, [editor, autoFocus]);

  // Handle blur carefully so BubbleMenu clicks don't instantly close it.
  // TipTap handles cursor beautifully, but React onBlur might fire when clicking menu.
  const handleBlur = (e: React.FocusEvent) => {
    if (containerRef.current && containerRef.current.contains(e.relatedTarget as Node)) {
       return;
    }
    onCommit();
  };

  if (!editor) {
    return null;
  }

  return (
    <div 
        ref={containerRef} 
        className="w-full h-full relative" 
        onClick={(e) => { e.stopPropagation(); }} 
        onBlur={handleBlur}
        tabIndex={-1}
    >
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100, zIndex: 9999 }}>
        <div className="flex bg-ink-800 border border-ink-700 shadow-xl rounded-lg overflow-hidden text-xs text-ink-100 items-center p-1 gap-0.5 z-[9999]">
          <button 
             onClick={() => editor.chain().focus().toggleBold().run()} 
             className={`px-2 py-1.5 rounded hover:bg-ink-700 transition font-bold ${editor.isActive('bold') ? 'bg-ink-700 text-white' : ''}`}
          >B</button>
          <button 
             onClick={() => editor.chain().focus().toggleItalic().run()} 
             className={`px-2 py-1.5 rounded hover:bg-ink-700 transition italic ${editor.isActive('italic') ? 'bg-ink-700 text-white' : ''}`}
          >i</button>
          <button 
             onClick={() => editor.chain().focus().toggleStrike().run()} 
             className={`px-2 py-1.5 rounded hover:bg-ink-700 transition line-through ${editor.isActive('strike') ? 'bg-ink-700 text-white' : ''}`}
          >S</button>
          <button 
             onClick={() => editor.chain().focus().toggleCode().run()} 
             className={`px-2 py-1.5 rounded hover:bg-ink-700 transition font-mono ${editor.isActive('code') ? 'bg-ink-700 text-white' : ''}`}
          >{'<>'}</button>
           <button 
             onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('URL', previousUrl);
                if (url === null) { return; }
                if (url === '') {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  return;
                }
                const cleanUrl = /^https?:\/\//i.test(url) ? url : "https://" + url;
                editor.chain().focus().extendMarkRange('link').setLink({ href: cleanUrl }).run();
             }}
             className={`px-2 py-1.5 rounded hover:bg-ink-700 transition ${editor.isActive('link') ? 'bg-ink-700 text-white' : ''}`}
          >Link</button>
        </div>
      </BubbleMenu>
      
      <div className="w-full pb-0.5 pt-0.5 px-0.5 text-sm cursor-text rounded-sm focus-within:ring-1 focus-within:ring-ink-600 bg-transparent">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
