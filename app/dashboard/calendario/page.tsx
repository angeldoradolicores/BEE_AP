'use client'

import { useState, useMemo, useEffect } from 'react'
import { plantasMeliferas, mesesCortos } from '@/lib/plantas-data'
import { useAuth } from '@/lib/auth-context'
import { obtenerTodasLasPlantas, type PlantaUsuario } from '@/lib/firestore-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarioPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [userPlants, setUserPlants] = useState<PlantaUsuario[]>([])
  
  const { user } = useAuth()
  const mesActual = new Date().getMonth() + 1

  useEffect(() => {
    if (user) {
      obtenerTodasLasPlantas().then(setUserPlants)
    }
  }, [user])

  // Group plants by their flowering pattern
  const plantasOrdenadas = useMemo(() => {
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

  const userPlantsMapped = userPlants
      .filter(p => p.id) // Filter out plants without id
      .map(p => {
        const floracionPorMes = Array.isArray(p.floracion_por_mes) && p.floracion_por_mes.length === 12
          ? p.floracion_por_mes.map((nivel) => nivel.charAt(0).toUpperCase() + nivel.slice(1))
          : buildFloracionPorMes(p.floracion_inicio, p.floracion_fin)

        const mesInicio = floracionPorMes.findIndex((nivel) => nivel !== 'Bajo') + 1
        const mesFin = floracionPorMes.length - [...floracionPorMes].reverse().findIndex((nivel) => nivel !== 'Bajo')

        return {
          id: p.id!,
          nombreCientifico: p.nombre_cientifico,
          nombreComun: p.nombre_comun,
          familia: p.familia,
          colorFlor: p.color_flor,
          recompensa: (p.nectar === 'alto' && p.polen === 'alto' ? 'P/N' : p.nectar === 'alto' ? 'N' : 'P') as 'N' | 'P' | 'P/N',
          estratificacion: p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1) as 'Arvense' | 'Cultivo' | 'Arbusto' | 'Árbol',
          frecuenciaVisita: p.frecuencia_visita as 'baja' | 'media' | 'alta',
          mesInicio: mesInicio || 0,
          mesFin: mesFin || 0,
          nectar: p.nectar.charAt(0).toUpperCase() + p.nectar.slice(1) as 'Alto' | 'Medio' | 'Bajo',
          polen: p.polen.charAt(0).toUpperCase() + p.polen.slice(1) as 'Alto' | 'Medio' | 'Bajo',
          descripcion: p.descripcion || '',
          imagenUrl: p.imagen_url
        }
      })

    const allPlants = [...plantasMeliferas, ...userPlantsMapped]

    return allPlants.sort((a, b) => {
      // Sort by start month
      return a.mesInicio - b.mesInicio
    })
  }, [userPlants])

  const countByStatus = (status: 'alta' | 'media' | 'baja', mesActual: number): number => {
    return plantasOrdenadas.filter(planta => {
      const plantaStatus = getMonthStatus(mesActual, planta.mesInicio, planta.mesFin)
      return plantaStatus === status
    }).length
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Calendario de floración</h1>
        <p className="text-muted-foreground">
          Visualiza la floración de las plantas por mes
        </p>
      </div>

      {/* Year selector */}
      <div className="flex items-center justify-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setYear(y => y - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xl font-semibold w-20 text-center">{year}</span>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setYear(y => y + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Month headers */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[120px_repeat(12,1fr)] gap-1 mb-2">
            <div className="text-sm font-medium text-muted-foreground"></div>
            {mesesCortos.map((mes, i) => (
              <div 
                key={mes} 
                className={`text-xs text-center font-medium ${
                  i + 1 === mesActual ? 'text-secondary font-bold' : 'text-muted-foreground'
                }`}
              >
                {mes}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 justify-end mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 rounded bg-secondary" />
              <span>Alta</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 rounded bg-secondary/50" />
              <span>Media</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 rounded bg-destructive/30" />
              <span>Baja</span>
            </div>
          </div>

          {/* Plants grid */}
          <div className="space-y-1">
            {plantasOrdenadas.map((planta) => (
              <div 
                key={planta.id}
                className="grid grid-cols-[120px_repeat(12,1fr)] gap-1 items-center"
              >
                <div className="text-sm truncate pr-2" title={planta.nombreComun}>
                  {planta.nombreComun}
                </div>
                {Array.from({ length: 12 }, (_, i) => {
                  const mes = i + 1
                  const status = getMonthStatus(mes, planta.mesInicio, planta.mesFin)
                  const distance = status === 'baja' ? getDistanceToFlowering(mes, planta.mesInicio, planta.mesFin) : 0
                  const opacity = status === 'baja' ? Math.max(0.3, 1 - (distance - 1) * 0.2) : 1
                  return (
                    <div
                      key={i}
                      className={`h-6 rounded transition-colors ${
                        status === 'alta' 
                          ? 'bg-secondary' 
                          : status === 'media'
                          ? 'bg-secondary/50'
                          : status === 'baja'
                          ? ''
                          : 'bg-muted/30'
                      } ${mes === mesActual ? 'ring-1 ring-foreground' : ''}`}
                      style={status === 'baja' ? { backgroundColor: `rgba(239, 68, 68, ${opacity})` } : {}}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly summary */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Resumen del mes actual ({mesesCortos[mesActual - 1]})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-secondary/20">
              <p className="text-2xl font-bold text-secondary">
                {countByStatus('alta', mesActual)}
              </p>
              <p className="text-xs text-muted-foreground">Floración alta</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/20">
              <p className="text-2xl font-bold text-primary">
                {countByStatus('media', mesActual)}
              </p>
              <p className="text-xs text-muted-foreground">Floración media</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/20">
              <p className="text-2xl font-bold text-destructive">
                {countByStatus('baja', mesActual)}
              </p>
              <p className="text-xs text-muted-foreground">Floración baja</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getMonthStatus(mes: number, inicio: number, fin: number): 'alta' | 'media' | 'baja' {
  // Check if in range
  let enRango = false
  if (inicio <= fin) {
    enRango = mes >= inicio && mes <= fin
  } else {
    enRango = mes >= inicio || mes <= fin
  }
  
  if (enRango) {
    return 'alta'
  }
  
  // Check if within 1 month of range
  const distanciaInicio = Math.min(
    Math.abs(mes - inicio),
    12 - Math.abs(mes - inicio)
  )
  const distanciaFin = Math.min(
    Math.abs(mes - fin),
    12 - Math.abs(mes - fin)
  )
  
  if (distanciaInicio <= 1 || distanciaFin <= 1) {
    return 'media'
  }
  
  return 'baja'
}

function getDistanceToFlowering(mes: number, inicio: number, fin: number): number {
  const distanciaInicio = Math.min(
    Math.abs(mes - inicio),
    12 - Math.abs(mes - inicio)
  )
  const distanciaFin = Math.min(
    Math.abs(mes - fin),
    12 - Math.abs(mes - fin)
  )
  return Math.min(distanciaInicio, distanciaFin)
}
