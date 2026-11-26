'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ARCHIVOS_MAXIMOS, FORMATOS_APORTE, PESO_MAXIMO, TIPOS_APORTE, type TipoAporte } from '@/lib/revision-tipos';

const AUTOR_GUARDADO = 'dm-revision-autor';

const OPCIONES: Record<TipoAporte, { nombre: string; texto: string }> = {
  historia: { nombre: 'Historia', texto: 'Comentario (opcional)' },
  publicacion: { nombre: 'Publicación', texto: 'Descripción (opcional)' },
  video: { nombre: 'Video', texto: 'Descripción (opcional)' },
  idea: { nombre: 'Idea', texto: 'Contá la idea' },
};

function medidas(archivo: File) {
  const url = URL.createObjectURL(archivo);
  return new Promise<{ ancho: number; alto: number }>((listo) => {
    const terminar = (ancho: number, alto: number) => {
      URL.revokeObjectURL(url);
      listo({ ancho: ancho || 1080, alto: alto || 1920 });
    };
    if (archivo.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => terminar(video.videoWidth, video.videoHeight);
      video.onerror = () => terminar(0, 0);
      video.src = url;
    } else {
      const imagen = new Image();
      imagen.onload = () => terminar(imagen.naturalWidth, imagen.naturalHeight);
      imagen.onerror = () => terminar(0, 0);
      imagen.src = url;
    }
  });
}

/** Subida directa al almacén, con avance. */
function subir(url: string, archivo: File, alAvanzar: (bytes: number) => void) {
  return new Promise<void>((listo, fallar) => {
    const pedido = new XMLHttpRequest();
    pedido.open('PUT', url);
    pedido.setRequestHeader('Content-Type', archivo.type);
    pedido.upload.onprogress = (e) => alAvanzar(e.loaded);
    pedido.onload = () => (pedido.status < 300 ? listo() : fallar(new Error(`No se pudo subir "${archivo.name}".`)));
    pedido.onerror = () => fallar(new Error('Se cortó la subida. Revisá la conexión.'));
    pedido.send(archivo);
  });
}

export function Cargar({ clave, alCerrar, alTerminar }: { clave: string; alCerrar: () => void; alTerminar: () => void }) {
  const [tipo, setTipo] = useState<TipoAporte>('historia');
  const [archivos, setArchivos] = useState<File[]>([]);
  const [texto, setTexto] = useState('');
  const [autor, setAutor] = useState(() => {
    try {
      return localStorage.getItem(AUTOR_GUARDADO) ?? '';
    } catch {
      return '';
    }
  });
  const [avance, setAvance] = useState<number | null>(null);
  const [error, setError] = useState('');

  const llevaArchivos = tipo !== 'idea';
  const listo = llevaArchivos ? archivos.length > 0 : texto.trim().length > 0;

  function elegir(lista: FileList | null) {
    const elegidos = Array.from(lista ?? []);
    const malo = elegidos.find((a) => !(a.type in FORMATOS_APORTE) || a.type.startsWith('video/') !== (tipo === 'video'));
    const pesado = elegidos.find((a) => a.size > PESO_MAXIMO);
    if (malo) setError(`"${malo.name}" no es ${tipo === 'video' ? 'un video MP4, MOV o WebM' : 'una imagen JPG, PNG, WebP o GIF'}.`);
    else if (pesado) setError(`"${pesado.name}" pesa más de 50 MB. Achicalo o recortalo antes de subirlo.`);
    else if (elegidos.length > ARCHIVOS_MAXIMOS) setError(`Hasta ${ARCHIVOS_MAXIMOS} imágenes por vez.`);
    else {
      setError('');
      setArchivos(elegidos);
      return;
    }
    setArchivos([]);
  }

  async function api(cuerpo: object) {
    const respuesta = await fetch('/api/revision/aporte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revision-clave': clave },
      body: JSON.stringify(cuerpo),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.error);
    return datos;
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setAvance(0);
    try {
      localStorage.setItem(AUTOR_GUARDADO, autor);
    } catch {}
    try {
      const subidos = [];
      if (llevaArchivos) {
        const { permisos } = await api({ accion: 'preparar', archivos: archivos.map((a) => ({ mime: a.type, peso: a.size })) });
        const total = archivos.reduce((suma, a) => suma + a.size, 0);
        let hechos = 0;
        for (const [i, archivo] of archivos.entries()) {
          await subir(permisos[i].url, archivo, (bytes) => setAvance(Math.round((100 * (hechos + bytes)) / total)));
          hechos += archivo.size;
          subidos.push({ ruta: permisos[i].ruta, mime: archivo.type, ...(await medidas(archivo)) });
        }
      }
      await api({ accion: 'crear', tipo, texto, autor, archivos: subidos });
      alTerminar();
    } catch (fallo) {
      setError(fallo instanceof Error && fallo.message ? fallo.message : 'No se pudo cargar. Probá de nuevo.');
      setAvance(null);
    }
  }

  return (
    <section aria-label="Cargar contenido" className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <form onSubmit={enviar} className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4 sm:py-8">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-2xl font-bold tracking-tight">Cargar contenido</h2>
          <Button type="button" variant="ghost" size="icon" onClick={alCerrar} disabled={avance !== null} aria-label="Cerrar"><X /></Button>
        </div>

        <div className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1" role="group" aria-label="Qué vas a cargar">
          {TIPOS_APORTE.map((valor) => (
            <button
              key={valor}
              type="button"
              aria-pressed={tipo === valor}
              onClick={() => { setTipo(valor); setArchivos([]); setError(''); }}
              className={cn('rounded-md px-1 py-2 text-sm font-medium', tipo === valor ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground')}
            >
              {OPCIONES[valor].nombre}
            </button>
          ))}
        </div>

        {llevaArchivos && (
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed bg-white p-6 text-center focus-within:ring-2 focus-within:ring-ring">
            <span className="font-semibold text-primary">{tipo === 'video' ? 'Elegir video' : 'Elegir imagen'}</span>
            <span className="text-sm text-muted-foreground">
              {archivos.length ? archivos.map((a) => a.name).join(', ') : tipo === 'video' ? 'MP4, MOV o WebM, hasta 50 MB' : tipo === 'publicacion' ? 'Una o varias si es carrusel' : 'JPG, PNG, WebP o GIF'}
            </span>
            <input
              key={tipo}
              type="file"
              className="sr-only"
              accept={Object.keys(FORMATOS_APORTE).filter((m) => m.startsWith(tipo === 'video' ? 'video/' : 'image/')).join(',')}
              multiple={tipo === 'publicacion' || tipo === 'historia'}
              onChange={(e) => elegir(e.target.files)}
            />
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm font-semibold">
          {OPCIONES[tipo].texto}
          <Textarea value={texto} maxLength={4000} rows={tipo === 'idea' ? 8 : 4} onChange={(e) => setTexto(e.target.value)} className="text-base font-normal" />
        </label>

        <Input aria-label="Tu nombre (opcional)" placeholder="Tu nombre (opcional)" value={autor} maxLength={60} onChange={(e) => setAutor(e.target.value)} />

        {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}

        <Button type="submit" size="lg" disabled={!listo || avance !== null}>
          {avance === null ? 'Cargar' : llevaArchivos ? `Subiendo ${avance}%` : 'Guardando'}
        </Button>
      </form>
    </section>
  );
}
