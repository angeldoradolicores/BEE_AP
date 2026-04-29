'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/auth-context'
import { 
  obtenerApiario, 
  obtenerColmenas, 
  crearColmena,
  eliminarColmena,
  crearActividad,
  obtenerActividades,
  Apiario, 
  Colmena,
  Actividad
} from '@/lib/firestore-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Trash2,
  Loader2,
  Hexagon,
  Activity,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Timestamp } from 'firebase/firestore'

export default function ApiarioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, userData } = useAuth()
  const router = useRouter()
  
  const [apiario, setApiario] = useState<Apiario | null>(null)
  const [colmenas, setColmenas] = useState<Colmena[]>([])
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [showColmenaForm, setShowColmenaForm] = useState(false)
  const [showActividadForm, setShowActividadForm] = useState(false)
  const [colmenaNombre, setColmenaNombre] = useState('')
  const [colmenaTipo, setColmenaTipo] = useState<Colmena['tipo']>('langstroth')
  const [actividadTipo, setActividadTipo] = useState<Actividad['tipo']>('revision')
  const [actividadDesc, setActividadDesc] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (userData?.rol !== 'apicultor') {
      router.push('/dashboard')
      return
    }
    cargarDatos()
  }, [id, user, userData, router])

  const cargarDatos = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [apiarioData, colmenasData, actividadesData] = await Promise.all([
        obtenerApiario(id),
        obtenerColmenas(user.uid, id),
        obtenerActividades(user.uid)
      ])
      
      if (!apiarioData || apiarioData.userId !== user.uid) {
        router.push('/dashboard/apiarios')
        return
      }
      
      setApiario(apiarioData)
      setColmenas(colmenasData)
      setActividades(actividadesData.filter(a => a.apiarioId === id).slice(0, 5))
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddColmena = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !colmenaNombre.trim()) return
    
    setSaving(true)
    try {
      await crearColmena({
        nombre: colmenaNombre.trim(),
        apiarioId: id,
        tipo: colmenaTipo,
        estado: 'activa',
        userId: user.uid
      })
      
      setColmenaNombre('')
      setShowColmenaForm(false)
      cargarDatos()
    } catch (error) {
      console.error('Error creando colmena:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddActividad = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !actividadDesc.trim()) return
    
    setSaving(true)
    try {
      await crearActividad({
        apiarioId: id,
        tipo: actividadTipo,
        descripcion: actividadDesc.trim(),
        fecha: Timestamp.now(),
        userId: user.uid
      })
      
      setActividadDesc('')
      setShowActividadForm(false)
      cargarDatos()
    } catch (error) {
      console.error('Error creando actividad:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteColmena = async (colmenaId: string) => {
    if (!confirm('¿Eliminar esta colmena?')) return
    try {
      await eliminarColmena(colmenaId)
      cargarDatos()
    } catch (error) {
      console.error('Error eliminando colmena:', error)
    }
  }

  const tipoActividadLabels: Record<Actividad['tipo'], string> = {
    revision: 'Revisión',
    cosecha: 'Cosecha',
    alimentacion: 'Alimentación',
    tratamiento: 'Tratamiento',
    otra: 'Otra'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!apiario) return null

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/apiarios">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{apiario.nombre}</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{apiario.ubicacion}</span>
          </div>
        </div>
      </div>

      {/* Colmenas Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Hexagon className="h-4 w-4 text-primary" />
              Colmenas ({colmenas.length})
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowColmenaForm(!showColmenaForm)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add colmena form */}
          {showColmenaForm && (
            <form onSubmit={handleAddColmena} className="p-3 bg-muted/50 rounded-lg space-y-3">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  placeholder="Ej: Colmena 1"
                  value={colmenaNombre}
                  onChange={(e) => setColmenaNombre(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={colmenaTipo} onValueChange={(v) => setColmenaTipo(v as Colmena['tipo'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="langstroth">Langstroth</SelectItem>
                    <SelectItem value="dadant">Dadant</SelectItem>
                    <SelectItem value="warre">Warré</SelectItem>
                    <SelectItem value="top-bar">Top Bar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  size="sm" 
                  className="bg-secondary hover:bg-secondary/90"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowColmenaForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {/* Colmenas list */}
          {colmenas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay colmenas registradas
            </p>
          ) : (
            <div className="space-y-2">
              {colmenas.map((colmena) => (
                <div 
                  key={colmena.id} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                      <Hexagon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{colmena.nombre}</p>
                      <p className="text-xs text-muted-foreground capitalize">{colmena.tipo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      colmena.estado === 'activa' ? 'bg-secondary/20 text-secondary' :
                      colmena.estado === 'inactiva' ? 'bg-muted text-muted-foreground' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {colmena.estado}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => colmena.id && handleDeleteColmena(colmena.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actividades Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-secondary" />
              Actividades Recientes
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowActividadForm(!showActividadForm)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Registrar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add actividad form */}
          {showActividadForm && (
            <form onSubmit={handleAddActividad} className="p-3 bg-muted/50 rounded-lg space-y-3">
              <div className="space-y-2">
                <Label>Tipo de actividad</Label>
                <Select value={actividadTipo} onValueChange={(v) => setActividadTipo(v as Actividad['tipo'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revision">Revisión</SelectItem>
                    <SelectItem value="cosecha">Cosecha</SelectItem>
                    <SelectItem value="alimentacion">Alimentación</SelectItem>
                    <SelectItem value="tratamiento">Tratamiento</SelectItem>
                    <SelectItem value="otra">Otra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  placeholder="Describe la actividad realizada..."
                  value={actividadDesc}
                  onChange={(e) => setActividadDesc(e.target.value)}
                  required
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  size="sm" 
                  className="bg-secondary hover:bg-secondary/90"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowActividadForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {/* Actividades list */}
          {actividades.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay actividades registradas
            </p>
          ) : (
            <div className="space-y-2">
              {actividades.map((actividad) => (
                <div 
                  key={actividad.id} 
                  className="p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-secondary">
                      {tipoActividadLabels[actividad.tipo]}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {actividad.fecha?.toDate?.().toLocaleDateString('es-CO') || 'Sin fecha'}
                    </span>
                  </div>
                  <p className="text-sm">{actividad.descripcion}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
