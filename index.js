/**
 * 1.Import required node packages
 */


import dotenv from "dotenv"
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import flash from "connect-flash"; //to display error or success messege       


import auth from "./routes/auth.js";
import passport from "./config/passport.js"
import router from "./controllers/data.js"


/**
 * 2.Setup express and port
 */
const app = express();
const PORT = 3000;


/**
 * 3.setup Middleware
 */
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));
app.use(cors());
app.use(flash()); 



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
app.use("/", router);


/**
 * 5.host the app
 */
app.listen(PORT, ()=>{
    console.log("THE app is hosted on port", PORT);
})



