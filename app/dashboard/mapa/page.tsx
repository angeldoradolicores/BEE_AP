'use client'

import { useState, useMemo } from 'react'
import { CIUDADES_NARINO, useWeather, traducirCondicion, evaluarCondicionesAbejas } from '@/hooks/use-weather'
import { plantasMeliferas, getDisponibilidadPorMes, ajustarPorClima } from '@/lib/plantas-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Thermometer, Droplets, Wind, Leaf, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MapaPage() {
  const [selectedCity, setSelectedCity] = useState(CIUDADES_NARINO[0])
  const { weather, isLoading, refresh } = useWeather(selectedCity.lat, selectedCity.lon)
  const condiciones = evaluarCondicionesAbejas(weather)
  const mesActual = new Date().getMonth() + 1

  const plantasDisponibles = useMemo(() => {
    return plantasMeliferas.map(planta => {
      const base = getDisponibilidadPorMes(planta, mesActual)
      const ajustada = weather 
        ? ajustarPorClima(base, weather.temperatura, weather.humedad, weather.condicion)
        : base
      return { ...planta, disponibilidad: ajustada }
    }).filter(p => p.disponibilidad === 'alta' || p.disponibilidad === 'media')
  }, [mesActual, weather])

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Mapa de Floración</h1>
        <p className="text-muted-foreground">
          Botana, Pasto - Nariño, Colombia
        </p>
      </div>

      {/* Map representation */}
      <Card className="overflow-hidden">
        <div className="relative h-64 bg-gradient-to-b from-secondary/30 to-accent/20">
          {/* Simple map representation */}
          <svg 
            viewBox="0 0 400 200" 
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Colombia outline (simplified) */}
            <path
              d="M100 20 L150 15 L200 25 L250 20 L300 40 L320 80 L310 120 L280 150 L230 170 L180 180 L130 165 L90 130 L70 90 L80 50 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-muted-foreground/30"
            />
            
            {/* Nariño region */}
            <path
              d="M120 140 L140 135 L160 145 L175 155 L170 170 L145 175 L125 165 L115 150 Z"
              fill="currentColor"
              className="text-secondary/40"
              stroke="currentColor"
              strokeWidth="1"
            />
            
            {/* City markers */}
            {CIUDADES_NARINO.map((ciudad, index) => {
              // Calculate position based on coordinates (simplified mapping)
              const x = 130 + (ciudad.lon + 78) * 50
              const y = 180 - (ciudad.lat) * 20
              const isSelected = selectedCity.nombre === ciudad.nombre
              
              return (
                <g key={ciudad.nombre}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 8 : 5}
                    fill={isSelected ? 'var(--secondary)' : 'var(--muted-foreground)'}
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedCity(ciudad)}
                  />
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r={12}
                      fill="none"
                      stroke="var(--secondary)"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  )}
                </g>
              )
            })}
          </svg>

          {/* City selector overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card to-transparent p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {CIUDADES_NARINO.map((ciudad) => (
                <Button
                  key={ciudad.nombre}
                  variant={selectedCity.nombre === ciudad.nombre ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCity(ciudad)}
                  className={`flex-shrink-0 ${
                    selectedCity.nombre === ciudad.nombre 
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' 
                      : ''
                  }`}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {ciudad.nombre.split(',')[0]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Weather for selected location */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {selectedCity.nombre}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => refresh()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {weather ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-muted">
                  <Thermometer className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                  <p className="text-lg font-bold">{weather.temperatura}°C</p>
                  <p className="text-xs text-muted-foreground">Temperatura</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <Droplets className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-lg font-bold">{weather.humedad}%</p>
                  <p className="text-xs text-muted-foreground">Humedad</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <Wind className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                  <p className="text-lg font-bold">{weather.viento}</p>
                  <p className="text-xs text-muted-foreground">km/h</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="text-sm text-muted-foreground">Condición</p>
                  <p className="font-medium capitalize">{traducirCondicion(weather.condicion)}</p>
                </div>
                <Badge className={`${
                  condiciones.nivel === 'alta' 
                    ? 'bg-secondary text-secondary-foreground' 
                    : condiciones.nivel === 'media'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-destructive text-destructive-foreground'
                }`}>
                  Actividad {condiciones.nivel}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {isLoading ? 'Cargando clima...' : 'Configura la API de OpenWeather'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available plants in the area */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Floración disponible en la zona
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plantasDisponibles.length > 0 ? (
            <div className="space-y-2">
              {plantasDisponibles.slice(0, 6).map((planta) => (
                <div 
                  key={planta.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{planta.nombreComun}</p>
                    <p className="text-xs text-muted-foreground">
                      Néctar: {planta.nectar} | Polen: {planta.polen}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${
                    planta.disponibilidad === 'alta' 
                      ? 'border-secondary text-secondary' 
                      : 'border-primary text-primary'
                  }`}>
                    {planta.disponibilidad === 'alta' ? 'Alta' : 'Media'}
                  </Badge>
                </div>
              ))}
              {plantasDisponibles.length > 6 && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  +{plantasDisponibles.length - 6} plantas más disponibles
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay plantas con alta disponibilidad en este momento
            </p>
          )}
        </CardContent>
      </Card>

      {/* Climate impact info */}
      <Card className="bg-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Impacto del clima en la floración</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>Temperatura 20°C - 30°C</span>
            <Badge variant="outline" className="text-secondary border-secondary">Óptimo</Badge>
          </div>
          <div className="flex justify-between">
            <span>Humedad mayor a 50%</span>
            <Badge variant="outline" className="text-secondary border-secondary">Óptimo</Badge>
          </div>
          <div className="flex justify-between">
            <span>Lluvias moderadas</span>
            <Badge variant="outline" className="text-primary border-primary">Moderado</Badge>
          </div>
          <div className="flex justify-between">
            <span>Lluvias fuertes / Frío extremo</span>
            <Badge variant="outline" className="text-destructive border-destructive">Bajo</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
