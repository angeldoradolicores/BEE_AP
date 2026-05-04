/**
 * Convierte un archivo a Base64 para almacenamiento en Firestore
 * @param file Archivo de imagen
 * @returns Base64 string del archivo
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Guarda imagen como Base64 en Firestore (alternativa a Firebase Storage)
 * @param file Archivo de imagen
 * @returns Base64 string o null si hay error
 */
export async function uploadPlantImage(userId: string, file: File): Promise<string | null> {
  try {
    // Validar tamaño de archivo (máximo 5MB para Firestore)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.error('Archivo muy grande. Máximo 5MB.')
      return null
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      console.error('El archivo debe ser una imagen.')
      return null
    }

    console.log('Convirtiendo imagen a Base64...')
    const base64String = await fileToBase64(file)
    console.log('Imagen convertida a Base64 exitosamente')
    return base64String
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error procesando imagen:', errorMessage)
    return null
  }
}

