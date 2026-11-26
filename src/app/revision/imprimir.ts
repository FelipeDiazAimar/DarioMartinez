import type { Pieza, Revision } from '@/lib/revision-tipos';
import { nodosDeTexto, pedirHtml } from './comun';

// Hoja A4 en píxeles CSS, con un margen parejo.
const HOJA = { ancho: 794, alto: 1123, margen: 40 };

/** HTML de la lámina con las correcciones aplicadas. */
function conCorrecciones(html: string, cambios: Record<string, string>) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  nodosDeTexto(doc).forEach((nodo, i) => {
    if (i in cambios) nodo.nodeValue = cambios[i];
    const rawPos = cambios[`__pos_${i}`];
    if (rawPos && nodo.parentElement) {
      const [dx, dy] = rawPos.split(',').map(Number);
      if (Number.isFinite(dx) && Number.isFinite(dy) && (dx !== 0 || dy !== 0)) {
        const span = doc.createElement('span');
        span.style.display = 'inline-block';
        span.style.transform = `translate(${dx}px, ${dy}px)`;
        nodo.replaceWith(span);
        span.appendChild(nodo);
      }
    }
  });
  const estilo = doc.createElement('style');
  estilo.textContent = '*{-webkit-print-color-adjust:exact;print-color-adjust:exact}';
  doc.head.appendChild(estilo);
  return `<!doctype html>${doc.documentElement.outerHTML}`;
}

const cargado = (marco: HTMLIFrameElement) => new Promise<void>((listo) => marco.addEventListener('load', () => listo(), { once: true }));

/** Imprime la pieza (una hoja por imagen) tal como se ve, con las correcciones. */
export async function imprimir(pieza: Pieza, textos: Revision['textos'], clave: string) {
  const htmls = await Promise.all(
    pieza.laminas.map(async (l) =>
      l.archivo
        ? `<!doctype html><body style="margin:0"><img src="${l.archivo.url!.replaceAll('&', '&amp;')}" style="display:block;width:100vw;height:100vh;object-fit:contain">`
        : conCorrecciones(await pedirHtml(l, clave), textos[l.id] ?? {}),
    ),
  );

  document.getElementById('dm-impresion')?.remove();
  const hojas = document.createElement('iframe');
  hojas.id = 'dm-impresion';
  hojas.setAttribute('sandbox', 'allow-same-origin allow-modals');
  hojas.setAttribute('aria-hidden', 'true');
  hojas.style.cssText = `position:fixed;left:-10000px;top:0;width:${HOJA.ancho}px;height:${HOJA.alto}px;border:0`;
  hojas.srcdoc = `<!doctype html><title>${pieza.titulo.replace(/[<&]/g, '')}</title><style>
    @page{size:A4 portrait;margin:0}html,body{margin:0}
    div.hoja{width:${HOJA.ancho}px;height:${HOJA.alto - 2}px;display:flex;align-items:center;justify-content:center;overflow:hidden;break-after:page}
    div.hoja:last-child{break-after:auto}
    div.caja{position:relative;overflow:hidden}
    iframe{position:absolute;left:0;top:0;border:0;transform-origin:top left}
  </style>`;
  const listo = cargado(hojas);
  document.body.appendChild(hojas);
  await listo;

  const doc = hojas.contentDocument!;
  await Promise.all(
    pieza.laminas.map(async (lamina, i) => {
      const k = Math.min((HOJA.ancho - 2 * HOJA.margen) / lamina.ancho, (HOJA.alto - 2 * HOJA.margen) / lamina.alto);
      const hoja = doc.createElement('div');
      hoja.className = 'hoja';
      const caja = doc.createElement('div');
      caja.className = 'caja';
      caja.style.cssText = `width:${lamina.ancho * k}px;height:${lamina.alto * k}px`;
      const marco = doc.createElement('iframe');
      marco.style.cssText = `width:${lamina.ancho}px;height:${lamina.alto}px;transform:scale(${k})`;
      marco.srcdoc = htmls[i];
      const esperar = cargado(marco);
      caja.appendChild(marco);
      hoja.appendChild(caja);
      doc.body.appendChild(hoja);
      await esperar;
      await marco.contentDocument!.fonts.ready;
    }),
  );

  hojas.contentWindow!.focus();
  hojas.contentWindow!.print();
}
