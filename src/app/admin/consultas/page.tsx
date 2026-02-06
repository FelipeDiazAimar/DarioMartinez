'use client';

import { useState } from 'react';
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

const allSubmissions = [
    { id: 1, date: '2024-07-28', name: 'Carlos', lastname: 'Rodriguez', email: 'carlos.r@email.com', message: 'Hola, necesito saber si tienen stock de la impresora fiscal X.' },
    { id: 2, date: '2024-07-27', name: 'Ana', lastname: 'Martínez', email: 'ana.m@email.com', message: 'Mi PC se reinicia sola. ¿Pueden darme un diagnóstico?' },
    { id: 3, date: '2024-07-27', name: 'Luis', lastname: 'Hernández', email: 'luis.h@email.com', message: 'Quisiera saber el precio de una notebook para la universidad.' },
    { id: 4, date: '2024-07-26', name: 'Laura', lastname: 'Gómez', email: 'laura.g@email.com', message: '¿Hacen mantenimiento preventivo para una pequeña oficina? Somos 5 equipos.' },
    { id: 5, date: '2024-07-25', name: 'José', lastname: 'González', email: 'jose.g@email.com', message: 'Necesito instalar Windows 11 en mi computadora nueva.' },
    { id: 6, date: '2024-07-25', name: 'Sofía', lastname: 'López', email: 'sofia.l@email.com', message: 'El WiFi no llega bien a la planta alta de mi casa, ¿qué solución proponen?' },
    { id: 7, date: '2024-07-24', name: 'Miguel', lastname: 'Sánchez', email: 'miguel.s@email.com', message: 'Busco un lector de código de barras para mi local, ¿me asesoran?' },
    { id: 8, date: '2024-07-23', name: 'Elena', lastname: 'Ramírez', email: 'elena.r@email.com', message: '¿Cuánto cuesta cambiarle el disco a una notebook por un SSD?' },
    { id: 9, date: '2024-07-22', name: 'Javier', lastname: 'Torres', email: 'javier.t@email.com', message: 'Venden calculadoras con impresor?' },
    { id: 10, date: '2024-07-21', name: 'Lucía', lastname: 'Díaz', email: 'lucia.d@email.com', message: 'Consulta por el software POSBerry, quisiera una demostración.' },
    { id: 11, date: '2024-07-20', name: 'Marcos', lastname: 'Flores', email: 'marcos.f@email.com', message: 'El ventilador de mi laptop hace mucho ruido, ¿tiene arreglo?' },
    { id: 12, date: '2024-07-19', name: 'Valeria', lastname: 'Romero', email: 'valeria.r@email.com', message: 'Quisiera presupuesto para armar una PC para diseño gráfico.' },
    { id: 13, date: '2024-07-18', name: 'Fernando', lastname: 'Alvarez', email: 'fernando.a@email.com', message: '¿Reparan impresoras de otras marcas? Tengo una Epson.' },
    { id: 14, date: '2024-07-17', name: 'Gabriela', lastname: 'Benitez', email: 'gabriela.b@email.com', message: 'Necesito ayuda para configurar una red en mi casa.' },
    { id: 15, date: '2024-07-16', name: 'Diego', lastname: 'Sosa', email: 'diego.s@email.com', message: 'Hola, ¿venden teclados y mouses inalámbricos?' }
];

const ITEMS_PER_PAGE = 10;

export default function ConsultasPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allSubmissions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSubmissions = allSubmissions.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

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
                 <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="hidden md:table-cell">Email</TableHead>
                                <TableHead>Mensaje</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentSubmissions.map((submission) => (
                                <TableRow key={submission.id}>
                                    <TableCell className="hidden sm:table-cell font-medium whitespace-nowrap">{submission.date}</TableCell>
                                    <TableCell>{`${submission.name} ${submission.lastname}`}</TableCell>
                                    <TableCell className="hidden md:table-cell">{submission.email}</TableCell>
                                    <TableCell className="max-w-[200px] sm:max-w-xs truncate">{submission.message}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter>
                <div className="flex items-center justify-between w-full">
                    <div className="text-xs text-muted-foreground">
                        Mostrando <strong>{startIndex + 1}-{Math.min(endIndex, allSubmissions.length)}</strong> de <strong>{allSubmissions.length}</strong> consultas
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
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