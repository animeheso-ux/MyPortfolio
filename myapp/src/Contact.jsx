import "./css/contact.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

function Contact() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: "", email: "", comments: "" })

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
      
            <div className="moon-decor moon-mid"></div>

            <div className="contact-content">
                <p className="section-label">CONTACT</p>
                <h1 className="contact-heading">Contact me!</h1>

                <div className="contact-grid">
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <label htmlFor="name">Name:</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                        />

                        <label htmlFor="email">Email:</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                        />

                        <label htmlFor="comments">Comments:</label>
                        <textarea
                            id="comments"
                            name="comments"
                            value={form.comments}
                            onChange={handleChange}
                        ></textarea>

                        <button type="submit" className="send-btn">Send Message</button>
                    </form>

                    <div className="contact-links">
                        <p className="links-title">Other ways to reach me!</p>
                        <a href="https://mail.google.com/mail/u/0/#inbox" className="link-btn">animeheso@gmail.com</a>
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