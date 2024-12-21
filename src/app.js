import express from "express";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler.js";
import { config } from "dotenv";
config()

//Import Routers
import { authRouter } from "./routes/auth.routes.js";
import { blogRouter } from "./routes/blog.routes.js";

export const app = express()

const API_VERSION = process.env.API_VERSION

app.use(express.json())

app.use(morgan('dev'))

app.get('/',(req, res) =>{
        res.send("Welcome to Clinton's AltSchool BlogAPI Service");
    }
)

app.use(`/api/v${API_VERSION}/auth/`, authRouter)
app.use(`/api/v${API_VERSION}/blogs/`,blogRouter)


app.use("**", (req, res) => {
	res.status(404).send({ message: "This route does not exist" });
})

app.use(errorHandler)










