'use client';

import Link from 'next/link';
import {
  Menu,
  Instagram,
  Home,
  Wrench,
  Package,
  ShoppingBasket,
  Users,
  Mail,
  Inbox,
  BarChart3,
  HelpCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Receipt,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand-logo';
import { Magnet } from '@/components/react-bits';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { WhatsAppIcon } from './icons/whatsapp-icon';
import { LiveOpenStatus } from './live-open-status';
import { DEFAULT_CONTACT_INFO, getSharedContactInfo } from '@/lib/site-data-cache';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics-client';

const defaultContactInfo = DEFAULT_CONTACT_INFO;

const publicNavItems = [
  { href: '/servicios', label: 'Servicio Técnico' },
  { href: '/productos', label: 'Productos' },
  { href: '/posberry', label: 'Posberry', withPosberryMark: true },
  { href: '/controladores-fiscales', label: 'Controladores Fiscales' },
  { href: '/sobre-nosotros', label: 'Sobre Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

const adminNavItems = [
  { href: '/admin', label: 'Panel', icon: LayoutDashboard },
  { href: '/admin/estadisticas', label: 'Estadísticas y Enlaces', icon: BarChart3 },
  { href: '/admin/consultas', label: 'Consultas', icon: Inbox },
  { href: '/admin/editar-home', label: 'Home', icon: Home },
  { href: '/admin/editar-servicios', label: 'Servicio Técnico', icon: Wrench },
  { href: '/admin/editar-productos', label: 'Productos', icon: Package },
  { href: '/admin/editar-posberry', label: 'Posberry', icon: ShoppingBasket },
  { href: '/admin/editar-controladores-fiscales', label: 'Fiscales', icon: Receipt },
  { href: '/admin/editar-sobre-nosotros', label: 'Nosotros', icon: Users },
  { href: '/admin/editar-contacto', label: 'Contacto', icon: Mail },
  { href: '/admin/editar-preguntas-frecuentes', label: 'FAQ', icon: HelpCircle },
  { href: '/admin/articulos', label: 'Artículos BD', icon: Package },
  { href: '/admin/kardex', label: 'Kardex', icon: Package },
  { href: '/', label: 'Ver Sitio', icon: Eye },
];

export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [contactInfo, setContactInfo] = useState(defaultContactInfo);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const adminNavScrollRef = useRef<HTMLDivElement | null>(null);
  const navRailRef = useRef<HTMLDivElement | null>(null);
  const navLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isAdminLogin = pathname === '/admin-login';

  const activePublicHref =
    publicNavItems.find(
      (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
    )?.href ?? null;

  const targetHref = hoveredHref ?? activePublicHref;

  const updatePillIndicator = useCallback(() => {
    const rail = navRailRef.current;
    if (!rail || !targetHref) {
      setPillStyle((prev) => (prev.opacity === 0 ? prev : { ...prev, opacity: 0 }));
      return;
    }
    const targetEl = navLinkRefs.current[targetHref];
    if (!targetEl) {
      setPillStyle((prev) => (prev.opacity === 0 ? prev : { ...prev, opacity: 0 }));
      return;
    }
    setPillStyle({
      left: targetEl.offsetLeft,
      width: targetEl.offsetWidth,
      opacity: 1,
    });
  }, [targetHref]);

  useLayoutEffect(() => {
    updatePillIndicator();
  }, [updatePillIndicator, scrolled]);

  useEffect(() => {
    window.addEventListener('resize', updatePillIndicator);
    return () => window.removeEventListener('resize', updatePillIndicator);
  }, [updatePillIndicator]);

  const closeSheet = () => setSheetOpen(false);

  const scrollAdminNav = (direction: 'left' | 'right') => {
    if (!adminNavScrollRef.current) return;
    adminNavScrollRef.current.scrollBy({
      left: direction === 'left' ? -280 : 280,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    let rafId = 0;
    const updateScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 18);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0);
      rafId = 0;
    };
    const onScroll = () => {
      if (!rafId) rafId = window.requestAnimationFrame(updateScroll);
    };
    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  const handleAdminLogout = () => {
    document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    localStorage.removeItem('isAdminAuthenticated');
    sessionStorage.removeItem('isAdminAuthenticated');
    window.location.assign('/admin-login');
  };

  useEffect(() => {
    getSharedContactInfo().then(setContactInfo);
  }, []);

  if (isAdminLogin) {
    return null;
  }

  const whatsappLink = `https://wa.me/${(contactInfo.whatsapp || '').replace(/\D/g, '')}`;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-500 ease-expo',
        scrolled ? 'px-2.5 pt-2.5 sm:px-4 lg:px-6' : 'px-0 pt-0'
      )}
    >
      <div
        className={cn(
          'relative mx-auto w-full overflow-hidden transition-all duration-500 ease-expo',
          scrolled
            ? 'max-w-[1440px] rounded-2xl border border-primary/15 bg-white/88 shadow-[0_18px_46px_-18px_rgba(0,48,143,0.28)] backdrop-blur-xl'
            : 'border-b border-primary/12 bg-white/92 shadow-[0_6px_24px_-16px_rgba(0,48,143,0.16)] backdrop-blur-md'
        )}
      >
        {/* Franja superior luminosa institucional recortada al borde de la isla */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#00308F] via-[#3B6AF0] to-[#00308F] transition-opacity duration-300',
            scrolled ? 'opacity-90' : 'opacity-65'
          )}
        />

        {/* Barra de progreso de lectura integrada DENTRO del borde inferior del header (nunca flota suelta) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2.5px] bg-primary/5"
        >
          <div
            className="h-full origin-left bg-gradient-to-r from-[#00308F] via-[#3B82F6] to-[#1FAF5A] transition-transform duration-150 ease-out"
            style={{ transform: `scaleX(${scrollProgress})` }}
          />
        </div>

        <div className="mx-auto flex h-[74px] w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-7">
          {/* Izquierda: Logo + estado en vivo */}
          <div className="flex shrink-0 items-center gap-3.5">
            <Link
              href="/"
              className="group inline-flex items-center rounded-xl transition-transform duration-300 ease-expo hover:scale-[1.03] active:scale-[0.98] focus-visible:rounded-md"
            >
              <BrandLogo size="md" />
            </Link>
            {!isAdmin && !isAdminLogin && (
              <div className="hidden 2xl:block">
                <LiveOpenStatus compact />
              </div>
            )}
          </div>

          {/* Centro: Navegación Desktop con Sliding Magic Pill estilo React Bits */}
          {!isAdminLogin && (
            <nav
              aria-label={isAdmin ? 'Navegación de administración' : 'Navegación principal'}
              className="hidden min-w-0 lg:flex lg:flex-1 lg:items-center lg:justify-center"
            >
              {isAdmin ? (
                <div className="flex w-full min-w-0 items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => scrollAdminNav('left')}
                    aria-label="Desplazar navegación admin a la izquierda"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div
                    ref={adminNavScrollRef}
                    className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  >
                    <div className="flex items-center gap-1.5 pr-2">
                      {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                          item.href === '/admin'
                            ? pathname === '/admin'
                            : item.href !== '/' && pathname.startsWith(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              'rb-pill-interactive shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold',
                              isActive
                                ? 'border-primary bg-gradient-to-r from-[#002B82] to-[#2349B6] text-white shadow-sm'
                                : 'border-border bg-white text-foreground/80 hover:border-primary/45 hover:bg-[#EEF4FF] hover:text-primary'
                            )}
                          >
                            <span className="flex items-center gap-1.5">
                              <Icon className="h-3.5 w-3.5" />
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
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => scrollAdminNav('right')}
                    aria-label="Desplazar navegación admin a la derecha"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  ref={navRailRef}
                  onMouseLeave={() => setHoveredHref(null)}
                  className="relative inline-flex items-center gap-0.5 rounded-full border border-primary/12 bg-gradient-to-b from-[#EFF4FF]/95 to-[#F8FAFF]/95 p-1 shadow-[inset_0_1px_2px_rgba(0,48,143,0.06)]"
                >
                  {/* Pill deslizante reactivo */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-1 top-1 rounded-full border border-primary/20 bg-white shadow-[0_6px_18px_-6px_rgba(0,48,143,0.28)] transition-all duration-300 ease-expo"
                    style={{
                      transform: `translate3d(${pillStyle.left - 4}px, 0, 0)`,
                      width: `${pillStyle.width}px`,
                      opacity: pillStyle.opacity,
                    }}
                  />

                  {publicNavItems.map((item) => {
                    const isActive = activePublicHref === item.href;
                    const isTargeted = targetHref === item.href;

                    return (
                      <Link
                        key={item.href}
                        ref={(el) => {
                          navLinkRefs.current[item.href] = el;
                        }}
                        href={item.href}
                        onMouseEnter={() => setHoveredHref(item.href)}
                        onFocus={() => setHoveredHref(item.href)}
                        className={cn(
                          'relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors duration-200 xl:px-3.5 xl:text-sm',
                          isActive || isTargeted ? 'text-primary' : 'text-foreground/75 hover:text-primary'
                        )}
                      >
                        {item.withPosberryMark && (
                          <img
                            src="/LOGOBOSBERRY3.png"
                            alt=""
                            width={18}
                            height={18}
                            className="h-[18px] w-[18px] shrink-0 object-contain"
                            loading="eager"
                            decoding="async"
                          />
                        )}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </nav>
          )}

          {/* Derecha: Instagram SÚPER VISIBLE + WhatsApp con imán + Menú móvil */}
          <div className="flex shrink-0 items-center justify-end gap-2">
            {!isAdmin && !isAdminLogin && (
              <>
                {/* Instagram vibrante visible en escritorio (con texto en xl+) */}
                <Magnet strength={0.22} className="hidden lg:inline-flex">
                  <Button
                    asChild
                    variant="instagram"
                    size="sm"
                    className="h-9 rounded-full px-3 xl:px-4"
                  >
                    <Link
                      href={contactInfo.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Seguir a Darío Martínez Computación en Instagram"
                      onClick={() => trackEvent('social_click', { label: 'Instagram Header' })}
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="hidden xl:inline">Instagram</span>
                    </Link>
                  </Button>
                </Magnet>

                {/* WhatsApp vibrante con imán en escritorio */}
                <Magnet strength={0.22} className="hidden lg:inline-flex">
                  <Button
                    asChild
                    variant="whatsapp"
                    size="sm"
                    className="h-9 rounded-full px-4"
                  >
                    <Link
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('whatsapp_click', { label: 'Header CTA' })}
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </Link>
                  </Button>
                </Magnet>

                {/* Botón rápido de Instagram también visible en barra móvil */}
                <Button
                  asChild
                  variant="instagram"
                  size="icon"
                  className="h-9 w-9 rounded-full lg:hidden"
                >
                  <Link
                    href={contactInfo.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram de Darío Martínez Computación"
                    onClick={() => trackEvent('social_click', { label: 'Instagram Mobile Header' })}
                  >
                    <Instagram className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}

            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAdminLogout}
                className="hidden rounded-full border-destructive/25 text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-destructive lg:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            )}

            {/* Mobile & Tablet Navigation Drawer */}
            {!isAdminLogin && (
              <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-full lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menú de navegación</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex w-[88vw] max-w-sm flex-col p-6">
                  <SheetHeader className="border-b border-border pb-4 text-left">
                    <SheetTitle className="flex items-center justify-between gap-3">
                      <Link href="/" onClick={closeSheet} className="inline-flex items-center">
                        <BrandLogo size="sm" />
                      </Link>
                    </SheetTitle>
                    {!isAdmin && (
                      <div className="pt-2">
                        <LiveOpenStatus />
                      </div>
                    )}
                  </SheetHeader>

                  <nav className="mt-6 flex-1 space-y-1.5 overflow-y-auto pr-1">
                    {isAdmin ? (
                      adminNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                          item.href === '/admin'
                            ? pathname === '/admin'
                            : item.href !== '/' && pathname.startsWith(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeSheet}
                            className={cn(
                              'rb-pill-interactive flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium',
                              isActive
                                ? 'bg-gradient-to-r from-[#002B82] to-[#2349B6] text-white'
                                : 'text-foreground/85 hover:bg-surface hover:text-primary'
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })
                    ) : (
                      <>
                        <Link
                          href="/"
                          onClick={closeSheet}
                          className={cn(
                            'rb-pill-interactive flex items-center justify-between rounded-xl px-3.5 py-3 text-base font-medium',
                            pathname === '/'
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-foreground hover:bg-surface'
                          )}
                        >
                          <span>Inicio</span>
                        </Link>
                        {publicNavItems.map((item) => {
                          const isActive =
                            pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(`${item.href}/`));
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={closeSheet}
                              className={cn(
                                'rb-pill-interactive flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-base font-medium',
                                isActive
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'text-foreground hover:bg-surface'
                              )}
                            >
                              {item.withPosberryMark && (
                                <img
                                  src="/LOGOBOSBERRY3.png"
                                  alt=""
                                  width={20}
                                  height={20}
                                  className="h-5 w-5 shrink-0 object-contain"
                                  loading="eager"
                                  decoding="async"
                                />
                              )}
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </>
                    )}
                  </nav>

                  {!isAdmin && (
                    <div className="mt-6 grid grid-cols-1 gap-2.5 border-t border-border pt-4">
                      <Button asChild variant="whatsapp" size="lg" className="w-full rounded-full">
                        <Link
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            trackEvent('whatsapp_click', { label: 'Mobile Drawer CTA' });
                            closeSheet();
                          }}
                        >
                          <WhatsAppIcon className="h-5 w-5" />
                          Contactar por WhatsApp
                        </Link>
                      </Button>
                      <Button asChild variant="instagram" size="lg" className="w-full rounded-full">
                        <Link
                          href={contactInfo.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            trackEvent('social_click', { label: 'Instagram Mobile Drawer' });
                            closeSheet();
                          }}
                        >
                          <Instagram className="h-4 w-4" />
                          Seguir en Instagram
                        </Link>
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
