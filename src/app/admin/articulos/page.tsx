'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Check, Undo2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingImage } from '@/components/loading-image';

type ProductRow = Record<string, unknown>;

type Categoria = {
  id: string;
  nombre: string;
};

type RowIdentifier = {
  field: string;
  value: string;
};

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
  targetUrl?: string;
  data?: ProductRow[];
  publicUrl?: string;
  pagination?: PaginationMeta;
};

type CategoriasResponse = {
  success?: boolean;
  message?: string;
  data?: Categoria[];
};

type ArticuloCategoriaMapResponse = {
  success?: boolean;
  message?: string;
  data?: Record<string, string | null>;
};

type StockKardexResponse = {
  success?: boolean;
  data?: Record<string, { entradas: number; salidas: number; stock: number }>;
};

type UiErrorInfo = {
  title: string;
  causes: string[];
  solutions: string[];
};

const PAGE_SIZE = 30;

const HIDDEN_COLUMNS = new Set([
  'modostock',
  'modolinea',
  'modorubro',
  'modoarticulo',
  'stockenlinea',
  'stockenrubro',
  'stockenarticulo',
  'descripcionadicional',
  'anotaciones',
  'datovariable1',
  'datovariable2',
  'datovariable3',
  'datovariable4',
  'datovariable5',
  'datovariable6',
  'datovariable7',
  'datovariable8',
  'datovariable9',
  'datovariable10',
  'datovariable11',
  'datovariable12',
  'datovariable13',
  'datovariable14',
  'datovariable15',
  'avisoentradamercaderias',
  'avisocompras',
  'avisocomprobantes',
  'avisopedidos',
  'avisoventas',
  'tablacomisionventas',
  'tablacomisioncobros',
  'cuentacontable',
  'inactivo',
  // ocultas solicitadas
  'medidaunidad',
  'proveedor',
  'codigodelproveedor',
  'codigobarras',
  'rubroingresosbrutos',
  'alicuotaiva',
  'tipoimpuestointerno',
  'impuestointerno',
  'costoorigen',
  'costoproveedor',
  'costobase',
  'costorecdto1',
  'costorecdto2',
  'costorecdto3',
  'costorecdto4',
  'costorecdto5',
  'cantidadunidades',
]);

const ACTIONS_COLUMN_WIDTH = 280;

type NewArticleForm = {
  codigo: string;
  descripcion: string;
  descripcionWeb: string;
  anotacionesWeb: string;
  precio: string;
  imagen: string;
  mostrar_en_testbd: boolean;
};

const initialNewArticle: NewArticleForm = {
  codigo: '',
  descripcion: '',
  descripcionWeb: '',
  anotacionesWeb: '',
  precio: '',
  imagen: '',
  mostrar_en_testbd: false,
};

function toCellValue(value: unknown) {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function isTruthyDbBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'si' || normalized === 'sí';
  }

  return false;
}

function toUpdateValue(rawValue: string, sample: unknown) {
  if (typeof sample === 'number') {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : sample;
  }

  if (typeof sample === 'boolean') {
    return rawValue.trim().toLowerCase() === 'true' ? 1 : 0;
  }

  if (sample === null && rawValue.trim() === '') {
    return null;
  }

  return rawValue;
}

function inputWidthFromValue(value: string) {
  const normalizedLength = value.trim().length > 0 ? value.length : 1;
  const widthInCh = Math.max(4, normalizedLength + 1);
  return `${widthInCh}ch`;
}

function getRowIdentifier(row: ProductRow): RowIdentifier | null {
  const candidates = ['id', 'codigo', 'cod', 'sku', 'nroArticulo', 'articulo'];

  for (const field of candidates) {
    const value = row[field];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return {
        field,
        value: String(value),
      };
    }
  }

  return null;
}

function getArticleNumber(row: ProductRow) {
  const candidates = ['codigo', 'nroArticulo', 'articulo', 'sku', 'cod', 'id'];

  for (const field of candidates) {
    const value = row[field];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }

  return '';
}

function buildIdentifierUrl(identifier: RowIdentifier) {
  return `/api/admin/articulos/${encodeURIComponent(identifier.value)}?by=${encodeURIComponent(identifier.field)}`;
}

function getStableRowKey(row: ProductRow, index: number) {
  return String(row.id ?? `row-${index}`);
}

function normalizeImageForPreview(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  const raw = value.trim();
  if (!raw) {
    return '';
  }

  if (/^https?:\/\//i.test(raw) || /^\/\//.test(raw)) {
    return raw;
  }

  return '';
}

function shouldHideColumn(column: string) {
  return HIDDEN_COLUMNS.has(column.trim().toLowerCase());
}

