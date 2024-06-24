import express from 'express';
import bcrypt from 'bcrypt';
import passport from "passport";
import { Strategy } from "passport-local";
import db from '../config/database.js';

const auth = express();
const saltRounds = 10;

//home_page
auth.get("/", (req,res) => {
    res.render("home.ejs")
})

auth.post("/register", async (req, res) => {
    const { email, password, confirmPassword, username } = req.body; // get user input

    if (password !== confirmPassword) {
        return res.status(400).send("Passwords do not match.");
    }

    try {
        const existingUserResult = await db.query("SELECT * FROM users WHERE user_email = $1", [email]);
        if (existingUserResult.rows.length > 0) {
            return res.status(400).send("User already exists. Try logging in.");
        } else {
            // hashing the password
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const insertUserQuery = `
                INSERT INTO users (user_email, password, user_name) 
                VALUES ($1, $2, $3) RETURNING *
            `;
            const insertUserValues = [email, hashedPassword, username];

            const result = await db.query(insertUserQuery, insertUserValues);
            const user = result.rows[0];

            console.log(user);
            console.log("Register succesful")

            // log in after registering
            req.login(user, (err) => {
                if (err) {
             res.status(500).send("Error logging in after registration.");
                }
             res.redirect("/inventory");
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("Error while registering.");
    }
});

auth.post("/login", (req, res, next) => {
    console.log('Login attempt');
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.log('Error during authentication:', err);
            return next(err);
        }
        if (!user) {
            console.log('Authentication failed:', info.message);
            return res.redirect("/");
        }
        req.logIn(user, (err) => {
            if (err) {
                console.log('Error during login:', err);
                return next(err);
            }
            console.log('Login successful');
            return res.redirect("/inventory");
        });
    })(req, res, next);
});



/**
 * Get route for google login
 */
auth.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );
  
// Google OAuth callback route
auth.get("/auth/google/inventory",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect("/inventory");
    }
);
//for inventory page of each user
auth.get("/inventory", async (req,res) =>{
    if (req.isAuthenticated()) {
      try {
        const result = await db.query(`SELECT user_name FROM users WHERE user_email = $1`, [req.user.user_email])
        if(result.rows.length > 0){
          const userName = result.rows[0].user_name;
          res.render("index.ejs", {
               userName: userName,
          });
        }else{
          res.redirect("/");
          console.log("something is wrong")
        }
              
      } catch (error) {
        console.log(error);
        res.redirect("/");
        
      }
       
      } else {
        res.redirect("/");
        console.log("user not authenticated")
      }
})

export default auth;