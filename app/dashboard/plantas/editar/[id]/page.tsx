'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadPlantImage } from '@/lib/storage-service'
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

export default function EditarPlantaPage() {
  const { userData, user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const plantaId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    nombre: '',
    nombreCientifico: '',
    familia: '',
    tipo: '',
    colorFlor: '',
    floracionPorMes: Array(12).fill('Bajo'),
    nectar: '',
    polen: '',
    frecuenciaVisita: '',
    imagenUrl: '',
    descripcion: '',
  })
  const [imagenFile, setImagenFile] = useState<File | null>(null)

  useEffect(() => {
    if (userData?.rol !== 'apicultor') {
      router.push('/dashboard')
      return
    }

    const fetchPlanta = async () => {
      if (!user || !plantaId) return

      try {
        const docRef = doc(db, 'plantas_usuario', plantaId)
        const snapshot = await getDoc(docRef)
        
        if (!snapshot.exists()) {
          setError('Planta no encontrada')
          return
        }

        const data = snapshot.data()
        const defaultFloracionPorMes = Array(12).fill('Bajo')
        const floracionPorMes = Array.isArray(data.floracion_por_mes) && data.floracion_por_mes.length === 12
          ? data.floracion_por_mes.map((nivel: string) => nivel.charAt(0).toUpperCase() + nivel.slice(1))
          : defaultFloracionPorMes

        if (!Array.isArray(data.floracion_por_mes) && data.floracion_inicio && data.floracion_fin) {
          const inicio = data.floracion_inicio as number
          const fin = data.floracion_fin as number
          if (inicio <= fin) {
            for (let i = inicio; i <= fin; i++) {
              floracionPorMes[i - 1] = 'Alto'
            }
          } else {
            for (let i = inicio; i <= 12; i++) {
              floracionPorMes[i - 1] = 'Alto'
            }
            for (let i = 1; i <= fin; i++) {
              floracionPorMes[i - 1] = 'Alto'
            }
          }
        }

        setFormData({
          nombre: data.nombre_comun || '',
          nombreCientifico: data.nombre_cientifico || '',
          familia: data.familia || '',
          tipo: data.tipo || '',
          colorFlor: data.color_flor || '',
          floracionPorMes,
          nectar: data.nectar ? data.nectar.charAt(0).toUpperCase() + data.nectar.slice(1) : '',
          polen: data.polen ? data.polen.charAt(0).toUpperCase() + data.polen.slice(1) : '',
          frecuenciaVisita: data.frecuencia_visita ? data.frecuencia_visita.charAt(0).toUpperCase() + data.frecuencia_visita.slice(1) : '',
          imagenUrl: data.imagen_url || data.imagenUrl || '',
          descripcion: data.descripcion || '',
        })
      } catch (err) {
        console.error('Error fetching planta:', err)
        setError('Error al cargar la planta')
      } finally {
        setFetchLoading(false)
      }
    }

    fetchPlanta()
  }, [user, userData, router, plantaId])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFloracionMesChange = (index: number, value: string) => {
    setFormData(prev => {
      const floracionPorMes = [...prev.floracionPorMes]
      floracionPorMes[index] = value
      return { ...prev, floracionPorMes }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!user || userData?.rol !== 'apicultor') {
      setError('No tienes permisos para editar plantas')
      setLoading(false)
      return
    }

    try {
      let uploadedImageUrl = formData.imagenUrl
      if (imagenFile && user) {
        const newImageUrl = await uploadPlantImage(user.uid, imagenFile)
        if (newImageUrl) {
          uploadedImageUrl = newImageUrl
        } else {
          console.log('No se pudo subir la imagen nueva, manteniendo la imagen actual')
        }
      }
      const docRef = doc(db, 'plantas_usuario', plantaId)
      const activeMonths = formData.floracionPorMes
        .map((nivel, idx) => ({ nivel: nivel.toLowerCase(), idx }))
        .filter(({ nivel }) => nivel !== 'bajo')

      const dataToUpdate: any = {
        nombre_comun: formData.nombre,
        nombre_cientifico: formData.nombreCientifico,
        familia: formData.familia,
        tipo: formData.tipo.toLowerCase(),
        color_flor: formData.colorFlor,
        floracion_por_mes: formData.floracionPorMes.map((nivel) => nivel.toLowerCase()),
        nectar: formData.nectar.toLowerCase(),
        polen: formData.polen.toLowerCase(),
        frecuencia_visita: formData.frecuenciaVisita.toLowerCase(),
        imagen_url: uploadedImageUrl || null,
        descripcion: formData.descripcion,
      }

      if (activeMonths.length > 0) {
        dataToUpdate.floracion_inicio = activeMonths[0].idx + 1
        dataToUpdate.floracion_fin = activeMonths[activeMonths.length - 1].idx + 1
      }

      await updateDoc(docRef, dataToUpdate)
      
      router.push('/dashboard/plantas')
    } catch (err) {
      setError('Error al guardar la planta. Intenta de nuevo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (userData?.rol !== 'apicultor') {
    return null
  }

  if (fetchLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error && !formData.nombre) {
    return (
      <div className="p-4">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Editar Planta</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Planta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre común *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Mora"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombreCientifico">Nombre científico *</Label>
                <Input
                  id="nombreCientifico"
                  placeholder="Ej: Rubus glaucus"
                  value={formData.nombreCientifico}
                  onChange={(e) => handleChange('nombreCientifico', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="familia">Familia *</Label>
                <Input
                  id="familia"
                  placeholder="Ej: Rosaceae"
                  value={formData.familia}
                  onChange={(e) => handleChange('familia', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(v) => handleChange('tipo', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorFlor">Color de flor *</Label>
                <Input
                  id="colorFlor"
                  placeholder="Ej: Blanca"
                  value={formData.colorFlor}
                  onChange={(e) => handleChange('colorFlor', e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Floración por mes *</Label>
                <p className="text-sm text-muted-foreground">
                  Selecciona el nivel de floración para cada mes.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {meses.map((mes, index) => (
                    <div key={mes.value} className="space-y-2">
                      <Label className="text-xs">{mes.label}</Label>
                      <Select
                        value={formData.floracionPorMes[index]}
                        onValueChange={(v) => handleFloracionMesChange(index, v)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          {niveles.map((nivel) => (
                            <SelectItem key={nivel} value={nivel}>
                              {nivel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nectar">Néctar *</Label>
                <Select value={formData.nectar} onValueChange={(v) => handleChange('nectar', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nivel de néctar" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveles.map((nivel) => (
                      <SelectItem key={nivel} value={nivel}>
                        {nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="polen">Polen *</Label>
                <Select value={formData.polen} onValueChange={(v) => handleChange('polen', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nivel de polen" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveles.map((nivel) => (
                      <SelectItem key={nivel} value={nivel}>
                        {nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frecuenciaVisita">Frecuencia de visita *</Label>
                <Select value={formData.frecuenciaVisita} onValueChange={(v) => handleChange('frecuenciaVisita', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveles.map((nivel) => (
                      <SelectItem key={nivel} value={nivel}>
                        {nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="imagenFile">Imagen de la planta</Label>
                <Input
                  id="imagenFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImagenFile(e.target.files?.[0] ?? null)}
                />
                {formData.imagenUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Imagen actual:</p>
                    <img
                      src={formData.imagenUrl}
                      alt={formData.nombre}
                      className="mt-2 h-28 w-full max-w-xs rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Información adicional sobre la planta..."
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                rows={3}
              />
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
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}