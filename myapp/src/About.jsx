import "./css/about.css"
import { useNavigate } from "react-router-dom"

function About() {
    const navigate = useNavigate()
    return (
        <div className="about-page">

            <div className="moon-decor moon-top"></div>
            <div className="moon-decor moon-bottom"></div>

            <div className="about-content">
                <p className="section-label">ABOUT</p>
                <h1 className="about-heading">A little about me</h1>

                <div className="about-top-grid">
                    <div className="photo-box"><span>Photo</span></div>
                    <div className="bio-box"><span>Bio</span></div>
                </div>

                <hr className="divider" />

                <p className="section-label">Skills</p>
                <div className="skills-row">
                    <div className="skill-tag">Frontend<br />frameworks</div>
                    <div className="skill-tag">Backend<br />frame works</div>
                </div>

                <p className="section-label underline">My Journey</p>
                <div className="journey-list">
                    <div className="journey-item"></div>
                    <div className="journey-item"></div>
                    <div className="journey-item"></div>
                </div>

                <button className="get-in-touch" onClick={() => navigate("/Contact")}>
                    GET IN TOUCH
                </button>
            </div>
        </div>
    )
}

export default About