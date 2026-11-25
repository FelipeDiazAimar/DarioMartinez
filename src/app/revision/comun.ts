import type { Estado, Lamina, Revision, Tipo } from '@/lib/revision-tipos';

export const NOMBRE_ESTADO: Record<Estado, string> = {
  pendiente: 'Pendiente',
  correcciones: 'Con correcciones',
  aprobado: 'Aprobada',
  desaprobado: 'Desaprobada',
};

/** Primero lo que falta revisar. */
export const ORDEN_ESTADO: Record<Estado, number> = { pendiente: 0, correcciones: 1, desaprobado: 2, aprobado: 3 };

export const COLOR_ESTADO: Record<Estado, string> = {
  pendiente: 'bg-muted text-primary',
  correcciones: 'bg-amber-100 text-amber-900',
  aprobado: 'bg-green-100 text-green-900',
  desaprobado: 'bg-red-100 text-red-800',
};

export const NOMBRE_TIPO: Record<Tipo, string> = { publicacion: 'Publicación', historia: 'Historia', portada: 'Portada web' };

export function fechaCorta(dia: string) {
  const [, mes, numero] = dia.split('-');
  const semana = new Date(`${dia}T12:00:00`).toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '');
  return `${semana.charAt(0).toUpperCase()}${semana.slice(1)} ${Number(numero)}/${Number(mes)}`;
}

export function hayTextoCorregido(revision: Revision) {
  return revision.descripcion !== null || Object.values(revision.textos).some((t) => Object.keys(t).length > 0);
}

const descargas = new Map<string, Promise<string>>();

/** HTML de una lámina (se pide una sola vez por visita). */
export function pedirHtml(lamina: Lamina, clave: string) {
  let pedido = descargas.get(lamina.html);
  if (!pedido) {
    pedido = fetch(`/api/revision/lamina?id=${encodeURIComponent(lamina.id)}`, { headers: { 'x-revision-clave': clave } }).then(async (r) => {
      const datos = await r.json();
      if (!r.ok) throw new Error(datos.error);
      return datos.html as string;
    });
    pedido.catch(() => descargas.delete(lamina.html));
    descargas.set(lamina.html, pedido);
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
