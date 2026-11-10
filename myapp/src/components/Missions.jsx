import "../css/missions.css"
import { useEffect, useRef, useState } from "react"

/* Edit this list: titles, briefs, stacks and links are yours to change.
   Stacks only include what I know from your projects; add or fix as needed. */
const MISSIONS = [
    {
        id: "muscify",
        code: "MSN-01",
        title: "Muscify",
        category: "Full-stack",
        tag: "FEATURED",
        brief: "A music app and my main portfolio project.",
        stack: [],
        link: "",
    },
    {
        id: "learning-quest",
        code: "MSN-02",
        title: "Learning Quest",
        category: "Full-stack",
        tag: "GROUP · C270",
        brief: "A quiz and learning platform built with my team for my devops course, I was the team leader making everytime works but I mainly did the quiz page and deployment with google cloud",
        stack: ["Full-stack", "Docker", "Google Cloud"],
        link: "",
    },
    {
        id: "pathway",
        code: "MSN-03",
        title: "Pathway",
        category: "Full-stack",
        tag: "CAREER GUIDANCE",
        brief: "A career guidance website with secure sign-in.",
        stack: ["React", "Express", "MySQL", "JWT"],
        link: "",
    },
    {
        id: "activity-tracker",
        code: "MSN-04",
        title: "Runnova",
        category: "Full-stack",
        tag: "STRAVA-INSPIRED",
        brief: "A Strava-inspired tracker for logging and viewing activities.",
        stack: ["Express", "EJS", "Bootstrap 5"],
        link: "https://yongjian-c237-ca2-team1.onrender.com",
    },
    {
        id: "zoom-clone",
        code: "MSN-05",
        title: "Zoom Clone",
        category: "Real-time",
        tag: "LIVE VIDEO",
        brief: "A video meeting app with live connections between users.",
        stack: ["React", "WebSockets", "webRTC"],
        link: "https://github.com/animeheso-ux/ZoomClone-WebRTC",
    },
    {
        id: "mediasoup",
        code: "MSN-06",
        title: "Mediasoup Video Call",
        category: "Real-time",
        tag: "SFU",
        brief: "A video call app built on the mediasoup media server.",
        stack: ["React", "Node.js", "Express", "mediasoup"],
        link: "https://github.com/animeheso-ux/SFU-with-mediasoup",
    },
        {
        id: "Musicify(Mobile)",
        code: "MSN-07",
        title: "Musicify(Mobile)",
        category: "Mobile App",
        tag: "MUSIC",
        brief: "I made this app based on my web version of musicfiy",
        stack: ["React Native", "Node.js", "Express"],
        link: "",
    },
]

const FILTERS = ["All", "Full-stack", "Real-time","Mobile App"]

function Missions() {
    const rootRef = useRef(null)
    const [filter, setFilter] = useState("All")
    const [selectedId, setSelectedId] = useState(MISSIONS[0].id)

    const visible = MISSIONS.filter((m) => filter === "All" || m.category === filter)
    const selected = visible.find((m) => m.id === selectedId) || visible[0]

    // reveal on scroll
    useEffect(() => {
        const el = rootRef.current
        if (!el) return
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && el.classList.add("in")),
            { threshold: 0.15 }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [])

    return (
        <div className="missions" ref={rootRef}>
            <div className="m-head">
                <span className="m-kicker">// SELECT MISSION</span>
                <h2 className="m-title">SELECTED WORK</h2>
                <div className="m-line" />
            </div>

            <div className="m-filters" role="tablist" aria-label="Filter missions">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        role="tab"
                        aria-selected={filter === f}
                        className={"m-chip" + (filter === f ? " active" : "")}
                        onClick={() => setFilter(f)}
                    >
                        {f.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="m-body">
                {/* mission list */}
                <div className="m-list">
                    {visible.map((m) => (
                        <button
                            key={m.id}
                            className={"m-card" + (selected && selected.id === m.id ? " selected" : "")}
                            aria-pressed={selected && selected.id === m.id}
                            onClick={() => setSelectedId(m.id)}
                        >
                            <span className="m-code">{m.code}</span>
                            <span className="m-name">{m.title}</span>
                            <span className="m-tag">{m.tag}</span>
                            <span className="m-arrow" aria-hidden="true">›</span>
                        </button>
                    ))}
                </div>

                {/* data panel */}
                {selected && (
                    <aside className="m-panel" key={selected.id}>
                        <div className="m-panel-top">
                            <span>MISSION BRIEF</span>
                            <span className="m-dot" /> <span>{selected.code}</span>
                        </div>
                        <h3 className="m-panel-title">{selected.title}</h3>
                        <p className="m-panel-text">{selected.brief}</p>

                        <div className="m-specs">
                            <div>
                                <span className="m-label">CLASS</span>
                                <span>{selected.category.toUpperCase()}</span>
                            </div>
                            <div>
                                <span className="m-label">TAG</span>
                                <span>{selected.tag}</span>
                            </div>
                        </div>

                        {selected.stack.length > 0 && (
                            <>
                                <span className="m-label">TECH STACK</span>
                                <div className="m-stack">
                                    {selected.stack.map((s) => (
                                        <span key={s} className="m-pill">{s}</span>
                                    ))}
                                </div>
                            </>
                        )}

                        {selected.link ? (
                            <a className="m-launch" href={selected.link} target="_blank" rel="noreferrer">
                                OPEN FILE
                            </a>
                        ) : (
                            <button className="m-launch disabled" disabled>
                                LINK COMING SOON
                            </button>
                        )}
                    </aside>
                )}
            </div>
        </div>
    )
}

export default Missions