function parseUiError(rawError: string): UiErrorInfo {
  const normalized = rawError.toLowerCase();

  if (normalized.includes("data too long for column 'imagen'")) {
    return {
      title: 'La URL de imagen es demasiado larga para la columna imagen.',
      causes: [
        'La base de datos tiene la columna imagen con tamaño corto (por ejemplo VARCHAR chico).',
        'La URL pegada supera el límite permitido por esa columna.',
      ],
      solutions: [
        'Reiniciá mysql-api-express para que aplique el ajuste automático de imagen a VARCHAR(2048).',
        'Volvé a guardar la URL; si persiste, confirmá en la DB que imagen tenga al menos 2048 caracteres.',
        'Como alternativa, subí la imagen a Supabase desde “Adjuntar imagen” y guardá esa URL pública.',
      ],
    };
  }

  if (normalized.includes('502') || normalized.includes('bad gateway') || normalized.includes('upstream')) {
    return {
      title: 'No se pudo conectar con la API de artículos (error de gateway).',
      causes: [
        'La API backend no está levantada o la URL configurada no responde.',
        'El túnel público (Cloudflare/otro) está caído o cambió.',
      ],
      solutions: [
        'Verificá que mysql-api-express esté corriendo.',
        'Comprobá API_BASE_URL y API_TOKEN en .env.local.',
        'Probá /health de la API y luego recargá la página.',
      ],
    };
  }

  if (normalized.includes('fetch failed') || normalized.includes('failed to fetch') || normalized.includes('econnrefused')) {
    return {
      title: 'No hay conexión con el servidor de datos.',
      causes: [
        'Servidor detenido o puerto incorrecto.',
        'Host inaccesible desde esta máquina.',
      ],
      solutions: [
        'Levantá la API mysql-api-express.',
        'Confirmá la URL de API_BASE_URL y el puerto.',
      ],
    };
  }

  if (normalized.includes('401') || normalized.includes('no autorizado') || normalized.includes('unauthorized')) {
    return {
      title: 'Token inválido o faltante para acceder a la API.',
      causes: [
        'API_TOKEN no coincide entre frontend y backend.',
      ],
      solutions: [
        'Verificá API_TOKEN en DarioMartinez/.env.local y mysql-api-express/.env.',
        'Reiniciá ambos servidores después de corregir variables.',
      ],
    };
  }

  return {
    title: 'No se pudo completar la operación sobre artículos.',
    causes: [
      'Hubo un error en la API o en la base de datos.',
    ],
    solutions: [
      'Intentá nuevamente.',
      'Si persiste, revisá el detalle técnico y el log del backend.',
    ],
  };
}

