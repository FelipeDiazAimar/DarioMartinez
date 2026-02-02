"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
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

const navLinks = [
  { href: "#servicios", label: "Servicios" },
  { href: "#sobre-nosotros", label: "Sobre Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);

  const closeSheet = () => setSheetOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center">
          <Image
            src="/logo.png"
            alt="Darío Martínez Computación"
            width={200}
            height={33}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button asChild className="hidden md:flex">
             <Link href="https://wa.me/5491123456789" target="_blank">
              <WhatsAppIcon className="mr-2 h-5 w-5" />
              WhatsApp
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
                        src="/logo.png"
                        alt="Darío Martínez Computación"
                        width={200}
                        height={33}
                      />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-6 text-lg font-medium mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    onClick={closeSheet}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
               <div className="mt-8">
                 <Button asChild size="lg" className="w-full">
                   <Link href="https://wa.me/5491123456789" target="_blank">
                    <WhatsAppIcon className="mr-2 h-5 w-5" />
                    Contactar por WhatsApp
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
