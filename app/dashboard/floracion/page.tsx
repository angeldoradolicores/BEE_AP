'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { plantasMeliferas, getDisponibilidadPorMes, ajustarPorClima } from '@/lib/plantas-data'
import { useWeather, CIUDADES_NARINO } from '@/hooks/use-weather'
import { useAuth } from '@/lib/auth-context'
import { obtenerTodasLasPlantas, type PlantaUsuario } from '@/lib/firestore-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, ChevronRight, Leaf } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Disponibilidad = 'alta' | 'media' | 'baja' | 'todas'

const disponibilidadColors = {
  alta: 'bg-secondary text-secondary-foreground',
  media: 'bg-primary text-primary-foreground',
  baja: 'bg-destructive text-destructive-foreground',
}

const disponibilidadLabels = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export default function FloracionPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState<Disponibilidad>('todas')
  const [selectedCity] = useState(CIUDADES_NARINO[0])
  const [userPlants, setUserPlants] = useState<PlantaUsuario[]>([])
  const [error, setError] = useState('')
  
  const { user } = useAuth()
  const { weather } = useWeather(selectedCity.lat, selectedCity.lon)
  const mesActual = new Date().getMonth() + 1

  useEffect(() => {
    if (user) {
      obtenerTodasLasPlantas()
        .then((plants) => {
          setUserPlants(plants)
          setError('')
        })
        .catch((err) => {
          console.error('Error cargando plantas:', err)
          setError('No se pudieron cargar las plantas. Intenta de nuevo más tarde.')
        })
    }
  }, [user])

  const plantasConDisponibilidad = useMemo(() => {
    const userPlantsMapped = userPlants
      .filter(p => p.id) // Filter out plants without id
      .map(p => ({
        id: p.id!,
        nombreCientifico: p.nombre_cientifico,
        nombreComun: p.nombre_comun,
        familia: p.familia,
        colorFlor: p.color_flor,
        recompensa: (p.nectar === 'alto' && p.polen === 'alto' ? 'P/N' : p.nectar === 'alto' ? 'N' : 'P') as 'N' | 'P' | 'P/N',
        estratificacion: p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1) as 'Arvense' | 'Cultivo' | 'Arbusto' | 'Árbol',
        frecuenciaVisita: p.frecuencia_visita as 'baja' | 'media' | 'alta',
        mesInicio: p.floracion_inicio,
        mesFin: p.floracion_fin,
        nectar: p.nectar.charAt(0).toUpperCase() + p.nectar.slice(1) as 'Alto' | 'Medio' | 'Bajo',
        polen: p.polen.charAt(0).toUpperCase() + p.polen.slice(1) as 'Alto' | 'Medio' | 'Bajo',
        descripcion: p.descripcion || '',
        imagenUrl: p.imagen_url
      }))

    const allPlants = [...plantasMeliferas, ...userPlantsMapped]

    return allPlants.map(planta => {
      const disponibilidadBase = getDisponibilidadPorMes(planta, mesActual)
      const disponibilidadAjustada = weather 
        ? ajustarPorClima(disponibilidadBase, weather.temperatura, weather.humedad, weather.condicion)
        : disponibilidadBase
      
      return {
        ...planta,
        disponibilidad: disponibilidadAjustada,
      }
    })
  }, [mesActual, weather, userPlants])

  const plantasFiltradas = useMemo(() => {
    return plantasConDisponibilidad.filter(planta => {
      const matchesSearch = 
        planta.nombreComun.toLowerCase().includes(searchQuery.toLowerCase()) ||
        planta.nombreCientifico.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDisponibilidad = 
        filtroDisponibilidad === 'todas' || planta.disponibilidad === filtroDisponibilidad
      
      return matchesSearch && matchesDisponibilidad
    })
  }, [plantasConDisponibilidad, searchQuery, filtroDisponibilidad])

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Disponibilidad de floración</h1>
        <p className="text-muted-foreground">
          Consulta las plantas melíferas según el clima actual
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar planta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select 
          value={filtroDisponibilidad} 
          onValueChange={(v) => setFiltroDisponibilidad(v as Disponibilidad)}
        >
          <SelectTrigger className="w-[120px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <div className="flex gap-3 justify-center">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-xs">Alta</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs">Media</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-xs">Baja</span>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4 text-center text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Plants List */}
      <div className="space-y-3">
        {plantasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Leaf className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No se encontraron plantas</p>
            </CardContent>
          </Card>
        ) : (
          plantasFiltradas.map((planta) => (
            <Link 
              key={planta.id} 
              href={`/dashboard/floracion/${planta.id}`}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Plant image placeholder */}
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {planta.imagenUrl ? (
                        <img
                          src={planta.imagenUrl}
                          alt={planta.nombreComun}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: getColorFromFlor(planta.colorFlor) }}
                        >
                          <Leaf className="h-8 w-8 text-white/80" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold truncate">{planta.nombreComun}</h3>
                          <p className="text-sm text-muted-foreground truncate italic">
                            {planta.nombreCientifico}
                          </p>
                        </div>
                        <Badge className={disponibilidadColors[planta.disponibilidad]}>
                          {disponibilidadLabels[planta.disponibilidad]}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Néctar: {planta.nectar}</span>
                        <span>Polen: {planta.polen}</span>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
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
