"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Node } from '@tiptap/core';
import { useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Strikethrough,
  Code as CodeIcon
} from 'lucide-react';

const Image = Node.create({
  name: 'image',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      class: { default: 'max-w-full h-auto rounded-xl shadow-lg my-4 border border-ink-700' }
    }
  },
  parseHTML() {
    return [{ tag: 'img[src]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes]
  },
});

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
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
            class: 'text-accent-400 hover:underline cursor-pointer',
        }
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      let html = editor.getHTML();
      if (isSingleLine) {
        // Strip wrapping <p> and </p> if it's a single paragraph
        if (html.startsWith('<p>') && html.endsWith('</p>') && html.split('<p>').length === 2) {
          html = html.slice(3, -4);
        }
      }
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none text-sm text-ink-100 min-h-[60px] w-full break-words [&_a]:text-accent-400 [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_code]:bg-ink-700 [&_code]:px-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-accent-300 [&_p]:m-0 p-4',
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
      <div className="flex items-center gap-1 p-1.5 border-b border-ink-700/50 bg-ink-800/50">
          <button 
             type="button"
             onClick={() => editor.chain().focus().toggleBold().run()} 
             className={`p-2 rounded-lg hover:bg-ink-700 transition ${editor.isActive('bold') ? 'bg-ink-700 text-accent-400' : 'text-ink-400'}`}
             title="Bold"
          ><Bold className="w-4 h-4" /></button>
          <button 
             type="button"
             onClick={() => editor.chain().focus().toggleItalic().run()} 
             className={`p-2 rounded-lg hover:bg-ink-700 transition ${editor.isActive('italic') ? 'bg-ink-700 text-accent-400' : 'text-ink-400'}`}
             title="Italic"
          ><Italic className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-ink-700 mx-1" />
          <button 
             type="button"
             onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('Enter URL', previousUrl);
                if (url === null) return;
                if (url === '') {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  return;
                }
                const cleanUrl = /^https?:\/\//i.test(url) ? url : "https://" + url;
                editor.chain().focus().extendMarkRange('link').setLink({ href: cleanUrl }).run();
             }}
             className={`p-2 rounded-lg hover:bg-ink-700 transition ${editor.isActive('link') ? 'bg-ink-700 text-accent-400' : 'text-ink-400'}`}
             title="Link"
          ><LinkIcon className="w-4 h-4" /></button>
          <button 
             type="button"
             onClick={() => {
                const url = window.prompt('Enter Image URL');
                if (url) {
                  editor.chain().focus().insertContent(`<img src="${url}" />`).run();
                }
             }}
             className="p-2 rounded-lg hover:bg-ink-700 transition text-ink-400"
             title="Insert Image"
          ><ImageIcon className="w-4 h-4" /></button>
      </div>

      <BubbleMenu editor={editor}>
        <div className="flex bg-ink-900 border border-ink-700 shadow-2xl rounded-xl overflow-hidden text-xs text-ink-100 items-center p-1 gap-0.5 z-[9999]">
          <button 
             type="button"
             onClick={() => editor.chain().focus().toggleBold().run()} 
             className={`px-2 py-1.5 rounded hover:bg-ink-700 transition font-bold ${editor.isActive('bold') ? 'bg-ink-700 text-white' : ''}`}
          >B</button>
          <button 
             type="button"
             onClick={() => editor.chain().focus().toggleItalic().run()} 
             className={`px-2 py-1.5 rounded hover:bg-ink-700 transition italic ${editor.isActive('italic') ? 'bg-ink-700 text-white' : ''}`}
          >i</button>
          <button 
             type="button"
             onClick={() => editor.chain().focus().toggleStrike().run()} 
             className={`px-2 py-1.5 rounded hover:bg-ink-700 transition line-through ${editor.isActive('strike') ? 'bg-ink-700 text-white' : ''}`}
          >S</button>
          <button 
             type="button"
             onClick={() => editor.chain().focus().toggleCode().run()} 
             className={`px-2 py-1.5 rounded hover:bg-ink-700 transition font-mono ${editor.isActive('code') ? 'bg-ink-700 text-white' : ''}`}
          >{'<>'}</button>
        </div>
      </BubbleMenu>
      
      <div className="w-full cursor-text bg-transparent">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
