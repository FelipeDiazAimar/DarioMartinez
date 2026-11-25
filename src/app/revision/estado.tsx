import { Check, Clock, PencilLine, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Estado } from '@/lib/revision-tipos';
import { COLOR_ESTADO, NOMBRE_ESTADO } from './comun';

const ICONO: Record<Estado, typeof Check> = { pendiente: Clock, correcciones: PencilLine, aprobado: Check, desaprobado: X };

export function MarcaEstado({ estado, className }: { estado: Estado; className?: string }) {
  const Icono = ICONO[estado];
  return (
    <span className={cn('flex items-center justify-center gap-1.5 font-bold', COLOR_ESTADO[estado], className)}>
      <Icono aria-hidden className="h-4 w-4 shrink-0" strokeWidth={3} />
      {NOMBRE_ESTADO[estado]}
    </span>
  );
}
