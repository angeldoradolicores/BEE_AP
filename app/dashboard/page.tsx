'use client'
import React from "react";
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useWeather, CIUDADES_NARINO, traducirCondicion, evaluarCondicionesAbejas } from '@/hooks/use-weather'
import { obtenerEstadisticas } from '@/lib/firestore-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Cloud, Droplets, Wind, RefreshCw, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function WeatherIcon({ condicion, className = "w-16 h-16" }: { condicion: string; className?: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    Clear: (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="25" fill="#FCD34D" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line
            key={i}
            x1={50 + 30 * Math.cos((angle * Math.PI) / 180)}
            y1={50 + 30 * Math.sin((angle * Math.PI) / 180)}
            x2={50 + 40 * Math.cos((angle * Math.PI) / 180)}
            y2={50 + 40 * Math.sin((angle * Math.PI) / 180)}
            stroke="#FCD34D"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
      </svg>
    ),
    Clouds: (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="35" cy="55" r="20" fill="#9CA3AF" />
        <circle cx="55" cy="45" r="25" fill="#D1D5DB" />
        <circle cx="70" cy="55" r="18" fill="#9CA3AF" />
        <circle cx="30" cy="35" r="12" fill="#FCD34D" />
      </svg>
    ),
    Rain: (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="35" cy="40" r="18" fill="#6B7280" />
        <circle cx="55" cy="32" r="22" fill="#9CA3AF" />
        <circle cx="70" cy="40" r="16" fill="#6B7280" />
        <line x1="30" y1="65" x2="25" y2="80" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="65" x2="45" y2="80" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
        <line x1="70" y1="65" x2="65" y2="80" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    Drizzle: (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="35" cy="40" r="18" fill="#9CA3AF" />
        <circle cx="55" cy="32" r="22" fill="#D1D5DB" />
        <circle cx="70" cy="40" r="16" fill="#9CA3AF" />
        <circle cx="35" cy="70" r="2" fill="#3B82F6" />
        <circle cx="50" cy="75" r="2" fill="#3B82F6" />
        <circle cx="65" cy="70" r="2" fill="#3B82F6" />
      </svg>
    ),
    Thunderstorm: (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="35" cy="35" r="18" fill="#4B5563" />
        <circle cx="55" cy="27" r="22" fill="#6B7280" />
        <circle cx="70" cy="35" r="16" fill="#4B5563" />
        <polygon points="50,50 40,70 48,70 42,90 60,65 52,65 58,50" fill="#FCD34D" />
      </svg>
    ),
  }
  
  return iconMap[condicion] || iconMap.Clouds
}

function ActividadAbejas({ nivel }: { nivel: 'alta' | 'media' | 'baja' }) {
  const colores = {
    alta: 'text-secondary',
    media: 'text-primary',
    baja: 'text-destructive',
  }
  
  const porcentajes = {
    alta: 85,
    media: 55,
    baja: 25,
  }

  const mensajes = {
    alta: 'Condiciones favorables',
    media: 'Condiciones moderadas',
    baja: 'Condiciones no favorables',
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${porcentajes[nivel] * 2.51} 251`}
            strokeLinecap="round"
            className={colores[nivel]}
          />
        </svg>
        {/* Bee icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 60 60" className="w-12 h-12">
            <ellipse cx="30" cy="35" rx="12" ry="15" fill="#FCD34D" stroke="#1F2937" strokeWidth="1.5"/>
            <path d="M20 30 Q30 28 40 30" stroke="#1F2937" strokeWidth="2"/>
            <path d="M19 36 Q30 34 41 36" stroke="#1F2937" strokeWidth="2"/>
            <path d="M20 42 Q30 40 40 42" stroke="#1F2937" strokeWidth="2"/>
            <circle cx="30" cy="22" r="7" fill="#1F2937"/>
            <ellipse cx="18" cy="28" rx="8" ry="5" fill="white" fillOpacity="0.6"/>
            <ellipse cx="42" cy="28" rx="8" ry="5" fill="white" fillOpacity="0.6"/>
          </svg>
        </div>
      </div>
      <p className={`text-lg font-semibold mt-2 capitalize ${colores[nivel]}`}>
        {nivel}
      </p>
      <p className="text-sm text-muted-foreground text-center">
        {mensajes[nivel]}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const { user, userData } = useAuth()
  const [selectedCity, setSelectedCity] = useState(CIUDADES_NARINO[0])
  const [stats, setStats] = useState({ totalApiarios: 0, totalColmenas: 0, totalActividades: 0, totalPlantas: 0 })
  
  const { weather, isLoading, refresh } = useWeather(selectedCity.lat, selectedCity.lon)
  const condicionesAbejas = evaluarCondicionesAbejas(weather)

  useEffect(() => {
    if (user && userData?.rol === 'apicultor') {
      obtenerEstadisticas(user.uid).then(setStats).catch(console.error)
    }
  }, [user, userData])

  const handleCityChange = (value: string) => {
    const city = CIUDADES_NARINO.find(c => c.nombre === value)
    if (city) setSelectedCity(city)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Hola, {userData?.nombre || 'Usuario'}
          </h1>
          <p className="text-muted-foreground">
            {userData?.rol === 'apicultor' ? 'Panel de Apicultor' : 'Bienvenido a Bee'}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>
      </div>

      {/* City Selector */}
      <Select value={selectedCity.nombre} onValueChange={handleCityChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona una ciudad" />
        </SelectTrigger>
        <SelectContent>
          {CIUDADES_NARINO.map((ciudad) => (
            <SelectItem key={ciudad.nombre} value={ciudad.nombre}>
              {ciudad.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Weather Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Clima actual</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => refresh()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Cargando clima...</div>
            </div>
          ) : weather ? (
            <div className="flex items-center gap-4">
              <WeatherIcon condicion={weather.condicion} />
              <div className="flex-1">
                <p className="text-4xl font-bold">{weather.temperatura}°C</p>
                <p className="text-muted-foreground capitalize">
                  {traducirCondicion(weather.condicion)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Cloud className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Configura la API de OpenWeather</p>
              <p className="text-xs mt-1">Agrega NEXT_PUBLIC_OPENWEATHER_API_KEY</p>
            </div>
          )}
          
          {weather && (
            <div className="flex justify-around mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>Humedad {weather.humedad}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wind className="h-4 w-4 text-gray-500" />
                <span>Viento {weather.viento} km/h</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bee Activity Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Actividad de las abejas</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-4">
          <ActividadAbejas nivel={condicionesAbejas.nivel} />
        </CardContent>
      </Card>

      {/* Quick Stats - Only for apicultores */}
      {userData?.rol === 'apicultor' && (
        <>
          <Link href="/dashboard/apiarios">
            <Card className="bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <span className="font-medium">Gestionar Apiarios y Colmenas</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-primary/20">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{stats.totalApiarios}</p>
                <p className="text-sm text-muted-foreground">Apiarios</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/20">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{stats.totalColmenas}</p>
                <p className="text-sm text-muted-foreground">Colmenas</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {/* Info card for regular users */}
      {userData?.rol === 'usuario' && (
        <Card className="bg-muted/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Explora la floración de plantas melíferas y consulta el calendario de disponibilidad
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
