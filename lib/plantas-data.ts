export interface PlantaMelifera {
  id: string
  nombreCientifico: string
  nombreComun: string
  familia: string
  colorFlor: string
  recompensa: 'N' | 'P' | 'P/N' // Néctar, Polen, Ambos
  estratificacion: 'Arvense' | 'Cultivo' | 'Arbusto' | 'Árbol'
  frecuenciaVisita: 'baja' | 'media' | 'alta'
  mesInicio: number // 1-12
  mesFin: number // 1-12
  nectar: 'Alto' | 'Medio' | 'Bajo'
  polen: 'Alto' | 'Medio' | 'Bajo'
  descripcion: string
  imagenUrl?: string
}

// Datos de las plantas de la tabla proporcionada
export const plantasMeliferas: PlantaMelifera[] = [
]

// Función para determinar disponibilidad según el mes actual
export function getDisponibilidadPorMes(planta: PlantaMelifera, mesActual: number): 'alta' | 'media' | 'baja' {
  const { mesInicio, mesFin } = planta
  
  // Manejar rangos que cruzan el año (ej: Nov-Feb)
  let enRango = false
  if (mesInicio <= mesFin) {
    enRango = mesActual >= mesInicio && mesActual <= mesFin
  } else {
    enRango = mesActual >= mesInicio || mesActual <= mesFin
  }
  
  if (enRango) {
    return 'alta'
  }
  
  // Calcular si está a ±1 mes del rango
  const distanciaInicio = Math.min(
    Math.abs(mesActual - mesInicio),
    12 - Math.abs(mesActual - mesInicio)
  )
  const distanciaFin = Math.min(
    Math.abs(mesActual - mesFin),
    12 - Math.abs(mesActual - mesFin)
  )
  
  if (distanciaInicio <= 1 || distanciaFin <= 1) {
    return 'media'
  }
  
  return 'baja'
}

// Función para ajustar disponibilidad según clima
export function ajustarPorClima(
  disponibilidadBase: 'alta' | 'media' | 'baja',
  temperatura: number,
  humedad: number,
  condicion: string
): 'alta' | 'media' | 'baja' {
  let score = disponibilidadBase === 'alta' ? 3 : disponibilidadBase === 'media' ? 2 : 1
  
  // Temperatura óptima: 20-30°C
  if (temperatura >= 20 && temperatura <= 30) {
    score += 0.5
  } else if (temperatura < 15 || temperatura > 35) {
    score -= 1
  }
  
  // Humedad óptima: >50%
  if (humedad > 50) {
    score += 0.5
  } else if (humedad < 30) {
    score -= 0.5
  }
  
  // Condición climática
  const condicionLower = condicion.toLowerCase()
  if (condicionLower.includes('lluvia fuerte') || condicionLower.includes('tormenta') || condicionLower.includes('nieve')) {
    score -= 1.5
  } else if (condicionLower.includes('lluvia') || condicionLower.includes('llovizna')) {
    score -= 0.5
  }
  
  if (score >= 2.5) return 'alta'
  if (score >= 1.5) return 'media'
  return 'baja'
}

// Meses en español
export const mesesEspanol = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export const mesesCortos = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]
