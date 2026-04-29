'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  User, 
  Settings, 
  HelpCircle, 
  Info, 
  LogOut, 
  ChevronRight,
  Bell,
  Palette,
  Shield,
  Flower2,
  PlusCircle,
  BarChart3,
  Home,
  Hexagon
} from 'lucide-react'
import Link from 'next/link'

const menuItems = [
  { icon: User, label: 'Mi perfil', href: '#' },
  { icon: Bell, label: 'Notificaciones', href: '#' },
  { icon: Palette, label: 'Apariencia', href: '#' },
  { icon: Shield, label: 'Privacidad', href: '#' },
  { icon: Settings, label: 'Configuración', href: '#' },
  { icon: HelpCircle, label: 'Ayuda y soporte', href: '#' },
  { icon: Info, label: 'Acerca de', href: '#' },
]

export default function MasPage() {
  const { userData, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const initials = userData?.nombre
    ? userData.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AP'

  return (
    <div className="p-4 space-y-4">
      {/* User profile card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 bg-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{userData?.nombre || 'Usuario'}</h2>
              <p className="text-sm text-muted-foreground">{userData?.correo}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full capitalize ${
                userData?.rol === 'apicultor' 
                  ? 'bg-secondary/20 text-secondary' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {userData?.rol === 'apicultor' ? 'Apicultor' : 'Usuario'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apicultor Admin Section - Only visible for apicultores */}
      {userData?.rol === 'apicultor' && (
        <Card className="border-secondary/50 bg-secondary/5">
          <CardContent className="p-4">
            <h3 className="font-semibold text-secondary mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Gestión de Apicultor
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/apiarios"
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors border"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-center">Mis Apiarios</span>
              </Link>
              <Link
                href="/dashboard/plantas"
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors border"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Flower2 className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-sm font-medium text-center">Mis Plantas</span>
              </Link>
              <Link
                href="/dashboard/apiarios/nuevo"
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors border"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <PlusCircle className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-center">Nuevo Apiario</span>
              </Link>
              <Link
                href="/dashboard/plantas/nueva"
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors border"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <PlusCircle className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-sm font-medium text-center">Nueva Planta</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu items */}
      <Card>
        <CardContent className="p-0">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left ${
                  index !== menuItems.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            )
          })}
        </CardContent>
      </Card>

      {/* Sign out button */}
      <Button 
        variant="outline" 
        className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Cerrar sesión
      </Button>

      {/* App info */}
      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>Bee - Apicultura Inteligente</p>
        <p>Versión 1.0.0</p>
      </div>
    </div>
  )
}
