import "./css/home.css"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import * as THREE from "three"

function Home() {
    const navigate = useNavigate()
    const mountRef = useRef(null)
    const flashRef = useRef(null)
    const diveRef = useRef(null)
    const navigateRef = useRef(navigate)
    navigateRef.current = navigate
    const [diving, setDiving] = useState(false)

    // arrow click: fly into the moon, then land on /About
    const enterMoon = () => {
        if (diving) return
        setDiving(true)
        if (diveRef.current) diveRef.current()
    }

    useEffect(() => {
        const mount = mountRef.current
        if (!mount) return

        const rnd = (a, b) => a + Math.random() * (b - a)
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const K = Math.PI // three r155+ no longer scales light intensity by PI, so compensate

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        mount.appendChild(renderer.domElement)

        const scene = new THREE.Scene()
        scene.fog = new THREE.FogExp2(0x0b0816, 0.012)
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200)

        const disposables = []
        const track = (o) => { disposables.push(o); return o }

        /* ---------- procedural moon texture ---------- */
        const moonTexture = () => {
            const W = 1024, H = 512
            const c = document.createElement("canvas")
            c.width = W; c.height = H
            const g = c.getContext("2d")
            const base = g.createLinearGradient(0, 0, 0, H)
            base.addColorStop(0, "#6f6bb8"); base.addColorStop(0.5, "#58539f"); base.addColorStop(1, "#6a66b0")
            g.fillStyle = base; g.fillRect(0, 0, W, H)
            for (let i = 0; i < 70; i++) {
                const x = rnd(0, W), y = rnd(0, H), r = rnd(30, 120)
                    ;[-W, 0, W].forEach((o) => {
                        const gr = g.createRadialGradient(x + o, y, 0, x + o, y, r)
                        gr.addColorStop(0, "rgba(18,16,70,.45)"); gr.addColorStop(1, "rgba(18,16,70,0)")
                        g.fillStyle = gr; g.fillRect(x + o - r, y - r, r * 2, r * 2)
                    })
            }
            for (let i = 0; i < 900; i++) {
                const x = rnd(0, W), y = rnd(0, H), r = 2 + Math.pow(Math.random(), 3) * 46
                    ;[-W, 0, W].forEach((o) => {
                        const gr = g.createRadialGradient(x + o, y, r * 0.2, x + o, y, r)
                        gr.addColorStop(0, "rgba(12,10,50,.5)")
                        gr.addColorStop(0.8, "rgba(20,18,70,.25)")
                        gr.addColorStop(0.92, "rgba(215,210,255,.38)")
                        gr.addColorStop(1, "rgba(215,210,255,0)")
                        g.fillStyle = gr; g.beginPath(); g.arc(x + o, y, r, 0, 7); g.fill()
                    })
            }
            // fine regolith speckle
            for (let i = 0; i < 7000; i++) {
                const light = Math.random() > 0.5
                g.fillStyle = light ? `rgba(220,215,255,${rnd(0.05, 0.16)})` : `rgba(10,8,45,${rnd(0.06, 0.2)})`
                g.fillRect(rnd(0, W), rnd(0, H), rnd(1, 2.4), rnd(1, 2.4))
            }
            // bright ray systems radiating from a few big impacts
            for (let k = 0; k < 4; k++) {
                const cx = rnd(0, W), cy = rnd(H * 0.2, H * 0.8)
                for (let i = 0; i < 46; i++) {
                    const a = rnd(0, 6.283), l = rnd(50, 220)
                    const x2 = cx + Math.cos(a) * l, y2 = cy + Math.sin(a) * l
                    const gr = g.createLinearGradient(cx, cy, x2, y2)
                    gr.addColorStop(0, "rgba(225,220,255,.2)"); gr.addColorStop(1, "rgba(225,220,255,0)")
                    g.strokeStyle = gr; g.lineWidth = rnd(0.8, 2.4)
                    g.beginPath(); g.moveTo(cx, cy); g.lineTo(x2, y2); g.stroke()
                }
            }
            // large terraced craters with central peaks
            for (let i = 0; i < 9; i++) {
                const x = rnd(0, W), y = rnd(H * 0.15, H * 0.85), r = rnd(36, 78)
                    ;[-W, 0, W].forEach((o) => {
                        const floor = g.createRadialGradient(x + o, y, 0, x + o, y, r)
                        floor.addColorStop(0, "rgba(14,12,60,.5)"); floor.addColorStop(1, "rgba(14,12,60,.15)")
                        g.fillStyle = floor; g.beginPath(); g.arc(x + o, y, r, 0, 7); g.fill()
                        g.lineWidth = 2
                        g.strokeStyle = "rgba(225,220,255,.4)"; g.beginPath(); g.arc(x + o, y, r, 0, 7); g.stroke()
                        g.strokeStyle = "rgba(225,220,255,.2)"; g.beginPath(); g.arc(x + o, y, r * 0.72, 0, 7); g.stroke()
                        const peak = g.createRadialGradient(x + o, y, 0, x + o, y, r * 0.22)
                        peak.addColorStop(0, "rgba(235,230,255,.7)"); peak.addColorStop(1, "rgba(235,230,255,0)")
                        g.fillStyle = peak; g.beginPath(); g.arc(x + o, y, r * 0.22, 0, 7); g.fill()
                    })
            }
            const t = new THREE.CanvasTexture(c)
            if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace
            return t
        }

        const tex = track(moonTexture())
        const moon = new THREE.Mesh(
            track(new THREE.SphereGeometry(2.7, 96, 96)),
            track(new THREE.MeshStandardMaterial({
                map: tex, bumpMap: tex, bumpScale: 0.9, roughness: 1, metalness: 0,
                emissive: 0x1a1650, emissiveIntensity: 0.5,
            }))
        )
        moon.rotation.set(0.25, -0.9, 0.1)

        const atmo = new THREE.Mesh(
            track(new THREE.SphereGeometry(3.05, 64, 64)),
            track(new THREE.ShaderMaterial({
                transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
                uniforms: { k: { value: 1 } },
                vertexShader: "varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
                fragmentShader: "uniform float k;varying vec3 n;void main(){float i=pow(.68-dot(n,vec3(0.,0.,1.)),3.);gl_FragColor=vec4(.45,.4,1.,1.)*i*1.4*k;}",
            }))
        )

        scene.add(new THREE.AmbientLight(0x2a2570, 0.9 * K))
        const sun = new THREE.DirectionalLight(0xd5ceff, 2.1 * K)
        sun.position.set(6, 3, 4)
        scene.add(sun)
        const back = new THREE.PointLight(0x6a4cff, 2 * K, 30, 0)
        back.position.set(-6, -2, -3)
        scene.add(back)

        const world = new THREE.Group()
        world.add(moon, atmo)
        scene.add(world)

        /* ---------- orbit rings ---------- */
        const rings = new THREE.Group()
        world.add(rings)
        const ring = (R, tube, arc, color, op, rx, ry, rz) => {
            const m = new THREE.Mesh(
                track(new THREE.TorusGeometry(R, tube, 8, 180, arc)),
                track(new THREE.MeshBasicMaterial({
                    color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false,
                }))
            )
            m.rotation.set(rx, ry, rz)
            rings.add(m)
            return m
        }
        ring(4.0, 0.018, Math.PI * 1.6, 0xb3aeff, 0.9, 1.25, 0.25, 0.2)
        ring(4.0, 0.07, Math.PI * 1.6, 0x6f63ff, 0.18, 1.25, 0.25, 0.2)
        const r3 = ring(3.55, 0.012, Math.PI * 1.9, 0x9d97ff, 0.75, 0.55, -0.5, 0.9)
        const r4 = ring(4.6, 0.01, Math.PI * 1.3, 0xc9c4ff, 0.55, 1.6, 0.6, 2.4)
        const r5 = ring(3.3, 0.03, Math.PI * 0.5, 0x9ad0ff, 0.9, 1.25, 0.25, 1.4)

        /* ---------- crystal shards ---------- */
        const shardGeo = track(new THREE.OctahedronGeometry(1))
        const shardMat = track(new THREE.MeshStandardMaterial({
            color: 0x8fb8ff, emissive: 0x2b50b0, emissiveIntensity: 0.7, flatShading: true, roughness: 0.3, metalness: 0.4,
            transparent: true, opacity: 0.45, depthWrite: false,
        }))
        const shards = [
            [6.0, 2.6, -0.5, 0.12, 1.0, -0.55],
            [-6.4, -1.8, -0.5, 0.09, 0.75, 0.5],
            [5.6, -2.8, -0.3, 0.1, 0.8, 0.9],
            [-5.8, 3.0, -1.0, 0.07, 0.55, -0.3],
        ].map((s) => {
            const m = new THREE.Mesh(shardGeo, shardMat)
            m.scale.set(s[3], s[4], s[3])
            m.position.set(s[0], s[1], s[2])
            m.rotation.z = s[5]
            m.userData = { y: s[1], ph: Math.random() * 6 }
            world.add(m)
            return m
        })

        /* ---------- sparkles ---------- */
        const sparkTex = track((() => {
            const c = document.createElement("canvas")
            c.width = c.height = 128
            const g = c.getContext("2d")
            const h = g.createRadialGradient(64, 64, 0, 64, 64, 22)
            h.addColorStop(0, "rgba(255,255,255,1)"); h.addColorStop(1, "rgba(160,150,255,0)")
            g.fillStyle = h; g.fillRect(0, 0, 128, 128)
            g.fillStyle = "#fff"; g.beginPath()
            g.moveTo(64, 2)
            g.quadraticCurveTo(64, 64, 126, 64)
            g.quadraticCurveTo(64, 64, 64, 126)
            g.quadraticCurveTo(64, 64, 2, 64)
            g.quadraticCurveTo(64, 64, 64, 2)
            g.fill()
            return new THREE.CanvasTexture(c)
        })())
        const sparks = [
            [0, 4.1, 0.5, 1.4], [0, -4.1, 0.5, 1.4], [-4.6, 0.4, 0.3, 0.6], [4.5, -0.6, 0.3, 0.55],
            [1.9, 3.1, 0.6, 0.5], [-2.8, -3, 0.6, 0.5], [3.7, 3.1, 0.2, 0.4], [-1.6, 3.6, 0.4, 0.35],
        ].map((p, i) => {
            const mat = track(new THREE.SpriteMaterial({
                map: sparkTex, color: i < 2 ? 0xdcd6ff : 0xffffff, transparent: true,
                blending: THREE.AdditiveBlending, depthWrite: false,
            }))
            const s = new THREE.Sprite(mat)
            s.position.set(p[0], p[1], p[2])
            s.scale.setScalar(p[3])
            s.userData = { b: p[3], ph: Math.random() * 6 }
            world.add(s)
            return s
        })

        /* ---------- starfield ---------- */
        const N = 1800
        const pos = new Float32Array(N * 3)
        for (let i = 0; i < N; i++) {
            const r = rnd(25, 90), t = rnd(0, 6.283), p = Math.acos(rnd(-1, 1))
            pos[i * 3] = r * Math.sin(p) * Math.cos(t)
            pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t)
            pos[i * 3 + 2] = r * Math.cos(p)
        }
        const sg = track(new THREE.BufferGeometry())
        sg.setAttribute("position", new THREE.BufferAttribute(pos, 3))
        const dot = track((() => {
            const c = document.createElement("canvas")
            c.width = c.height = 32
            const g = c.getContext("2d")
            const r = g.createRadialGradient(16, 16, 0, 16, 16, 16)
            r.addColorStop(0, "#fff"); r.addColorStop(1, "rgba(255,255,255,0)")
            g.fillStyle = r; g.fillRect(0, 0, 32, 32)
            return new THREE.CanvasTexture(c)
        })())
        const stars = new THREE.Points(sg, track(new THREE.PointsMaterial({
            size: 0.5, map: dot, color: 0xcfc8ff, transparent: true, opacity: 0.85, depthWrite: false, fog: false,
        })))
        scene.add(stars)

        /* ---------- spire city + floating islands (from the logo) ---------- */
        const stoneMat = track(new THREE.MeshStandardMaterial({
            color: 0x15123f, emissive: 0x1b1766, emissiveIntensity: 0.55, flatShading: true, roughness: 0.8,
        }))
        const edgeMat = track(new THREE.LineBasicMaterial({ color: 0xb3aeff, transparent: true, opacity: 0.35 }))
        const floaters = []

        const withEdges = (mesh, geo) => {
            mesh.add(new THREE.LineSegments(track(new THREE.EdgesGeometry(geo)), edgeMat))
            return mesh
        }

        // tall gothic spire: a slim cone on a wider shoulder
        const spire = (h, r) => {
            const g = new THREE.Group()
            const top = track(new THREE.ConeGeometry(r, h, 4)); top.translate(0, h / 2, 0)
            const shoulder = track(new THREE.ConeGeometry(r * 1.7, h * 0.3, 4)); shoulder.translate(0, h * 0.15, 0)
            ;[top, shoulder].forEach((geo) => {
                const m = withEdges(new THREE.Mesh(geo, stoneMat), geo)
                m.rotation.y = Math.PI / 4
                g.add(m)
            })
            return g
        }

        // floating rock the spires stand on
        const rock = (rad, depth) => {
            const geo = track(new THREE.ConeGeometry(rad, depth, 7, 1))
            geo.rotateX(Math.PI)
            geo.translate(0, -depth / 2, 0)
            const pos = geo.attributes.position
            for (let i = 0; i < pos.count; i++) { // roughen it a bit
                pos.setX(i, pos.getX(i) * rnd(0.88, 1.12))
                pos.setZ(i, pos.getZ(i) * rnd(0.88, 1.12))
            }
            geo.computeVertexNormals()
            return withEdges(new THREE.Mesh(geo, stoneMat), geo)
        }

        const city = new THREE.Group()
        city.add(rock(1.6, 2.1))
        ;[
            [0, 0, 4.4, 0.22], [-0.5, 0.15, 2.9, 0.18], [0.45, -0.1, 3.4, 0.2], [-0.95, 0.1, 1.8, 0.14],
            [0.95, 0.2, 2.1, 0.15], [-0.2, 0.5, 2.3, 0.12], [1.3, -0.2, 1.2, 0.1], [-1.25, -0.2, 1.1, 0.1],
        ].forEach(([x, z, h, r]) => {
            const s = spire(h, r)
            s.position.set(x, 0, z)
            city.add(s)
        })
        city.position.set(-3.0, -1.4, 1.5)
        city.scale.setScalar(0.9)
        world.add(city)
        floaters.push({ obj: city, y: city.position.y, ph: 0, amp: 0.06 })

        // small islands on the right
        ;[[4.9, -0.7, 0.8, 0.3, 1.0], [5.7, -1.6, 0.4, 0.18, 0.7]].forEach(([x, y, z, sc, h], i) => {
            const isl = new THREE.Group()
            isl.add(rock(1.3, 1.6))
            const s = spire(h * 2.2, 0.16)
            isl.add(s)
            isl.position.set(x, y, z)
            isl.scale.setScalar(sc)
            world.add(isl)
            floaters.push({ obj: isl, y: y, ph: 1.5 + i * 2, amp: 0.1 })
        })

        /* ---------- cloud banks ---------- */
        const cloudTex = track((() => {
            const c = document.createElement("canvas")
            c.width = c.height = 256
            const g = c.getContext("2d")
            for (let i = 0; i < 14; i++) {
                const x = rnd(60, 196), y = rnd(90, 166), r = rnd(40, 80)
                const gr = g.createRadialGradient(x, y, 0, x, y, r)
                gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)")
                g.fillStyle = gr; g.fillRect(0, 0, 256, 256)
            }
            return new THREE.CanvasTexture(c)
        })())
        const clouds = [
            [-2.6, -2.0, 2.0, 4.2, 0x4a46a8], [-0.9, -2.6, 2.6, 4.6, 0x3d3994], [0.9, -2.9, 2.8, 4.4, 0x5a55c0],
            [2.5, -2.3, 2.4, 4.0, 0x4a46a8], [-3.8, -1.3, 1.8, 3.4, 0x5a55c0], [3.6, -1.8, 1.6, 3.2, 0x3d3994],
        ].map(([x, y, z, sz, col], i) => {
            const s = new THREE.Sprite(track(new THREE.SpriteMaterial({
                map: cloudTex, color: col, transparent: true, opacity: 0.5, depthWrite: false, fog: false,
            })))
            s.position.set(x, y, z)
            s.scale.set(sz, sz * 0.55, 1)
            s.userData = { x, ph: i * 1.3 }
            world.add(s)
            return s
        })

        /* ---------- shooting stars ---------- */
        const trailTex = track((() => {
            const c = document.createElement("canvas")
            c.width = 256; c.height = 8
            const g = c.getContext("2d")
            const gr = g.createLinearGradient(0, 0, 256, 0)
            gr.addColorStop(0, "rgba(160,150,255,0)")
            gr.addColorStop(0.7, "rgba(190,180,255,0.55)")
            gr.addColorStop(1, "rgba(255,255,255,1)")
            g.fillStyle = gr
            g.fillRect(0, 0, 256, 8)
            return new THREE.CanvasTexture(c)
        })())
        const trailGeo = track(new THREE.PlaneGeometry(1, 1))
        const SKY_Z = -12 // behind the moon, in the "sky"

        const makeShooter = () => {
            const trailMat = track(new THREE.MeshBasicMaterial({
                map: trailTex, transparent: true, opacity: 0,
                blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
            }))
            const trail = new THREE.Mesh(trailGeo, trailMat)
            const headMat = track(new THREE.SpriteMaterial({
                map: sparkTex, transparent: true, opacity: 0,
                blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
            }))
            const head = new THREE.Sprite(headMat)
            head.scale.setScalar(0.7)
            trail.visible = head.visible = false
            scene.add(trail, head)
            return { trail, head, trailMat, headMat, active: false, p: 0, life: 1, x: 0, y: 0, dx: 0, dy: 0, len: 4 }
        }
        const shooters = [makeShooter(), makeShooter()]
        let nextShot = rnd(2, 4) // seconds until first star

        const launch = (s) => {
            const dist = camera.position.z - SKY_Z
            const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist
            const halfW = halfH * camera.aspect
            const angle = rnd(-2.65, -2.25) // down and to the left
            const speed = rnd(13, 19)
            s.x = rnd(-halfW * 0.3, halfW * 1.1)
            s.y = halfH * rnd(0.7, 1.05)
            s.dx = Math.cos(angle) * speed
            s.dy = Math.sin(angle) * speed
            s.len = rnd(3.5, 6)
            s.life = rnd(0.9, 1.5)
            s.p = 0
            s.active = true
            s.trail.rotation.z = angle
            s.trail.scale.set(s.len, 0.05, 1)
            s.trail.visible = s.head.visible = true
        }

        const updateShooters = (dt, t) => {
            if (!reduce && t > nextShot) {
                const free = shooters.find((s) => !s.active)
                if (free) launch(free)
                nextShot = t + rnd(4, 9) // "occasionally": every 4 to 9 seconds
            }
            shooters.forEach((s) => {
                if (!s.active) return
                s.p += dt / s.life
                if (s.p >= 1) {
                    s.active = false
                    s.trail.visible = s.head.visible = false
                    return
                }
                s.x += s.dx * dt
                s.y += s.dy * dt
                const a = Math.sin(Math.PI * s.p) // fade in, then out
                const ux = s.dx / Math.hypot(s.dx, s.dy)
                const uy = s.dy / Math.hypot(s.dx, s.dy)
                s.head.position.set(s.x, s.y, SKY_Z)
                s.trail.position.set(s.x - ux * s.len / 2, s.y - uy * s.len / 2, SKY_Z)
                s.trailMat.opacity = a
                s.headMat.opacity = a
            })
        }

        /* ---------- resize + pointer ---------- */
        const resize = () => {
            const w = window.innerWidth, h = window.innerHeight, a = w / h
            renderer.setSize(w, h)
            camera.aspect = a
            camera.position.z = a < 1.2 ? 9 + (1.2 - a) * 8 : 9
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

        /* ---------- loop ---------- */
        const clock = new THREE.Clock()
        let raf
        let last = 0

        // dive into the moon: camera rushes toward the surface, FOV widens, screen floods with light
        let dive = null
        diveRef.current = () => {
            if (dive) return
            dive = { start: clock.getElapsedTime(), dur: reduce ? 0.4 : 1.2, fromZ: camera.position.z, fromFov: camera.fov, done: false }
            mouse.tx = 0
            mouse.ty = 0
        }
        const frame = () => {
            const t = clock.getElapsedTime()
            const dt = Math.min(t - last, 0.05)
            last = t
            updateShooters(dt, t)

            if (dive) {
                const p = Math.min((t - dive.start) / dive.dur, 1)
                const e = p * p * (3 - 2 * p) * 0.4 + p * p * p * 0.6 // eases in, then rushes
                camera.position.z = dive.fromZ + (2.95 - dive.fromZ) * e // ends just above the surface, so the moon fills the screen
                camera.fov = dive.fromFov + (88 - dive.fromFov) * e
                camera.updateProjectionMatrix()
                atmo.material.uniforms.k.value = Math.min(Math.max((camera.position.z - 3.1) / 2.5, 0), 1) // glow fades out before we pass through it
                const f = Math.min(Math.max((p - 0.86) / 0.14, 0), 1) // only a quick, surface-coloured fade at the very end
                if (flashRef.current) flashRef.current.style.opacity = String(f * f * (3 - 2 * f))
                if (p >= 1 && !dive.done) {
                    dive.done = true
                    navigateRef.current("/About", { state: { fromMoon: true } })
                }
            }

            // living moon: slow spin, gentle float, light + tilt follow the pointer
            if (!reduce) {
                moon.rotation.y = -0.9 + t * 0.02
                const bob = Math.sin(t * 0.5) * 0.08
                moon.position.y = bob
                atmo.position.y = bob
            }
            moon.rotation.x = 0.25 + mouse.y * 0.05
            sun.position.x = 6 + mouse.x * 1.5
            sun.position.y = 3 - mouse.y * 1.0
            mouse.x += (mouse.tx - mouse.x) * 0.04
            mouse.y += (mouse.ty - mouse.y) * 0.04
            world.rotation.y = mouse.x * 0.12
            world.rotation.x = mouse.y * 0.08
            camera.position.x = mouse.x * 0.35
            camera.position.y = -mouse.y * 0.2
            camera.lookAt(0, 0, 0)
            if (!reduce) {
                rings.rotation.z = t * 0.05
                r3.rotation.z = 0.9 + t * 0.12
                r4.rotation.z = 2.4 - t * 0.08
                r5.rotation.z = 1.4 + t * 0.25
                stars.rotation.y = t * 0.004
                floaters.forEach((f) => { f.obj.position.y = f.y + Math.sin(t * 0.6 + f.ph) * f.amp })
                clouds.forEach((c) => { c.position.x = c.userData.x + Math.sin(t * 0.15 + c.userData.ph) * 0.25 })
                shards.forEach((s) => {
                    s.position.y = s.userData.y + Math.sin(t * 0.8 + s.userData.ph) * 0.15
                    s.rotation.y = t * 0.4 + s.userData.ph
                })
                sparks.forEach((s) => s.scale.setScalar(s.userData.b * (0.75 + 0.25 * Math.sin(t * 1.8 + s.userData.ph))))
            }
            renderer.render(scene, camera)
            raf = requestAnimationFrame(frame)
        }
        frame()

        /* ---------- cleanup ---------- */
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("resize", resize)
            window.removeEventListener("pointermove", onMove)
            disposables.forEach((d) => d.dispose && d.dispose())
            renderer.dispose()
            if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
        }
    }, [])

    return (
        <div>
            {/* Three.js background */}
            <div ref={mountRef} className="three-bg" aria-hidden="true" />
            <div ref={flashRef} className="dive-flash" aria-hidden="true" />

            <div className={"filter" + (diving ? " diving" : "")}>
                <h1 className="Greeting">Hi!</h1>
                <h1 className="name-font">Im Yong Jian</h1>
                <h1 className="subtitle">FULL STACK DEVELOPER</h1>

                <div className="CTA">
                    <button className="cta-work" onClick={() => navigate("/Portfolio")}>
                        MY WORK
                    </button>
                    <button className="scroll-arrow" onClick={enterMoon} aria-label="Enter the moon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M12 4v16M5 13l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Home