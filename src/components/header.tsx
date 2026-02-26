"use client";

import Link from "next/link";
import {
  Menu,
  Instagram,
  Cog,
  Home,
  Wrench,
  Package,
  ShoppingBasket,
  Users,
  Mail,
  Inbox,
  BarChart,
  HelpCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LoadingImage } from "@/components/loading-image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WhatsAppIcon } from "./icons/whatsapp-icon";
import { supabase } from "@/lib/supabase-client";

const defaultContactInfo = {
  whatsapp: "5493564504977",
  instagram: "https://www.instagram.com/dariomartinezcomputacion/",
  facebook: "https://www.facebook.com/profile.php?id=61585160335205",
  email: "dario.martinez.comp@email.com",
  phone: "03564 15-504977",
  address: "Libertador Norte 163",
  google_maps: "https://share.google/WFdtCtDtE7RPHKL5o",
  hours_mon_thu: "Lunes a Jueves de 7:30 a 12:30 y de 15:30 a 19:30",
  hours_fri: "Viernes de 8:00 a 12:00 y de 15:30 a 19:30",
};

const adminNavItems = [
  { href: "/admin/editar-home", label: "Editar Home", icon: Home },
  { href: "/admin/editar-servicios", label: "Servicio Técnico", icon: Wrench },
  { href: "/admin/editar-productos", label: "Productos", icon: Package },
  { href: "/admin/editar-posberry", label: "Posberry", icon: ShoppingBasket },
  { href: "/admin/editar-controladores-fiscales", label: "Controladores Fiscales", icon: Receipt },
  { href: "/admin/editar-sobre-nosotros", label: "Sobre Nosotros", icon: Users },
  { href: "/admin/editar-contacto", label: "Contacto", icon: Mail },
  { href: "/admin/consultas", label: "Consultas", icon: Inbox },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: BarChart },
  { href: "/admin/editar-preguntas-frecuentes", label: "Preguntas Frecuentes", icon: HelpCircle },
  { href: "/admin/articulos", label: "Articulos (Base de datos)", icon: Package },
  { href: "/admin/kardex", label: "Kardex (Base de datos)", icon: Package },
  { href: "/admin/ventas", label: "Ventas", icon: Receipt },
  { href: "/", label: "Ver Sitio Web", icon: Eye },
];

