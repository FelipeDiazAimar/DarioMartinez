import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full border-t">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/LOGO1.png"
            alt="Soluciones Tecnológicas"
            width={40}
            height={40}
          />
        </Link>
        <p className="text-sm text-foreground/60" suppressHydrationWarning>
          © {new Date().getFullYear()} Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
