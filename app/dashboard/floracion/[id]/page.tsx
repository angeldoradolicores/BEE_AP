'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { obtenerPlantaUsuario, eliminarPlantaUsuario } from '@/lib/firestore-service'
import { plantasMeliferas } from '@/lib/plantas-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Leaf, Edit, Trash2 } from 'lucide-react'

export default function FloracionDetallePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const plantaId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [planta, setPlanta] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!plantaId) return

    const fetchPlanta = async () => {
      try {
        setLoading(true)
        
        // Primero intenta buscar planta del usuario
        const plantaData = await obtenerPlantaUsuario(plantaId)
        
        if (plantaData) {
          setPlanta(plantaData)
          setError('')
          return
        }

        // Si no encuentra, busca en plantas predefinidas
        const plantaPredefinida = plantasMeliferas.find(p => p.id === plantaId)
        if (plantaPredefinida) {
          setPlanta(plantaPredefinida)
          setError('')
          return
        }

        setError('Planta no encontrada')
      } catch (err) {
        console.error('Error cargando planta:', err)
        // Intenta buscar en predefinidas si hay error
        const plantaPredefinida = plantasMeliferas.find(p => p.id === plantaId)
        if (plantaPredefinida) {
          setPlanta(plantaPredefinida)
          setError('')
        } else {
          setError('Error al cargar la planta')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPlanta()
  }, [plantaId])

  const handleDelete = async () => {
    if (!confirm('¿Está seguro de que desea eliminar esta planta?')) return

    try {
      setIsDeleting(true)
      await eliminarPlantaUsuario(plantaId)
      router.push('/dashboard/floracion')
    } catch (err) {
      console.error('Error eliminando planta:', err)
      setError('Error al eliminar la planta')
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !planta) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Detalle de Floración</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive mb-4">{error || 'Planta no encontrada'}</p>
            <Button onClick={() => router.push('/dashboard/floracion')}>
              Volver a Floración
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const mesInicio = planta.floracion_inicio || planta.mesInicio
  const mesFin = planta.floracion_fin || planta.mesFin
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const isUserPlant = planta.userId === user?.uid

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{planta.nombre_comun || planta.nombreComun}</h1>
        </div>
        {isUserPlant && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/plantas/editar/${plantaId}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar
            </Button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Image */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              {planta.imagen_url || planta.imagenUrl ? (
                <img
                  src={planta.imagen_url || planta.imagenUrl}
                  alt={planta.nombre_comun || planta.nombreComun}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div
                  className="w-full h-64 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: getColorFromFlor(planta.color_flor || planta.colorFlor || 'Verde'),
                  }}
                >
                  <Leaf className="h-16 w-16 text-white/80" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div className="md:col-span-2 space-y-4">
          {/* Nombres */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nombre científico</p>
                <p className="font-semibold italic">{planta.nombre_cientifico || planta.nombreCientifico}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Familia</p>
                <p className="font-semibold">{planta.familia}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-semibold capitalize">{planta.tipo || planta.estratificacion}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Color de flor</p>
                <p className="font-semibold">{planta.color_flor || planta.colorFlor}</p>
              </div>
            </CardContent>
          </Card>

          {/* Aporte apícola */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Aporte Apícola</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Néctar</p>
                  <Badge variant="secondary" className="w-full justify-center">
                    {planta.nectar}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Polen</p>
                  <Badge variant="secondary" className="w-full justify-center">
                    {planta.polen}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Visitas</p>
                  <Badge variant="secondary" className="w-full justify-center capitalize">
                    {planta.frecuencia_visita || planta.frecuenciaVisita}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floración */}
      <Card>
        <CardHeader>
          <CardTitle>Período de Floración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Inicio</p>
              <Badge variant="outline" className="text-base px-3 py-2">
                {meses[mesInicio - 1]}
              </Badge>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gradient-to-r from-secondary to-primary rounded-full" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Fin</p>
              <Badge variant="outline" className="text-base px-3 py-2">
                {meses[mesFin - 1]}
              </Badge>
            </div>
          </div>

          {/* Mes por mes */}
          <div className="grid grid-cols-12 gap-1">
            {meses.map((mes, index) => {
              let isInRange = false
              if (mesInicio <= mesFin) {
                isInRange = index + 1 >= mesInicio && index + 1 <= mesFin
              } else {
                isInRange = index + 1 >= mesInicio || index + 1 <= mesFin
              }
              
              return (
                <div
                  key={mes}
                  className={`p-2 text-center text-xs font-semibold rounded ${
                    isInRange
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {mes}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Descripción */}
      {planta.descripcion && (
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {planta.descripcion}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getColorFromFlor(color: string): string {
  const colorMap: Record<string, string> = {
    'Blanca': '#f5f5f5',
    'Blanco': '#f5f5f5',
    'Amarillo': '#FCD34D',
    'Amarilla': '#FCD34D',
    'Rosado': '#F472B6',
    'Violeta': '#8B5CF6',
    'Morado': '#7C3AED',
    'Verde': '#22C55E',
    'Azul': '#3B82F6',
  }
  return colorMap[color] || '#9CA3AF'
}
