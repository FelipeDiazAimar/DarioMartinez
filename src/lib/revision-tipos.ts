export const ESTADOS = ['pendiente', 'correcciones', 'aprobado', 'desaprobado'] as const;
export type Estado = (typeof ESTADOS)[number];
export type Tipo = 'publicacion' | 'historia' | 'portada';

export type Lamina = {
  id: string;
  ancho: number;
  alto: number;
  /** Ruta del HTML de la pieza en el almacén. */
  html: string;
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
