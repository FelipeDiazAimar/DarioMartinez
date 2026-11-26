'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Database,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BrandLogo } from '@/components/brand-logo';
import { AuroraBackdrop, Magnet, SpotlightCard } from '@/components/react-bits';

const adminHighlights = [
  {
    icon: BarChart3,
    title: 'Estadísticas reales y Enlaces UTM',
    desc: 'Medí visitas, clics a WhatsApp y campañas de Instagram, Facebook y Google.',
  },
  {
    icon: Database,
    title: 'Catálogo, Stock y Espejo Supabase',
    desc: 'Gestioná artículos, categorías, precios y sincronización en vivo.',
  },
  {
    icon: ShieldCheck,
    title: 'Editor CMS en tiempo real',
    desc: 'Actualizá banners, textos, horarios, servicios y preguntas frecuentes.',
  },
];

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setAdminAuthCookie = (persistent: boolean) => {
    const base = 'admin_auth=1; path=/; SameSite=Lax';
    document.cookie = persistent ? `${base}; max-age=${60 * 60 * 24 * 30}` : base;
  };

  const getAdminDestination = () => {
    const next = new URLSearchParams(window.location.search).get('next');
    if (!next || !next.startsWith('/admin')) {
      return '/admin';
    }
    return next;
  };

  useEffect(() => {
    const localAuth = localStorage.getItem('isAdminAuthenticated');
    if (localAuth === 'true') {
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (password === 'MartinezDario@') {
      if (rememberMe) {
        localStorage.setItem('isAdminAuthenticated', 'true');
        sessionStorage.removeItem('isAdminAuthenticated');
        setAdminAuthCookie(true);
      } else {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.removeItem('isAdminAuthenticated');
        setAdminAuthCookie(false);
      }

      window.location.assign(getAdminDestination());
    } else {
      document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      setError('Clave incorrecta. Verificá mayúsculas e intentá nuevamente.');
      setPassword('');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-brand-cobalt relative flex min-h-dvh w-full flex-col justify-between overflow-hidden px-4 py-6 text-white sm:px-6 lg:px-8">
      <AuroraBackdrop variant="cobalt" />

      {/* Barra superior minimalista para volver al sitio público */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link
          href="/"
          className="rb-glare rb-pill-interactive inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md hover:border-white/45 hover:bg-white/20"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al sitio público
        </Link>

        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-medium text-emerald-200 backdrop-blur-md sm:inline-flex">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Acceso interno seguro
        </span>
      </div>

      {/* Contenido central split 2 columnas */}
      <div className="relative z-10 mx-auto my-8 grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Columna izquierda: Identidad institucional y capacidades */}
        <div className="space-y-7 lg:col-span-6">
          <div className="inline-flex">
            <BrandLogo variant="dark" size="xl" />
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-sky-300" />
              Centro de Control · Darío Martínez Computación
            </span>
            <h1 className="font-headline text-3xl font-extrabold leading-[1.08] tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
              Administración integral de tu plataforma web
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
              Ingresá con la clave interna para consultar métricas reales, generar enlaces UTM de campaña y administrar el catálogo y contenidos.
            </p>
          </div>

          <div className="hidden space-y-3 lg:block">
            {adminHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <SpotlightCard
                  key={item.title}
                  spotlightColor="rgba(120, 180, 255, 0.24)"
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition-colors hover:border-white/30"
                >
                  <div className="relative z-20 flex items-start gap-3.5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 text-sky-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-headline text-sm font-bold text-white">{item.title}</h2>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/75">{item.desc}</p>
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>

        {/* Columna derecha: Tarjeta interactiva Spotlight de login */}
        <div className="lg:col-span-6">
          <SpotlightCard
            spotlightColor="rgba(0, 48, 143, 0.14)"
            className="mx-auto w-full max-w-md rounded-3xl border border-white/30 bg-white p-7 text-foreground shadow-[0_32px_80px_-20px_rgba(0,12,48,0.65)] sm:p-9"
          >
            <div className="relative z-20">
              <div className="flex items-center gap-3.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#002878] to-[#2349B6] text-white shadow-md shadow-primary/30">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
                    Iniciar sesión
                  </h2>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Panel administrativo restringido
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold text-foreground/85">
                      Clave de acceso
                    </Label>
                    {capsLockOn && (
                      <span className="text-[11px] font-semibold text-amber-600">
                        Bloq Mayús activado
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                      required
                      autoFocus
                      autoComplete="current-password"
                      placeholder="Ingresá tu clave interna"
                      className="h-12 rounded-xl border-primary/20 bg-[#F6F9FF] pr-12 text-sm transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                      className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <label
                  htmlFor="remember-me"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/80 bg-[#F8FAFF] px-3.5 py-3 transition-colors hover:border-primary/35"
                >
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                  />
                  <div className="text-xs leading-snug">
                    <span className="block font-semibold text-foreground">Recordar este dispositivo</span>
                    <span className="text-muted-foreground">Mantiene tu sesión activa por 30 días</span>
                  </div>
                </label>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-xs font-medium text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Magnet strength={0.14} className="w-full">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="rb-star-cta h-12 w-full rounded-full text-sm font-bold"
                  >
                    <span>{isSubmitting ? 'Verificando acceso...' : 'Ingresar al Panel'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Magnet>
              </form>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span>San Francisco, Córdoba</span>
                <Link href="/" className="font-semibold text-primary hover:underline">
                  Ir a la portada →
                </Link>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* Pie discreto */}
      <div className="relative z-10 mx-auto w-full max-w-6xl text-center text-xs text-white/55">
        <p suppressHydrationWarning>
          © {new Date().getFullYear()} Darío Martínez Computación · Sistema de Administración Interna
        </p>
      </div>
    </section>
  );
}
