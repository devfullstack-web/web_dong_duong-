"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { Extension } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { MoveHorizontal, Maximize, AlignLeft as AlignLeftIcon, AlignCenter as AlignCenterIcon, AlignRight as AlignRightIcon, Trash2 } from "lucide-react";

import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignJustify,
  Highlighter,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  Table as TableIcon,
  Youtube as YoutubeIcon,
  CheckSquare,
  Eraser,
  Palette,
  BookType,
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MediaSelectorDialog } from "./media-selector-dialog";

// Custom Font Size Extension
const FONT_FAMILIES = [
  { label: "Arial", value: "Arial" },
  { label: "Helvetica", value: "Helvetica" },
  { label: "Times", value: "Times New Roman" },
  { label: "Georgia", value: "Georgia" },
  { label: "Courier", value: "Courier New" },
  { label: "Verdana", value: "Verdana" },
  { label: "Tahoma", value: "Tahoma" },
];

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }) => {
        return chain().setMark("textStyle", { fontSize: size }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark("textStyle", { fontSize: null }).run();
      },
    };
  },
});

const FontFamily = Extension.create({
  name: "fontFamily",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) {
                return {};
              }
              return {
                style: `font-family: ${attributes.fontFamily}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontFamily: (fontFamily: string) => ({ chain }) => {
        return chain().setMark("textStyle", { fontFamily }).run();
      },
      unsetFontFamily: () => ({ chain }) => {
        return chain().setMark("textStyle", { fontFamily: null }).run();
      },
    };
  },
});

// Custom Image with Resize and Alignment Extension
const ImageResizeComponent = ({ node, updateAttributes, selected, editor }: { node: { attrs: Record<string, string> }; updateAttributes: (attrs: Record<string, string>) => void; selected: boolean; editor: Editor }) => {
  const [, setResizing] = useState(false);
  const [startWidth, setStartWidth] = useState(0);
  const [startX, setStartX] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
    const img = (e.target as HTMLElement).closest('.image-container')?.querySelector('img');
    if (img) {
      setStartWidth(img.clientWidth);
      setStartX(e.clientX);
    }

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(50, startWidth + deltaX);
      updateAttributes({ width: `${newWidth}px` });
    };

    const onMouseUp = () => {
      setResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <NodeViewWrapper className={cn(
      "relative inline-block my-6 group transition-all",
      node.attrs.align === 'center' && "flex flex-col items-center",
      node.attrs.align === 'left' && "flex flex-col items-start",
      node.attrs.align === 'right' && "flex flex-col items-end",
      node.attrs.align === 'full' && "w-full"
    )}>
      <div className={cn(
        "relative image-container group/container",
        selected && "ring-2 ring-brand-primary ring-offset-2",
        node.attrs.align === 'full' ? "w-full" : "w-fit"
      )}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={node.attrs.src}
          alt={node.attrs.alt}
          title={node.attrs.title}
          style={{
            width: node.attrs.width,
            height: node.attrs.height,
          }}
          className={cn(
            "block max-w-full h-auto rounded-none transition-all",
            node.attrs.align === 'full' && "w-full"
          )}
        />
        
        {/* Resize Handle */}
        <div 
          className="absolute right-0 bottom-0 w-6 h-6 bg-brand-primary text-white cursor-nwse-resize opacity-0 group-hover/container:opacity-100 flex items-center justify-center z-10"
          onMouseDown={onMouseDown}
        >
          <MoveHorizontal size={12} />
        </div>

        {/* Hover Toolbar */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl p-1 flex items-center gap-0.5 opacity-0 group-hover/container:opacity-100 transition-all z-20">
          <button 
            type="button"
            onClick={() => updateAttributes({ align: 'left' })}
            className={cn("p-1.5 hover:bg-slate-100", node.attrs.align === 'left' && "text-brand-primary")}
            title="Căn trái"
          >
            <AlignLeftIcon size={14} />
          </button>
          <button 
            type="button"
            onClick={() => updateAttributes({ align: 'center' })}
            className={cn("p-1.5 hover:bg-slate-100", node.attrs.align === 'center' && "text-brand-primary")}
            title="Căn giữa"
          >
            <AlignCenterIcon size={14} />
          </button>
          <button 
            type="button"
            onClick={() => updateAttributes({ align: 'right' })}
            className={cn("p-1.5 hover:bg-slate-100", node.attrs.align === 'right' && "text-brand-primary")}
            title="Căn phải"
          >
            <AlignRightIcon size={14} />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <button 
            type="button"
            onClick={() => updateAttributes({ align: 'full', width: '100%', height: 'auto' })}
            className={cn("p-1.5 hover:bg-slate-100", node.attrs.align === 'full' && "text-brand-primary")}
            title="Toàn chiều rộng"
          >
            <Maximize size={14} />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <button 
            type="button"
            onClick={() => (editor as Editor).commands.deleteSelection()}
            className="p-1.5 hover:bg-red-50 text-red-500"
            title="Xóa ảnh"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

const ImageResize = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => element.style.width || '100%',
        renderHTML: attributes => ({
          style: `width: ${attributes.width};`,
        }),
      },
      height: {
        default: 'auto',
        parseHTML: element => element.style.height || 'auto',
        renderHTML: attributes => ({
          style: `height: ${attributes.height};`,
        }),
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') || 'center',
        renderHTML: attributes => ({
          'data-align': attributes.align,
          class: cn(
            attributes.align === 'left' && "align-left",
            attributes.align === 'center' && "align-center",
            attributes.align === 'right' && "align-right",
            attributes.align === 'full' && "align-full"
          ),
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeComponent);
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const isSafeEditorUrl = (
  value: string,
  allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'],
) => {
  try {
    const url = new URL(value, window.location.origin);
    return allowedProtocols.includes(url.protocol);
  } catch {
    return false;
  }
};

const ToolbarButton = ({ 
  onClick, 
  isActive, 
  children, 
  tooltip,
  disabled
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  children: React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    disabled={disabled}
    onClick={onClick}
    className={cn(
      "h-8 w-8 p-0 rounded-none border-none",
      isActive ? "bg-slate-200 text-brand-primary font-bold" : "text-slate-600 hover:bg-slate-100"
    )}
    title={tooltip}
  >
    {children}
  </Button>
);

const Separator = () => <div className="w-px h-5 bg-slate-200 mx-1" />;

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-primary underline cursor-pointer",
        },
      }),
      ImageResize,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({ multicolor: true }),
      Superscript,
      Subscript,
      TextStyle,
      Color,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        width: 640,
        height: 480,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: placeholder || "Nhập nội dung bài viết...",
      }),
      CharacterCount,
      FontSize,
      FontFamily,
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none min-h-[500px] p-6 focus:outline-none focus:ring-0 text-sm leading-snug",
          "[&_p]:mb-1.5 [&_p]:leading-snug",
          "[&_h1]:mb-2 [&_h1]:mt-3 [&_h2]:mb-2 [&_h2]:mt-3 [&_h3]:mb-1.5 [&_h3]:mt-2",
          "[&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5",
          "[&_blockquote]:my-2 [&_pre]:my-2",
          "[&_table]:border-collapse [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_th]:bg-slate-50",
          className
        ),
      },
    },
  });

  if (!editor) return null;

  const saveSelection = () => {
    const { from, to } = editor.state.selection;
    savedSelectionRef.current = { from, to };
  };

  const applyTextStyle = (attributes: Record<string, string | null>) => {
    const selection = savedSelectionRef.current;

    if (selection) {
      editor.chain().focus().setTextSelection(selection).setMark("textStyle", attributes).run();
    } else {
      editor.chain().focus().setMark("textStyle", attributes).run();
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Địa chỉ URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!isSafeEditorUrl(url)) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    setIsMediaSelectorOpen(true);
  };

  const handleImageSelect = (url: string) => {
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
      setIsMediaSelectorOpen(false);
    }
  };

  const addYoutube = () => {
    const url = window.prompt("Dán link Youtube:");
    if (url && isSafeEditorUrl(url, ['http:', 'https:'])) {
      editor.commands.setYoutubeVideo({
        src: url,
      });
    }
  };

  return (
    <div className="w-full border border-slate-200 bg-white rounded-md overflow-hidden transition-all focus-within:ring-2 focus-within:ring-brand-primary/20">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 p-1">
        {/* History Group */}
        <div className="flex items-center">
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} tooltip="Hoàn tác (Ctrl+Z)">
            <Undo size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} tooltip="Làm lại (Ctrl+Y)">
            <Redo size={16} />
          </ToolbarButton>
        </div>

        <Separator />

        {/* Heading Group */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-slate-600">
              <Type size={16} />
              <span className="text-xs font-bold uppercase tracking-tighter">Tiêu đề</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>Văn bản thường</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="text-2xl font-bold">Tiêu đề 1</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="text-xl font-bold">Tiêu đề 2</DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="text-lg font-bold">Tiêu đề 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator />

        {/* Font Family Group */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1 text-slate-600"
              onMouseDown={saveSelection}
            >
              <BookType size={16} />
              <span className="text-xs font-bold uppercase tracking-tighter">Font</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px]">
            {FONT_FAMILIES.map((font) => (
              <DropdownMenuItem
                key={font.value}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyTextStyle({ fontFamily: font.value })}
                className={cn((editor.getAttributes("textStyle").fontFamily === font.value) && "bg-slate-100 text-brand-primary")}
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </DropdownMenuItem>
            ))}
            <Separator />
            <DropdownMenuItem
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyTextStyle({ fontFamily: null })}
              className="text-xs font-bold text-red-500"
            >
              Mặc định
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator />

        {/* Font Size Group */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1 text-slate-600"
              onMouseDown={saveSelection}
            >
              <BookType size={16} />
              <span className="text-xs font-bold uppercase tracking-tighter">Cỡ chữ</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[80px]">
            {["12px", "14px", "16px", "18px", "20px", "24px", "30px", "36px", "48px"].map(size => (
              <DropdownMenuItem 
                key={size} 
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyTextStyle({ fontSize: size })}
                className={cn("text-xs font-bold", (editor.getAttributes("textStyle").fontSize === size) && "bg-slate-100 text-brand-primary")}
              >
                {size}
              </DropdownMenuItem>
            ))}
            <Separator />
            <DropdownMenuItem
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyTextStyle({ fontSize: null })}
              className="text-xs font-bold text-red-500"
            >
              Mặc định
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator />

        {/* Text Styling Group */}
        <div className="flex items-center">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            tooltip="In đậm"
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            tooltip="In nghiêng"
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            tooltip="Gạch chân"
          >
            <UnderlineIcon size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive("highlight")}
            tooltip="Làm nổi bật"
          >
            <Highlighter size={16} />
          </ToolbarButton>
        </div>

        <Separator />

        {/* Color Group */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
               <Palette size={16} className="text-slate-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-2 grid grid-cols-5 gap-1">
             {["#000000", "#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#64748b"].map(color => (
               <button
                 key={color}
                 className="w-6 h-6 rounded-sm border border-slate-200"
                 style={{ backgroundColor: color }}
                 onClick={() => editor.chain().focus().setColor(color).run()}
               />
             ))}
             <button 
                className="col-span-1 h-6 flex items-center justify-center border border-slate-200 hover:bg-slate-100"
                onClick={() => editor.chain().focus().unsetColor().run()}
             >
                <Eraser size={12} />
             </button>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator />

        {/* Alignment Group */}
        <div className="flex items-center">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            tooltip="Căn trái"
          >
            <AlignLeft size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            tooltip="Căn giữa"
          >
            <AlignCenter size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            tooltip="Căn phải"
          >
            <AlignRight size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            tooltip="Căn đều"
          >
            <AlignJustify size={16} />
          </ToolbarButton>
        </div>

        <Separator />

        {/* Lists & Tasks Group */}
        <div className="flex items-center">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            tooltip="Danh sách dấu chấm"
          >
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            tooltip="Danh sách số"
          >
            <ListOrdered size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive("taskList")}
            tooltip="Danh sách công việc"
          >
            <CheckSquare size={16} />
          </ToolbarButton>
        </div>

        <Separator />

        {/* Insert Group */}
        <div className="flex items-center">
          <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} tooltip="Liên kết">
            <LinkIcon size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={addImage} tooltip="Hình ảnh">
            <ImageIcon size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={addYoutube} tooltip="Video Youtube">
            <YoutubeIcon size={16} />
          </ToolbarButton>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Bảng">
                <TableIcon size={16} className="text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Chèn bảng</DropdownMenuItem>
              <Separator />
              <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()}>Thêm cột trước</DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>Thêm cột sau</DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()}>Xóa cột</DropdownMenuItem>
              <Separator />
              <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()}>Thêm hàng trên</DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>Thêm hàng dưới</DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()}>Xóa hàng</DropdownMenuItem>
              <Separator />
              <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()} className="text-red-500">Xóa bảng</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator />

        {/* Script & Misc Group */}
        <div className="flex items-center">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            isActive={editor.isActive("superscript")}
            tooltip="Chỉ số trên"
          >
            <SuperscriptIcon size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            isActive={editor.isActive("subscript")}
            tooltip="Chỉ số dưới"
          >
            <SubscriptIcon size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            tooltip="Trích dẫn"
          >
            <Quote size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            tooltip="Khối mã"
          >
            <Code size={16} />
          </ToolbarButton>
        </div>
      </div>
      
      <div className="relative min-h-[500px]">
        <EditorContent editor={editor} />
      </div>

      <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 font-bold uppercase">
         <div className="flex gap-4">
            <span>Ký tự: {editor.storage.characterCount?.characters() || editor.getText().length}</span>
            <span>Từ: {editor.storage.characterCount?.words() || editor.getText().split(/\s+/).filter(Boolean).length}</span>
         </div>
         <div>Sài Gòn Valve CMS v2.0</div>
      </div>

      <MediaSelectorDialog 
        open={isMediaSelectorOpen}
        onOpenChange={setIsMediaSelectorOpen}
        onSelect={handleImageSelect}
      />
    </div>
  );
}
