import "./css/portfolio.css"
import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import * as THREE from "three"
import Missions from "./components/Missions.jsx"

function Portfolio() {
    const location = useLocation()
    const cameFromAbout = !!(location.state && location.state.fromAbout)
    const [arriving, setArriving] = useState(cameFromAbout)
    const bgRef = useRef(null)

    useEffect(() => {
        const mount = bgRef.current
        if (!mount) return
        let renderer
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true })
        } catch (err) {
            return
        }
        const rnd = (a, b) => a + Math.random() * (b - a)
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const K = Math.PI // compensates for three r155+ light units
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        mount.appendChild(renderer.domElement)

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x05030f)
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 900)

        const disposables = []
        const track = (o) => { disposables.push(o); return o }
        const srgb = (t) => { if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; return t }

        /* ---- the purple planet: banded surface seen from just above the clouds ---- */
        const R = 60
        const C = new THREE.Vector3(0, -61, -10)
        const bandTex = track(srgb((() => {
            const c = document.createElement("canvas")
            c.width = 1024; c.height = 512
            const g = c.getContext("2d")
            const gr = g.createLinearGradient(0, 0, 0, 512)
            ;[["0", "#2a2f8f"], ["0.25", "#5a4fd0"], ["0.5", "#7a6bff"], ["0.75", "#3b2f9f"], ["1", "#1c1a5f"]].forEach(([s, col]) => gr.addColorStop(+s, col))
            g.fillStyle = gr; g.fillRect(0, 0, 1024, 512)
            for (let i = 0; i < 110; i++) {
                g.fillStyle = Math.random() > 0.5 ? "rgba(235,230,255,.10)" : "rgba(15,8,70,.15)"
                g.fillRect(0, rnd(0, 512), 1024, rnd(3, 22))
            }
            for (let i = 0; i < 40; i++) {
                const x = rnd(0, 1024), y = rnd(20, 492), r = rnd(20, 70)
                ;[-1024, 0, 1024].forEach((o) => {
                    const rg = g.createRadialGradient(x + o, y, 0, x + o, y, r)
                    rg.addColorStop(0, "rgba(225,215,255,.2)"); rg.addColorStop(1, "rgba(225,215,255,0)")
                    g.fillStyle = rg; g.fillRect(x + o - r, y - r, r * 2, r * 2)
                })
            }
            return new THREE.CanvasTexture(c)
        })()))
        const planet = new THREE.Mesh(
            track(new THREE.SphereGeometry(R, 128, 96)),
            track(new THREE.MeshStandardMaterial({ map: bandTex, emissiveMap: bandTex, emissive: 0x6a5ad0, emissiveIntensity: 0.45, roughness: 1 }))
        )
        planet.position.copy(C)
        planet.rotation.x = Math.PI / 2 // poles point along z, so the bands run across the screen
        scene.add(planet)

        // drifting cloud streaks above the surface
        const cloudTex = track(srgb((() => {
            const c = document.createElement("canvas")
            c.width = 1024; c.height = 512
            const g = c.getContext("2d")
            for (let i = 0; i < 140; i++) {
                const x = rnd(0, 1024), y = rnd(0, 512), w = rnd(60, 260), h = rnd(4, 14)
                ;[-1024, 0, 1024].forEach((o) => {
                    const rg = g.createRadialGradient(x + o, y, 0, x + o, y, w)
                    rg.addColorStop(0, "rgba(255,255,255,.35)"); rg.addColorStop(1, "rgba(255,255,255,0)")
                    g.save(); g.translate(0, y); g.scale(1, h / w); g.translate(0, -y)
                    g.fillStyle = rg; g.fillRect(x + o - w, y - w, w * 2, w * 2); g.restore()
                })
            }
            return new THREE.CanvasTexture(c)
        })()))
        const clouds = new THREE.Mesh(
            track(new THREE.SphereGeometry(R + 0.35, 96, 72)),
            track(new THREE.MeshStandardMaterial({ map: cloudTex, transparent: true, opacity: 0.55, depthWrite: false, roughness: 1, color: 0xb9b0ff }))
        )
        clouds.position.copy(C)
        clouds.rotation.x = Math.PI / 2
        scene.add(clouds)

        // atmosphere glow along the horizon
        const glow = new THREE.Mesh(
            track(new THREE.SphereGeometry(R * 1.05, 96, 72)),
            track(new THREE.ShaderMaterial({
                transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
                vertexShader: "varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
                fragmentShader: "varying vec3 n;void main(){float i=pow(.72-dot(n,vec3(0.,0.,1.)),3.);gl_FragColor=vec4(.5,.42,1.,1.)*i*1.6;}",
            }))
        )
        glow.position.copy(C)
        scene.add(glow)

        /* lights */
        scene.add(new THREE.AmbientLight(0x3a3590, 1.1 * K))
        const sun = new THREE.DirectionalLight(0xd5ceff, 2.4 * K)
        sun.position.set(50, 25, 35)
        scene.add(sun)

        /* the moon we left behind, small in the sky */
        const moonTex = track(srgb((() => {
            const c = document.createElement("canvas")
            c.width = 512; c.height = 256
            const g = c.getContext("2d")
            g.fillStyle = "#6a66b0"; g.fillRect(0, 0, 512, 256)
            for (let i = 0; i < 40; i++) {
                const x = rnd(0, 512), y = rnd(0, 256), r = rnd(15, 60)
                const rg = g.createRadialGradient(x, y, 0, x, y, r)
                rg.addColorStop(0, "rgba(18,16,70,.4)"); rg.addColorStop(1, "rgba(18,16,70,0)")
                g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2)
            }
            for (let i = 0; i < 260; i++) {
                const x = rnd(0, 512), y = rnd(0, 256), r = 2 + Math.pow(Math.random(), 3) * 22
                const rg = g.createRadialGradient(x, y, r * 0.2, x, y, r)
                rg.addColorStop(0, "rgba(12,10,50,.5)"); rg.addColorStop(0.85, "rgba(20,18,70,.25)"); rg.addColorStop(0.95, "rgba(215,210,255,.4)"); rg.addColorStop(1, "rgba(215,210,255,0)")
                g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill()
            }
            return new THREE.CanvasTexture(c)
        })()))
        const moon = new THREE.Mesh(track(new THREE.SphereGeometry(7, 48, 48)), track(new THREE.MeshStandardMaterial({ map: moonTex, bumpMap: moonTex, bumpScale: 0.6, roughness: 1, emissive: 0x1a1650, emissiveIntensity: 0.5 })))
        moon.position.set(42, 28, -95)
        scene.add(moon)

        /* stars */
        const N = 1800
        const sp = new Float32Array(N * 3)
        for (let i = 0; i < N; i++) {
            const r = rnd(300, 500), t = rnd(0, 6.283), p = Math.acos(rnd(-0.2, 1))
            sp[i * 3] = r * Math.sin(p) * Math.cos(t)
            sp[i * 3 + 1] = r * Math.cos(p)
            sp[i * 3 + 2] = r * Math.sin(p) * Math.sin(t)
        }
        const sg = track(new THREE.BufferGeometry())
        sg.setAttribute("position", new THREE.BufferAttribute(sp, 3))
        const dotTex = track((() => {
            const c = document.createElement("canvas")
            c.width = c.height = 32
            const g = c.getContext("2d")
            const r = g.createRadialGradient(16, 16, 0, 16, 16, 16)
            r.addColorStop(0, "#fff"); r.addColorStop(1, "rgba(255,255,255,0)")
            g.fillStyle = r; g.fillRect(0, 0, 32, 32)
            return new THREE.CanvasTexture(c)
        })())
        scene.add(new THREE.Points(sg, track(new THREE.PointsMaterial({ size: 1.8, map: dotTex, color: 0xcfc8ff, transparent: true, opacity: 0.9, depthWrite: false, fog: false }))))

        /* camera rig */
        const resize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight)
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
        }
        resize()
        window.addEventListener("resize", resize)
        const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
        const onMove = (e) => {
            mouse.tx = (e.clientX / window.innerWidth) * 2 - 1
            mouse.ty = (e.clientY / window.innerHeight) * 2 - 1
        }
        window.addEventListener("pointermove", onMove)

        // arrival: start right above the cloud tops looking down (where the flight ended), then rise and level out
        const landDur = cameFromAbout && !reduce ? 2.8 : 0
        const endPos = new THREE.Vector3(), startPos = new THREE.Vector3(0, 0.6, 6)
        const lookStart = new THREE.Vector3(0, -1, 5.7), lookEnd = new THREE.Vector3()
        const look = new THREE.Vector3()
        const clock = new THREE.Clock()
        let raf, last = 0
        const frame = () => {
            const t = clock.getElapsedTime()
            const dt = Math.min(t - last, 0.05)
            last = t
            mouse.x += (mouse.tx - mouse.x) * 0.05
            mouse.y += (mouse.ty - mouse.y) * 0.05

            const maxS = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
            const p = Math.min(window.scrollY / maxS, 1)

            const l = landDur ? Math.min(t / landDur, 1) : 1
            const e = 1 - Math.pow(1 - l, 3)
            endPos.set(mouse.x * 1.2, 3 + p * 7, 14)
            camera.position.lerpVectors(startPos, endPos, e)
            lookEnd.set(mouse.x * 6, 1.5 + p * 4 - mouse.y * 1.5, -30)
            look.lerpVectors(lookStart, lookEnd, e)
            camera.lookAt(look)

            if (!reduce) {
                planet.rotation.y += dt * 0.012 // bands drift across the screen
                clouds.rotation.y += dt * 0.02
                moon.rotation.y += dt * 0.02
            }
            renderer.render(scene, camera)
            raf = requestAnimationFrame(frame)
        }
        frame()

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("resize", resize)
            window.removeEventListener("pointermove", onMove)
            disposables.forEach((d) => d.dispose && d.dispose())
            renderer.dispose()
            if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
        }
    }, [cameFromAbout])

    return (
        <div className="portfolio-page">
            <div ref={bgRef} className="portfolio-bg" aria-hidden="true" />
            {arriving && <div className="arrive" onAnimationEnd={() => setArriving(false)} aria-hidden="true" />}
            <div className="portfolio-content">
                <Missions />
            </div>
        </div>
    )
}

export default Portfolio