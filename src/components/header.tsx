"use client";

import Link from "next/link";
import {
  Menu,
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
import { WhatsAppIcon } from "./icons/whatsapp-icon";

export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);

  const closeSheet = () => setSheetOpen(false);

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
            className="flex items-center gap-2 transition-colors hover:text-primary"
          >
            Posberry
            <Image
              src="/LOGOBOSBERRY3.png"
              alt="Posberry"
              width={28}
              height={28}
            />
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
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button asChild className="hidden rounded-full md:flex">
            <Link href="https://wa.me/5493564504977" target="_blank">
              <WhatsAppIcon className="mr-2 h-5 w-5" />
              WhatsApp
            </Link>
          </Button>
          <Button asChild className="hidden rounded-full md:flex">
            <Link href="https://www.instagram.com/dariomartinezcomputacion/" target="_blank">
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
                      className="flex items-center justify-between gap-4 px-2.5 text-foreground hover:text-primary"
                      onClick={closeSheet}
                    >
                      Posberry
                      <Image
                        src="/LOGOBOSBERRY3.png"
                        alt="Posberry"
                        width={28}
                        height={28}
                      />
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
                </nav>
              </div>
              <div className="mt-auto grid grid-cols-1 gap-4">
                <Button asChild size="lg" className="w-full rounded-full">
                  <Link href="https://wa.me/5493564504977" target="_blank">
                    <WhatsAppIcon className="mr-2 h-5 w-5" />
                    WhatsApp
                  </Link>
                </Button>
                <Button asChild size="lg" className="w-full rounded-full">
                  <Link href="https://www.instagram.com/dariomartinezcomputacion/" target="_blank">
                    <Instagram className="mr-2 h-5 w-5" />
                    Instagram
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
