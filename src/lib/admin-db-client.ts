'use client';

// Reemplazo de `supabase` para las páginas del panel.
// Imita la parte de supabase-js que usan (from/select/insert/update/upsert/delete,
// eq/in/not/order/limit/single/maybeSingle y storage.upload/getPublicUrl), pero cada
// operación pasa por /api/admin/db o /api/admin/storage, que corren en el servidor con
// sesión de admin. Así la clave pública de Supabase no necesita permisos de escritura.

import { supabase as publicSupabase } from '@/lib/supabase-client';

type DbError = { message: string; code?: string; details?: string; hint?: string };
type DbResult<T = any> = { data: T | null; error: DbError | null };

type Action = 'select' | 'insert' | 'update' | 'upsert' | 'delete';

type Filter =
  | { op: 'eq'; column: string; value: unknown }
  | { op: 'in'; column: string; value: unknown[] }
  | { op: 'not'; column: string; operator: 'is' | 'eq'; value: unknown };

async function postJson<T>(url: string, body: unknown): Promise<DbResult<T>> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      // La sesión venció: se vuelve al login conservando la página actual.
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/admin-login?next=${next}`);
      return { data: null, error: { message: 'La sesión venció. Volvé a ingresar.' } };
    }

    const payload = await response.json().catch(() => null);
    if (!payload) return { data: null, error: { message: `Error del servidor (${response.status}).` } };
    return payload as DbResult<T>;
  } catch (error) {
    return { data: null, error: { message: error instanceof Error ? error.message : 'Error de conexión.' } };
  }
}

class AdminQuery<T = any> implements PromiseLike<DbResult<T>> {
  private action: Action = 'select';
  private values: unknown = undefined;
  private columns: string | undefined;
  private returning: string | undefined;
  private onConflict: string | undefined;
  private filters: Filter[] = [];
  private orders: { column: string; ascending: boolean }[] = [];
  private limitValue: number | undefined;
  private mode: 'single' | 'maybeSingle' | undefined;

  constructor(private readonly table: string) {}

  select(columns = '*') {
    if (this.action === 'select') this.columns = columns;
    else this.returning = columns;
    return this;
  }

  insert(values: unknown) {
    this.action = 'insert';
    this.values = values;
    return this;
  }

  update(values: unknown) {
    this.action = 'update';
    this.values = values;
    return this;
  }

  upsert(values: unknown, options?: { onConflict?: string }) {
    this.action = 'upsert';
    this.values = values;
    this.onConflict = options?.onConflict;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ op: 'eq', column, value });
    return this;
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ op: 'in', column, value });
    return this;
  }

  not(column: string, operator: 'is' | 'eq', value: unknown) {
    this.filters.push({ op: 'not', column, operator, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending !== false });
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  single() {
    this.mode = 'single';
    return this;
  }

  maybeSingle() {
    this.mode = 'maybeSingle';
    return this;
  }

  private execute(): Promise<DbResult<T>> {
    return postJson<T>('/api/admin/db', {
      table: this.table,
      action: this.action,
      values: this.values,
      columns: this.columns,
      returning: this.returning,
      onConflict: this.onConflict,
      filters: this.filters,
      order: this.orders,
      limit: this.limitValue,
      mode: this.mode,
    });
  }

  then<R1 = DbResult<T>, R2 = never>(
    onFulfilled?: ((value: DbResult<T>) => R1 | PromiseLike<R1>) | null,
    onRejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.execute().then(onFulfilled, onRejected);
  }
}

function storageBucket(bucket: string) {
  return {
    async upload(path: string, file: File | Blob, options?: { upsert?: boolean }) {
      const permit = await postJson<{ path: string; token: string }>('/api/admin/storage', {
        bucket,
        path,
        upsert: options?.upsert === true,
      });
      if (permit.error || !permit.data) return { data: null, error: permit.error ?? { message: 'Sin permiso de subida.' } };

      return publicSupabase.storage.from(bucket).uploadToSignedUrl(permit.data.path, permit.data.token, file);
    },

    // Solo arma la URL pública; no consulta nada.
    getPublicUrl(path: string) {
      return publicSupabase.storage.from(bucket).getPublicUrl(path);
    },
  };
}

export const adminSupabase = {
  from<T = any>(table: string) {
    return new AdminQuery<T>(table);
  },
  storage: {
    from: storageBucket,
  },
};
