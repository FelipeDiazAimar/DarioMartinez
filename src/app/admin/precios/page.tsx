'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Check, Undo2, Search, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PrecioRow = Record<string, unknown>;

type PaginationMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: PrecioRow[];
  pagination?: PaginationMeta;
};

const PAGE_SIZE = 30;

const COLUMN_ORDER = ['linea', 'rubro', 'articulo', 'mercado', 'fecha', 'calculo', 'porcentaje', 'moneda', 'precioSinIva'];

const PK_FIELDS = new Set(['linea', 'rubro', 'articulo', 'mercado']);

function toCellValue(value: unknown) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatDateForInput(value: unknown) {
  if (!value) return '';
  const s = String(value);
  // Handle ISO date strings like "2024-01-15T00:00:00.000Z"
  const match = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : s;
}

function toUpdateValue(rawValue: string, sample: unknown) {
  if (typeof sample === 'number') {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : sample;
  }
  if (sample === null && rawValue.trim() === '') return null;
  return rawValue;
}

function inputWidthFromValue(value: string) {
  const len = value.trim().length > 0 ? value.length : 1;
  return `${Math.max(6, len + 2)}ch`;
}

function getStableRowKey(row: PrecioRow, index: number) {
  return `${row.linea}-${row.rubro}-${row.articulo}-${row.mercado}-${index}`;
}

type NewPrecioForm = {
  linea: string;
  rubro: string;
  articulo: string;
  mercado: string;
  fecha: string;
  calculo: string;
  porcentaje: string;
  moneda: string;
  precioSinIva: string;
};

const initialNewPrecio: NewPrecioForm = {
  linea: '',
  rubro: '',
  articulo: '',
  mercado: '1',
  fecha: new Date().toISOString().slice(0, 10),
  calculo: '0',
  porcentaje: '0',
  moneda: '$',
  precioSinIva: '0',
};

