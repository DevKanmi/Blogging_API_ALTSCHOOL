import { config } from "dotenv"
import { DBConnection } from "./src/configs/db.js"
import { app } from "./src/app.js"

config()
DBConnection()

const PORT = process.env.PORT || 8080

app.listen(PORT, () =>{
    console.log(`App is running on port ${PORT}`)
})