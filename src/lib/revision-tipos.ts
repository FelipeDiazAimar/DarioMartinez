export const ESTADOS = ['pendiente', 'correcciones', 'aprobado', 'desaprobado'] as const;
export type Estado = (typeof ESTADOS)[number];
export type Tipo = 'publicacion' | 'historia' | 'portada';

export type Lamina = {
  id: string;
  ancho: number;
  alto: number;
  /** Ruta de la imagen final en el almacén. */
  imagen: string;
  /** Ruta del HTML editable, o null si la pieza solo existe como imagen. */
  html: string | null;
  /** Enlace temporal a la imagen (lo agrega la API). */
  url?: string;
};

export type Pieza = {
  id: string;
  tipo: Tipo;
  titulo: string;
  /** Fecha de publicación (AAAA-MM-DD) o null en las portadas. */
  dia: string | null;
  hora: string | null;
  laminas: Lamina[];
  /** Texto que acompaña a la publicación; null en historias y portadas. */
  descripcion: string | null;
};

export type Revision = {
  estado: Estado;
  nota: string;
  /** Descripción corregida; null si queda la original. */
  descripcion: string | null;
  /** Textos corregidos: lámina → número de texto → texto nuevo. */
  textos: Record<string, Record<string, string>>;
  autor: string;
  actualizado: string | null;
};

export const REVISION_VACIA: Revision = {
  estado: 'pendiente',
  nota: '',
  descripcion: null,
  textos: {},
  autor: '',
  actualizado: null,
};