export default function AdminArticulosPage() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [articleCategoryByNumber, setArticleCategoryByNumber] = useState<Record<string, string | null>>({});
  const [stockByArticle, setStockByArticle] = useState<Record<string, number>>({});
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
  const [editingCategoryByRow, setEditingCategoryByRow] = useState<Record<string, string>>({});
  const [draftsByRow, setDraftsByRow] = useState<Record<string, Record<string, string>>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const searchTermRef = useRef('');
  const [searchField, setSearchField] = useState('all');
  const searchFieldRef = useRef('all');
  const [sortBy, setSortBy] = useState('descripcion');
  const sortByRef = useRef('descripcion');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const sortDirectionRef = useRef<'asc' | 'desc'>('asc');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [newArticle, setNewArticle] = useState<NewArticleForm>(initialNewArticle);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const floatingScrollRef = useRef<HTMLDivElement | null>(null);
  const syncingScrollRef = useRef(false);
  const [showFloatingScrollbar, setShowFloatingScrollbar] = useState(false);
  const [floatingScrollWidth, setFloatingScrollWidth] = useState(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);

  const uiError = useMemo(() => (error ? parseUiError(error) : null), [error]);

  const columns = useMemo(() => {
    const set = new Set<string>();

    rows.forEach((row) => {
      Object.keys(row)
        .filter((key) => !shouldHideColumn(key))
        .forEach((key) => set.add(key));
    });

    set.add('categoria');
    set.add('mostrar_en_testbd');
    const ordered = Array.from(set);

    const cantidadKey = ordered.find((column) => column.toLowerCase() === 'cantidadunidades');
    const descripcionAdicionalIndex = ordered.findIndex((column) => column.toLowerCase() === 'descripcionadicional');

    if (cantidadKey && descripcionAdicionalIndex >= 0) {
      const cantidadIndex = ordered.findIndex((column) => column === cantidadKey);
      if (cantidadIndex >= 0 && cantidadIndex !== descripcionAdicionalIndex - 1) {
        ordered.splice(cantidadIndex, 1);
        const targetIndex = ordered.findIndex((column) => column.toLowerCase() === 'descripcionadicional');
        ordered.splice(targetIndex, 0, cantidadKey);
      }
    }

    const moveBefore = (columnName: string, beforeColumnName: string) => {
      const from = ordered.findIndex((column) => column.toLowerCase() === columnName.toLowerCase());
      const to = ordered.findIndex((column) => column.toLowerCase() === beforeColumnName.toLowerCase());

      if (from < 0 || to < 0 || from === to) {
        return;
      }

      const [item] = ordered.splice(from, 1);
      const target = ordered.findIndex((column) => column.toLowerCase() === beforeColumnName.toLowerCase());
      ordered.splice(target, 0, item);
    };

    // volver visibles las columnas web y colocarlas antes de imagen
    moveBefore('DescripcionWeb', 'imagen');
    moveBefore('AnotacionesWeb', 'imagen');

    // ubicar stockKardex (stock calculado desde la tabla kardex) antes de DescripcionWeb
    moveBefore('stockKardex', 'DescripcionWeb');

    // datovariable1/2 siguen incluidos pero ya ocultos; orden no importante
    moveBefore('datovariable2', 'imagen');
    moveBefore('datovariable1', 'imagen');

    return ordered;
  }, [rows]);

  const categoriesById = useMemo(() => {
    const entries = categorias.map((categoria) => [categoria.id, categoria.nombre]);
    return Object.fromEntries(entries);
  }, [categorias]);

  const searchColumnOptions = useMemo(() => {
    const baseColumns = ['codigo', 'descripcion', 'DescripcionWeb', 'AnotacionesWeb', 'stockKardex'];
    const merged = Array.from(new Set([...baseColumns, ...columns]));
    return merged.filter((column) => column !== 'mostrar_en_testbd' && column !== 'categoria');
  }, [columns]);

  const filteredRows = useMemo(() => {
    if (selectedCategoryFilter === 'all') {
      return rows;
    }

    if (selectedCategoryFilter === '__none__') {
      return rows.filter((row) => {
        const articleNumber = getArticleNumber(row);
        if (!articleNumber) {
          return true;
        }

        return !articleCategoryByNumber[articleNumber];
      });
    }

    return rows.filter((row) => {
      const articleNumber = getArticleNumber(row);
      if (!articleNumber) {
        return false;
      }

      return articleCategoryByNumber[articleNumber] === selectedCategoryFilter;
    });
  }, [rows, articleCategoryByNumber, selectedCategoryFilter]);

  const editingRow = useMemo(() => {
    if (!editingRowKey) {
      return null;
    }

    return rows.find((row, index) => getStableRowKey(row, index) === editingRowKey) ?? null;
  }, [rows, editingRowKey]);

  const pendingRowKeys = useMemo(() => {
    const keys = new Set<string>([...Object.keys(draftsByRow), ...Object.keys(editingCategoryByRow)]);
    return Array.from(keys);
  }, [draftsByRow, editingCategoryByRow]);

  const hasPendingEdits = pendingRowKeys.length > 0;

  const loadCategorias = async () => {
    const response = await fetch('/api/admin/categorias', {
      method: 'GET',
      cache: 'no-store',
    });

    const payload = (await response.json()) as CategoriasResponse;

    if (!response.ok || !payload?.success || !Array.isArray(payload?.data)) {
      throw new Error(payload?.message || 'No se pudieron cargar las categorías.');
    }

    setCategorias(payload.data);
  };

  const loadArticleCategories = async (targetRows: ProductRow[]) => {
    const articleNumbers = Array.from(
      new Set(
        targetRows
          .map((row) => getArticleNumber(row))
          .filter(Boolean),
      ),
    );

    if (articleNumbers.length === 0) {
      setArticleCategoryByNumber({});
      return;
    }

    const params = new URLSearchParams({
      articulos: articleNumbers.join(','),
    });

    const response = await fetch(`/api/admin/categorias/articulos?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    });

    const payload = (await response.json()) as ArticuloCategoriaMapResponse;

    if (!response.ok || !payload?.success || !payload?.data) {
      throw new Error(payload?.message || 'No se pudieron cargar categorías por artículo.');
    }

    setArticleCategoryByNumber(payload.data);
  };

  const loadStockKardex = async (): Promise<Record<string, number>> => {
    try {
      const response = await fetch('/api/admin/articulos/stock', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = (await response.json()) as StockKardexResponse;

      if (response.ok && payload?.success && payload?.data) {
        const map: Record<string, number> = {};
        for (const [codigo, info] of Object.entries(payload.data)) {
          map[codigo] = info.stock;
        }
        return map;
      }
    } catch {
      // Stock from kardex is supplementary — don't block the page on failure
    }
    return {};
  };

  const loadRows = async (targetPage = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        pageSize: String(PAGE_SIZE),
      });

      const currentSearch = searchTermRef.current.trim();
      if (currentSearch) {
        params.set('search', currentSearch);
      }

      const currentSearchField = searchFieldRef.current.trim();
      if (currentSearchField) {
        params.set('searchField', currentSearchField);
      }

      const currentSortBy = sortByRef.current.trim();
      if (currentSortBy) {
        params.set('sortBy', currentSortBy);
      }

      const currentSortDirection = sortDirectionRef.current;
      if (currentSortDirection) {
        params.set('sortDirection', currentSortDirection);
      }

      const [articulosResponse, stockMap] = await Promise.all([
        fetch(`/api/admin/articulos?${params.toString()}`, {
          method: 'GET',
          cache: 'no-store',
        }),
        loadStockKardex(),
      ]);

      const payload = (await articulosResponse.json()) as ApiResponse;

      if (!articulosResponse.ok || !payload?.success || !Array.isArray(payload?.data)) {
        const detail = payload?.error ? ` (${payload.error})` : '';
        const target = payload?.targetUrl ? ` [API: ${payload.targetUrl}]` : '';
        throw new Error(`${payload?.message || 'No se pudieron obtener los artículos.'}${detail}${target}`);
      }

      const normalizedRows = payload.data.map((row) => {
        const codigo = String(row.codigo ?? '');
        return {
          ...row,
          mostrar_en_testbd: isTruthyDbBoolean(row.mostrar_en_testbd) ? 1 : 0,
          stockKardex: stockMap[codigo] ?? 0,
        };
      });

      const page = Number(payload.pagination?.page ?? targetPage);
      const pages = Number(payload.pagination?.totalPages ?? 1);
      const total = Number(payload.pagination?.total ?? normalizedRows.length);

      await loadArticleCategories(normalizedRows);
      setStockByArticle(stockMap);
      setRows(normalizedRows);
      setCurrentPage(Number.isFinite(page) && page > 0 ? page : 1);
      setTotalPages(Number.isFinite(pages) && pages > 0 ? pages : 1);
      setTotalRows(Number.isFinite(total) && total >= 0 ? total : 0);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await loadCategorias();
      } catch (initialLoadError) {
        setError(initialLoadError instanceof Error ? initialLoadError.message : 'Error al cargar categorías');
      }

      await loadRows(1);
    };

    void loadInitialData();
  }, []);

  useEffect(() => {
    const updateFloatingScrollbar = () => {
      const tableContainer = tableScrollRef.current;
      if (!tableContainer) {
        setShowFloatingScrollbar(false);
        setFloatingScrollWidth(0);
        return;
      }

      const hasHorizontalOverflow = tableContainer.scrollWidth > tableContainer.clientWidth + 1;
      const rect = tableContainer.getBoundingClientRect();
      const isOnScreen = rect.bottom > 0 && rect.top < window.innerHeight;

      setFloatingScrollWidth(tableContainer.scrollWidth);
      setShowFloatingScrollbar(hasHorizontalOverflow && isOnScreen);

      const floatingContainer = floatingScrollRef.current;
      if (floatingContainer && Math.abs(floatingContainer.scrollLeft - tableContainer.scrollLeft) > 1) {
        floatingContainer.scrollLeft = tableContainer.scrollLeft;
      }
    };

    updateFloatingScrollbar();
    window.addEventListener('resize', updateFloatingScrollbar);
    window.addEventListener('scroll', updateFloatingScrollbar, { passive: true });

    return () => {
      window.removeEventListener('resize', updateFloatingScrollbar);
      window.removeEventListener('scroll', updateFloatingScrollbar);
    };
  }, [rows, loading, editingRowKey]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = tableScrollRef.current;
    if (!el) return;
    // Only for touch or middle-button — don't hijack normal clicks
    if (e.pointerType !== 'touch') return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragScrollLeftRef.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = tableScrollRef.current;
    if (!el) return;
    const dx = e.clientX - dragStartXRef.current;
    el.scrollLeft = dragScrollLeftRef.current - dx;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const syncFromTable = () => {
    const tableContainer = tableScrollRef.current;
    const floatingContainer = floatingScrollRef.current;

    if (!tableContainer || !floatingContainer || syncingScrollRef.current) {
      return;
    }

    syncingScrollRef.current = true;
    floatingContainer.scrollLeft = tableContainer.scrollLeft;
    requestAnimationFrame(() => {
      syncingScrollRef.current = false;
    });
  };

  const syncFromFloating = () => {
    const tableContainer = tableScrollRef.current;
    const floatingContainer = floatingScrollRef.current;

    if (!tableContainer || !floatingContainer || syncingScrollRef.current) {
      return;
    }

    syncingScrollRef.current = true;
    tableContainer.scrollLeft = floatingContainer.scrollLeft;
    requestAnimationFrame(() => {
      syncingScrollRef.current = false;
    });
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        codigo: newArticle.codigo.trim(),
        descripcion: newArticle.descripcion.trim(),
        descripcionWeb: newArticle.descripcionWeb.trim(),
        anotacionesWeb: newArticle.anotacionesWeb.trim(),
        precio: Number(newArticle.precio || '0'),
        imagen: newArticle.imagen.trim(),
        mostrar_en_testbd: newArticle.mostrar_en_testbd ? 1 : 0,
      };

      const response = await fetch('/api/admin/articulos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'No se pudo crear el artículo.');
      }

      setNewArticle(initialNewArticle);
      await loadRows(1);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Error al crear artículo');
    } finally {
      setSaving(false);
    }
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    searchTermRef.current = value;
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      void loadRows(1);
    }, 400);
  }, []);

  const handleSearchFieldChange = (value: string) => {
    setSearchField(value);
    searchFieldRef.current = value;
    void loadRows(1);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    sortByRef.current = value;
    void loadRows(1);
  };

  const handleSortDirectionChange = (value: 'asc' | 'desc') => {
    setSortDirection(value);
    sortDirectionRef.current = value;
    void loadRows(1);
  };

  const persistArticleCategory = async (articleNumber: string, categoriaId: string | null) => {
    const categoryResponse = await fetch('/api/admin/categorias/articulos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articuloNumero: articleNumber,
        categoriaId,
      }),
    });

    const categoryPayload = (await categoryResponse.json()) as { success?: boolean; message?: string };
    if (!categoryResponse.ok || !categoryPayload?.success) {
      throw new Error(categoryPayload?.message || 'No se pudo guardar la categoría del artículo.');
    }

    setArticleCategoryByNumber((prev) => ({
      ...prev,
      [articleNumber]: categoriaId,
    }));
  };

  const startEdit = async (row: ProductRow, rowKey: string) => {
    setEditingRowKey(rowKey);

    setDraftsByRow((prev) => {
      if (prev[rowKey]) {
        return prev;
      }

      const nextDraft: Record<string, string> = {};
      Object.entries(row).forEach(([key, value]) => {
        nextDraft[key] = value === null || value === undefined ? '' : String(value);
      });

      nextDraft.mostrar_en_testbd = isTruthyDbBoolean(row.mostrar_en_testbd) ? '1' : '0';
      return {
        ...prev,
        [rowKey]: nextDraft,
      };
    });

    const articleNumber = getArticleNumber(row);
    setEditingCategoryByRow((prev) => {
      if (rowKey in prev) {
        return prev;
      }

      return {
        ...prev,
        [rowKey]: articleNumber ? (articleCategoryByNumber[articleNumber] ?? '') : '',
      };
    });
  };

  const cancelEdit = () => {
    if (editingRowKey) {
      setDraftsByRow((prev) => {
        const next = { ...prev };
        delete next[editingRowKey];
        return next;
      });

      setEditingCategoryByRow((prev) => {
        const next = { ...prev };
        delete next[editingRowKey];
        return next;
      });
    }

    setEditingRowKey(null);
  };

  const saveEdit = async (row: ProductRow) => {
    const identifier = getRowIdentifier(row);
    const articleNumber = getArticleNumber(row);
    const rowKey = editingRowKey ?? String(row.id ?? '');
    const draft = draftsByRow[rowKey] ?? {};
    const editingCategoryId = editingCategoryByRow[rowKey] ?? '';

    if (!identifier) {
      setError('No se puede editar: el artículo no tiene identificador (id/código).');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {};
      const previousCategoryId = articleNumber ? (articleCategoryByNumber[articleNumber] ?? '') : '';
      const categoryChanged = Boolean(articleNumber) && editingCategoryId !== previousCategoryId;

      Object.keys(draft).forEach((key) => {
        if (key === 'id' || key === 'stockKardex') {
          return;
        }

        const originalValue = row[key];

        if (key === 'mostrar_en_testbd') {
          const nextVisibility = draft[key] === '1' ? 1 : 0;
          const currentVisibility = isTruthyDbBoolean(originalValue) ? 1 : 0;

          if (nextVisibility !== currentVisibility) {
            payload[key] = nextVisibility;
          }

          return;
        }

        const nextValue = toUpdateValue(draft[key] ?? '', originalValue);

        const normalizedCurrent = originalValue === null || originalValue === undefined ? '' : String(originalValue);
        const normalizedNext = nextValue === null || nextValue === undefined ? '' : String(nextValue);

        if (normalizedNext !== normalizedCurrent) {
          payload[key] = nextValue;
        }
      });

      if (Object.keys(payload).length === 0 && !categoryChanged) {
        setDraftsByRow((prev) => {
          const next = { ...prev };
          delete next[rowKey];
          return next;
        });
        setEditingCategoryByRow((prev) => {
          const next = { ...prev };
          delete next[rowKey];
          return next;
        });
        setEditingRowKey(null);
        return;
      }

      if (Object.keys(payload).length > 0) {
        const response = await fetch(buildIdentifierUrl(identifier), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = (await response.json()) as ApiResponse;

        if (!response.ok || !result?.success) {
          const detail = (result as ApiResponse & { error?: string })?.error;
          throw new Error(detail ? `${result?.message || 'No se pudo actualizar el artículo.'} (${detail})` : (result?.message || 'No se pudo actualizar el artículo.'));
        }
      }

      if (categoryChanged) {
        await persistArticleCategory(articleNumber, editingCategoryId || null);
      }

      setDraftsByRow((prev) => {
        const next = { ...prev };
        delete next[rowKey];
        return next;
      });
      setEditingCategoryByRow((prev) => {
        const next = { ...prev };
        delete next[rowKey];
        return next;
      });
      setEditingRowKey(null);
      await loadRows();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const saveAllEdits = async () => {
    if (pendingRowKeys.length === 0) {
      return;
    }

    setSaving(true);
    setError(null);

    const failedRows: string[] = [];
    const successfulRowKeys: string[] = [];

    try {
      for (const rowKey of pendingRowKeys) {
        const row = rows.find((item, index) => getStableRowKey(item, index) === rowKey);
        if (!row) {
          continue;
        }

        const identifier = getRowIdentifier(row);
        const articleNumber = getArticleNumber(row);
        const rowDraft = draftsByRow[rowKey] ?? {};
        const rowCategoryDraft = editingCategoryByRow[rowKey] ?? '';

        if (!identifier) {
          failedRows.push(rowKey);
          continue;
        }

        try {
          const payload: Record<string, unknown> = {};
          const previousCategoryId = articleNumber ? (articleCategoryByNumber[articleNumber] ?? '') : '';
          const categoryChanged = Boolean(articleNumber) && rowCategoryDraft !== previousCategoryId;

          Object.keys(rowDraft).forEach((key) => {
            if (key === 'id' || key === 'stockKardex') {
              return;
            }

            const originalValue = row[key];

            if (key === 'mostrar_en_testbd') {
              const nextVisibility = rowDraft[key] === '1' ? 1 : 0;
              const currentVisibility = isTruthyDbBoolean(originalValue) ? 1 : 0;

              if (nextVisibility !== currentVisibility) {
                payload[key] = nextVisibility;
              }

              return;
            }

            const nextValue = toUpdateValue(rowDraft[key] ?? '', originalValue);

            const normalizedCurrent = originalValue === null || originalValue === undefined ? '' : String(originalValue);
            const normalizedNext = nextValue === null || nextValue === undefined ? '' : String(nextValue);

            if (normalizedNext !== normalizedCurrent) {
              payload[key] = nextValue;
            }
          });

          if (Object.keys(payload).length > 0) {
            const response = await fetch(buildIdentifierUrl(identifier), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            const result = (await response.json()) as ApiResponse;

            if (!response.ok || !result?.success) {
              const detail = (result as ApiResponse & { error?: string })?.error;
              throw new Error(
                detail
                  ? `${result?.message || 'No se pudo actualizar el artículo.'} (${detail})`
                  : (result?.message || 'No se pudo actualizar el artículo.'),
              );
            }
          }

          if (categoryChanged) {
            await persistArticleCategory(articleNumber, rowCategoryDraft || null);
          }

          successfulRowKeys.push(rowKey);
        } catch {
          failedRows.push(rowKey);
        }
      }

      if (successfulRowKeys.length > 0) {
        setDraftsByRow((prev) => {
          const next = { ...prev };
          successfulRowKeys.forEach((key) => {
            delete next[key];
          });
          return next;
        });

        setEditingCategoryByRow((prev) => {
          const next = { ...prev };
          successfulRowKeys.forEach((key) => {
            delete next[key];
          });
          return next;
        });
      }

      if (failedRows.length > 0) {
        setError(`Se guardaron ${successfulRowKeys.length} artículos y fallaron ${failedRows.length}. Reintentá guardar nuevamente.`);
      }

      if (successfulRowKeys.length > 0) {
        await loadRows(currentPage);
      }

      if (failedRows.length === 0) {
        setEditingRowKey(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (row: ProductRow) => {
    const identifier = getRowIdentifier(row);

    if (!identifier) {
      setError('No se puede eliminar: el artículo no tiene identificador (id/código).');
      return;
    }

    const confirmed = window.confirm('¿Seguro que querés eliminar este artículo?');
    if (!confirmed) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(buildIdentifierUrl(identifier), {
        method: 'DELETE',
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'No se pudo eliminar el artículo.');
      }

      await loadRows();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Error al eliminar artículo');
    } finally {
      setSaving(false);
    }
  };

  const stageVisibilityChange = (row: ProductRow, rowId: string, show: boolean) => {
    const identifier = getRowIdentifier(row);

    if (!identifier) {
      setError('No se puede cambiar visibilidad: el artículo no tiene identificador (id/código).');
      return;
    }

    const currentVisibility = isTruthyDbBoolean(row.mostrar_en_testbd) ? '1' : '0';
    const nextVisibility = show ? '1' : '0';

    setDraftsByRow((prev) => {
      const next = { ...prev };
      const rowDraft = { ...(next[rowId] ?? {}) };

      if (nextVisibility === currentVisibility) {
        delete rowDraft.mostrar_en_testbd;
      } else {
        rowDraft.mostrar_en_testbd = nextVisibility;
      }

      if (Object.keys(rowDraft).length === 0) {
        delete next[rowId];
      } else {
        next[rowId] = rowDraft;
      }

      return next;
    });
  };

  const uploadImage = async (row: ProductRow, file: File) => {
    const identifier = getRowIdentifier(row);

    if (!identifier) {
      setError('No se puede subir imagen: el artículo no tiene identificador (id/código).');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('articleId', identifier.value);
      formData.append('file', file);

      const uploadResponse = await fetch('/api/admin/articulos/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = (await uploadResponse.json()) as ApiResponse;

      if (!uploadResponse.ok || !uploadResult?.publicUrl) {
        throw new Error(uploadResult?.message || 'No se pudo subir la imagen a Supabase.');
      }

      const saveImageResponse = await fetch(buildIdentifierUrl(identifier), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagen: uploadResult.publicUrl }),
      });

      const saveImageResult = (await saveImageResponse.json()) as ApiResponse;

      if (!saveImageResponse.ok || !saveImageResult?.success) {
        throw new Error(saveImageResult?.message || 'No se pudo guardar la URL de imagen en la base local.');
      }

      await loadRows();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Error al subir imagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:space-y-6 sm:p-6">
      <section className="rounded-2xl border bg-card p-3 shadow-sm sm:p-5">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Administrar artículos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Desde acá podés ver, editar, agregar y eliminar artículos; además podés subir imagen a Supabase y decidir si se muestra en TestBD.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Regla de visibilidad: por defecto <span className="font-medium">no se muestra ninguno</span> en TestBD.
        </p>
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/testbd" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">
              Ir al catálogo TestBD
            </Link>
            <Link href="/admin/categorias" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">
              Administrar categorías
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-sm sm:p-6">
        <div className="w-full">
          <h2 className="text-base font-semibold sm:text-lg">Buscar artículos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Elegí columna de búsqueda y orden para explorar como quieras.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start">
            <select
              value={searchField}
              onChange={(event) => handleSearchFieldChange(event.target.value)}
              className="flex-1 min-w-[170px] h-10 rounded-2xl border bg-background px-3 text-sm"
            >
              <option value="all">Buscar en: Todas las columnas</option>
              {searchColumnOptions.map((column) => (
                <option key={column} value={column}>
                  Buscar en: {column}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(event) => handleSortByChange(event.target.value)}
              className="flex-1 min-w-[170px] h-10 rounded-2xl border bg-background px-3 text-sm"
            >
              {searchColumnOptions.map((column) => (
                <option key={column} value={column}>
                  Ordenar por: {column}
                </option>
              ))}
            </select>
            <select
              value={sortDirection}
              onChange={(event) => handleSortDirectionChange(event.target.value === 'desc' ? 'desc' : 'asc')}
              className="flex-1 min-w-[170px] h-10 rounded-2xl border bg-background px-3 text-sm"
            >
              <option value="asc">Orden: Ascendente</option>
              <option value="desc">Orden: Descendente</option>
            </select>
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar por código o descripción..."
                className="h-11 w-full rounded-2xl border bg-background pl-10 pr-10 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-3 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold sm:text-lg">Listado de artículos ({filteredRows.length} visibles de {totalRows})</h2>
          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center">
            <select
              value={selectedCategoryFilter}
              onChange={(event) => setSelectedCategoryFilter(event.target.value)}
              className="h-10 w-full rounded-2xl border bg-background px-3 text-sm sm:w-auto"
            >
              <option value="all">Todas las categorías</option>
              <option value="__none__">Sin categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void loadRows(currentPage - 1)}
                disabled={loading || saving || currentPage <= 1}
                className="rounded-md border px-3 py-1 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-muted-foreground whitespace-nowrap">
                Pág. {currentPage}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => void loadRows(currentPage + 1)}
                disabled={loading || saving || currentPage >= totalPages}
                className="rounded-md border px-3 py-1 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        {error && uiError ? (
          <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive space-y-3">
            <p className="font-semibold">{uiError.title}</p>

            <div>
              <p className="font-medium">Posibles causas</p>
              <ul className="mt-1 list-disc pl-5 space-y-1">
                {uiError.causes.map((cause) => (
                  <li key={cause}>{cause}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-medium">Cómo resolver</p>
              <ul className="mt-1 list-disc pl-5 space-y-1">
                {uiError.solutions.map((solution) => (
                  <li key={solution}>{solution}</li>
                ))}
              </ul>
            </div>

            <p className="text-xs opacity-90 break-all">Detalle técnico: {error}</p>
          </div>
        ) : null}

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Cargando artículos...</p>
        ) : (
          <>
            <div
              ref={tableScrollRef}
              onScroll={syncFromTable}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="mt-4 overflow-auto rounded-lg border touch-pan-y cursor-grab active:cursor-grabbing"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <table className="w-max min-w-full border-collapse text-sm leading-tight">
              <thead className="bg-muted/60">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className={
                        column === 'mostrar_en_testbd'
                          ? `sticky z-20 border-b bg-muted px-2 py-1 text-left font-medium whitespace-nowrap min-w-[170px]`
                          : column === 'categoria'
                            ? 'border-b px-2 py-1 text-left font-medium whitespace-nowrap min-w-[220px]'
                          : 'border-b px-2 py-1 text-left font-medium whitespace-nowrap'
                      }
                      style={column === 'mostrar_en_testbd' ? { right: `${ACTIONS_COLUMN_WIDTH}px` } : undefined}
                    >
                      {column}
                    </th>
                  ))}
                  <th className="sticky right-0 z-30 min-w-[140px] border-b bg-muted px-2 py-1 text-left font-medium whitespace-nowrap sm:min-w-[280px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => {
                  const rowId = getStableRowKey(row, index);
                  const isEditing = editingRowKey === rowId;
                  const rowDraft = draftsByRow[rowId] ?? {};
                  const rowCategoryDraft = editingCategoryByRow[rowId] ?? '';
                  const imageUrl = normalizeImageForPreview(row.imagen);
                  const rowIdentifier = getRowIdentifier(row);
                  const canUpload = Boolean(rowIdentifier);

                  return (
                    <tr key={rowId} className="align-top odd:bg-background even:bg-muted/20">
                      {columns.map((column) => {
                        if (isEditing && column !== 'id') {
                          if (column === 'categoria') {
                            return (
                              <td key={`${rowId}-${column}`} className="border-b px-2 py-1 align-middle min-w-[220px]">
                                <select
                                  value={rowCategoryDraft}
                                  onChange={(event) =>
                                    setEditingCategoryByRow((prev) => ({
                                      ...prev,
                                      [rowId]: event.target.value,
                                    }))
                                  }
                                  className="h-9 w-full min-w-[200px] rounded-xl border bg-background px-2 text-xs"
                                >
                                  <option value="">Sin categoría</option>
                                  {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
                                      {categoria.nombre}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            );
                          }

                          if (column === 'mostrar_en_testbd') {
                            return (
                              <td
                                key={`${rowId}-${column}`}
                                className="sticky z-10 border-b bg-card px-2 py-1 whitespace-nowrap align-middle min-w-[170px]"
                                style={{ right: `${ACTIONS_COLUMN_WIDTH}px` }}
                              >
                                <label className="inline-flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={rowDraft[column] === '1'}
                                    onChange={(event) =>
                                      setDraftsByRow((prev) => ({
                                        ...prev,
                                        [rowId]: {
                                          ...(prev[rowId] ?? {}),
                                          [column]: event.target.checked ? '1' : '0',
                                        },
                                      }))
                                    }
                                  />
                                  Mostrar
                                </label>
                              </td>
                            );
                          }

                          if (column === 'stockKardex') {
                            return (
                              <td key={`${rowId}-${column}`} className="border-b px-2 py-1 whitespace-nowrap align-middle text-muted-foreground">
                                {toCellValue(row[column])}
                              </td>
                            );
                          }

                          return (
                            <td key={`${rowId}-${column}`} className="border-b px-2 py-1 align-middle">
                              <input
                                value={rowDraft[column] ?? ''}
                                onChange={(event) =>
                                  setDraftsByRow((prev) => ({
                                    ...prev,
                                    [rowId]: {
                                      ...(prev[rowId] ?? {}),
                                      [column]: event.target.value,
                                    },
                                  }))
                                }
                                className="h-9 rounded-xl border bg-background px-2 text-xs"
                                style={{ width: inputWidthFromValue(rowDraft[column] ?? '') }}
                              />
                            </td>
                          );
                        }

                        if (column === 'imagen') {
                          return (
                            <td key={`${rowId}-${column}`} className="border-b px-2 py-1 align-middle">
                              {imageUrl ? (
                                <div className="flex items-center gap-2">
                                  <LoadingImage
                                    src={imageUrl}
                                    alt="Imagen artículo"
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 rounded border object-cover"
                                    spinnerSizeClassName="h-4 w-4"
                                  />
                                  <span title={imageUrl} className="block max-w-[170px] truncate text-xs text-muted-foreground">{imageUrl}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Sin imagen</span>
                              )}
                            </td>
                          );
                        }

                        if (column === 'categoria') {
                          const articleNumber = getArticleNumber(row);
                          const categoryId = articleNumber ? articleCategoryByNumber[articleNumber] ?? null : null;
                          const categoryName = categoryId ? categoriesById[categoryId] : null;

                          return (
                            <td key={`${rowId}-${column}`} className="border-b px-2 py-1 whitespace-nowrap align-middle min-w-[220px]">
                              {categoryName || <span className="text-muted-foreground">Sin categoría</span>}
                            </td>
                          );
                        }

                        if (column === 'mostrar_en_testbd') {
                          const draftVisibility = draftsByRow[rowId]?.mostrar_en_testbd;
                          const checked = draftVisibility
                            ? draftVisibility === '1'
                            : isTruthyDbBoolean(row[column]);
                          return (
                            <td
                              key={`${rowId}-${column}`}
                              className="sticky z-10 border-b bg-card px-2 py-1 whitespace-nowrap align-middle min-w-[170px]"
                              style={{ right: `${ACTIONS_COLUMN_WIDTH}px` }}
                            >
                              <label className="inline-flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(event) => stageVisibilityChange(row, rowId, event.target.checked)}
                                  disabled={saving || !canUpload}
                                />
                                {checked ? 'Visible' : 'Oculto'}
                              </label>
                            </td>
                          );
                        }

                        return (
                          <td key={`${rowId}-${column}`} className="border-b px-2 py-1 whitespace-nowrap align-middle">
                            {toCellValue(row[column])}
                          </td>
                        );
                      })}

                      <td className="sticky right-0 z-20 min-w-[140px] border-b bg-card px-2 py-1 align-middle whitespace-nowrap sm:min-w-[280px]">
                        <div className="flex flex-wrap items-center gap-1 sm:flex-nowrap">
                          {!isEditing ? (
                            <button
                              type="button"
                              onClick={() => startEdit(row, rowId)}
                              className="rounded-md border px-2 py-0.5 text-xs hover:bg-muted"
                            >
                              Editar
                            </button>
                          ) : (
                            <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                              Editando
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => void deleteRow(row)}
                            disabled={saving || !canUpload}
                            className="rounded-md border border-destructive/40 px-2 py-0.5 text-xs text-destructive disabled:opacity-60"
                          >
                            Eliminar
                          </button>

                          <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-xs hover:bg-muted">
                            <span>Adjuntar imagen</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={saving || !canUpload}
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                  void uploadImage(row, file);
                                }

                                event.currentTarget.value = '';
                              }}
                            />
                          </label>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-3 py-4 text-center text-sm text-muted-foreground">
                      No hay artículos para el filtro seleccionado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2 text-sm">
              <button
                type="button"
                onClick={() => void loadRows(currentPage - 1)}
                disabled={loading || saving || currentPage <= 1}
                className="rounded-md border px-3 py-1 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => void loadRows(currentPage + 1)}
                disabled={loading || saving || currentPage >= totalPages}
                className="rounded-md border px-3 py-1 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </section>

      {showFloatingScrollbar ? (
        <div className="pointer-events-none fixed bottom-3 left-0 right-0 z-40 px-6">
          <div className="pointer-events-auto mx-auto w-full max-w-[1600px] rounded-md border bg-background/95 shadow-sm backdrop-blur-sm">
            <div
              ref={floatingScrollRef}
              onScroll={syncFromFloating}
              className="h-4 overflow-x-auto overflow-y-hidden"
            >
              <div style={{ width: floatingScrollWidth, height: 1 }} />
            </div>
          </div>
        </div>
      ) : null}

      {hasPendingEdits ? (
        <div className={`fixed right-6 z-50 ${showFloatingScrollbar ? 'bottom-16' : 'bottom-6'}`}>
          <div className="hidden items-center gap-4 md:flex">
            <Button type="button" variant="outline" size="lg" className="bg-background shadow-lg" onClick={cancelEdit} disabled={saving}>
              <Undo2 className="mr-2 h-5 w-5" />
              Descartar fila actual
            </Button>
            <Button type="button" size="lg" className="shadow-lg" onClick={() => void saveAllEdits()} disabled={saving || !hasPendingEdits}>
              <Check className="mr-2 h-5 w-5" />
              {saving ? 'Guardando...' : `Guardar todos (${pendingRowKeys.length})`}
            </Button>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full border-2 bg-background shadow-lg"
              onClick={cancelEdit}
              disabled={saving}
            >
              <Undo2 className="h-6 w-6" />
              <span className="sr-only">Deshacer Cambios</span>
            </Button>
            <Button type="button" size="icon" className="h-14 w-14 rounded-full shadow-lg" onClick={() => void saveAllEdits()} disabled={saving || !hasPendingEdits}>
              <Check className="h-6 w-6" />
              <span className="sr-only">Guardar todos los cambios</span>
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
