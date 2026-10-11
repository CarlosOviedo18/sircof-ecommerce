import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Lista recursivamente las imágenes png/jpg/jpeg de un directorio
function findImages(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return findImages(fullPath)
    return /\.(png|jpe?g)$/i.test(entry.name) ? [fullPath] : []
  })
}

async function convertImages() {
  try {
    console.log(' Iniciando conversión de imágenes a WebP...')

    // Crea carpeta si no existe
    const webpDir = path.join(__dirname, 'src/assets/webp')
    if (!fs.existsSync(webpDir)) {
      fs.mkdirSync(webpDir, { recursive: true })
      console.log(` Carpeta creada: src/assets/webp`)
    }

    // ✅ Busca imágenes en src/assets/img/
    const files = findImages(path.join(__dirname, 'src/assets/img'))

    for (const file of files) {
      const filename = `${path.parse(file).name}.webp`
      await sharp(file)
        .webp({ quality: 80, alphaQuality: 100 })
        .toFile(path.join(webpDir, filename))
      console.log(`   ✓ ${filename}`)
    }

    if (files.length > 0) {
      console.log(` ${files.length} imágenes convertidas a WebP`)
    } else {
      console.log(' No se encontraron imágenes para convertir')
    }

  } catch (error) {
    console.error(' Error en conversión:', error.message)
    process.exit(1)
  }
}

convertImages()
