'use client';

import { useCallback, useEffect, useState } from 'react';
import { ESTADOS, REVISION_VACIA, type Estado, type Pieza, type Revision, type Tipo } from '@/lib/revision-tipos';
import { Detalle } from './detalle';
import { NOMBRE_ESTADO, NOMBRE_TIPO, hayTextoCorregido, nombreDia } from './comun';
import estilos from './revision.module.css';

const FILTRO_ESTADO: Record<Estado, string> = {
  pendiente: 'Pendientes',
  correcciones: 'Con correcciones',
  aprobado: 'Aprobadas',
  desaprobado: 'Desaprobadas',
};
const FILTRO_TIPO: Record<Tipo, string> = { publicacion: 'Publicaciones', historia: 'Historias', portada: 'Portadas' };
const CLAVE_GUARDADA = 'dm-revision-clave';

export default function RevisionPage() {
  const [clave, setClave] = useState<string | null>(null);
  const [piezas, setPiezas] = useState<Pieza[] | null>(null);
  const [revisiones, setRevisiones] = useState<Record<string, Revision>>({});
  const [error, setError] = useState('');
  const [estado, setEstado] = useState<Estado | 'todas'>('todas');
  const [tipo, setTipo] = useState<Tipo | 'todo'>('todo');
  const [abierta, setAbierta] = useState<string | null>(null);

  // La clave va después del # del enlace: el navegador no la manda al servidor ni queda en registros.
  useEffect(() => {
    const deEnlace = window.location.hash.slice(1);
    let guardada = '';
    try {
      if (deEnlace) localStorage.setItem(CLAVE_GUARDADA, deEnlace);
      guardada = localStorage.getItem(CLAVE_GUARDADA) ?? '';
    } catch {}
    setClave(deEnlace || guardada);
  }, []);

  const cargar = useCallback(async () => {
    if (clave === null) return;
    setError('');
    try {
      const respuesta = await fetch('/api/revision', { headers: { 'x-revision-clave': clave }, cache: 'no-store' });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error);
      setPiezas(datos.piezas);
      setRevisiones(datos.revisiones);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'No se pudieron cargar las piezas.');
    }
  }, [clave]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const revisionDe = (id: string) => revisiones[id] ?? REVISION_VACIA;
  const todas = piezas ?? [];
  const delTipo = todas.filter((p) => tipo === 'todo' || p.tipo === tipo);
  const visibles = delTipo.filter((p) => estado === 'todas' || revisionDe(p.id).estado === estado);

  const grupos = new Map<string, Pieza[]>();
  for (const pieza of visibles) {
    const nombre = pieza.dia ? nombreDia(pieza.dia) : 'Portadas de destacadas';
    grupos.set(nombre, [...(grupos.get(nombre) ?? []), pieza]);
  }

  const aprobadas = todas.filter((p) => revisionDe(p.id).estado === 'aprobado').length;
  const piezaAbierta = todas.find((p) => p.id === abierta);

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <h1>Revisión de contenido</h1>
          <p>Darío Martínez Computación</p>
        </div>
        {piezas && (
          <p className={estilos.avance}>
            <strong>{aprobadas}</strong> de {piezas.length} aprobadas
          </p>
        )}
      </header>
      <div className={estilos.franja} aria-hidden />

      {piezas && (
        <nav className={estilos.filtros} aria-label="Filtros">
          <div className={estilos.grupoFiltro} role="group" aria-label="Estado">
            {(['todas', ...ESTADOS] as const).map((valor) => (
              <button key={valor} type="button" aria-pressed={estado === valor} onClick={() => setEstado(valor)}>
                {valor === 'todas' ? 'Todas' : FILTRO_ESTADO[valor]}
                <span>{valor === 'todas' ? delTipo.length : delTipo.filter((p) => revisionDe(p.id).estado === valor).length}</span>
              </button>
            ))}
          </div>
          <div className={estilos.grupoFiltro} role="group" aria-label="Tipo">
            {(['todo', 'publicacion', 'historia', 'portada'] as const).map((valor) => (
              <button key={valor} type="button" aria-pressed={tipo === valor} onClick={() => setTipo(valor)}>
                {valor === 'todo' ? 'Todo tipo' : FILTRO_TIPO[valor]}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className={estilos.contenido}>
        {error && (
          <div className={estilos.aviso} role="alert">
            <p>{error}</p>
            <button type="button" className={estilos.boton} onClick={cargar}>Reintentar</button>
          </div>
        )}

        {!piezas && !error && (
          <div className={estilos.grilla} aria-label="Cargando piezas">
            {Array.from({ length: 10 }, (_, i) => <div key={i} className="dm-skeleton rounded-lg" style={{ aspectRatio: '9 / 16' }} />)}
          </div>
        )}

        {piezas && visibles.length === 0 && (
          <div className={estilos.aviso}>
            <p>No hay piezas con esos filtros.</p>
            <button type="button" className={estilos.boton} onClick={() => { setEstado('todas'); setTipo('todo'); }}>Ver todas</button>
          </div>
        )}

        {[...grupos].map(([nombre, lista]) => (
          <section key={nombre} className={estilos.dia}>
            <h2>{nombre}</h2>
            <div className={estilos.grilla}>
              {lista.map((pieza) => {
                const revision = revisionDe(pieza.id);
                const [primera] = pieza.laminas;
                return (
                  <button key={pieza.id} type="button" className={estilos.pieza} onClick={() => setAbierta(pieza.id)}>
                    <span className={estilos.marco} style={{ aspectRatio: `${primera.ancho} / ${primera.alto}` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={primera.url} alt="" loading="lazy" />
                      {pieza.laminas.length > 1 && <span className={estilos.cuantas}>{pieza.laminas.length} imágenes</span>}
                    </span>
                    <span className={estilos.titulo}>{pieza.titulo}</span>
                    <span className={estilos.datos}>{NOMBRE_TIPO[pieza.tipo]}{pieza.hora ? `, ${pieza.hora}` : ''}</span>
                    <span className={estilos.marcas}>
                      <span className={estilos.estado} data-estado={revision.estado}>{NOMBRE_ESTADO[revision.estado]}</span>
                      {hayTextoCorregido(revision) && <span className={estilos.extra}>Texto corregido</span>}
                      {revision.nota && <span className={estilos.extra}>Con nota</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {piezaAbierta && clave !== null && (
        <Detalle
          key={piezaAbierta.id}
          pieza={piezaAbierta}
          revision={revisionDe(piezaAbierta.id)}
          clave={clave}
          lista={visibles.some((p) => p.id === piezaAbierta.id) ? visibles : todas}
          alGuardar={(revision) => setRevisiones((antes) => ({ ...antes, [piezaAbierta.id]: revision }))}
          alIr={setAbierta}
        />
      )}
    </div>
  );
}
