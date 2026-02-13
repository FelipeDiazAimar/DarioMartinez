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
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
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

export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState(defaultContactInfo);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const closeSheet = () => setSheetOpen(false);

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
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center">
          <Image
            src="/LOGO1.png"
            alt="Darío Martínez Computación"
            width={60}
            height={60}
            className="h-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6 text-sm font-medium">
          {isAdmin ? (
            <>
              <Link
                href="/admin/editar-home"
                className="transition-colors hover:text-primary flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Editar Home
              </Link>
              
              <Link
                href="/admin/editar-servicios"
                className="transition-colors hover:text-primary flex items-center gap-2"
              >
                <Wrench className="h-4 w-4" />
                Servicio Técnico
              </Link>

              <Link
                href="/admin/editar-productos"
                className="transition-colors hover:text-primary flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Productos
              </Link>

              <Link
                href="/admin/editar-posberry"
                className="transition-colors hover:text-primary flex items-center gap-2"
              >
                <ShoppingBasket className="h-4 w-4" />
                Posberry
              </Link>
              
              <Link
                href="/admin/editar-sobre-nosotros"
                className="transition-colors hover:text-primary flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Sobre Nosotros
              </Link>
              
              <Link
                href="/admin/editar-contacto"
                className="transition-colors hover:text-primary flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Contacto
              </Link>

              <Link
                href="/admin/consultas"
                className="transition-colors hover:text-primary flex items-center gap-2"
              >
                <Inbox className="h-4 w-4" />
                Consultas
              </Link>

              <Link
                href="/admin/estadisticas"
                className="transition-colors hover:text-primary flex items-center gap-2"
              >
                <BarChart className="h-4 w-4" />
                Estadísticas
              </Link>

              <Link
                href="/admin/editar-preguntas-frecuentes"
                className="transition-colors hover:text-primary flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Preguntas Frecuentes
              </Link>

              <Link
                href="/"
                className="transition-colors hover:text-primary flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Ver Sitio Web
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/servicios"
                className="transition-colors hover:text-primary"
              >
                Servicio Técnico
              </Link>
              
              <Link
                href="/productos"
                className="transition-colors hover:text-primary"
              >
                Productos
              </Link>

              <Link
                href="/posberry"
                className="flex items-center transition-colors hover:text-primary"
              >
                <Image
                  src="/LOGOBOSBERRY3.png"
                  alt="Posberry"
                  width={28}
                  height={28}
                  style={{ marginRight: '-2px' }}
                />
                Posberry
              </Link>
              
              <Link
                href="/sobre-nosotros"
                className="transition-colors hover:text-primary"
              >
                Sobre Nosotros
              </Link>
              
              <Link
                href="/contacto"
                className="transition-colors hover:text-primary"
              >
                Contacto
              </Link>
            </>
          )}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          {!isAdmin && (
            <Button asChild className="hidden rounded-full md:flex" style={{ backgroundColor: 'hsl(220deg 100% 28% / 79%)' }}>
              <Link href={whatsappLink} target="_blank">
                <WhatsAppIcon className="mr-2 h-5 w-5" />
                WhatsApp
              </Link>
            </Button>
          )}
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
                      <Image
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
                      <Link
                        href="/admin/editar-home"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        <Home className="h-5 w-5" />
                        Editar Home
                      </Link>
                      <Link
                        href="/admin/editar-servicios"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        <Wrench className="h-5 w-5" />
                        Servicio Técnico
                      </Link>
                      <Link
                        href="/admin/editar-productos"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        <Package className="h-5 w-5" />
                        Productos
                      </Link>
                      <Link
                        href="/admin/editar-posberry"
                        className="flex items-center px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        <ShoppingBasket className="h-5 w-5" />
                        Posberry
                      </Link>
                      <Link
                        href="/admin/editar-sobre-nosotros"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        <Users className="h-5 w-5" />
                        Sobre Nosotros
                      </Link>
                      <Link
                        href="/admin/editar-contacto"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        <Mail className="h-5 w-5" />
                        Contacto
                      </Link>
                      <Link
                        href="/admin/consultas"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        <Inbox className="h-5 w-5" />
                        Consultas
                      </Link>
                      <Link
                        href="/admin/estadisticas"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        <BarChart className="h-5 w-5" />
                        Estadísticas
                      </Link>
                      <Link
                        href="/admin/editar-preguntas-frecuentes"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        <HelpCircle className="h-5 w-5" />
                        Preguntas Frecuentes
                      </Link>
                      <Link
                        href="/"
                        className="flex items-center gap-4 px-2.5 text-foreground hover:text-primary"
                        onClick={closeSheet}
                      >
                        <Eye className="h-5 w-5" />
                        Ver Sitio Web
                      </Link>
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
                        <Image
                          src="/LOGOBOSBERRY3.png"
                          alt="Posberry"
                          width={28}
                          height={28}
                          style={{ marginRight: '-2px' }}
                        />
                        Posberry
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
                    <Link href={whatsappLink} target="_blank" onClick={closeSheet}>
                      <WhatsAppIcon className="mr-2 h-5 w-5" />
                      WhatsApp
                    </Link>
                  </Button>
                )}
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
