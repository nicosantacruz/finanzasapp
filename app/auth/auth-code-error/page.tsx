import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Error de Autenticación
          </CardTitle>
          <CardDescription className="text-center">
            Hubo un problema al iniciar sesión
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            No se pudo completar el proceso de autenticación. Esto puede deberse a:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• El código de autorización ha expirado</li>
            <li>• El usuario canceló el proceso</li>
            <li>• Problemas de conectividad</li>
          </ul>
          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/login">
                Intentar nuevamente
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                Volver al inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
