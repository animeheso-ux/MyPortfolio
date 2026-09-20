
import "./css/index.css"
import Navbar from './components/navbar.jsx'
import Home from "./Home.jsx"
import About from "./About.jsx"
import Contact from "./Contact.jsx"
import Portfolio from "./Portfolio.jsx"
import Error from "./Error.jsx"

import { BrowserRouter, Route , Routes } from 'react-router-dom'



function App() {

  return (
            <BrowserRouter>
            <div>
                  <Navbar/>
            </div>


            <Routes>             
              <Route path="/" element={<Home/>}></Route>
            <Route path="/About" element={<About/>}></Route>
            <Route path="/Contact" element={<Contact/>}></Route>
            <Route path="/Portfolio" element={<Portfolio/>}></Route>
            <Route path="*" element={<Error/>}></Route>
            </Routes>
            </BrowserRouter>





  )
}

export default App
