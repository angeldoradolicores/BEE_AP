'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { obtenerTodosLosApiarios, eliminarApiario, Apiario } from '@/lib/firestore-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Trash2, 
  Home,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ApiariosPage() {
  const { user, userData } = useAuth()
  const router = useRouter()
  const [apiarios, setApiarios] = useState<Apiario[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userData?.rol !== 'apicultor') {
      router.push('/dashboard')
      return
    }
    
    if (user) {
      cargarApiarios()
    }
  }, [user, userData, router])

  const cargarApiarios = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await obtenerTodosLosApiarios()
      setApiarios(data)
      setError('')
    } catch (error) {
      console.error('Error cargando apiarios:', error)
      setError('Error al cargar apiarios. Intenta nuevamente más tarde.')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este apiario? Se eliminarán también sus colmenas.')) return
    
    setDeleting(id)
    try {
      await eliminarApiario(id)
      setApiarios(prev => prev.filter(a => a.id !== id))
    } catch (error) {
      console.error('Error eliminando apiario:', error)
    } finally {
      setDeleting(null)
    }
  }

  if (userData?.rol !== 'apicultor') {
    return null
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold flex-1">Mis Apiarios</h1>
        <Link href="/dashboard/apiarios/nuevo">
          <Button size="sm" className="bg-secondary hover:bg-secondary/90">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

        {error && !loading && (
          <Card className="border-destructive/20">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h3 className="font-semibold mb-2">Error</h3>
              <p className="text-sm text-destructive mb-4">{error}</p>
            </CardContent>
          </Card>
        )}

      {/* Empty state */}
      {!loading && apiarios.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No tienes apiarios</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Agrega tu primer apiario para comenzar a gestionar tus colmenas
            </p>
            <Link href="/dashboard/apiarios/nuevo">
              <Button className="bg-secondary hover:bg-secondary/90">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Apiario
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Apiarios list */}
      <div className="space-y-3">
        {apiarios.map((apiario) => (
          <Card key={apiario.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center">
                <Link 
                  href={`/dashboard/apiarios/${apiario.id}`}
                  className="flex-1 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{apiario.nombre}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{apiario.ubicacion}</span>
                      </div>
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => apiario.id && handleEliminar(apiario.id)}
                  disabled={deleting === apiario.id}
                >
                  {deleting === apiario.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info */}
      {!loading && apiarios.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Toca un apiario para ver sus colmenas y registrar actividades
          </p>
        </div>
      )}
    </div>
  )
}
