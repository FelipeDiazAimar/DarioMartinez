export const ESTADOS = ['pendiente', 'correcciones', 'aprobado', 'desaprobado'] as const;
export type Estado = (typeof ESTADOS)[number];
export type Tipo = 'publicacion' | 'historia' | 'video' | 'idea' | 'portada';

/** Lo que el grupo puede cargar desde la sección. */
export const TIPOS_APORTE = ['historia', 'publicacion', 'video', 'idea'] as const;
export type TipoAporte = (typeof TIPOS_APORTE)[number];

export const FORMATOS_APORTE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
};
export const PESO_MAXIMO = 50 * 1024 * 1024;
export const ARCHIVOS_MAXIMOS = 10;

export type Lamina = {
  id: string;
  ancho: number;
  alto: number;
  /** Ruta del HTML editable (piezas producidas). */
  html?: string;
  /** Archivo cargado por el grupo. */
  archivo?: { ruta: string; mime: string; url?: string };
};

export type Pieza = {
  id: string;
  tipo: Tipo;
  titulo: string;
  /** Fecha de publicación (AAAA-MM-DD) o null. */
  dia: string | null;
  hora: string | null;
  laminas: Lamina[];
  /** Descripción de la publicación o texto de la idea; null si no lleva. */
  descripcion: string | null;
  /** Quién la cargó, si la subió el grupo. */
  aporte?: { autor: string; creado: string };
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
