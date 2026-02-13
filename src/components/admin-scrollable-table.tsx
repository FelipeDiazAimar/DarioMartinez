'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ScrollableTableProps = {
  columns: string[];
  rows: Record<string, string>[];
  emptyMessage: string;
};

export function AdminScrollableTable({ columns, rows, emptyMessage }: ScrollableTableProps) {
  const topScrollRef = useRef<HTMLDivElement | null>(null);
  const bottomScrollRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const syncingRef = useRef(false);
  const [tableWidth, setTableWidth] = useState(0);

  const colSpan = useMemo(() => Math.max(columns.length, 1), [columns.length]);

  useEffect(() => {
    const updateWidth = () => {
      const width = tableRef.current?.scrollWidth ?? 0;
      setTableWidth(width);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    if (tableRef.current) {
      resizeObserver.observe(tableRef.current);
    }

    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
      resizeObserver.disconnect();
    };
  }, [columns, rows]);

  const syncScroll = (source: HTMLDivElement | null, target: HTMLDivElement | null) => {
    if (!source || !target || syncingRef.current) {
      return;
    }

    syncingRef.current = true;
    target.scrollLeft = source.scrollLeft;
    requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  };

  const moveHorizontally = (direction: 'left' | 'right') => {
    const target = bottomScrollRef.current;

    if (!target) {
      return;
    }

    const amount = direction === 'left' ? -320 : 320;
    target.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className="mt-6">
      <div
        ref={topScrollRef}
        className="max-w-full overflow-x-auto rounded-md border"
        onScroll={() => syncScroll(topScrollRef.current, bottomScrollRef.current)}
      >
        <div className="h-px" style={{ width: `${tableWidth}px` }} />
      </div>

      <div className="relative mt-2">
        <div
          ref={bottomScrollRef}
          className="max-w-full overflow-x-auto rounded-md border"
          onScroll={() => syncScroll(bottomScrollRef.current, topScrollRef.current)}
        >
          <table ref={tableRef} className="min-w-max text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="whitespace-nowrap border-b px-3 py-2 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-muted-foreground" colSpan={colSpan}>
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    {columns.map((column) => (
                      <td key={`${index}-${column}`} className="whitespace-nowrap px-3 py-2 align-top">
                        {row[column]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pointer-events-none fixed inset-y-0 left-3 right-3 z-50 flex items-center justify-between">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="pointer-events-auto rounded-full shadow-lg"
            onClick={() => moveHorizontally('left')}
            aria-label="Desplazar tabla a la izquierda"
          >
            <ChevronLeft />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="pointer-events-auto rounded-full shadow-lg"
            onClick={() => moveHorizontally('right')}
            aria-label="Desplazar tabla a la derecha"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
