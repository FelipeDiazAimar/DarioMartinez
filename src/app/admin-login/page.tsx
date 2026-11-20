'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Cog, Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');

    try {
      // La clave se valida en el servidor, que deja una cookie de sesión firmada (httpOnly).
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, remember: rememberMe }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        setError(payload?.message || 'Clave incorrecta. Intente de nuevo.');
        setPassword('');
        return;
      }

      // Marca que usan las páginas del panel para mostrarse. La protección real es la cookie
      // de sesión que verifica el middleware.
      if (rememberMe) {
        localStorage.setItem('isAdminAuthenticated', 'true');
        sessionStorage.removeItem('isAdminAuthenticated');
      } else {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.removeItem('isAdminAuthenticated');
      }

      // Forzar navegación completa evita carreras entre set de cookie y middleware.
      window.location.assign(getAdminDestination());
    } catch {
      setError('No se pudo conectar con el servidor. Intente de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center bg-muted py-12 md:py-24 lg:py-32">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <Cog className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Panel de Administración</CardTitle>
          <CardDescription>Ingrese la clave para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Clave de Acceso</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="********"
                  className="pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(Boolean(checked))} />
              <Label
                htmlFor="remember-me"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Recordar este dispositivo
              </Label>
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
