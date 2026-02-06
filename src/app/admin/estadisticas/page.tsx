'use client';

import {
  Eye,
  Users,
  BarChart2,
  FileText,
  MousePointerClick,
  Smartphone,
  Tablet,
  Laptop,
  ChevronsUpDown,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


// Dummy data
const dailyVisitsData = [
  { date: 'Lun', visits: 22 },
  { date: 'Mar', visits: 34 },
  { date: 'Mié', visits: 54 },
  { date: 'Jue', visits: 42 },
  { date: 'Vie', visits: 78 },
  { date: 'Sáb', visits: 92 },
  { date: 'Dom', visits: 65 },
];

const yearlyVisitsData = [
    { month: 'Ene', visits: 12032 },
    { month: 'Feb', visits: 15342 },
    { month: 'Mar', visits: 18234 },
    { month: 'Abr', visits: 17895 },
    { month: 'May', visits: 21234 },
    { month: 'Jun', visits: 25345 },
    { month: 'Jul', visits: 23456 },
    { month: 'Ago', visits: 27890 },
    { month: 'Sep', visits: 30123 },
    { month: 'Oct', visits: 32456 },
    { month: 'Nov', visits: 35678 },
    { month: 'Dic', visits: 40321 },
];

const pageViewsData = [
    { name: '/servicios', views: 1203 },
    { name: '/posberry', views: 982 },
    { name: '/productos', views: 876 },
    { name: '/', views: 750 },
    { name: '/contacto', views: 453 },
];

const deviceData = [
  { name: 'Móvil', value: 400, icon: Smartphone },
  { name: 'Escritorio', value: 300, icon: Laptop },
  { name: 'Tablet', value: 100, icon: Tablet },
];

const productClicksData = [
    { name: 'Impresoras Fiscales', clicks: 450 },
    { name: 'PC de Escritorio', clicks: 380 },
    { name: 'Notebooks', clicks: 620 },
    { name: 'Comanderas y Ticketeadoras', clicks: 300 },
    { name: 'Lectores de Códigos de Barra', clicks: 410 },
    { name: 'Calculadoras', clicks: 190 },
].sort((a, b) => b.clicks - a.clicks);

const contactQueriesData = [
    { name: 'Juan Pérez' },
    { name: 'María García' },
    { name: 'Carlos Rodríguez' },
    { name: 'Ana Martínez' },
    { name: 'Luis Hernández' },
    { name: 'Laura Gómez' },
    { name: 'José González' },
    { name: 'Sofía López' },
    { name: 'Miguel Sánchez' },
    { name: 'Elena Ramírez' },
    { name: 'Lucía Díaz' },
    { name: 'Javier Torres' },
].sort((a,b) => a.name.localeCompare(b.name));

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export default function StatisticsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
             <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline flex items-center gap-3">
                <BarChart2 className="h-8 w-8" />
                Estadísticas del Sitio
            </h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Visitas Totales
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,231</div>
              <p className="text-xs text-muted-foreground">
                +20.1% desde el mes pasado
              </p>
            </CardContent>
          </Card>
          <Card>
            <Collapsible>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Clics en Productos
                </CardTitle>
                <div className="flex items-center">
                    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Desplegar</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">+2,350</div>
                <p className="text-xs text-muted-foreground">
                  +180.1% desde el mes pasado
                </p>
              </CardContent>
              <CollapsibleContent>
                  <CardContent className="pt-0">
                      <div className="border-t pt-4">
                          <h4 className="mb-2 text-sm font-semibold">Desglose por producto</h4>
                          <ul className="space-y-1.5">
                              {productClicksData.map((product) => (
                                  <li key={product.name} className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">{product.name}</span>
                                      <span className="font-medium whitespace-nowrap">{product.clicks} clics</span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
          <Card>
            <Collapsible>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consultas de Contacto</CardTitle>
                <div className="flex items-center">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Desplegar</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">+1,234</div>
                <p className="text-xs text-muted-foreground">
                  +19% desde el mes pasado
                </p>
              </CardContent>
              <CollapsibleContent>
                  <CardContent className="pt-0">
                      <div className="border-t pt-4">
                          <h4 className="mb-2 text-sm font-semibold">Historial de Consultas</h4>
                          <div className="max-h-28 overflow-y-auto pr-4">
                            <ul className="space-y-1.5">
                                {contactQueriesData.map((contact) => (
                                    <li key={contact.name} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{contact.name}</span>
                                    </li>
                                ))}
                            </ul>
                          </div>
                      </div>
                  </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                +201 desde el mes pasado
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <Tabs defaultValue="week">
                <CardHeader className="flex flex-row items-center">
                    <CardTitle>Visitas</CardTitle>
                    <TabsList className="ml-auto">
                        <TabsTrigger value="week">Última Semana</TabsTrigger>
                        <TabsTrigger value="year">Último Año</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent>
                    <TabsContent value="week" className="mt-0">
                        <ChartContainer config={{
                            visits: {
                                label: 'Visitas',
                                color: 'hsl(var(--chart-1))',
                            },
                        }} className="min-h-[300px] w-full">
                            <BarChart accessibilityLayer data={dailyVisitsData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                />
                                 <YAxis
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={10}
                                />
                                <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Bar dataKey="visits" fill="var(--color-visits)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </TabsContent>
                    <TabsContent value="year" className="mt-0">
                        <ChartContainer config={{
                            visits: {
                                label: 'Visitas',
                                color: 'hsl(var(--chart-1))',
                            },
                        }} className="min-h-[300px] w-full">
                            <BarChart accessibilityLayer data={yearlyVisitsData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                />
                                 <YAxis
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={10}
                                />
                                <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Bar dataKey="visits" fill="var(--color-visits)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </TabsContent>
                </CardContent>
            </Tabs>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Visitas por Dispositivo</CardTitle>
              <CardDescription>
                Distribución de visitas en los últimos 30 días.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
               <ChartContainer
                    config={{
                        mobile: { label: 'Móvil', color: 'hsl(var(--chart-1))', icon: Smartphone },
                        desktop: { label: 'Escritorio', color: 'hsl(var(--chart-2))', icon: Laptop },
                        tablet: { label: 'Tablet', color: 'hsl(var(--chart-3))', icon: Tablet },
                    }}
                    className="mx-auto aspect-square h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={deviceData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                             {deviceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
               </ChartContainer>
            </CardContent>
             <CardContent className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex-1">
                    <div className="flex justify-center gap-4">
                        {deviceData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS[deviceData.indexOf(entry)]}}></div>
                                <span>{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
         <Card>
              <CardHeader>
                <CardTitle>Páginas Más Visitadas</CardTitle>
                <CardDescription>
                  Ranking de las páginas con más tráfico en el sitio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <ChartContainer config={{
                    views: {
                        label: 'Vistas',
                        color: 'hsl(var(--chart-2))',
                    },
                }} className="min-h-[250px] w-full">
                    <BarChart accessibilityLayer data={pageViewsData} layout="vertical">
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            width={80}
                        />
                        <XAxis type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="views" fill="var(--color-views)" radius={4} />
                    </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
      </main>
    </div>
  );
}
