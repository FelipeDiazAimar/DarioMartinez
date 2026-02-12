'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Inbox } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase-client';
type ConsultaRow = {
  id: number;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  mensaje: string | null;
  created_at: string | null;
  leida?: boolean | null;
};

const ITEMS_PER_PAGE = 10;

export default function ConsultasPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<ConsultaRow[]>([]);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('isAdminAuthenticated');
    const localAuth = localStorage.getItem('isAdminAuthenticated');
    if (sessionAuth === 'true' || localAuth === 'true') {
        setIsAuthenticated(true);
    } else {
        router.replace('/admin-login');
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadConsultas = async () => {
      setIsLoading(true);
      setLoadError(null);

      const { data, error } = await supabase
        .from('consultas')
        .select('id, nombre, apellido, email, mensaje, created_at, leida')
        .order('created_at', { ascending: false });

      if (error) {
        setLoadError(error.message);
        setSubmissions([]);
        setIsLoading(false);
        return;
      }

      setSubmissions((data || []) as ConsultaRow[]);
      setIsLoading(false);
    };

    loadConsultas();
  }, [isAuthenticated]);


  const totalPages = Math.ceil(submissions.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSubmissions = submissions.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const toggleReadStatus = async (id: number, currentValue?: boolean | null) => {
    const { error } = await supabase
      .from('consultas')
      .update({ leida: !currentValue })
      .eq('id', id);

    if (!error) {
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, leida: !currentValue } : item
        )
      );
    }
  };

  const deleteConsulta = async (id: number) => {
    const { error } = await supabase
      .from('consultas')
      .delete()
      .eq('id', id);

    if (!error) {
      setSubmissions((prev) => prev.filter((item) => item.id !== id));
    }
  };
  
  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center">
            <Skeleton className="h-10 w-1/2" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-2">
                <Skeleton className="h-10 w-full mb-2" />
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full mb-2" />
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between w-full">
                <Skeleton className="h-5 w-1/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
         <div className="flex items-center">
             <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline flex items-center gap-3">
                <Inbox className="h-8 w-8" />
                Bandeja de Consultas
            </h1>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Historial de Consultas</CardTitle>
                <CardDescription>
                    Listado de todas las consultas recibidas a través del formulario de contacto.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loadError && (
                  <div className="mb-4 text-sm text-destructive">
                    Error al cargar consultas: {loadError}
                  </div>
                )}
                {!loadError && submissions.length === 0 && (
                  <div className="mb-4 text-sm text-muted-foreground">
                    No hay consultas registradas todavía.
                  </div>
                )}
                 <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                              <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="hidden md:table-cell">Email</TableHead>
                                <TableHead>Mensaje</TableHead>
                              <TableHead className="hidden lg:table-cell">Estado</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentSubmissions.map((submission) => (
                                <TableRow key={submission.id}>
                                <TableCell className="hidden sm:table-cell font-medium whitespace-nowrap">
                                  {submission.created_at
                                  ? new Date(submission.created_at).toLocaleDateString('es-AR')
                                  : '-'}
                                </TableCell>
                                <TableCell>{`${submission.nombre ?? ''} ${submission.apellido ?? ''}`.trim() || '-'}</TableCell>
                                <TableCell className="hidden md:table-cell">{submission.email ?? '-'}</TableCell>
                                    <TableCell className="max-w-[200px] sm:max-w-xs truncate">{submission.mensaje ?? '-'}</TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                      <span
                                        className={
                                          submission.leida
                                            ? 'text-xs rounded-full bg-primary/10 text-primary px-2 py-1'
                                            : 'text-xs rounded-full bg-amber-500/10 text-amber-600 px-2 py-1'
                                        }
                                      >
                                        {submission.leida ? 'Leída' : 'No leída'}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => toggleReadStatus(submission.id, submission.leida)}
                                        >
                                          {submission.leida ? 'Marcar no leída' : 'Marcar leída'}
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => deleteConsulta(submission.id)}
                                        >
                                          Eliminar
                                        </Button>
                                      </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter>
                <div className="flex items-center justify-between w-full">
                    <div className="text-xs text-muted-foreground">
                          {submissions.length > 0 ? (
                            <>Mostrando <strong>{startIndex + 1}-{Math.min(endIndex, submissions.length)}</strong> de <strong>{submissions.length}</strong> consultas</>
                          ) : (
                            <>Mostrando <strong>0</strong> consultas</>
                          )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1 || submissions.length === 0}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages || submissions.length === 0}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
      </main>
    </div>
  );
}
