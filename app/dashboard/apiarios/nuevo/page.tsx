'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { CIUDADES_NARINO } from '@/hooks/use-weather'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NuevoApiarioPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [nombre, setNombre] = useState('')
  const [ubicacionCustom, setUbicacionCustom] = useState('')
  const [selectedCity, setSelectedCity] = useState(CIUDADES_NARINO[0])
  const [usarCiudad, setUsarCiudad] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    setLoading(true)
    setError('')

    try {
      await addDoc(collection(db, 'apiarios'), {
        nombre: nombre.trim(),
        ubicacion: usarCiudad ? selectedCity.nombre : ubicacionCustom.trim(),
        latitud: usarCiudad ? selectedCity.lat : 0,
        longitud: usarCiudad ? selectedCity.lon : 0,
        userId: user.uid,
        fecha_creacion: serverTimestamp()
      })
      
      router.push('/dashboard/apiarios')
    } catch (err) {
      console.error('Error creando apiario:', err)
      setError('Error al crear el apiario. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/apiarios">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Nuevo Apiario</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-secondary" />
            Datos del Apiario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del apiario *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Apiario El Paraíso"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Ubicación</Label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant={usarCiudad ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUsarCiudad(true)}
                  className={usarCiudad ? 'bg-secondary hover:bg-secondary/90' : ''}
                >
                  Ciudad de Nariño
                </Button>
                <Button
                  type="button"
                  variant={!usarCiudad ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUsarCiudad(false)}
                  className={!usarCiudad ? 'bg-secondary hover:bg-secondary/90' : ''}
                >
                  Personalizada
                </Button>
              </div>

              {usarCiudad ? (
                <Select 
                  value={selectedCity.nombre} 
                  onValueChange={(v) => {
                    const city = CIUDADES_NARINO.find(c => c.nombre === v)
                    if (city) setSelectedCity(city)
                  }}
                >
                  <SelectTrigger>
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
              ) : (
                <Input
                  placeholder="Ej: Vereda San Juan, Pasto"
                  value={ubicacionCustom}
                  onChange={(e) => setUbicacionCustom(e.target.value)}
                />
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full bg-secondary hover:bg-secondary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Crear Apiario'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
