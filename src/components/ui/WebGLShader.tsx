"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function WebGLShader() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isVisible = useRef(true)
    const sceneRef = useRef<{
        scene: THREE.Scene | null
        camera: THREE.OrthographicCamera | null
        renderer: THREE.WebGLRenderer | null
        mesh: THREE.Mesh | null
        uniforms: any
        animationId: number | null
    }>({
        scene: null,
        camera: null,
        renderer: null,
        mesh: null,
        uniforms: null,
        animationId: null,
    })

    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const { current: refs } = sceneRef

        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisible.current = entry.isIntersecting
            },
            { threshold: 0 }
        )
        observer.observe(canvas)

        const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

        const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        float d = length(p) * distortion;
        
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
        
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `

        const initScene = () => {
            const isMobile = window.innerWidth < 768;
            refs.scene = new THREE.Scene()
            refs.renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                powerPreference: "low-power",
                antialias: false
            })

            // Aggressively cap pixel ratio on mobile to 1.0 for performance
            refs.renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 2))

            refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

            refs.uniforms = {
                resolution: { value: [window.innerWidth, window.innerHeight] },
                time: { value: 0.0 },
                xScale: { value: 1.0 },
                yScale: { value: 0.5 },
                distortion: { value: 0.05 },
            }

            const position = [
                -1.0, -1.0, 0.0,
                1.0, -1.0, 0.0,
                -1.0, 1.0, 0.0,
                1.0, -1.0, 0.0,
                -1.0, 1.0, 0.0,
                1.0, 1.0, 0.0,
            ]

            const geometry = new THREE.BufferGeometry()
            geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(position), 3))

            const material = new THREE.RawShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: refs.uniforms,
                side: THREE.DoubleSide,
            })

            refs.mesh = new THREE.Mesh(geometry, material)
            refs.scene.add(refs.mesh)

            handleResize()
        }

        let frameCount = 0;
        const animate = () => {
            refs.animationId = requestAnimationFrame(animate)

            if (!isVisible.current) return

            // Skip frames on mobile to reduce CPU/GPU load (approx 30fps)
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                frameCount++;
                if (frameCount % 2 !== 0) return;
            }

            if (refs.uniforms) refs.uniforms.time.value += 0.01
            if (refs.renderer && refs.scene && refs.camera) {
                refs.renderer.render(refs.scene, refs.camera)
            }
        }

        const handleResize = () => {
            if (!refs.renderer || !refs.uniforms) return
            const width = window.innerWidth
            const height = window.innerHeight
            refs.renderer.setSize(width, height, false)
            refs.uniforms.resolution.value = [width, height]
        }

        initScene()
        animate()
        window.addEventListener("resize", handleResize)

        return () => {
            if (refs.animationId) cancelAnimationFrame(refs.animationId)
            window.removeEventListener("resize", handleResize)
            observer.disconnect()

            if (refs.mesh) {
                refs.scene?.remove(refs.mesh)
                refs.mesh.geometry.dispose()
                if (refs.mesh.material instanceof THREE.Material) {
                    refs.mesh.material.dispose()
                }
            }
            refs.renderer?.dispose()
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full block -z-10 pointer-events-none will-change-transform"
        />
    )
}
