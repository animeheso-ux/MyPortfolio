import "./css/about.css"
import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import * as THREE from "three"

/* ---- Edit these: this is the information about you ---- */
const NAME = "Yong Jian"
const ROLE = "Full-stack developer · Polytechnic student · Singapore"
const BIO = [
    "I’m Yong Jian, a polytechnic student in Singapore who builds full-stack web apps, from React front ends to Express and Node back ends with real databases behind them.",
    "I work on both solo and group projects, and I care about interfaces that feel cinematic: dark, glowing, and a little bit sci-fi.",
]

const SKILLS = [
    { group: "Front end", items: ["React", "Three.js", "Bootstrap 5", "EJS"] },
    { group: "Back end", items: ["Node.js", "Express", "MySQL", "JWT"] },
    { group: "Real-time", items: ["WebSockets", "PeerJS", "mediasoup/webRTC"] },
    { group: "DevOps", items: ["Docker", "Google Cloud"] },
    { group: "Mobile", items: ["Expo", "react-native-maps"] },
]

const JOURNEY = [
    { when: "STUDYING", title: "Polytechnic coursework", text: "Statistics and web development modules, with full-stack projects as a core part of the work." },
    { when: "TEAMWORK", title: "Group projects", text: "Built Learning Quest, a quiz and learning platform, with Team 2 for C270." },
    { when: "BUILDING", title: "Muscify", text: "My main portfolio project: a music app." },
    { when: "NEXT", title: "Internships", text: "Looking for internships and junior roles in full-stack and DevOps." },
]

/* A panel that tilts in 3D toward the pointer. `base` = resting Y rotation in degrees. */
function Tilt({ className = "", base = 0, children }) {
    const ref = useRef(null)
    const move = (e) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        el.style.setProperty("--rx", (-y * 12).toFixed(2) + "deg")
        el.style.setProperty("--ry", (x * 14 + base).toFixed(2) + "deg")
    }
    const leave = () => {
        const el = ref.current
        if (!el) return
        el.style.setProperty("--rx", "0deg")
        el.style.setProperty("--ry", base + "deg")
    }
    return (
        <div ref={ref} className={"tilt " + className} style={{ "--ry": base + "deg" }} onPointerMove={move} onPointerLeave={leave}>
            {children}
        </div>
    )
}

