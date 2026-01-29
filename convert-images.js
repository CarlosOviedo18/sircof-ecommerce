import imagemin from 'imagemin'
import imageminWebp from 'imagemin-webp'
import imageminMozjpeg from 'imagemin-mozjpeg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
    const files = await imagemin(['src/assets/img/**/*.{png,jpg,jpeg}'], {
      destination: webpDir,
      plugins: [
        imageminWebp({
          quality: 80,
          alphaQuality: 100
        }),
        imageminMozjpeg({
          quality: 80
        })
      ]
    })

    if (files.length > 0) {
      console.log(` ${files.length} imágenes convertidas a WebP`)
      files.forEach(file => {
        const filename = typeof file === 'string' ? path.basename(file) : file.path || 'imagen.webp'
        console.log(`   ✓ ${filename}`)
      })
    } else {
      console.log(' No se encontraron imágenes para convertir')
    }

  } catch (error) {
    console.error(' Error en conversión:', error.message)
    process.exit(1)
  }
}

convertImages()

