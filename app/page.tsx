'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rol, setRol] = useState<'usuario' | 'apicultor'>('usuario')
  
  const { signIn, signUp, user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  if (!authLoading && user) {
    router.push('/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password, nombre, rol)
      }
      router.push('/dashboard')
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message.includes('invalid') 
            ? 'Correo o contraseña incorrectos'
            : err.message.includes('email-already-in-use')
            ? 'Este correo ya está registrado'
            : 'Error al iniciar sesión'
          : 'Error desconocido'
      )
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/20 to-background">
      {/* Header with logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Bee Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg 
              viewBox="0 0 100 100" 
              className="w-16 h-16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Honeycomb background */}
              <path 
                d="M50 10 L65 20 L65 40 L50 50 L35 40 L35 20 Z" 
                fill="#FCD34D" 
                stroke="#B45309" 
                strokeWidth="2"
              />
              {/* Bee body */}
              <ellipse cx="50" cy="60" rx="18" ry="22" fill="#FCD34D" stroke="#1F2937" strokeWidth="2"/>
              {/* Bee stripes */}
              <path d="M35 52 Q50 50 65 52" stroke="#1F2937" strokeWidth="3"/>
              <path d="M34 60 Q50 58 66 60" stroke="#1F2937" strokeWidth="3"/>
              <path d="M35 68 Q50 66 65 68" stroke="#1F2937" strokeWidth="3"/>
              {/* Bee head */}
              <circle cx="50" cy="38" r="10" fill="#1F2937"/>
              {/* Eyes */}
              <circle cx="46" cy="36" r="2" fill="white"/>
              <circle cx="54" cy="36" r="2" fill="white"/>
              {/* Wings */}
              <ellipse cx="30" cy="50" rx="12" ry="8" fill="white" fillOpacity="0.7" stroke="#9CA3AF" strokeWidth="1"/>
              <ellipse cx="70" cy="50" rx="12" ry="8" fill="white" fillOpacity="0.7" stroke="#9CA3AF" strokeWidth="1"/>
              {/* Antennae */}
              <path d="M45 30 Q42 22 38 18" stroke="#1F2937" strokeWidth="2" fill="none"/>
              <path d="M55 30 Q58 22 62 18" stroke="#1F2937" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Bee</h1>
          <p className="text-muted-foreground">Apicultura inteligente</p>
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-sm shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl">
              {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Ingresa tus credenciales para acceder' 
                : 'Completa los datos para registrarte'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tipo de cuenta</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRol('usuario')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          rol === 'usuario' 
                            ? 'border-secondary bg-secondary/10' 
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span className="text-sm font-medium">Usuario</span>
                          <span className="text-xs text-muted-foreground">Solo consulta</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRol('apicultor')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          rol === 'apicultor' 
                            ? 'border-secondary bg-secondary/10' 
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <svg viewBox="0 0 24 24" className="w-6 h-6">
                            <ellipse cx="12" cy="14" rx="5" ry="6" fill="#FCD34D" stroke="#1F2937" strokeWidth="1"/>
                            <path d="M8 12 Q12 11 16 12" stroke="#1F2937" strokeWidth="1.5"/>
                            <path d="M8 15 Q12 14 16 15" stroke="#1F2937" strokeWidth="1.5"/>
                            <circle cx="12" cy="8" r="3" fill="#1F2937"/>
                          </svg>
                          <span className="text-sm font-medium">Apicultor</span>
                          <span className="text-xs text-muted-foreground">Gestiona plantas</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isLogin ? 'Iniciar sesión' : 'Registrarse'}
              </Button>

              {isLogin && (
                <button
                  type="button"
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              </span>{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
                className="text-secondary font-medium hover:underline"
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decorative flowers at bottom */}
      <div className="h-20 bg-gradient-to-t from-primary/30 to-transparent flex items-end justify-center pb-4">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="w-3 h-3 rounded-full bg-primary/60"
              style={{ transform: `translateY(${Math.sin(i) * 4}px)` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
