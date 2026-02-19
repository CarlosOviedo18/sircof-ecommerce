import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import gsap from 'gsap'

// ===== Responsive helpers =====
const getResponsiveFactor = () => {
  const w = window.innerWidth
  if (w < 480) return 0.35
  if (w < 768) return 0.5
  if (w < 1024) return 0.75
  return 1
}

// Posiciones del modelo 3D según la sección visible
const getPositions = () => {
  const f = getResponsiveFactor()
  return [
    {
      id: 'banner',
      position: { x: 0, y: -0.5 * f, z: 0 },
      rotation: { x: 0.1, y: 1.5, z: 0.2 },
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
      position: { x: 2 * f, y: -0.4 * f, z: -2 * f },
      rotation: { x: 0.2, y: 1.2, z: 0 },
      scale: f * 0.7,
    },
    {
      id: 'contact',
      position: { x: 0, y: -0.6 * f, z: -1 * f },
      rotation: { x: 0.3, y: -0.6, z: 0.1 },
      scale: f * 1,
    },
  ]
}

/**
 * Componente que renderiza un modelo 3D GLB flotante
 * que se mueve al hacer scroll entre secciones.
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

  const modelMove = useCallback(() => {
    const sections = document.querySelectorAll(sectionSelector)
    let currentSection = ''
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect()
      if (rect.top <= window.innerHeight / 3) {
        currentSection = section.id
      }
    })

    const positions = getPositions()
    const posIndex = positions.findIndex((val) => val.id === currentSection)

    if (posIndex >= 0 && modelRef.current) {
      const coords = positions[posIndex]
      gsap.to(modelRef.current.position, {
        x: coords.position.x,
        y: coords.position.y,
        z: coords.position.z,
        duration: 1.5,
        ease: 'power3.inOut',
      })
      gsap.to(modelRef.current.rotation, {
        x: coords.rotation.x,
        y: coords.rotation.y,
        z: coords.rotation.z,
        duration: 1.5,
        ease: 'power3.inOut',
      })
      gsap.to(modelRef.current.scale, {
        x: coords.scale,
        y: coords.scale,
        z: coords.scale,
        duration: 1.5,
        ease: 'power3.inOut',
      })
    }
  }, [sectionSelector])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    mountedRef.current = true

    // Escena
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Cámara
    const camera = new THREE.PerspectiveCamera(
      10,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 13
    cameraRef.current = camera

    // Renderer - compatible con Three.js 0.183+
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.5
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5)
    scene.add(ambientLight)

    const topLight = new THREE.DirectionalLight(0xffffff, 2)
    topLight.position.set(500, 500, 500)
    scene.add(topLight)

    const bottomLight = new THREE.DirectionalLight(0xffffff, 1.5)
    bottomLight.position.set(-500, -500, 500)
    scene.add(bottomLight)

    // Cargar modelo 3D
    const loader = new GLTFLoader()
    console.log('[CoffeeCup3D] Cargando modelo desde:', modelPath)

    loader.load(
      modelPath,
      (gltf) => {
        if (!mountedRef.current) return

        const model = gltf.scene
        console.log('[CoffeeCup3D] Modelo cargado correctamente')

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

        console.log('[CoffeeCup3D] BoundingBox:', box.min, box.max)
        console.log('[CoffeeCup3D] Scale factor:', f)

        // Animaciones del modelo
        const mixer = new THREE.AnimationMixer(model)
        mixerRef.current = mixer
        if (gltf.animations.length > 0) {
          console.log('[CoffeeCup3D] Reproduciendo', gltf.animations.length, 'animaciones')
          mixer.clipAction(gltf.animations[0]).play()
        }

        modelMove()
      },
      (xhr) => {
        if (xhr.total > 0) {
          console.log('[CoffeeCup3D] Progreso:', Math.round((xhr.loaded / xhr.total) * 100) + '%')
        }
      },
      (error) => {
        console.error('[CoffeeCup3D] Error cargando modelo 3D:', error)
      }
    )

    // Loop de renderizado
    const clock = new THREE.Clock()
    const animate = () => {
      if (!mountedRef.current) return
      animFrameRef.current = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      if (mixerRef.current) mixerRef.current.update(delta)
      renderer.render(scene, camera)
    }
    animate()

    // Scroll
    const handleScroll = () => {
      if (modelRef.current) modelMove()
    }
    window.addEventListener('scroll', handleScroll)

    // Resize
    const handleResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      if (modelRef.current) modelMove()
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      mountedRef.current = false
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
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
  }, [modelPath, modelMove])

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
      }}
    />
  )
}

export default CoffeeCup3D
