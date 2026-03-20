import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import gsap from 'gsap'

// ===== Responsive helpers =====
const isMobile = () => window.innerWidth < 768
const isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1024
const isSmallMobile = () => window.innerWidth < 480

const getResponsiveFactor = () => {
  const w = window.innerWidth
  if (w < 480) return 0.65   // Mucho más grande en móvil
  if (w < 768) return 0.75   // Visible en tablet pequeña
  if (w < 1024) return 0.85
  return 1
}

// Posiciones del modelo 3D según la sección visible
// En móvil: centrado y más cerca de la cámara para que se vea bien
const getPositions = () => {
  const f = getResponsiveFactor()
  const mobile = isMobile()
  const smallMobile = isSmallMobile()

  if (smallMobile) {
    // ── Teléfonos pequeños (<480px) ──
    // Solo visible en banner, desaparece en el resto
    const hidden = { position: { x: 0, y: 5, z: -10 }, rotation: { x: 0, y: 0, z: 0 }, scale: 0 }
    return [
      {
        id: 'banner',
        position: { x: 0, y: -0.3, z: 1 },
        rotation: { x: 0.1, y: 0, z: 0 },
        scale: 0.75,
      },
      { id: 'intro', ...hidden },
      { id: 'description', ...hidden },
      { id: 'global', ...hidden },
      { id: 'mission', ...hidden },
      {
        id: 'contact',
        position: { x: 0, y: -0.2, z: 1 },
        rotation: { x: 0.1, y: 0, z: 0 },
        scale: 0.75,
      },
    ]
  }

  if (mobile) {
    // ── Móviles medianos (480-767px) ──
    // Solo visible en banner, desaparece en el resto
    const hidden = { position: { x: 0, y: 5, z: -10 }, rotation: { x: 0, y: 0, z: 0 }, scale: 0 }
    return [
      {
        id: 'banner',
        position: { x: 0, y: -0.3, z: 0.5 },
        rotation: { x: 0.1, y: 0, z: 0 },
        scale: 0.85,
      },
      { id: 'intro', ...hidden },
      { id: 'description', ...hidden },
      { id: 'global', ...hidden },
      { id: 'mission', ...hidden },
      {
        id: 'contact',
        position: { x: 0, y: -0.2, z: 0.5 },
        rotation: { x: 0.1, y: 0, z: 0 },
        scale: 0.85,
      },
    ]
  }

  if (isTablet()) {
    // ── iPad / Tablet (768-1023px) ──
    // Igual que móvil: visible en banner, oculto en el resto y visible en contacto.
    const hidden = { position: { x: 0, y: 5, z: -10 }, rotation: { x: 0, y: 0, z: 0 }, scale: 0 }
    return [
      {
        id: 'banner',
        position: { x: 0, y: -0.3, z: 0.3 },
        rotation: { x: 0.1, y: 0, z: 0 },
        scale: 0.9,
      },
      { id: 'intro', ...hidden },
      { id: 'description', ...hidden },
      { id: 'global', ...hidden },
      { id: 'mission', ...hidden },
      {
        id: 'contact',
        position: { x: 0, y: -0.2, z: 0.3 },
        rotation: { x: 0.1, y: 0, z: 0 },
        scale: 0.9,
      },
    ]
  }

  // ── Desktop / Tablet grande ──
  return [
    {
      id: 'banner',
      position: { x: 0, y: -0.5 * f, z: 0 },
      rotation: { x: 0.1, y: 0, z: 0 },
      scale: f * 1.1,
    },
    {
      id: 'intro',
      position: { x: 1.5 * f, y: -0.5 * f, z: -2 * f },
      rotation: { x: 0.5, y: -1, z: 0.3 },
      scale: f * 0.9,
    },
    {
      id: 'description',
      position: { x: -1.5 * f, y: -0.5 * f, z: -2 * f },
      rotation: { x: 0.4, y: 1, z: -0.3 },
      scale: f * 0.9,
    },
    {
      id: 'global',
      position: { x: 1.2 * f, y: -0.5 * f, z: -1.5 * f },
      rotation: { x: 0.3, y: -0.8, z: 0.15 },
      scale: f * 0.9,
    },
    {
      id: 'mission',
      position: { x: 2.2 * f, y: -0.3 * f, z: -1 * f },
      rotation: { x: 0.15, y: -0.9, z: 0.05 },
      scale: f * 0.85,
    },
    {
      id: 'contact',
      position: { x: 0, y: -0.4 * f, z: 0 },
      rotation: { x: 0.1, y: 0, z: 0 },
      scale: f * 1.1,
    },
  ]
}

/**
 * Componente que renderiza un modelo 3D GLB flotante
 * que se mueve al hacer scroll entre secciones.
 *
 * Usa RAF-throttled scroll + overwrite para que nunca se bugee.
 */
