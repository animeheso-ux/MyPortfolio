import express from "express"
import {exec} from "node:child_process"
import path from "path"
import http from "http"
import { fileURLToPath } from "node:url"

const app = express()
const PORT = 3000
const server = http.createServer(app)

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)


app.use(express.static(path.join(dirname,"myapp/dist")))



app.get("/{*path}",(req,res)=> {
    res.sendFile(path.join(dirname,"myapp/dist","index.html"))
})


exec("cd myapp && npm run build",(err)=> {
    if (err) {
        throw err
    }

    console.log("react build : DONE")
})






server.listen(PORT,() => console.log(`http://localhost:${PORT}`),exec(`start http://localhost:${PORT}`))