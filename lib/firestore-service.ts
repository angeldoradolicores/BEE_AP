import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

// ==================== TIPOS ====================

export interface Apiario {
  id?: string
  nombre: string
  ubicacion: string
  latitud: number
  longitud: number
  userId: string
  fecha_creacion: Timestamp
  colmenas_count?: number
}

export interface Colmena {
  id?: string
  nombre: string
  apiarioId: string
  tipo: 'langstroth' | 'dadant' | 'warre' | 'top-bar'
  estado: 'activa' | 'inactiva' | 'en_revision'
  fecha_instalacion: Timestamp
  userId: string
  notas?: string
}

export interface Actividad {
  id?: string
  apiarioId: string
  colmenaId?: string
  tipo: 'revision' | 'cosecha' | 'alimentacion' | 'tratamiento' | 'otra'
  descripcion: string
  fecha: Timestamp
  userId: string
}

export interface PlantaUsuario {
  id?: string
  nombre_cientifico: string
  nombre_comun: string
  familia: string
  tipo: 'arbol' | 'arbusto' | 'hierba' | 'cultivo'
  color_flor: string
  floracion_inicio?: number // mes 1-12
  floracion_fin?: number // mes 1-12
  floracion_por_mes?: ('alto' | 'medio' | 'bajo')[]
  nectar: 'alto' | 'medio' | 'bajo'
  polen: 'alto' | 'medio' | 'bajo'
  frecuencia_visita: 'alta' | 'media' | 'baja'
  descripcion?: string
  imagen_url?: string
  userId: string
  fecha_creacion: Timestamp
}

// ==================== APIARIOS ====================

export async function crearApiario(data: Omit<Apiario, 'id' | 'fecha_creacion'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'apiarios'), {
    ...data,
    fecha_creacion: serverTimestamp()
  })
  return docRef.id
}

export async function obtenerApiarios(userId: string): Promise<Apiario[]> {
  const q = query(
    collection(db, 'apiarios'),
    where('userId', '==', userId),
    orderBy('fecha_creacion', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Apiario[]
}

export async function obtenerTodosLosApiarios(): Promise<Apiario[]> {
  const q = query(
    collection(db, 'apiarios'),
    orderBy('fecha_creacion', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Apiario[]
}

export async function obtenerApiario(id: string): Promise<Apiario | null> {
  const docRef = doc(db, 'apiarios', id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as Apiario
}

export async function actualizarApiario(id: string, data: Partial<Apiario>): Promise<void> {
  const docRef = doc(db, 'apiarios', id)
  await updateDoc(docRef, data)
}

export async function eliminarApiario(id: string): Promise<void> {
  const docRef = doc(db, 'apiarios', id)
  await deleteDoc(docRef)
}

// ==================== COLMENAS ====================

export async function crearColmena(data: Omit<Colmena, 'id' | 'fecha_instalacion'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'colmenas'), {
    ...data,
    fecha_instalacion: serverTimestamp()
  })
  return docRef.id
}

export async function obtenerColmenas(userId: string, apiarioId?: string): Promise<Colmena[]> {
  let q
  if (apiarioId) {
    q = query(
      collection(db, 'colmenas'),
      where('userId', '==', userId),
      where('apiarioId', '==', apiarioId),
      orderBy('fecha_instalacion', 'desc')
    )
  } else {
    q = query(
      collection(db, 'colmenas'),
      where('userId', '==', userId),
      orderBy('fecha_instalacion', 'desc')
    )
  }
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Colmena[]
}

export async function obtenerTodasLasColmenas(): Promise<Colmena[]> {
  const q = query(
    collection(db, 'colmenas'),
    orderBy('fecha_instalacion', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Colmena[]
}

export async function actualizarColmena(id: string, data: Partial<Colmena>): Promise<void> {
  const docRef = doc(db, 'colmenas', id)
  await updateDoc(docRef, data)
}

export async function eliminarColmena(id: string): Promise<void> {
  const docRef = doc(db, 'colmenas', id)
  await deleteDoc(docRef)
}

// ==================== ACTIVIDADES ====================

export async function crearActividad(data: Omit<Actividad, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'actividades'), data)
  return docRef.id
}

export async function obtenerActividades(userId: string, limit?: number): Promise<Actividad[]> {
  const q = query(
    collection(db, 'actividades'),
    where('userId', '==', userId),
    orderBy('fecha', 'desc')
  )
  const snapshot = await getDocs(q)
  const actividades = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Actividad[]
  
  return limit ? actividades.slice(0, limit) : actividades
}

export async function obtenerTodasLasActividades(): Promise<Actividad[]> {
  const q = query(
    collection(db, 'actividades'),
    orderBy('fecha', 'desc')
  )
  const snapshot = await getDocs(q)
  const actividades = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Actividad[]
  
  return actividades
}

export async function eliminarActividad(id: string): Promise<void> {
  const docRef = doc(db, 'actividades', id)
  await deleteDoc(docRef)
}

// ==================== PLANTAS USUARIO ====================

export async function crearPlantaUsuario(data: Omit<PlantaUsuario, 'id' | 'fecha_creacion'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'plantas_usuario'), {
    ...data,
    fecha_creacion: serverTimestamp()
  })
  return docRef.id
}

export async function obtenerPlantasUsuario(userId: string): Promise<PlantaUsuario[]> {
  const q = query(
    collection(db, 'plantas_usuario'),
    where('userId', '==', userId),
    orderBy('fecha_creacion', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as PlantaUsuario[]
}

export async function obtenerTodasLasPlantas(): Promise<PlantaUsuario[]> {
  const q = query(
    collection(db, 'plantas_usuario'),
    orderBy('fecha_creacion', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as PlantaUsuario[]
}

export async function obtenerPlantaUsuario(id: string): Promise<PlantaUsuario | null> {
  const docRef = doc(db, 'plantas_usuario', id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as PlantaUsuario
}

export async function actualizarPlantaUsuario(id: string, data: Partial<PlantaUsuario>): Promise<void> {
  const docRef = doc(db, 'plantas_usuario', id)
  await updateDoc(docRef, data)
}

export async function eliminarPlantaUsuario(id: string): Promise<void> {
  const docRef = doc(db, 'plantas_usuario', id)
  await deleteDoc(docRef)
}

// ==================== ESTADISTICAS ====================

export async function obtenerEstadisticas(userId: string): Promise<{
  totalApiarios: number
  totalColmenas: number
  totalActividades: number
  totalPlantas: number
}> {
  const [apiarios, colmenas, actividades, plantas] = await Promise.all([
    obtenerApiarios(userId),
    obtenerColmenas(userId),
    obtenerActividades(userId),
    obtenerPlantasUsuario(userId)
  ])

  return {
    totalApiarios: apiarios.length,
    totalColmenas: colmenas.length,
    totalActividades: actividades.length,
    totalPlantas: plantas.length
  }
}

export async function obtenerEstadisticasGlobales(): Promise<{
  totalApiarios: number
  totalColmenas: number
  totalActividades: number
  totalPlantas: number
}> {
  const [apiarios, colmenas, actividades, plantas] = await Promise.all([
    obtenerTodosLosApiarios(),
    obtenerTodasLasColmenas(),
    obtenerTodasLasActividades(),
    obtenerTodasLasPlantas()
  ])

  return {
    totalApiarios: apiarios.length,
    totalColmenas: colmenas.length,
    totalActividades: actividades.length,
    totalPlantas: plantas.length
  }
}
