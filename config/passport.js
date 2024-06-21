import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import db from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Google strategy using passport to add user if they don't exist in DB
 */
passport.use("google",
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/inventory",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    }), async(accessToken, refreshToken, profile, cb) =>{
        try {
            //Check if user exist in DB
            const result =  await db.query("SELECT * FROM users WHERE email = $1", [profile.email.value]);
            if(result.rows.length === 0){ //if not add new user to DB
                const newUser = await db.query("INSERT INTO users (user_email, user_name, user_password) VALUE ($1, $2, $3) RETURNING *",
                    [profile.email,profile.name,"GoogleAuthenticated"]
                );
                return cb(null, newUser.rows[0]);
            }else{
            //return the user
            return cb(null, result.rows[0]);
            }

        } catch (err) {
           return cb(err);
        }
    }
)

/**
 * Serialize and Deserialize the user
 */
passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });

  export default passport;