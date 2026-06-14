import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Image, Link, Paperclip } from 'lucide-react';
import axios from 'axios';

const API = 'https://kubox-production-493b.up.railway.app/api';
const BACKEND_URL = 'http://localhost:3001';

// ExtensiÃ³n de imagen personalizada
const CustomImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => {
          if (!attributes.src) {
            return {};
          }
          return {
            src: attributes.src,
            style: 'max-width: 100%; height: auto; border-radius: 0.5rem; margin: 0.5em 0;',
          };
        },
      },
    };
  },
});

const MenuBar = ({ editor, onAdjuntoChange }) => {
  if (!editor) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen vÃ¡lida');
      return;
    }

    const formData = new FormData();
    formData.append('imagen', file);

    try {
      const res = await axios.post(`${API}/upload-imagen`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.url) {
        // Usar URL completa del backend
        const fullUrl = `${BACKEND_URL}${res.data.url}`;
        console.log('Insertando imagen:', fullUrl);
        editor.chain().focus().setImage({ src: fullUrl }).run();
        alert('âœ… Imagen insertada correctamente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir la imagen: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAdjuntoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('adjunto', file);

    try {
      const res = await axios.post(`${API}/upload-adjunto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.url) {
        const fullUrl = `${BACKEND_URL}${res.data.url}`;
        if (onAdjuntoChange) {
          onAdjuntoChange({ url: fullUrl, nombre: res.data.nombre });
        }
        alert('âœ… Archivo adjunto subido: ' + res.data.nombre);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir el archivo: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="border border-gray-200 rounded-t-xl p-2 flex flex-wrap gap-1 bg-gray-50 sticky top-0 z-10">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        title="Negrita"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        title="Cursiva"
      >
        <Italic size={16} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        title="Lista con viÃ±etas"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        title="Lista numerada"
      >
        <ListOrdered size={16} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
        title="Alinear izquierda"
      >
        <AlignLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
        title="Centrar"
      >
        <AlignCenter size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
        title="Alinear derecha"
      >
        <AlignRight size={16} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <label className="p-1.5 rounded hover:bg-gray-200 transition cursor-pointer" title="Subir imagen">
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        <Image size={16} />
      </label>
      
      <label className="p-1.5 rounded hover:bg-gray-200 transition cursor-pointer" title="Adjuntar archivo">
        <input type="file" onChange={handleAdjuntoUpload} className="hidden" />
        <Paperclip size={16} />
      </label>
      
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('URL del enlace:');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        className="p-1.5 rounded hover:bg-gray-200 transition"
        title="Insertar enlace"
      >
        <Link size={16} />
      </button>
    </div>
  );
};

export default function EditorTexto({ value, onChange, placeholder, onAdjuntoChange }) {
 const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,  // â† DESHABILITAR link de StarterKit para evitar duplicado
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      CustomImage,
      LinkExtension.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none p-3 min-h-[200px] focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <MenuBar editor={editor} onAdjuntoChange={onAdjuntoChange} />
      <EditorContent editor={editor} />
      <div className="text-xs text-gray-400 p-2 border-t border-gray-100">
        Sugerencia: Puedes dar formato al texto usando los botones de la barra de herramientas
      </div>
    </div>
  );
}