import express from 'express';
import bcrypt from 'bcrypt';
import passport from "passport";
import db from '../config/database.js';

const auth = express();
const saltRounds = 10;

//home_page
auth.get("/", (req,res) => {
    res.render("home.ejs", {
      loginError: req.flash('loginError'),
      loginSuccess: req.flash('loginSuccess'),
      registerError: req.flash('registerError'),
      registerSuccess: req.flash('registerSuccess')
    })
})

auth.post("/register", async (req, res) => {
    const { email, password, confirmPassword, username } = req.body;
    console.log(password, confirmPassword) // get user input

    if (password !== confirmPassword) {
        req.flash('registerError', 'password do not match')
        return res.redirect("/")
    }

    try {
        const existingUserResult = await db.query("SELECT * FROM users WHERE user_email = $1", [email]);
        if (existingUserResult.rows.length > 0) {
            req.flash('registerError', 'User already exists. Try logging in' ) //flash error message
            return res.redirect("/")
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
                req.flash('registerError', 'Error while logging in')
                return res.redirect("/")
                }
                req.flash('registerSucess', "Succesfully logged in")
             res.redirect("/inventory");
            });
        }
    } catch (err) {
        console.error(err);
        req.flash('registerError', 'Error while registering')
    }
});


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
        req.flash('loginError', 'something went wrong')
         res.redirect("/");
      }
            
    } catch (error) {
      console.log(error);
      req.flash('loginError', 'User does not exist')
      res.redirect("/");
      
    }
     
    } else {
      req.flash('loginError', 'User not authentcated')
      res.redirect("/");
      
      console.log("user not authenticated")
    }
})


auth.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('loginError', info.message || 'Invalid username or password');
      return res.redirect('/');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash('loginSuccess', 'Successfully logged in');
      return res.redirect('/inventory');
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

auth.get("/logout", (req,res) => {
  req.logout((err) => {
    if(err){
      return next(err)
    }
    res.redirect("/")
  })
})


export default auth;