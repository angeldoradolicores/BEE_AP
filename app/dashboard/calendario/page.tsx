'use client'

import { useState, useMemo } from 'react'
import { plantasMeliferas, mesesCortos } from '@/lib/plantas-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarioPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const mesActual = new Date().getMonth() + 1

  // Group plants by their flowering pattern
  const plantasOrdenadas = useMemo(() => {
    return [...plantasMeliferas].sort((a, b) => {
      // Sort by start month
      return a.mesInicio - b.mesInicio
    })
  }, [])

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
                  return (
                    <div
                      key={i}
                      className={`h-6 rounded transition-colors ${
                        status === 'alta' 
                          ? 'bg-secondary' 
                          : status === 'media'
                          ? 'bg-secondary/50'
                          : status === 'baja'
                          ? 'bg-destructive/30'
                          : 'bg-muted/30'
                      } ${mes === mesActual ? 'ring-1 ring-foreground' : ''}`}
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

function getMonthStatus(mes: number, inicio: number, fin: number): 'alta' | 'media' | 'baja' | 'none' {
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
  
  return 'none'
}

function countByStatus(status: 'alta' | 'media' | 'baja', mesActual: number): number {
  return plantasMeliferas.filter(planta => {
    const plantaStatus = getMonthStatus(mesActual, planta.mesInicio, planta.mesFin)
    if (status === 'baja') {
      return plantaStatus === 'none' || plantaStatus === 'baja'
    }
    return plantaStatus === status
  }).length
}
