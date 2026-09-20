import "./css/portfolio.css"
import { useNavigate } from "react-router-dom"

function Portfolio() {
    const navigate = useNavigate()

    const projects = [
        { title: "Project 1" },
        { title: "Project 2" },
        { title: "Project 3" },
        { title: "Project 4" },
    ]

    return (
        <div className="portfolio-page">

            <div className="moon-decor moon-top"></div>

            <div className="portfolio-content">
                <p className="section-label">PORTFOLIO</p>
                <h1 className="portfolio-heading">SELECTED WORK</h1>
                <p className="portfolio-subtitle">My projects</p>

                <div className="filter-row">
                    <select className="filter-select" defaultValue="Websites">
                        <option value="Websites">Websites</option>
                        <option value="Apps">Apps</option>
                        <option value="All">All</option>
                    </select>
                </div>

                <div className="project-grid">
                    {projects.map((project, i) => (
                        <div className="project-item" key={i}>
                            <h3 className="project-title">{project.title}</h3>
                            <div
                                className="project-box"
                                onClick={() => navigate(`/Portfolio/${i + 1}`)}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Portfolio