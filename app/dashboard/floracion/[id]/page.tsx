'use client'

import { use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { plantasMeliferas, getDisponibilidadPorMes, ajustarPorClima, mesesCortos } from '@/lib/plantas-data'
import { useWeather, CIUDADES_NARINO } from '@/hooks/use-weather'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Leaf, Droplets, CircleDot, Calendar, Info, Lightbulb } from 'lucide-react'

const disponibilidadColors = {
  alta: 'bg-secondary text-secondary-foreground',
  media: 'bg-primary text-primary-foreground',
  baja: 'bg-destructive text-destructive-foreground',
}

const disponibilidadLabels = {
  alta: 'Alta - Disponible',
  media: 'Media - Parcialmente disponible',
  baja: 'Baja - No disponible',
}

export default function PlantaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  
  const planta = plantasMeliferas.find(p => p.id === resolvedParams.id)
  const { weather } = useWeather(CIUDADES_NARINO[0].lat, CIUDADES_NARINO[0].lon)
  const mesActual = new Date().getMonth() + 1

  const disponibilidad = useMemo(() => {
    if (!planta) return 'baja'
    const base = getDisponibilidadPorMes(planta, mesActual)
    return weather 
      ? ajustarPorClima(base, weather.temperatura, weather.humedad, weather.condicion)
      : base
  }, [planta, mesActual, weather])

  if (!planta) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <Leaf className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Planta no encontrada</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const recomendacion = getRecomendacion(disponibilidad, planta)

  return (
    <div className="pb-4">
      {/* Header with image */}
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div 
          className="h-48 flex items-center justify-center"
          style={{ backgroundColor: getColorFromFlor(planta.colorFlor) }}
        >
          <Leaf className="h-24 w-24 text-white/60" />
        </div>
        
        <Badge className="absolute top-4 right-4 bg-card text-card-foreground">
          {planta.estratificacion}
        </Badge>
      </div>

      <div className="p-4 space-y-4 -mt-4 relative">
        {/* Main Info Card */}
        <Card>
          <CardContent className="p-4">
            <h1 className="text-2xl font-bold">{planta.nombreComun}</h1>
            <p className="text-muted-foreground italic">{planta.nombreCientifico}</p>
            <p className="text-sm text-muted-foreground mt-1">Familia: {planta.familia}</p>
          </CardContent>
        </Card>

        {/* Flowering Period */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Floración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {mesesCortos[planta.mesInicio - 1]} - {mesesCortos[planta.mesFin - 1]}
            </p>
            
            {/* Month indicator */}
            <div className="flex gap-1 mt-3">
              {mesesCortos.map((mes, i) => {
                const enRango = isInRange(i + 1, planta.mesInicio, planta.mesFin)
                const esActual = i + 1 === mesActual
                return (
                  <div
                    key={mes}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      enRango 
                        ? 'bg-secondary' 
                        : 'bg-muted'
                    } ${esActual ? 'ring-2 ring-foreground ring-offset-1' : ''}`}
                    title={mes}
                  />
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Ene</span>
              <span>Dic</span>
            </div>
          </CardContent>
        </Card>

        {/* Contribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              Aporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Néctar</p>
                  <p className="font-medium">{planta.nectar}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <CircleDot className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Polen</p>
                  <p className="font-medium">{planta.polen}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Availability */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Disponibilidad actual</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${disponibilidadColors[disponibilidad]} text-sm py-1 px-3`}>
              {disponibilidadLabels[disponibilidad]}
            </Badge>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card className="bg-secondary/10 border-secondary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-secondary" />
              Recomendación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{recomendacion}</p>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{planta.descripcion}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function isInRange(mes: number, inicio: number, fin: number): boolean {
  if (inicio <= fin) {
    return mes >= inicio && mes <= fin
  }
  return mes >= inicio || mes <= fin
}

function getColorFromFlor(color: string): string {
  const colorMap: Record<string, string> = {
    'Blanca': '#E5E7EB',
    'Blanco': '#E5E7EB',
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

function getRecomendacion(disponibilidad: 'alta' | 'media' | 'baja', planta: { nectar: string; polen: string }): string {
  if (disponibilidad === 'alta') {
    return `Las condiciones actuales son favorables para la recolección de ${
      planta.nectar === 'Alto' ? 'néctar' : planta.polen === 'Alto' ? 'polen' : 'recursos'
    }. Excelente momento para aprovechar esta planta.`
  } else if (disponibilidad === 'media') {
    return 'Las condiciones son moderadas. Las abejas pueden visitar esta planta, pero la producción puede no ser óptima.'
  } else {
    return 'No es el mejor momento para esta planta. Considera otras fuentes de floración disponibles en la zona.'
  }
}
