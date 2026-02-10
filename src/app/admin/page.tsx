'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
    Home,
    Wrench,
    ShoppingBasket,
    Users,
    Mail,
    BarChart,
    HelpCircle,
    Cog,
    Inbox,
    Eye,
    Package,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const sections = [
    { title: 'Editar Home', href: '/admin/editar-home', icon: <Home className="h-8 w-8" /> },
    { title: 'Servicio Técnico', href: '/admin/editar-servicios', icon: <Wrench className="h-8 w-8" /> },
    { title: 'Productos', href: '/admin/editar-productos', icon: <Package className="h-8 w-8" /> },
    { title: 'Posberry', href: '/admin/editar-posberry', icon: <ShoppingBasket className="h-8 w-8" /> },
    { title: 'Sobre Nosotros', href: '/admin/editar-sobre-nosotros', icon: <Users className="h-8 w-8" /> },
    { title: 'Contacto', href: '/admin/editar-contacto', icon: <Mail className="h-8 w-8" /> },
    { title: 'Consultas', href: '/admin/consultas', icon: <Inbox className="h-8 w-8" /> },
    { title: 'Estadísticas', href: '/admin/estadisticas', icon: <BarChart className="h-8 w-8" /> },
    { title: 'Preguntas Frecuentes', href: '/admin/editar-preguntas-frecuentes', icon: <HelpCircle className="h-8 w-8" /> },
    { title: 'Ver Sitio Web', href: '/', icon: <Eye className="h-8 w-8" /> },
];

export default function AdminPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const sessionAuth = sessionStorage.getItem('isAdminAuthenticated');
        const localAuth = localStorage.getItem('isAdminAuthenticated');
        if (sessionAuth === 'true' || localAuth === 'true') {
            setIsAuthenticated(true);
        } else {
            router.replace('/admin-login');
        }
    }, [router]);

    if (!isAuthenticated) {
        return (
            <div className="container px-4 md:px-6 py-12 md:py-16 lg:py-20">
                 <div className="space-y-4 mb-8">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-6 w-3/4" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 10 }).map((_, i) => (
                       <Skeleton key={i} className="h-40 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container px-4 md:px-6 py-12 md:py-16 lg:py-20">
            <div className="space-y-4 mb-8">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline flex items-center gap-3">
                    <Cog className="h-8 w-8" />
                    Panel de Administración
                </h1>
                <p className="text-muted-foreground">
                    Seleccione una sección para ver o editar su contenido.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sections.map((section) => (
                    <Link href={section.href} key={section.title} className="block">
                        <Card className="h-full transition-transform transform hover:scale-105 hover:shadow-xl">
                            <CardHeader className="flex flex-col items-center justify-center text-center p-6">
                                <div className="mb-4 text-primary">
                                    {section.icon}
                                </div>
                                <CardTitle>{section.title}</CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
