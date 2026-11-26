import type { Estado, Lamina, Revision, Tipo } from '@/lib/revision-tipos';

export const NOMBRE_ESTADO: Record<Estado, string> = {
  pendiente: 'Pendiente',
  correcciones: 'Con correcciones',
  aprobado: 'Aprobada',
  desaprobado: 'Desaprobada',
};

/** Primero lo que falta revisar. */
export const ORDEN_ESTADO: Record<Estado, number> = { pendiente: 0, correcciones: 1, desaprobado: 2, aprobado: 3 };

/** Franja de la tarjeta (fondo lleno) y borde, para ver el estado de un vistazo. */
export const COLOR_ESTADO: Record<Estado, string> = {
  pendiente: 'bg-amber-400 text-amber-950',
  correcciones: 'bg-blue-700 text-white',
  aprobado: 'bg-green-700 text-white',
  desaprobado: 'bg-red-600 text-white',
};

export const BORDE_ESTADO: Record<Estado, string> = {
  pendiente: 'border-amber-400',
  correcciones: 'border-blue-700',
  aprobado: 'border-green-700',
  desaprobado: 'border-red-600',
};

export const NOMBRE_TIPO: Record<Tipo, string> = { publicacion: 'Publicación', historia: 'Historia', video: 'Video', idea: 'Idea', portada: 'Portada web' };

export function hayTextoCorregido(revision: Revision) {
  return revision.descripcion !== null || Object.values(revision.textos).some((t) => Object.keys(t).length > 0);
}

const descargas = new Map<string, Promise<string>>();

/** HTML de una lámina (se pide una sola vez por visita). */
export function pedirHtml(lamina: Lamina, clave: string) {
  const ruta = lamina.html!;
  let pedido = descargas.get(ruta);
  if (!pedido) {
    pedido = fetch(`/api/revision/lamina?id=${encodeURIComponent(lamina.id)}`, { headers: { 'x-revision-clave': clave } }).then(async (r) => {
      const datos = await r.json();
      if (!r.ok) throw new Error(datos.error);
      return datos.html as string;
    });
    pedido.catch(() => descargas.delete(ruta));
    descargas.set(ruta, pedido);
  }
  return pedido;
}

/** Textos visibles de la pieza, en el orden en que aparecen en el documento. */
export function nodosDeTexto(doc: Document) {
  const recorrido = doc.createTreeWalker(doc.body, 4 /* NodeFilter.SHOW_TEXT */);
  const nodos: Text[] = [];
  while (recorrido.nextNode()) {
    const nodo = recorrido.currentNode as Text;
    if (nodo.nodeValue?.trim() && !nodo.parentElement?.closest('style,script')) nodos.push(nodo);
  }
  return nodos;
}
