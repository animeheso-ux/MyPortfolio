import "./css/home.css"
import { useNavigate } from "react-router-dom"

function Home() {
    const navigate = useNavigate()
    return (
        <div>

            <div className="filter">
                <h1 className="Greeting">Hi!</h1>
                <h1 className="name-font">Im Yong Jian</h1>
                <h1 className="subtitle">FULL STACK DEVELOPER</h1>

                <div className="CTA">
                    <button className="cta-work" onClick={() => navigate("/Portfolio")}>
                        MY WORK
                    </button>
                    <button className="scroll-arrow" onClick={() => navigate("/About")} aria-label="Scroll down">
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