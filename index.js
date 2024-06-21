/**
 * 1.Import required node packages
 */
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv"

import router from "./routes/home.js";
import authRoutes from "./routes/auth.js";

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


app.get('/inventory', (req, res) => {
    if (req.isAuthenticated()) {
      res.render('index.ejs', { user: req.user });
    } else {
      res.redirect('/');
    }
  });

app.use("/",authRoutes)

/**
 * 5.host the app
 */
app.listen(PORT, ()=>{
    console.log("THE app is hosted on port", PORT);
})



