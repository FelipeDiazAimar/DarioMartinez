'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Categoria = {
  id: string;
  nombre: string;
  created_at?: string;
};

type CategoriasResponse = {
  success?: boolean;
  message?: string;
  data?: Categoria[];
};

export default function AdminCategoriasPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const sortedCategorias = useMemo(
    () => [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [categorias],
  );

  const loadCategorias = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/categorias', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = (await response.json()) as CategoriasResponse;

      if (!response.ok || !payload?.success || !Array.isArray(payload?.data)) {
        throw new Error(payload?.message || 'No se pudieron obtener las categorías.');
      }

      setCategorias(payload.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('isAdminAuthenticated');
    const localAuth = localStorage.getItem('isAdminAuthenticated');

    if (sessionAuth === 'true' || localAuth === 'true') {
      setIsAuthenticated(true);
      void loadCategorias();
    } else {
      router.replace('/admin-login');
    }
  }, [router]);

  const createCategoria = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newName.trim()) {
      setError('Ingresá un nombre de categoría.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newName.trim() }),
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'No se pudo crear la categoría.');
      }

      setNewName('');
      await loadCategorias();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Error al crear categoría');
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (id: string) => {
    if (!editingName.trim()) {
      setError('El nombre no puede estar vacío.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/categorias/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: editingName.trim() }),
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'No se pudo editar la categoría.');
      }

      setEditingId(null);
      setEditingName('');
      await loadCategorias();
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : 'Error al editar categoría');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategoria = async (id: string) => {
    const confirmed = window.confirm('¿Seguro que querés eliminar esta categoría?');
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/categorias/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'No se pudo eliminar la categoría.');
      }

      await loadCategorias();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Error al eliminar categoría');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <main className="mx-auto w-full max-w-5xl p-6">Validando sesión...</main>;
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Categorías de artículos</h1>
        <p className="mt-2 text-sm text-muted-foreground">Creá, editá y eliminá categorías que luego podés asignar desde la tabla de artículos.</p>
        <div className="mt-4">
          <Link href="/admin/articulos" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">
            Volver a artículos
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Nueva categoría</h2>
        <form onSubmit={createCategoria} className="mt-4 flex flex-wrap items-center gap-2">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            className="h-10 min-w-[260px] rounded-md border bg-background px-3 text-sm"
            placeholder="Ej: Notebooks"
          />
          <button
            type="submit"
            disabled={saving}
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            Crear categoría
          </button>
        </form>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Listado ({sortedCategorias.length})</h2>

        {error ? (
          <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Cargando categorías...</p>
        ) : sortedCategorias.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Todavía no hay categorías.</p>
        ) : (
          <div className="mt-4 overflow-auto rounded-lg border">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="border-b px-3 py-2 text-left font-medium">Nombre</th>
                  <th className="border-b px-3 py-2 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedCategorias.map((categoria) => {
                  const isEditing = editingId === categoria.id;

                  return (
                    <tr key={categoria.id} className="odd:bg-background even:bg-muted/20">
                      <td className="border-b px-3 py-2">
                        {isEditing ? (
                          <input
                            value={editingName}
                            onChange={(event) => setEditingName(event.target.value)}
                            className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                          />
                        ) : (
                          categoria.nombre
                        )}
                      </td>
                      <td className="border-b px-3 py-2">
                        <div className="flex items-center gap-2">
                          {!isEditing ? (
                            <button
                              type="button"
                              className="rounded-md border px-3 py-1 text-xs hover:bg-muted"
                              onClick={() => {
                                setEditingId(categoria.id);
                                setEditingName(categoria.nombre);
                              }}
                            >
                              Editar
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="rounded-md border px-3 py-1 text-xs hover:bg-muted"
                                onClick={() => void saveEdit(categoria.id)}
                                disabled={saving}
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                className="rounded-md border px-3 py-1 text-xs hover:bg-muted"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditingName('');
                                }}
                              >
                                Cancelar
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            className="rounded-md border border-destructive/40 px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
                            onClick={() => void deleteCategoria(categoria.id)}
                            disabled={saving}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
