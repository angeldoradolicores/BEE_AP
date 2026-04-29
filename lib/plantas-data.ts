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
  {
    id: 'rubus-l',
    nombreCientifico: 'Rubus L.',
    nombreComun: 'Mora sin espinas',
    familia: 'Rosaceae',
    colorFlor: 'Blanca',
    recompensa: 'N',
    estratificacion: 'Cultivo',
    frecuenciaVisita: 'media',
    mesInicio: 3,
    mesFin: 6,
    nectar: 'Alto',
    polen: 'Medio',
    descripcion: 'Planta cultivada que produce excelente néctar para las abejas durante la primavera.',
    imagenUrl: '/plantas/mora.jpg'
  },
  {
    id: 'rubus-bogotensis',
    nombreCientifico: 'Rubus bogotensis Kunth.',
    nombreComun: 'Mora silvestre',
    familia: 'Rosaceae',
    colorFlor: 'Blanca',
    recompensa: 'N',
    estratificacion: 'Arbusto',
    frecuenciaVisita: 'media',
    mesInicio: 2,
    mesFin: 5,
    nectar: 'Alto',
    polen: 'Medio',
    descripcion: 'Variedad silvestre que crece en bordes de caminos y zonas húmedas.',
    imagenUrl: '/plantas/mora-silvestre.jpg'
  },
  {
    id: 'rumex-crispus',
    nombreCientifico: 'Rumex crispus L.',
    nombreComun: 'Lengua de vaca',
    familia: 'Polygonaceae',
    colorFlor: 'Verde',
    recompensa: 'P/N',
    estratificacion: 'Arvense',
    frecuenciaVisita: 'baja',
    mesInicio: 4,
    mesFin: 8,
    nectar: 'Bajo',
    polen: 'Medio',
    descripcion: 'Planta arvense común en pastizales, proporciona polen y néctar moderado.',
    imagenUrl: '/plantas/lengua-vaca.jpg'
  },
  {
    id: 'sambucus-nigra',
    nombreCientifico: 'Sambucus nigra L.',
    nombreComun: 'Sauco blanco',
    familia: 'Adoxaceae',
    colorFlor: 'Blanca',
    recompensa: 'P/N',
    estratificacion: 'Árbol',
    frecuenciaVisita: 'media',
    mesInicio: 4,
    mesFin: 6,
    nectar: 'Alto',
    polen: 'Alto',
    descripcion: 'Árbol muy visitado por las abejas, excelente fuente de néctar y polen.',
    imagenUrl: '/plantas/sauco.jpg'
  },
  {
    id: 'solanum-nigrescens',
    nombreCientifico: 'Solanum nigrescens',
    nombreComun: 'Hierba mora',
    familia: 'Solanaceae',
    colorFlor: 'Blanca',
    recompensa: 'P/N',
    estratificacion: 'Arvense',
    frecuenciaVisita: 'baja',
    mesInicio: 1,
    mesFin: 12,
    nectar: 'Medio',
    polen: 'Medio',
    descripcion: 'Planta arvense de floración continua durante todo el año.',
    imagenUrl: '/plantas/hierba-mora.jpg'
  },
  {
    id: 'solanum-phureja',
    nombreCientifico: 'Solanum phureja Juz. & Bukasov',
    nombreComun: 'Papa amarilla',
    familia: 'Solanaceae',
    colorFlor: 'Blanca',
    recompensa: 'P',
    estratificacion: 'Cultivo',
    frecuenciaVisita: 'baja',
    mesInicio: 3,
    mesFin: 5,
    nectar: 'Bajo',
    polen: 'Alto',
    descripcion: 'Cultivo tradicional que aporta principalmente polen a las colmenas.',
    imagenUrl: '/plantas/papa.jpg'
  },
  {
    id: 'taraxacum-officinale',
    nombreCientifico: 'Taraxacum officinale L.',
    nombreComun: 'Diente de león',
    familia: 'Asteraceae',
    colorFlor: 'Amarillo',
    recompensa: 'P/N',
    estratificacion: 'Arvense',
    frecuenciaVisita: 'media',
    mesInicio: 1,
    mesFin: 12,
    nectar: 'Alto',
    polen: 'Alto',
    descripcion: 'Una de las principales fuentes de alimento para las abejas durante todo el año.',
    imagenUrl: '/plantas/diente-leon.jpg'
  },
  {
    id: 'tibouchina-mollis',
    nombreCientifico: 'Tibouchina mollis',
    nombreComun: 'Flor de mayo',
    familia: 'Melastomataceae',
    colorFlor: 'Violeta',
    recompensa: 'P',
    estratificacion: 'Arbusto',
    frecuenciaVisita: 'media',
    mesInicio: 5,
    mesFin: 6,
    nectar: 'Bajo',
    polen: 'Alto',
    descripcion: 'Arbusto ornamental que florece principalmente en mayo, importante fuente de polen.',
    imagenUrl: '/plantas/flor-mayo.jpg'
  },
  {
    id: 'tecoma-stans',
    nombreCientifico: 'Tecoma stans (L.) Juss.',
    nombreComun: 'Quillotocto',
    familia: 'Bignoniaceae',
    colorFlor: 'Amarillo',
    recompensa: 'P/N',
    estratificacion: 'Árbol',
    frecuenciaVisita: 'baja',
    mesInicio: 6,
    mesFin: 9,
    nectar: 'Alto',
    polen: 'Medio',
    descripcion: 'Árbol de flores amarillas muy atractivo para polinizadores.',
    imagenUrl: '/plantas/quillotocto.jpg'
  },
  {
    id: 'trifolium-pratense',
    nombreCientifico: 'Trifolium pratense L.',
    nombreComun: 'Trébol rojo',
    familia: 'Fabaceae',
    colorFlor: 'Rosado',
    recompensa: 'P/N',
    estratificacion: 'Cultivo',
    frecuenciaVisita: 'media',
    mesInicio: 3,
    mesFin: 7,
    nectar: 'Alto',
    polen: 'Alto',
    descripcion: 'Excelente planta forrajera y melífera, muy visitada por las abejas.',
    imagenUrl: '/plantas/trebol-rojo.jpg'
  },
  {
    id: 'trifolium-repens',
    nombreCientifico: 'Trifolium repens L.',
    nombreComun: 'Trébol blanco',
    familia: 'Fabaceae',
    colorFlor: 'Blanco',
    recompensa: 'P/N',
    estratificacion: 'Arvense',
    frecuenciaVisita: 'media',
    mesInicio: 4,
    mesFin: 6,
    nectar: 'Alto',
    polen: 'Alto',
    descripcion: 'Planta rastrera muy común en pastizales, fuente constante de néctar.',
    imagenUrl: '/plantas/trebol-blanco.jpg'
  },
  {
    id: 'verbesina-arborea',
    nombreCientifico: 'Verbesina arbórea',
    nombreComun: 'Colla Blanca',
    familia: 'Asteraceae',
    colorFlor: 'Blanca',
    recompensa: 'P/N',
    estratificacion: 'Arbusto',
    frecuenciaVisita: 'media',
    mesInicio: 5,
    mesFin: 8,
    nectar: 'Alto',
    polen: 'Alto',
    descripcion: 'Arbusto nativo con abundante floración blanca.',
    imagenUrl: '/plantas/colla-blanca.jpg'
  },
  {
    id: 'verbena-litoralis',
    nombreCientifico: 'Verbena litoralis Kunth',
    nombreComun: 'Verbena',
    familia: 'Verbenaceae',
    colorFlor: 'Morado',
    recompensa: 'N',
    estratificacion: 'Arvense',
    frecuenciaVisita: 'media',
    mesInicio: 1,
    mesFin: 12,
    nectar: 'Medio',
    polen: 'Bajo',
    descripcion: 'Planta herbácea de floración prolongada durante todo el año.',
    imagenUrl: '/plantas/verbena.jpg'
  },
  {
    id: 'wedelia-latifolia',
    nombreCientifico: 'Wedelia latifolia DC.',
    nombreComun: 'Botoncillo',
    familia: 'Asteraceae',
    colorFlor: 'Amarilla',
    recompensa: 'P',
    estratificacion: 'Arbusto',
    frecuenciaVisita: 'media',
    mesInicio: 6,
    mesFin: 9,
    nectar: 'Medio',
    polen: 'Alto',
    descripcion: 'Arbusto de flores amarillas, importante fuente de polen.',
    imagenUrl: '/plantas/botoncillo.jpg'
  },
  {
    id: 'zantedeschia-aethiopica',
    nombreCientifico: 'Zantedeschia aethiopica',
    nombreComun: 'Cartucho',
    familia: 'Araceae',
    colorFlor: 'Blanca',
    recompensa: 'P/N',
    estratificacion: 'Cultivo',
    frecuenciaVisita: 'baja',
    mesInicio: 3,
    mesFin: 6,
    nectar: 'Medio',
    polen: 'Alto',
    descripcion: 'Planta ornamental cultivada en zonas húmedas.',
    imagenUrl: '/plantas/cartucho.jpg'
  },
  {
    id: 'zea-mays',
    nombreCientifico: 'Zea mays L.',
    nombreComun: 'Maíz',
    familia: 'Poaceae',
    colorFlor: 'Verde',
    recompensa: 'P',
    estratificacion: 'Cultivo',
    frecuenciaVisita: 'media',
    mesInicio: 3,
    mesFin: 8,
    nectar: 'Bajo',
    polen: 'Alto',
    descripcion: 'Cultivo principal que aporta gran cantidad de polen a las colmenas.',
    imagenUrl: '/plantas/maiz.jpg'
  },
  {
    id: 'acacia',
    nombreCientifico: 'Acacia spp.',
    nombreComun: 'Acacia',
    familia: 'Fabaceae',
    colorFlor: 'Blanca',
    recompensa: 'P/N',
    estratificacion: 'Árbol',
    frecuenciaVisita: 'alta',
    mesInicio: 4,
    mesFin: 6,
    nectar: 'Alto',
    polen: 'Alto',
    descripcion: 'Árbol de floración abundante, excelente fuente de néctar para producción de miel.',
    imagenUrl: '/plantas/acacia.jpg'
  },
  {
    id: 'romero',
    nombreCientifico: 'Rosmarinus officinalis',
    nombreComun: 'Romero',
    familia: 'Lamiaceae',
    colorFlor: 'Azul',
    recompensa: 'P/N',
    estratificacion: 'Arbusto',
    frecuenciaVisita: 'alta',
    mesInicio: 3,
    mesFin: 5,
    nectar: 'Alto',
    polen: 'Medio',
    descripcion: 'Arbusto aromático muy atractivo para las abejas, produce miel de excelente calidad.',
    imagenUrl: '/plantas/romero.jpg'
  },
  {
    id: 'girasol',
    nombreCientifico: 'Helianthus annuus',
    nombreComun: 'Girasol',
    familia: 'Asteraceae',
    colorFlor: 'Amarillo',
    recompensa: 'P/N',
    estratificacion: 'Cultivo',
    frecuenciaVisita: 'alta',
    mesInicio: 5,
    mesFin: 7,
    nectar: 'Alto',
    polen: 'Alto',
    descripcion: 'Cultivo de alta producción de néctar y polen, muy visitado por las abejas.',
    imagenUrl: '/plantas/girasol.jpg'
  },
  {
    id: 'naranja',
    nombreCientifico: 'Citrus sinensis',
    nombreComun: 'Naranja',
    familia: 'Rutaceae',
    colorFlor: 'Blanca',
    recompensa: 'N',
    estratificacion: 'Árbol',
    frecuenciaVisita: 'alta',
    mesInicio: 8,
    mesFin: 10,
    nectar: 'Alto',
    polen: 'Medio',
    descripcion: 'Cítrico cuyas flores producen néctar aromático para miel de azahar.',
    imagenUrl: '/plantas/naranja.jpg'
  }
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
