import useSWR from 'swr'

interface WeatherData {
  temperatura: number
  humedad: number
  viento: number
  condicion: string
  descripcion: string
  icono: string
  ciudad: string
  pais: string
}

interface OpenWeatherResponse {
  main: {
    temp: number
    humidity: number
  }
  wind: {
    speed: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  name: string
  sys: {
    country: string
  }
}

const fetcher = async (url: string): Promise<WeatherData> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Error al obtener el clima')
  }
  const data: OpenWeatherResponse = await res.json()
  
  return {
    temperatura: Math.round(data.main.temp),
    humedad: data.main.humidity,
    viento: Math.round(data.wind.speed * 3.6), // Convertir m/s a km/h
    condicion: data.weather[0].main,
    descripcion: data.weather[0].description,
    icono: data.weather[0].icon,
    ciudad: data.name,
    pais: data.sys.country,
  }
}

export function useWeather(lat: number, lon: number) {
  const apiKey = "3176cf1653eca95de8cf2d32691dce06"
  
  const { data, error, isLoading, mutate } = useSWR<WeatherData>(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`,
    fetcher,
    {
      refreshInterval: 600000, // Refrescar cada 10 minutos
      revalidateOnFocus: false,
    }
  )

  return {
    weather: data,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

// Coordenadas de Botana, Pasto, Nariño, Colombia
export const BOTANA_COORDS = {
  lat: 1.1924,
  lon: -77.2856,
  nombre: 'Botana, Pasto, Nariño'
}

// Otras ciudades de Nariño para selección
export const CIUDADES_NARINO = [
  { nombre: 'Botana, Pasto', lat: 1.1924, lon: -77.2856 },
  { nombre: 'Pasto', lat: 1.2136, lon: -77.2811 },
  { nombre: 'Ipiales', lat: 0.8281, lon: -77.6456 },
  { nombre: 'Tumaco', lat: 1.7986, lon: -78.7644 },
  { nombre: 'La Unión', lat: 1.6028, lon: -77.1369 },
]

// Traducción de condiciones climáticas
export const traducirCondicion = (condicion: string): string => {
  const traducciones: Record<string, string> = {
    'Clear': 'Despejado',
    'Clouds': 'Nublado',
    'Rain': 'Lluvia',
    'Drizzle': 'Llovizna',
    'Thunderstorm': 'Tormenta',
    'Snow': 'Nieve',
    'Mist': 'Neblina',
    'Fog': 'Niebla',
    'Haze': 'Calima',
  }
  return traducciones[condicion] || condicion
}

// Evaluar condiciones para las abejas
export function evaluarCondicionesAbejas(weather: WeatherData | undefined): {
  nivel: 'alta' | 'media' | 'baja'
  mensaje: string
} {
  if (!weather) {
    return { nivel: 'media', mensaje: 'Cargando datos del clima...' }
  }

  const { temperatura, humedad, condicion } = weather
  let score = 0

  // Temperatura ideal: 20-30°C
  if (temperatura >= 20 && temperatura <= 30) score += 2
  else if (temperatura >= 15 && temperatura <= 35) score += 1

  // Humedad ideal: 50-80%
  if (humedad >= 50 && humedad <= 80) score += 2
  else if (humedad >= 30 && humedad <= 90) score += 1

  // Condiciones ideales: despejado o parcialmente nublado
  const condicionesOptimas = ['Clear', 'Clouds']
  const condicionesMalas = ['Rain', 'Thunderstorm', 'Snow', 'Drizzle']
  
  if (condicionesOptimas.includes(condicion)) score += 2
  else if (condicionesMalas.includes(condicion)) score -= 1

  if (score >= 5) {
    return { nivel: 'alta', mensaje: 'Condiciones favorables para la actividad de las abejas' }
  } else if (score >= 3) {
    return { nivel: 'media', mensaje: 'Condiciones moderadas para las abejas' }
  } else {
    return { nivel: 'baja', mensaje: 'Condiciones no favorables para las abejas' }
  }
}
