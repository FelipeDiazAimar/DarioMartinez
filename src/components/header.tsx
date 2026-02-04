"use client";

import Link from "next/link";
import {
  Menu,
  ChevronDown,
  Cable,
  Laptop,
  Printer,
  Headphones,
  Watch,
  Instagram,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { WhatsAppIcon } from "./icons/whatsapp-icon";
import { cn } from "@/lib/utils";

const productCategories = [
    {
      title: "Conectividad",
      icon: <Cable className="h-5 w-5 text-primary" />,
      items: ["Adaptadores", "Estabilizadores", "Extensores Wi-Fi", "Router", "Switch"],
    },
    {
      title: "Equipos",
      icon: <Laptop className="h-5 w-5 text-primary" />,
      items: ["Monitores", "Notebooks", "PC de Escritorio", "Tablets"],
    },
    {
      title: "Oficina",
      icon: <Printer className="h-5 w-5 text-primary" />,
      items: ["Impresoras", "Vigilancia"],
    },
    {
      title: "Periféricos",
      icon: <Headphones className="h-5 w-5 text-primary" />,
      items: ["Auriculares", "Cámaras Web", "Mouse", "Mousepad", "Teclado"],
    },
    {
      title: "Tecnología",
      icon: <Watch className="h-5 w-5 text-primary" />,
      items: ["Accesorios TV", "Reloj Inteligente"],
    },
  ];

export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  const closeSheet = () => setSheetOpen(false);
  const closeProductsMenu = () => setProductsOpen(false);

  return (
    <Collapsible open={productsOpen} onOpenChange={setProductsOpen} asChild>
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
            <Link
              href="#servicios"
              className="transition-colors hover:text-primary"
            >
              Servicio Técnico
            </Link>
            
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="p-0 text-sm font-medium transition-colors hover:text-primary focus-visible:ring-0 hover:bg-white"
              >
                Productos
                <ChevronDown
                  className={cn("relative top-[1px] ml-1 h-4 w-4 transition duration-200", productsOpen && "rotate-180")}
                  aria-hidden="true"
                />
              </Button>
            </CollapsibleTrigger>
            
            <Link
              href="#sobre-nosotros"
              className="transition-colors hover:text-primary"
            >
              Sobre Nosotros
            </Link>
            
            <Link
              href="#contacto"
              className="transition-colors hover:text-primary"
            >
              Contacto
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2">
            <Button asChild className="hidden md:flex">
              <Link href="https://wa.me/5493564504977" target="_blank">
                <WhatsAppIcon className="mr-2 h-5 w-5" />
                WhatsApp
              </Link>
            </Button>
            <Button asChild className="hidden md:flex">
              <Link href="https://www.instagram.com" target="_blank">
                <Instagram className="mr-2 h-5 w-5" />
                Instagram
              </Link>
            </Button>

            {/* Mobile Navigation */}
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
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
                <nav className="grid gap-4 text-base font-medium mt-8">
                  <Link
                      href="#servicios"
                      className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                      onClick={closeSheet}
                    >
                      Servicio Técnico
                    </Link>
                  <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="productos" className="border-b-0">
                          <AccordionTrigger className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground hover:no-underline py-2">
                              Productos
                          </AccordionTrigger>
                          <AccordionContent className="pl-8">
                            <div className="grid gap-4 mt-2">
                              {productCategories.map(category => (
                                <div key={category.title}>
                                  <h4 className="font-semibold mb-2">{category.title}</h4>
                                  <ul className="grid gap-2 text-sm">
                                    {category.items.map(item => (
                                      <li key={item}>
                                        <Link href="#" onClick={closeSheet} className="text-muted-foreground hover:text-foreground">{item}</Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                      </AccordionItem>
                  </Accordion>
                  <Link
                      href="#sobre-nosotros"
                      className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                      onClick={closeSheet}
                    >
                      Sobre Nosotros
                    </Link>
                  <Link
                      href="#contacto"
                      className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                      onClick={closeSheet}
                    >
                      Contacto
                    </Link>
                </nav>
                <div className="mt-8 grid grid-cols-1 gap-4">
                  <Button asChild size="lg" className="w-full">
                    <Link href="https://wa.me/5493564504977" target="_blank">
                      <WhatsAppIcon className="mr-2 h-5 w-5" />
                      Contactar por WhatsApp
                    </Link>
                  </Button>
                  <Button asChild size="lg" className="w-full" variant="outline">
                    <Link href="https://www.instagram.com" target="_blank">
                      <Instagram className="mr-2 h-5 w-5" />
                      Seguinos en Instagram
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <CollapsibleContent className="border-t bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-5 gap-8">
              {productCategories.map((category) => (
                <div key={category.title}>
                  <div className="flex items-center gap-2 mb-4">
                    {category.icon}
                    <h3 className="font-semibold text-sm tracking-wide">{category.title.toUpperCase()}</h3>
                  </div>
                  <ul className="space-y-3">
                    {category.items.map((item) => (
                      <li key={item}>
                        <Link
                          href={`#productos`}
                          onClick={closeProductsMenu}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </header>
    </Collapsible>
  );
}
