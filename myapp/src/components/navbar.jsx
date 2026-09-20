import "../css/navbar.css"

function Navbar() {
    return (
        <nav className="navbar NavBar p-2">
  <div className="container-fluid">
    <a className="navbar-brand" href="/">Home</a>

        <div className="ms-auto">
                    <a className ="navbar-brand" href="/About">About</a>
                <a className="navbar-brand" href="/Portfolio">Portfolio</a>
                <a className="navbar-brand" href="/Contact">Contact</a>
        </div>
  </div>
</nav>
    )
}


export default Navbar