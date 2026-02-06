'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Cog } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'MartinezDario@') {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      router.push('/admin');
    } else {
      setError('Clave incorrecta. Intente de nuevo.');
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
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
              />
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
