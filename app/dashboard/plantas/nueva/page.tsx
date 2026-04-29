'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

const meses = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
]

const tipos = ['Árbol', 'Arbusto', 'Hierba', 'Cultivo', 'Arvense']
const niveles = ['Alto', 'Medio', 'Bajo']

export default function NuevaPlantaPage() {
  const { userData, user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    nombre: '',
    nombreCientifico: '',
    familia: '',
    tipo: '',
    colorFlor: '',
    floracionInicio: '',
    floracionFin: '',
    nectar: '',
    polen: '',
    frecuenciaVisita: '',
    descripcion: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!user || userData?.rol !== 'apicultor') {
      setError('No tienes permisos para agregar plantas')
      setLoading(false)
      return
    }

    try {
      await addDoc(collection(db, 'plantas_usuario'), {
        ...formData,
        floracionInicio: parseInt(formData.floracionInicio),
        floracionFin: parseInt(formData.floracionFin),
        userId: user.uid,
        createdAt: serverTimestamp(),
      })
      
      router.push('/dashboard/plantas')
    } catch (err) {
      setError('Error al guardar la planta. Intenta de nuevo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (userData?.rol !== 'apicultor') {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Nueva Planta</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Información básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre común *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Acacia"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nombreCientifico">Nombre científico</Label>
              <Input
                id="nombreCientifico"
                placeholder="Ej: Acacia decurrens"
                value={formData.nombreCientifico}
                onChange={(e) => handleChange('nombreCientifico', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="familia">Familia</Label>
                <Input
                  id="familia"
                  placeholder="Ej: Fabaceae"
                  value={formData.familia}
                  onChange={(e) => handleChange('familia', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(v) => handleChange('tipo', v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="colorFlor">Color de la flor</Label>
              <Input
                id="colorFlor"
                placeholder="Ej: Amarillo"
                value={formData.colorFlor}
                onChange={(e) => handleChange('colorFlor', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Período de floración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Mes inicio *</Label>
                <Select value={formData.floracionInicio} onValueChange={(v) => handleChange('floracionInicio', v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map(mes => (
                      <SelectItem key={mes.value} value={mes.value}>{mes.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mes fin *</Label>
                <Select value={formData.floracionFin} onValueChange={(v) => handleChange('floracionFin', v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map(mes => (
                      <SelectItem key={mes.value} value={mes.value}>{mes.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Aporte apícola</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Néctar *</Label>
                <Select value={formData.nectar} onValueChange={(v) => handleChange('nectar', v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveles.map(nivel => (
                      <SelectItem key={nivel} value={nivel}>{nivel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Polen *</Label>
                <Select value={formData.polen} onValueChange={(v) => handleChange('polen', v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveles.map(nivel => (
                      <SelectItem key={nivel} value={nivel}>{nivel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Frecuencia de visita</Label>
              <Select value={formData.frecuenciaVisita} onValueChange={(v) => handleChange('frecuenciaVisita', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Descripción adicional de la planta, hábitat, observaciones..."
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button 
          type="submit" 
          className="w-full bg-secondary hover:bg-secondary/90"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar Planta
        </Button>
      </form>
    </div>
  )
}
