import { useEffect } from 'react';
import { 
  Box, 
  Paper, 
  IconButton,
  Tooltip
} from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  disabled?: boolean;
}

/**
 * Rich text editor component using TipTap
 * Provides formatting options like headings, bold, italic, lists, etc.
 */
const RichTextEditor = ({ content, onChange, disabled = false }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1],
        },
      }),
    ],
    content: content || '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    // Reset content when the form is closed/reopened
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: (theme) => 
          disabled ? theme.palette.action.disabled : theme.palette.divider,
        borderRadius: 2,
        overflow: 'hidden',
        p: 1,
        minHeight: '200px',
        transition: 'border-color 0.2s ease',
        bgcolor: (theme) => disabled ? theme.palette.action.disabledBackground : 'background.paper',
        '&:hover': {
          borderColor: (theme) => !disabled ? theme.palette.primary.main : theme.palette.action.disabled,
        },
        '& .ProseMirror': {
          height: '100%',
          minHeight: '180px',
          padding: 1,
          fontSize: '0.9rem',
          lineHeight: 1.6,
          '&:focus': {
            outline: 'none',
          },
          '& p': { 
            margin: '0.5em 0' 
          },
          '& ul, & ol': { 
            padding: '0 1rem',
            margin: '0.5em 0',
            color: 'black'
          },
          '& ul li': {
            listStyle: 'disc',
            marginLeft: '1rem',
            color: 'black'
          },
          '& ol li': {
            listStyle: 'decimal',
            marginLeft: '1rem',
            color: 'black'
          },
          '& h1': { 
            margin: '0.8em 0 0.4em',
            fontSize: '1.5rem',
            fontWeight: '600'
          },
        }
      }}
    >
      <Box sx={{ 
        mb: 1, 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 1
      }}>
        {/* Headings */}
        <Box sx={{ display: 'flex', mr: 1 }}>
          <Tooltip title="Heading">
            <IconButton 
              size="small" 
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              disabled={disabled || !editor?.can().chain().focus().toggleHeading({ level: 1 }).run()}
              color={editor?.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
              sx={{ fontWeight: 'bold' }}
            >
              H
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Text formatting */}
        <Box sx={{ display: 'flex', mr: 1 }}>
          <Tooltip title="Bold">
            <IconButton 
              size="small" 
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={disabled || !editor?.can().chain().focus().toggleBold().run()}
              color={editor?.isActive('bold') ? 'primary' : 'default'}
            >
              <strong>B</strong>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Italic">
            <IconButton 
              size="small" 
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={disabled || !editor?.can().chain().focus().toggleItalic().run()}
              color={editor?.isActive('italic') ? 'primary' : 'default'}
            >
              <em>I</em>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Strike">
            <IconButton 
              size="small" 
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              disabled={disabled || !editor?.can().chain().focus().toggleStrike().run()}
              color={editor?.isActive('strike') ? 'primary' : 'default'}
              sx={{ textDecoration: 'line-through' }}
            >
              S
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Lists */}
        <Box sx={{ display: 'flex', mr: 1 }}>
          <Tooltip title="Bullet List">
            <IconButton 
              size="small" 
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              disabled={disabled || !editor?.can().chain().focus().toggleBulletList().run()}
              color={editor?.isActive('bulletList') ? 'primary' : 'default'}
              sx={{ color: 'text.primary', fontWeight: 'bold' }}
            >
              •
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Numbered List">
            <IconButton 
              size="small" 
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              disabled={disabled || !editor?.can().chain().focus().toggleOrderedList().run()}
              color={editor?.isActive('orderedList') ? 'primary' : 'default'}
              sx={{ color: 'text.primary', fontWeight: 'bold' }}
            >
              1.
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Misc */}
        <Box sx={{ display: 'flex' }}>
          <Tooltip title="Horizontal rule">
            <IconButton 
              size="small" 
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              disabled={disabled}
            >
              —
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Clear formatting">
            <IconButton 
              size="small" 
              onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
              disabled={disabled}
            >
              <span style={{ fontSize: '16px' }}>⊘</span>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <EditorContent editor={editor} />
    </Paper>
  );
};

export default RichTextEditor;
