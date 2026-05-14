'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { obtenerTodasLasPlantas, eliminarPlantaUsuario } from '@/lib/firestore-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2, Edit, Flower2, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PlantaUsuario {
  id: string
  nombre: string
  nombreCientifico: string
  tipo: string
  floracionInicio?: number
  floracionFin?: number
  floracionPorMes?: string[]
  nectar: string
  polen: string
  frecuenciaVisita: string
  imagenUrl?: string
}

export default function MisPlantasPage() {
  const { userData, user } = useAuth()
  const router = useRouter()
  const [plantas, setPlantas] = useState<PlantaUsuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (userData?.rol !== 'apicultor') {
      router.push('/dashboard')
      return
    }

    const fetchPlantas = async () => {
      if (!user) return
      
      try {
        const plantasData = await obtenerTodasLasPlantas()
        const mappedPlantas = plantasData.map(planta => ({
          id: planta.id!,
          nombre: planta.nombre_comun,
          nombreCientifico: planta.nombre_cientifico,
          tipo: planta.tipo,
          floracionInicio: planta.floracion_inicio,
          floracionFin: planta.floracion_fin,
          floracionPorMes: planta.floracion_por_mes ?? buildFloracionPorMes(planta.floracion_inicio, planta.floracion_fin),
          nectar: planta.nectar,
          polen: planta.polen,
          frecuenciaVisita: planta.frecuencia_visita,
          imagenUrl: planta.imagen_url,
          descripcion: planta.descripcion,
        })) as PlantaUsuario[]
        setPlantas(mappedPlantas)
        setError('')
      } catch (error) {
        console.error('Error fetching plantas:', error)
        setError('Error al cargar plantas. Intenta nuevamente más tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchPlantas()
  }, [user, userData, router])

  const handleDelete = async (plantaId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta planta?')) return
    
    setDeleting(plantaId)
    try {
      await eliminarPlantaUsuario(plantaId)
      setPlantas(plantas.filter(p => p.id !== plantaId))
    } catch (error) {
      console.error('Error deleting planta:', error)
    } finally {
      setDeleting(null)
    }
  }

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  function buildFloracionPorMes(inicio?: number, fin?: number) {
    const result = Array(12).fill('Bajo')
    if (!inicio || !fin) return result

    if (inicio <= fin) {
      for (let i = inicio; i <= fin; i++) {
        result[i - 1] = 'Alto'
      }
    } else {
      for (let i = inicio; i <= 12; i++) {
        result[i - 1] = 'Alto'
      }
      for (let i = 1; i <= fin; i++) {
        result[i - 1] = 'Alto'
      }
    }

    return result
  }

  if (userData?.rol !== 'apicultor') {
    return null
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex-1">Mis Plantas</h1>
        <Link href="/dashboard/plantas/nueva">
          <Button size="sm" className="bg-secondary hover:bg-secondary/90">
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Flower2 className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="font-semibold mb-2">Error</h3>
            <p className="text-sm text-destructive mb-4">{error}</p>
          </CardContent>
        </Card>
      ) : plantas.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Flower2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No tienes plantas registradas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Agrega plantas melíferas de tu zona para llevar un registro de su floración
            </p>
            <Link href="/dashboard/plantas/nueva">
              <Button className="bg-secondary hover:bg-secondary/90">
                <Plus className="h-4 w-4 mr-2" />
                Agregar primera planta
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {plantas.map((planta) => (
            <Card key={planta.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {planta.imagenUrl ? (
                      <div className="mb-3 overflow-hidden rounded-lg">
                        <img
                          src={planta.imagenUrl}
                          alt={planta.nombre}
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    ) : null}
                    <h3 className="font-semibold">{planta.nombre}</h3>
                    <p className="text-sm text-muted-foreground italic">{planta.nombreCientifico}</p>
                    <div className="flex flex-wrap gap-1 mt-2 text-[10px]">
                      <span className="px-2 py-0.5 bg-muted rounded">{planta.tipo}</span>
                      {planta.floracionPorMes?.map((nivel, index) => {
                        const colorClass = nivel === 'Alto'
                          ? 'bg-secondary text-secondary-foreground'
                          : nivel === 'Medio'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-destructive text-destructive-foreground'

                        return (
                          <span key={index} className={`${colorClass} rounded-full px-2 py-0.5`}
                            title={`${meses[index]}: ${nivel}`}
                          >
                            {meses[index]}
                          </span>
                        )
                      })}
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Néctar: {planta.nectar}</span>
                      <span>Polen: {planta.polen}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/dashboard/plantas/editar/${planta.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(planta.id)}
                      disabled={deleting === planta.id}
                    >
                      {deleting === planta.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
