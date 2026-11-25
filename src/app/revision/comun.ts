import type { Estado, Revision, Tipo } from '@/lib/revision-tipos';

export const NOMBRE_ESTADO: Record<Estado, string> = {
  pendiente: 'Pendiente',
  correcciones: 'Con correcciones',
  aprobado: 'Aprobada',
  desaprobado: 'Desaprobada',
};

export const NOMBRE_TIPO: Record<Tipo, string> = { publicacion: 'Publicación', historia: 'Historia', portada: 'Portada' };

export function nombreDia(dia: string) {
  const texto = new Date(`${dia}T12:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  return texto.charAt(0).toUpperCase() + texto.slice(1).replace(',', '');
}

export function hayTextoCorregido(revision: Revision) {
  return revision.descripcion !== null || Object.values(revision.textos).some((t) => Object.keys(t).length > 0);
}
