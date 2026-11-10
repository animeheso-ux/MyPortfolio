import "./css/contact.css"
import { useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"

function Contact() {
    const navigate = useNavigate()
    const location = useLocation()
    const [form, setForm] = useState({ name: "", email: "", comments: "" })
    // true when you came through the door on the Portfolio page
    const [arriving, setArriving] = useState(!!(location.state && location.state.fromDoor))

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // wire up your send logic here (API call, mailto, etc.)
        console.log(form)
    }

    return (
        <div className="contact-page">
            {/* the doorway light fades away as you step through */}
            {arriving && <div className="door-arrive" onAnimationEnd={() => setArriving(false)} aria-hidden="true" />}

            <div className="moon-decor moon-mid"></div>

            <div className="contact-content">
                <p className="section-label">CONTACT</p>
                <h1 className="contact-heading">Contact me!</h1>

                <div className="contact-grid">

                    <div className="contact-links">
                        <p className="links-title">Ways to reach me!</p>
                        <a href="mailto:animeheso@gmail.comx" className="link-btn">animeheso@gmail.com</a>
                        <a href="https://www.linkedin.com/in/lim-yong-jian-566985396/" target="_blank" rel="noreferrer" className="link-btn">LinkedIn</a>
                        <a href="https://github.com/animeheso-ux" target="_blank" rel="noreferrer" className="link-btn">Github</a>
                    </div>
                </div>

                <hr className="divider" />

                <p className="footer-note">
                    Available in Singapore, open to internships and full-stack/devops
                </p>
            </div>
        </div>
    )
}

export default Contact