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

      // Forzar navegación completa evita carreras entre set de cookie y middleware.
      window.location.assign(getAdminDestination());
    } else {
      document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      setError('Clave incorrecta. Intente de nuevo.');
      setPassword('');
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
            <Button type="submit" className="w-full">
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
