'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bell, BellOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NotificacionesPage() {
  const router = useRouter()

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Notificaciones</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Centro de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No hay notificaciones nuevas</h3>
            <p className="text-sm text-muted-foreground">
              Cuando tengas actividades pendientes o recordatorios, aparecerán aquí.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}