export default function PreciosAdminPage() {
  const [rows, setRows] = useState<PrecioRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({});
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingCell, setSavingCell] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const searchTermRef = useRef('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrecio, setNewPrecio] = useState<NewPrecioForm>(initialNewPrecio);
  const [addingPrecio, setAddingPrecio] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [showFloatingScrollbar, setShowFloatingScrollbar] = useState(false);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);

  // Touch-drag scrolling
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const floatingScrollbarRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);
  const isSyncingScrollRef = useRef(false);

  const loadRows = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(targetPage));
      params.set('pageSize', String(PAGE_SIZE));
      const currentSearch = searchTermRef.current;
      if (currentSearch) params.set('search', currentSearch);

      const res = await fetch(`/api/admin/precios?${params.toString()}`);
      const json: ApiResponse = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        setError(json.message || json.error || `Error ${res.status}`);
        setRows([]);
        return;
      }

      const data = json.data ?? [];
      setRows(data);
      setPagination(json.pagination ?? {});

      if (data.length > 0) {
        const allKeys = Object.keys(data[0]);
        const ordered = COLUMN_ORDER.filter((c) => allKeys.includes(c));
        const extra = allKeys.filter((c) => !COLUMN_ORDER.includes(c));
        setColumns([...ordered, ...extra]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRows(1);
  }, [loadRows]);

  useEffect(() => {
    const updateFloatingScrollbar = () => {
      const wrapper = tableWrapperRef.current;
      if (!wrapper) {
        setShowFloatingScrollbar(false);
        return;
      }

      const shouldShow = wrapper.scrollWidth > wrapper.clientWidth + 1;
      setShowFloatingScrollbar(shouldShow);
      setTableScrollWidth(wrapper.scrollWidth);

      const floating = floatingScrollbarRef.current;
      if (floating && shouldShow) {
        floating.scrollLeft = wrapper.scrollLeft;
      }
    };

    updateFloatingScrollbar();
    window.addEventListener('resize', updateFloatingScrollbar);
    return () => window.removeEventListener('resize', updateFloatingScrollbar);
  }, [rows, columns, loading]);

  function handleSearch() {
    searchTermRef.current = searchInput.trim();
    setPage(1);
    loadRows(1);
  }

  function handleClearSearch() {
    setSearchInput('');
    searchTermRef.current = '';
    setPage(1);
    loadRows(1);
  }

  function goToPage(p: number) {
    setPage(p);
    loadRows(p);
  }

  // --- Inline editing ---
  function startEdit(rowIdx: number, col: string) {
    if (PK_FIELDS.has(col)) return; // Don't allow editing PK fields
    const row = rows[rowIdx];
    const val = col === 'fecha' ? formatDateForInput(row[col]) : toCellValue(row[col]);
    setEditingCell({ rowIdx, col });
    setEditValue(val === '—' ? '' : val);
  }

  function cancelEdit() {
    setEditingCell(null);
    setEditValue('');
  }

  async function saveEdit() {
    if (!editingCell) return;
    setSavingCell(true);
    const row = rows[editingCell.rowIdx];
    const col = editingCell.col;
    const originalValue = row[col];
    const newValue = col === 'fecha' ? editValue : toUpdateValue(editValue, originalValue);

    const params = new URLSearchParams();
    params.set('linea', String(row.linea ?? ''));
    params.set('rubro', String(row.rubro ?? ''));
    params.set('articulo', String(row.articulo ?? ''));
    params.set('mercado', String(row.mercado ?? ''));

    try {
      const res = await fetch(`/api/admin/precios?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [col]: newValue }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        alert(`Error al guardar: ${json.message || json.error || res.status}`);
      } else {
        // Update local state
        setRows((prev) => {
          const copy = [...prev];
          copy[editingCell.rowIdx] = { ...copy[editingCell.rowIdx], [col]: newValue };
          return copy;
        });
      }
    } catch (err: unknown) {
      alert(`Error de red: ${err instanceof Error ? err.message : 'desconocido'}`);
    } finally {
      setSavingCell(false);
      setEditingCell(null);
      setEditValue('');
    }
  }

  // --- Delete ---
  async function handleDelete(row: PrecioRow) {
    const key = `${row.linea}-${row.rubro}-${row.articulo}-${row.mercado}`;
    if (!confirm(`¿Eliminar precio de artículo "${row.articulo}" (línea ${row.linea}, rubro ${row.rubro}, mercado ${row.mercado})?`)) return;
    setDeletingKey(key);

    const params = new URLSearchParams();
    params.set('linea', String(row.linea ?? ''));
    params.set('rubro', String(row.rubro ?? ''));
    params.set('articulo', String(row.articulo ?? ''));
    params.set('mercado', String(row.mercado ?? ''));

    try {
      const res = await fetch(`/api/admin/precios?${params.toString()}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        alert(`Error al eliminar: ${json.message || json.error || res.status}`);
      } else {
        loadRows(page);
      }
    } catch (err: unknown) {
      alert(`Error de red: ${err instanceof Error ? err.message : 'desconocido'}`);
    } finally {
      setDeletingKey(null);
    }
  }

  // --- Add new ---
  async function handleAddPrecio() {
    if (!newPrecio.linea.trim() || !newPrecio.rubro.trim() || !newPrecio.articulo.trim()) {
      alert('Linea, Rubro y Articulo son obligatorios.');
      return;
    }
    setAddingPrecio(true);
    try {
      const body: Record<string, unknown> = {
        linea: newPrecio.linea.trim(),
        rubro: newPrecio.rubro.trim(),
        articulo: newPrecio.articulo.trim(),
        mercado: Number(newPrecio.mercado) || 1,
        fecha: newPrecio.fecha || new Date().toISOString().slice(0, 10),
        calculo: Number(newPrecio.calculo) || 0,
        porcentaje: Number(newPrecio.porcentaje) || 0,
        moneda: newPrecio.moneda.trim() || '$',
        precioSinIva: Number(newPrecio.precioSinIva) || 0,
      };

      const res = await fetch('/api/admin/precios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        alert(`Error al crear: ${json.message || json.error || res.status}`);
      } else {
        setNewPrecio(initialNewPrecio);
        setShowAddForm(false);
        loadRows(page);
      }
    } catch (err: unknown) {
      alert(`Error de red: ${err instanceof Error ? err.message : 'desconocido'}`);
    } finally {
      setAddingPrecio(false);
    }
  }

  // Touch drag handlers
  function onTouchStart(e: React.TouchEvent) {
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      scrollLeft: wrapper.scrollLeft,
      scrollTop: wrapper.scrollTop,
    };
  }

  function onTouchMove(e: React.TouchEvent) {
    const wrapper = tableWrapperRef.current;
    const start = touchStartRef.current;
    if (!wrapper || !start) return;
    const touch = e.touches[0];
    const dx = start.x - touch.clientX;
    const dy = start.y - touch.clientY;
    wrapper.scrollLeft = start.scrollLeft + dx;
    wrapper.scrollTop = start.scrollTop + dy;
  }

  function onTouchEnd() {
    touchStartRef.current = null;
  }

  function onTableScroll() {
    const wrapper = tableWrapperRef.current;
    const floating = floatingScrollbarRef.current;
    if (!wrapper || !floating || isSyncingScrollRef.current) return;
    isSyncingScrollRef.current = true;
    floating.scrollLeft = wrapper.scrollLeft;
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  }

  function onFloatingScroll() {
    const wrapper = tableWrapperRef.current;
    const floating = floatingScrollbarRef.current;
    if (!wrapper || !floating || isSyncingScrollRef.current) return;
    isSyncingScrollRef.current = true;
    wrapper.scrollLeft = floating.scrollLeft;
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  }

  const totalPages = pagination.totalPages ?? 1;
  const totalRecords = pagination.total ?? rows.length;

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-6 md:py-10 max-w-full pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:underline mb-1 inline-block">
            ← Volver al Admin
          </Link>
          <h1 className="text-2xl font-bold">Precios (Base de datos)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalRecords.toLocaleString()} registros
            {searchTermRef.current ? ` (filtrado por "${searchTermRef.current}")` : ''}
          </p>
        </div>
        <Button onClick={() => setShowAddForm((v) => !v)} variant={showAddForm ? 'outline' : 'default'} size="sm" className="w-full sm:w-auto">
          {showAddForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showAddForm ? 'Cancelar' : 'Agregar Precio'}
        </Button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="border rounded-lg p-4 mb-6 bg-muted/30">
          <h2 className="font-semibold mb-3">Nuevo Precio</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {(Object.keys(initialNewPrecio) as (keyof NewPrecioForm)[]).map((field) => (
              <div key={field}>
                <label className="text-xs font-medium text-muted-foreground block mb-1">{field}</label>
                <input
                  type={field === 'fecha' ? 'date' : field === 'mercado' || field === 'calculo' || field === 'porcentaje' || field === 'precioSinIva' ? 'number' : 'text'}
                  step={field === 'porcentaje' || field === 'precioSinIva' ? '0.01' : undefined}
                  className="w-full border rounded px-2 py-1 text-sm bg-background"
                  value={newPrecio[field]}
                  onChange={(e) => setNewPrecio((prev) => ({ ...prev, [field]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Button onClick={handleAddPrecio} disabled={addingPrecio} size="sm">
              {addingPrecio ? 'Guardando...' : 'Guardar Precio'}
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por artículo, línea, rubro..."
            className="w-full border rounded-md pl-9 pr-3 py-2 text-sm bg-background"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </div>
        <Button onClick={handleSearch} size="sm" variant="secondary" className="w-full sm:w-auto">
          Buscar
        </Button>
        {searchTermRef.current && (
          <Button onClick={handleClearSearch} size="sm" variant="ghost" className="w-full sm:w-auto">
            Limpiar
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-3 sm:hidden">
        Deslizá horizontalmente la tabla o usá la barra flotante inferior.
      </p>

      {/* Error */}
      {error && (
        <div className="border border-destructive rounded-lg p-4 mb-4 bg-destructive/10 text-destructive">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-muted-foreground">Cargando precios...</div>
      )}

      {/* Table */}
      {!loading && !error && rows.length > 0 && (
        <div
          ref={tableWrapperRef}
          className="overflow-auto border rounded-lg max-h-[70vh]"
          onScroll={onTableScroll}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-2 sm:px-3 py-2 text-left font-medium whitespace-nowrap border-b">
                    {col}
                  </th>
                ))}
                <th className="px-2 sm:px-3 py-2 text-left font-medium whitespace-nowrap border-b" style={{ minWidth: 80 }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => {
                const rowKey = getStableRowKey(row, rowIdx);
                const isDeleting = deletingKey === `${row.linea}-${row.rubro}-${row.articulo}-${row.mercado}`;
                return (
                  <tr key={rowKey} className={`border-b hover:bg-muted/50 ${isDeleting ? 'opacity-50' : ''}`}>
                    {columns.map((col) => {
                      const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.col === col;
                      const isPk = PK_FIELDS.has(col);
                      const cellVal = col === 'fecha' ? formatDateForInput(row[col]) : toCellValue(row[col]);

                      if (isEditing) {
                        return (
                          <td key={col} className="px-1 py-1 border-b">
                            <div className="flex items-center gap-1">
                              <input
                                type={col === 'fecha' ? 'date' : col === 'calculo' || col === 'mercado' ? 'number' : col === 'porcentaje' || col === 'precioSinIva' ? 'number' : 'text'}
                                step={col === 'porcentaje' || col === 'precioSinIva' ? '0.0001' : undefined}
                                className="border rounded px-1 py-0.5 text-sm bg-background"
                                style={{ width: inputWidthFromValue(editValue) }}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                autoFocus
                                disabled={savingCell}
                              />
                              <button onClick={saveEdit} disabled={savingCell} className="p-0.5 text-green-600 hover:text-green-800" title="Guardar">
                                <Check className="h-4 w-4" />
                              </button>
                              <button onClick={cancelEdit} className="p-0.5 text-muted-foreground hover:text-foreground" title="Cancelar">
                                <Undo2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col}
                          className={`px-2 sm:px-3 py-2 whitespace-nowrap border-b ${isPk ? 'font-mono text-xs bg-muted/30' : 'cursor-pointer hover:bg-accent/50'}`}
                          onDoubleClick={() => !isPk && startEdit(rowIdx, col)}
                          title={isPk ? 'Clave primaria (no editable)' : 'Doble clic para editar'}
                        >
                          {cellVal}
                        </td>
                      );
                    })}
                    <td className="px-2 py-1 border-b whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(row)}
                        disabled={isDeleting}
                        className="p-1 text-destructive hover:text-destructive/80"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && rows.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron precios.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
            Siguiente
          </Button>
        </div>
      )}

      {showFloatingScrollbar && (
        <div className="fixed bottom-3 left-2 right-2 sm:left-6 sm:right-6 z-30 rounded-lg border bg-background/95 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/85">
          <div
            ref={floatingScrollbarRef}
            onScroll={onFloatingScroll}
            className="overflow-x-auto overflow-y-hidden h-4"
          >
            <div style={{ width: `${tableScrollWidth}px`, height: '1px' }} />
          </div>
        </div>
      )}
    </div>
  );
}