function CoffeeCup3D({ modelPath = '/models/sample.glb', sectionSelector = '.about-section' }) {
  const containerRef = useRef(null)
  const modelRef = useRef(null)
  const mixerRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const animFrameRef = useRef(null)
  const mountedRef = useRef(true)
  // Track last section to avoid redundant animations
  const lastSectionRef = useRef('')
  // RAF-based scroll throttle
  const scrollRafRef = useRef(null)
  const lastScrollYRef = useRef(0)
  const forcedTabletHideRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    mountedRef.current = true
    lastSectionRef.current = ''
    lastScrollYRef.current = window.scrollY || 0
    forcedTabletHideRef.current = false

    // ─── Detectar sección actual y mover modelo ───
    const modelMove = () => {
      if (!modelRef.current || !mountedRef.current) return

      const sections = document.querySelectorAll(sectionSelector)
      let currentSection = ''

      // Buscar la sección más visible
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= window.innerHeight / 3) {
          currentSection = section.id
        }
      })

      // En iPad: ocultar apenas empieza el scroll hacia abajo (más rápido).
      const currentScrollY = window.scrollY || 0
      const isScrollingDown = currentScrollY > lastScrollYRef.current
      lastScrollYRef.current = currentScrollY
      if (isTablet() && isScrollingDown && currentScrollY > 6 && currentSection !== 'contact') {
        if (!forcedTabletHideRef.current) {
          const model = modelRef.current
          forcedTabletHideRef.current = true
          gsap.killTweensOf(model.position)
          gsap.killTweensOf(model.rotation)
          gsap.killTweensOf(model.scale)
          gsap.to(model.position, {
            x: 0,
            y: 5,
            z: -10,
            duration: 0.22,
            ease: 'power2.out',
            overwrite: true,
          })
          gsap.to(model.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.22,
            ease: 'power2.out',
            overwrite: true,
          })
        }
        return
      }

      // Si no cambió la sección, no hacer nada (evita animaciones redundantes)
      if (!currentSection || currentSection === lastSectionRef.current) return
      lastSectionRef.current = currentSection

      const positions = getPositions()
      const posIndex = positions.findIndex((val) => val.id === currentSection)
      if (posIndex < 0) return

      const coords = positions[posIndex]
      const model = modelRef.current
      if (currentSection === 'contact') forcedTabletHideRef.current = false

      // Matar cualquier animación anterior en este objeto antes de crear nuevas
      gsap.killTweensOf(model.position)
      gsap.killTweensOf(model.rotation)
      gsap.killTweensOf(model.scale)

      gsap.to(model.position, {
        x: coords.position.x,
        y: coords.position.y,
        z: coords.position.z,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: true,
      })
      gsap.to(model.rotation, {
        x: coords.rotation.x,
        y: coords.rotation.y,
        z: coords.rotation.z,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: true,
      })
      gsap.to(model.scale, {
        x: coords.scale,
        y: coords.scale,
        z: coords.scale,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: true,
      })
    }

    // ─── Escena ───
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // ─── Cámara ───
    // En móvil usar FOV más amplio para que el modelo se vea más grande
    const mobileFov = isMobile() ? 14 : 10
    const camera = new THREE.PerspectiveCamera(
      mobileFov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = isMobile() ? 10 : 13
    cameraRef.current = camera

    // ─── Renderer ───
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.5
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // ─── Iluminación ───
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5)
    scene.add(ambientLight)

    const topLight = new THREE.DirectionalLight(0xffffff, 2)
    topLight.position.set(500, 500, 500)
    scene.add(topLight)

    const bottomLight = new THREE.DirectionalLight(0xffffff, 1.5)
    bottomLight.position.set(-500, -500, 500)
    scene.add(bottomLight)

    // ─── Cargar modelo 3D ───
    const loader = new GLTFLoader()

    loader.load(
      modelPath,
      (gltf) => {
        if (!mountedRef.current) return

        const model = gltf.scene

        // Centrar el modelo basándose en su bounding box
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)

        // Wrapper para que las animaciones de posición funcionen
        const wrapper = new THREE.Group()
        wrapper.add(model)
        scene.add(wrapper)
        modelRef.current = wrapper

        const f = getResponsiveFactor()
        wrapper.scale.set(f, f, f)

        // Animaciones del modelo (si tiene)
        const mixer = new THREE.AnimationMixer(model)
        mixerRef.current = mixer
        if (gltf.animations.length > 0) {
          mixer.clipAction(gltf.animations[0]).play()
        }

        // Posicionar inmediatamente sin animación en la carga inicial
        const sections = document.querySelectorAll(sectionSelector)
        let currentSection = ''
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect()
          if (rect.top <= window.innerHeight / 3) {
            currentSection = section.id
          }
        })

        const positions = getPositions()
        const posIndex = positions.findIndex((val) => val.id === (currentSection || 'banner'))
        if (posIndex >= 0) {
          const coords = positions[posIndex]
          wrapper.position.set(coords.position.x, coords.position.y, coords.position.z)
          wrapper.rotation.set(coords.rotation.x, coords.rotation.y, coords.rotation.z)
          wrapper.scale.set(coords.scale, coords.scale, coords.scale)
          lastSectionRef.current = currentSection || 'banner'
        }
      },
      undefined,
      (error) => {
        console.error('[CoffeeCup3D] Error cargando modelo 3D:', error)
      }
    )

    // ─── Loop de renderizado ───
    const clock = new THREE.Clock()
    const animate = () => {
      if (!mountedRef.current) return
      animFrameRef.current = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      if (mixerRef.current) mixerRef.current.update(delta)
      renderer.render(scene, camera)
    }
    animate()

    // ─── Scroll (throttled con RAF — máximo 1 vez por frame) ───
    const handleScroll = () => {
      if (scrollRafRef.current) return // ya hay un frame pendiente
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null
        modelMove()
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    // ─── Resize ───
    const handleResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      // Forzar re-evaluación de sección al cambiar tamaño
      lastSectionRef.current = ''
      modelMove()
    }
    window.addEventListener('resize', handleResize)

    // ─── Cleanup ───
    return () => {
      mountedRef.current = false
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      // Matar todas las animaciones GSAP pendientes del modelo
      if (modelRef.current) {
        gsap.killTweensOf(modelRef.current.position)
        gsap.killTweensOf(modelRef.current.rotation)
        gsap.killTweensOf(modelRef.current.scale)
      }
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
          materials.forEach((m) => {
            if (m.map) m.map.dispose()
            m.dispose()
          })
        }
      })
    }
  }, [modelPath, sectionSelector])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 10,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    />
  )
}

export default CoffeeCup3D