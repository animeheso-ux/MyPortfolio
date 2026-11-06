import "../css/navbar.css"
import { createPortal } from "react-dom"
import Icon from "../PortfolioImages/YJ Studios Moonlit Emblem.png"

function Navbar() {
    return createPortal(
        <nav
            className="navbar NavBar p-0"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                display: "flex",
            }}
        >
            <div className="container-fluid">
                <img src={Icon} alt="YJ Studios logo" />
                <a className="navbar-brand" href="#/">Home</a>

                <div className="ms-auto">
                    <a className="navbar-brand" href="#/About">About</a>
                    <a className="navbar-brand" href="#/Portfolio">Portfolio</a>
                    <a className="navbar-brand" href="#/Contact">Contact</a>
                </div>
            </div>
        </nav>,
        document.body
    )
}

export default Navbar