function About() {
    const navigate = useNavigate()
    const location = useLocation()
    const cameFromMoon = !!(location.state && location.state.fromMoon)
    const [emerging, setEmerging] = useState(cameFromMoon)
    const pageRef = useRef(null)
    const bgRef = useRef(null)
    const fadeRef = useRef(null)
    const flightRef = useRef(null)
    const navigateRef = useRef(navigate)
    navigateRef.current = navigate
    const [leaving, setLeaving] = useState(false)

    // fly from the moon to the purple planet, then land on /Portfolio
    const flyToPlanet = () => {
        if (leaving) return
        setLeaving(true)
        document.body.style.overflow = "hidden"
        if (flightRef.current) flightRef.current()
    }

    // scroll reveal
    useEffect(() => {
        const els = pageRef.current ? pageRef.current.querySelectorAll(".reveal") : []
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
            { threshold: 0.12 }
        )
        els.forEach((el) => io.observe(el))
        return () => io.disconnect()
    }, [])

    /* ---------- 3D lunar surface ---------- */
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
        scene.fog = new THREE.FogExp2(0x1a1240, 0.017)
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 900)
        scene.add(camera)

        const disposables = []
        const track = (o) => { disposables.push(o); return o }

        /* terrain: noise + craters */
        const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
        const vnoise = (x, y) => {
            const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi
            const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
            const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
            return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
        }
        const fbm = (x, y) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, y * f); f *= 2; a *= 0.5 } return s }
        const craters = Array.from({ length: 95 }, () => ({
            x: rnd(-110, 110), z: rnd(-180, 50), r: 1.5 + Math.pow(Math.random(), 2.4) * 17,
        }))
        const height = (x, z) => {
            let y = (fbm(x * 0.03 + 10, z * 0.03) - 0.5) * 5 + (fbm(x * 0.22, z * 0.22) - 0.5) * 0.35
            for (const c of craters) {
                const d = Math.hypot(x - c.x, z - c.z) / c.r
                if (d < 1.6) {
                    if (d < 1) y -= (1 - d * d) * c.r * 0.16
                    y += Math.exp(-(((d - 1) / 0.18) ** 2)) * c.r * 0.04
                }
            }
            return y
        }

        const tGeo = track(new THREE.PlaneGeometry(260, 260, 200, 200))
        tGeo.rotateX(-Math.PI / 2)
        tGeo.translate(0, 0, -70)
        const pos = tGeo.attributes.position
        const colors = new Float32Array(pos.count * 3)
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), z = pos.getZ(i)
            const y = height(x, z)
            pos.setY(i, y)
            const shade = Math.min(Math.max(0.5 + (y + 1.5) / 7, 0.35), 1) * (0.9 + hash(x * 3, z * 3) * 0.15)
            colors[i * 3] = 0.6 * shade
            colors[i * 3 + 1] = 0.58 * shade
            colors[i * 3 + 2] = 0.82 * shade
        }
        tGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
        tGeo.computeVertexNormals()
        scene.add(new THREE.Mesh(tGeo, track(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }))))

        /* lights: low sun for long, dramatic slopes */
        scene.add(new THREE.AmbientLight(0x2a2570, 0.9 * K))
        const sun = new THREE.DirectionalLight(0xd5ceff, 2.6 * K)
        sun.position.set(40, 7, -30)
        scene.add(sun)

        /* the big planet in the sky */
        const planetTex = track((() => {
            const c = document.createElement("canvas")
            c.width = 512; c.height = 256
            const g = c.getContext("2d")
            const gr = g.createLinearGradient(0, 0, 0, 256)
            ;[["0", "#2a2f8f"], ["0.3", "#5a4fd0"], ["0.5", "#7a6bff"], ["0.75", "#3b2f9f"], ["1", "#1c1a5f"]].forEach(([s, col]) => gr.addColorStop(+s, col))
            g.fillStyle = gr; g.fillRect(0, 0, 512, 256)
            for (let i = 0; i < 46; i++) {
                g.fillStyle = Math.random() > 0.5 ? "rgba(235,230,255,.10)" : "rgba(15,8,70,.14)"
                g.fillRect(0, rnd(0, 256), 512, rnd(3, 16))
            }
            for (let i = 0; i < 12; i++) {
                const x = rnd(0, 512), y = rnd(20, 236), r = rnd(14, 40)
                const rg = g.createRadialGradient(x, y, 0, x, y, r)
                rg.addColorStop(0, "rgba(220,210,255,.22)"); rg.addColorStop(1, "rgba(220,210,255,0)")
                g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2)
            }
            const t = new THREE.CanvasTexture(c)
            if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace
            return t
        })())
        const planet = new THREE.Mesh(track(new THREE.SphereGeometry(20, 64, 64)), track(new THREE.MeshStandardMaterial({ map: planetTex, roughness: 1, fog: false })))
        planet.position.set(-55, 30, -190)
        scene.add(planet)
        const glow = new THREE.Mesh(track(new THREE.SphereGeometry(23.5, 48, 48)), track(new THREE.ShaderMaterial({
            transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
            vertexShader: "varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
            fragmentShader: "varying vec3 n;void main(){float i=pow(.68-dot(n,vec3(0.,0.,1.)),3.);gl_FragColor=vec4(.45,.4,1.,1.)*i*1.4;}",
        })))
        glow.position.copy(planet.position)
        scene.add(glow)

        /* stars */
        const N = 1600
        const sp = new Float32Array(N * 3)
        for (let i = 0; i < N; i++) {
            const r = rnd(300, 500), t = rnd(0, 6.283), p = Math.acos(rnd(0.05, 1))
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

        /* distant spire city (from the logo) */
        const stoneMat = track(new THREE.MeshStandardMaterial({ color: 0x15123f, emissive: 0x1b1766, emissiveIntensity: 0.6, flatShading: true, roughness: 0.8 }))
        const edgeMat = track(new THREE.LineBasicMaterial({ color: 0xb3aeff, transparent: true, opacity: 0.4 }))
        const spire = (h, r) => {
            const g = new THREE.Group()
            ;[[r, h, h / 2], [r * 1.7, h * 0.3, h * 0.15]].forEach(([rad, hh, ty]) => {
                const geo = track(new THREE.ConeGeometry(rad, hh, 4))
                geo.translate(0, ty, 0)
                const m = new THREE.Mesh(geo, stoneMat)
                m.add(new THREE.LineSegments(track(new THREE.EdgesGeometry(geo)), edgeMat))
                m.rotation.y = Math.PI / 4
                g.add(m)
            })
            return g
        }
        ;[[0, 0, 26, 1.5], [-4, 2, 17, 1.2], [4.5, -1, 20, 1.3], [-8, 1, 11, 0.9], [8.5, 2, 13, 1.0], [-2, 5, 9, 0.8], [12, -2, 8, 0.8]].forEach(([dx, dz, h, r]) => {
            const x = -36 + dx, z = -85 + dz
            const s = spire(h, r)
            s.position.set(x, height(x, z) - 0.6, z)
            scene.add(s)
        })

        /* low-gravity dust that follows the camera */
        const DN = 260
        const dpos = new Float32Array(DN * 3)
        const dbase = new Float32Array(DN)
        for (let i = 0; i < DN; i++) {
            dpos[i * 3] = rnd(-8, 8); dpos[i * 3 + 1] = rnd(-2.2, 5); dpos[i * 3 + 2] = rnd(-22, -1)
            dbase[i] = dpos[i * 3 + 1]
        }
        const dg = track(new THREE.BufferGeometry())
        dg.setAttribute("position", new THREE.BufferAttribute(dpos, 3))
        camera.add(new THREE.Points(dg, track(new THREE.PointsMaterial({ size: 0.07, map: dotTex, color: 0xd9d3ff, transparent: true, opacity: 0.7, depthWrite: false, fog: false }))))

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

        const landDur = cameFromMoon && !reduce ? 2.8 : 0 // descend onto the surface after the dive
        let camZ = 10
        let camY = height(0, 10) + 2.2
        const clock = new THREE.Clock()
        // flight to the purple planet
        let flight = null
        flightRef.current = () => {
            if (flight) return
            const from = camera.position.clone()
            const dir = from.clone().sub(planet.position).normalize()
            const look0 = new THREE.Vector3()
            camera.getWorldDirection(look0)
            look0.multiplyScalar(40).add(from)
            flight = {
                start: clock.getElapsedTime(), dur: reduce ? 0.4 : 1.2, from, look0, look: new THREE.Vector3(), done: false,
                to: planet.position.clone().add(dir.multiplyScalar(24)), // stops close enough that the planet fills the screen
            }
        }

        let raf
        const lookStart = new THREE.Vector3()
        const lookEnd = new THREE.Vector3()
        const frame = () => {
            const t = clock.getElapsedTime()

            if (flight) {
                const p = Math.min((t - flight.start) / flight.dur, 1)
                const e = p * p * (3 - 2 * p) * 0.5 + p * p * p * 0.5 // lift off gently, then accelerate
                const lift = 14 * Math.sin(Math.PI * p) * (1 - p) // arc up over the craters first
                camera.position.lerpVectors(flight.from, flight.to, e)
                camera.position.y += lift
                const lp = Math.min(p * 1.6, 1)
                flight.look.lerpVectors(flight.look0, planet.position, lp * lp * (3 - 2 * lp)) // turn to face the planet
                camera.lookAt(flight.look)
                camera.fov = 60 + 15 * e
                camera.updateProjectionMatrix()
                const f = Math.min(Math.max((p - 0.86) / 0.14, 0), 1)
                if (fadeRef.current) fadeRef.current.style.opacity = String(f * f * (3 - 2 * f))
                if (p >= 1 && !flight.done) {
                    flight.done = true
                    navigateRef.current("/Portfolio", { state: { fromAbout: true } })
                }
                renderer.render(scene, camera)
                raf = requestAnimationFrame(frame)
                return
            }
            mouse.x += (mouse.tx - mouse.x) * 0.05
            mouse.y += (mouse.ty - mouse.y) * 0.05

            // scrolling the page walks you across the moon
            const maxS = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
            const p = Math.min(window.scrollY / maxS, 1)
            camZ += (10 - p * 55 - camZ) * 0.06
            camY += (height(0, camZ) + 2.2 - camY) * 0.1

            const l = landDur ? Math.min(t / landDur, 1) : 1
            const e = 1 - Math.pow(1 - l, 3)
            camera.position.set(mouse.x * 0.6, camY + (1 - e) * 42, camZ)
            // start looking straight down at the craters (like the end of the dive), then pitch up to the horizon as we land
            lookStart.set(0, camY, camZ - 3)
            lookEnd.set(mouse.x * 7, camY + 1.6 - mouse.y * 1.5, camZ - 40)
            lookStart.lerp(lookEnd, e)
            camera.lookAt(lookStart)

            if (!reduce) {
                const a = dg.attributes.position
                for (let i = 0; i < DN; i++) a.setY(i, dbase[i] + Math.sin(t * 0.4 + i) * 0.25)
                a.needsUpdate = true
                planet.rotation.y = t * 0.01
            }
            renderer.render(scene, camera)
            raf = requestAnimationFrame(frame)
        }
        frame()

        return () => {
            document.body.style.overflow = ""
            cancelAnimationFrame(raf)
            window.removeEventListener("resize", resize)
            window.removeEventListener("pointermove", onMove)
            disposables.forEach((d) => d.dispose && d.dispose())
            renderer.dispose()
            if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
        }
    }, [cameFromMoon])

    return (
        <div className={"about-page" + (leaving ? " leaving" : "")} ref={pageRef}>
            <div ref={bgRef} className="about-bg" aria-hidden="true" />

            {/* light from the dive fades out as you arrive on the moon */}
            {emerging && <div className="emerge" onAnimationEnd={() => setEmerging(false)} aria-hidden="true" />}
            <div ref={fadeRef} className="leave-fade" aria-hidden="true" />

            <div className="about-content">
                {/* intro: photo + bio */}
                <section className="about-intro reveal in">
                    <Tilt className="about-photo-wrap">
                        <div className="about-photo z2" aria-label="Photo placeholder"><span>YJ</span></div>
                    </Tilt>
                    <Tilt className="about-intro-card">
                        <p className="about-kicker z1">// ABOUT ME</p>
                        <h1 className="about-name z2">{NAME}</h1>
                        <p className="about-role z1">{ROLE}</p>
                        {BIO.map((p, i) => (
                            <p className="about-bio z1" key={i}>{p}</p>
                        ))}
                    </Tilt>
                </section>

                {/* skills */}
                <section className="reveal">
                    <h2 className="about-h">SKILLS</h2>
                    <div className="skill-grid">
                        {SKILLS.map((g) => (
                            <Tilt className="skill-panel" key={g.group}>
                                <span className="skill-group z1">{g.group.toUpperCase()}</span>
                                <div className="skill-tags z2">
                                    {g.items.map((s) => (
                                        <span className="skill-tag" key={s}>{s}</span>
                                    ))}
                                </div>
                            </Tilt>
                        ))}
                    </div>
                </section>

                {/* journey */}
                <section className="reveal">
                    <h2 className="about-h">MY JOURNEY</h2>
                    <ol className="timeline">
                        {JOURNEY.map((j, i) => (
                            <li key={j.title}>
                                <Tilt className="timeline-item" base={i % 2 ? 7 : -7}>
                                    <span className="timeline-when z1">{j.when}</span>
                                    <h3 className="z2">{j.title}</h3>
                                    <p className="z1">{j.text}</p>
                                </Tilt>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* contact */}
                <section className="about-cta reveal">
                    <Tilt className="cta-card">
                        <h2 className="about-h z2">GET IN TOUCH</h2>
                        <p className="about-bio z1">Available in Singapore, open to internships and full-stack / DevOps roles.</p>
                        <div className="cta-row z2">
                            <button className="about-btn" onClick={flyToPlanet}>VIEW MY WORK</button>
                            <button className="about-btn" onClick={() => navigate("/Contact")}>CONTACT ME</button>
                        </div>
                    </Tilt>
                </section>
            </div>
        </div>
    )
}

export default About