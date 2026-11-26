import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{ path: string; priority: number }> = [
    { path: '/', priority: 1 },
    { path: '/servicios', priority: 0.9 },
    { path: '/controladores-fiscales', priority: 0.9 },
    { path: '/posberry', priority: 0.9 },
    { path: '/productos', priority: 0.6 },
    { path: '/contacto', priority: 0.6 },
    { path: '/sobre-nosotros', priority: 0.6 },
    { path: '/preguntas-frecuentes', priority: 0.6 },
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    priority: route.priority,
  }));
}