export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState(defaultContactInfo);
  const adminNavScrollRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const closeSheet = () => setSheetOpen(false);

  const scrollAdminNav = (direction: "left" | "right") => {
    if (!adminNavScrollRef.current) {
      return;
    }

    adminNavScrollRef.current.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const loadContactInfo = async () => {
      const { data } = await supabase
        .from("contacto_info")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (data) {
        setContactInfo({
          ...defaultContactInfo,
          ...data,
        });
      }
    };

    loadContactInfo();
  }, []);

  const whatsappLink = `https://wa.me/${(contactInfo.whatsapp || "").replace(/\D/g, "")}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-none flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center">
          <LoadingImage
            src="/LOGO1.png"
            alt="Darío Martínez Computación"
            width={60}
            height={60}
            className="h-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-4 text-sm font-medium flex-1 min-w-0">
          {isAdmin ? (
            <div className="flex w-full items-center gap-2 min-w-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => scrollAdminNav("left")}
                aria-label="Desplazar navegación admin a la izquierda"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div
                ref={adminNavScrollRef}
                className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="flex items-center gap-2 pr-2">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="shrink-0 rounded-lg border bg-background px-3 py-2 transition-colors hover:bg-muted"
                      >
                        <span className="flex items-center gap-2 text-xs font-medium">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => scrollAdminNav("right")}
                aria-label="Desplazar navegación admin a la derecha"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Link
                href="/servicios"
                className="shrink-0 whitespace-nowrap transition-colors hover:text-primary"
              >
                Servicio Técnico
              </Link>
              
              <Link
                href="/productos"
                className="shrink-0 whitespace-nowrap transition-colors hover:text-primary"
              >
                Productos
              </Link>

              <Link
                href="/posberry"
                className="flex shrink-0 items-center whitespace-nowrap transition-colors hover:text-primary"
              >
                <LoadingImage
                  src="/LOGOBOSBERRY3.png"
                  alt="Posberry"
                  width={28}
                  height={28}
                  style={{ marginRight: '-2px' }}
                />
                Posberry
              </Link>

              <Link
                href="/controladores-fiscales"
                className="shrink-0 whitespace-nowrap transition-colors hover:text-primary"
              >
                Controladores Fiscales
              </Link>
              
              <Link
                href="/sobre-nosotros"
                className="shrink-0 whitespace-nowrap transition-colors hover:text-primary"
              >
                Sobre Nosotros
              </Link>
              
              <Link
                href="/contacto"
                className="shrink-0 whitespace-nowrap transition-colors hover:text-primary"
              >
                Contacto
              </Link>
            </div>
          )}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2">
          {!isAdmin && (
            <Button asChild className="hidden rounded-full md:flex" style={{ backgroundColor: 'hsl(220deg 100% 28% / 79%)' }}>
              <Link href={contactInfo.instagram} target="_blank">
                <Instagram className="mr-2 h-5 w-5" />
                Instagram
              </Link>
            </Button>
          )}
          {!isAdmin && (
            <Button asChild size="icon" className="hidden rounded-full md:flex" style={{ backgroundColor: 'hsl(220deg 100% 28% / 79%)' }}>
              <Link href="/admin-login" aria-label="Admin">
                <Cog className="h-5 w-5" />
              </Link>
            </Button>
          )}
          {isAdmin && (
            <Button asChild size="icon" className="hidden rounded-full md:flex" style={{ backgroundColor: 'hsl(220deg 100% 28% / 79%)' }}>
              <Link href="/admin" aria-label="Dashboard de Admin">
                <Cog className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {/* Mobile Navigation */}
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <div>
                <SheetHeader>
                  <SheetTitle>
                    <Link href="/" onClick={closeSheet}>
                      <LoadingImage
                          src="/LOGO1.png"
                          alt="Darío Martínez Computación"
                          width={60}
                          height={60}
                          className="h-auto"
                        />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="grid gap-4 text-lg font-medium mt-8">
                  {isAdmin ? (
                    <>
                      {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                            onClick={closeSheet}
                          >
                            <Icon className="h-5 w-5" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <Link
                        href="/servicios"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        Servicio Técnico
                      </Link>
                      <Link
                        href="/productos"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        Productos
                      </Link>
                      <Link
                        href="/posberry"
                        className="flex items-center px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        <LoadingImage
                          src="/LOGOBOSBERRY3.png"
                          alt="Posberry"
                          width={28}
                          height={28}
                          style={{ marginRight: '-2px' }}
                        />
                        Posberry
                      </Link>
                      <Link
                        href="/controladores-fiscales"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        Controladores Fiscales
                      </Link>
                      <Link
                        href="/sobre-nosotros"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        Sobre Nosotros
                      </Link>
                      <Link
                        href="/contacto"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        Contacto
                      </Link>
                    </>
                  )}
                </nav>
              </div>
              <div className="mt-auto grid grid-cols-1 gap-4">
                {!isAdmin && (
                  <Button asChild size="lg" className="w-full rounded-full" style={{ backgroundColor: 'hsl(220deg 100% 28% / 79%)' }}>
                    <Link href={contactInfo.instagram} target="_blank" onClick={closeSheet}>
                      <Instagram className="mr-2 h-5 w-5" />
                      Instagram
                    </Link>
                  </Button>
                )}
                {!isAdmin && (
                  <Button asChild size="lg" className="w-full rounded-full" style={{ backgroundColor: 'hsl(220deg 100% 28% / 79%)' }}>
                    <Link href="/admin-login" onClick={closeSheet}>
                      <Cog className="mr-2 h-5 w-5" />
                      Admin
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
