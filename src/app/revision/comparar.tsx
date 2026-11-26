'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Pieza as DatosPieza, Revision } from '@/lib/revision-tipos';
import { Pieza } from './lamina';

type Lado = 'original' | 'copia';

type Props = {
  pieza: DatosPieza;
  clave: string;
  escritorio: boolean;
  textos: Revision['textos'];
  descripcion: string;
  alCambiar: (laminaId: string, cambios: Record<string, string>) => void;
  alTocar: (lamina: number, indice: number, original: string) => void;
};

/** El original y la copia corregida: lado a lado en PC, alternando en el mismo lugar en celular. */
export function Comparar({ pieza, clave, escritorio, textos, descripcion, alCambiar, alTocar }: Props) {
  // Abre en la primera imagen que tiene cambios.
  const [imagen, setImagen] = useState(() => Math.max(0, pieza.laminas.findIndex((l) => textos[l.id])));
  const [lado, setLado] = useState<Lado>('original');
  const lamina = pieza.laminas[imagen];
  const descripcionCambio = pieza.descripcion !== null && descripcion !== pieza.descripcion;

  const columna = (cual: Lado) => {
    const copia = cual === 'copia';
    const texto = copia ? descripcion : pieza.descripcion;
    return (
      <figure key={cual} aria-label={copia ? 'Tu copia' : 'Original'} className={cn('min-h-0 min-w-0 flex-1 flex-col gap-2', lado === cual ? 'flex' : 'hidden lg:flex')}>
        <figcaption className={cn('hidden self-center rounded-full px-3 py-0.5 text-sm font-bold lg:block', copia ? 'bg-primary text-primary-foreground' : 'bg-muted text-primary')}>
          {copia ? 'Tu copia' : 'Original'}
        </figcaption>
        {lamina && (
          <div className="min-h-0 flex-1">
            <Pieza
              key={lamina.id}
              lamina={lamina}
              clave={clave}
              nombre={`${pieza.titulo}, ${copia ? 'copia' : 'original'}`}
              yaMismo
              conControles
              cambios={copia ? textos[lamina.id] : undefined}
              alCambiar={copia && escritorio ? (c) => alCambiar(lamina.id, c) : undefined}
              alTocar={copia && !escritorio ? (i, original) => alTocar(imagen, i, original) : undefined}
            />
          </div>
        )}
        {(descripcionCambio || !lamina) && (
          <p className={cn('overflow-y-auto whitespace-pre-wrap rounded-lg border bg-white p-3 text-sm', lamina ? 'h-24 shrink-0 lg:h-28' : 'min-h-0 flex-1')}>{texto}</p>
        )}
      </figure>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 lg:hidden" role="group" aria-label="Qué ver">
        {(['original', 'copia'] as const).map((valor) => (
          <button
            key={valor}
            type="button"
            aria-pressed={lado === valor}
            onClick={() => setLado(valor)}
            className={cn('rounded-md py-1.5 text-sm font-semibold', lado === valor ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
          >
            {valor === 'original' ? 'Original' : 'Tu copia'}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 gap-4">{(['original', 'copia'] as const).map(columna)}</div>

      {pieza.laminas.length > 1 && (
        <div className="flex justify-center gap-2">
          {pieza.laminas.map((l, i) => (
            <Button key={l.id} size="sm" variant={i === imagen ? 'default' : 'outline'} onClick={() => setImagen(i)}>
              Imagen {i + 1}{textos[l.id] ? ' (cambiada)' : ''}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
