import Link from "next/link";
import { MonitorSmartphone } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <MonitorSmartphone className="h-6 w-6" />
          <span className="font-semibold hidden sm:inline-block">Darío Martínez Computación</span>
        </Link>
        <p className="text-sm text-foreground/60">
          © {new Date().getFullYear()} Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
