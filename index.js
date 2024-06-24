/**
 * 1.Import required node packages
 */
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";

import dotenv from "dotenv"

import auth from "./routes/auth.js";
import passport from "./config/passport.js"


/**
 * 2.Setup express and port
 */
const app = express();
const PORT = 3000;
dotenv.config();

/**
 * 3.setup Middleware
 */
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));
app.use(cors());


/**
 * 4. Set up session
 */
app.use(session({
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized: false
}))

/**
 * middleware for session - initialize passport
 */
app.use(passport.initialize());
app.use(passport.session());

app.use("/", auth);


/**
 * 5.host the app
 */
app.listen(PORT, ()=>{
    console.log("THE app is hosted on port", PORT);
})



