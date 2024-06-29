import passport from 'passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';
import GoogleStrategy from 'passport-google-oauth2';
import db from './database.js';//importing databse connection


//local strategy
passport.use("local", new Strategy(async function verify(username, password, cb) {
  try {
    const result = await db.query("SELECT * FROM users WHERE user_email = $1", [username]);
    if(result.rows.length > 0){
      const user = result.rows[0];
      const storedHasedPassword = user.password;
      bcrypt.compare(password, storedHasedPassword, (err, valid) => {
        if(err){
          console.log("Error comparing password");
          return cb(err);
        }else{
          if(valid){
            return cb(null, user);
          } 
          else{
            console.log("Something went wrong")
            return cb(null, false , {message: "Something went wrong"});
          } 

        }
      })
    }else{
      console.log("user does not exist")
      return cb(null,false,{message: "No user found"})
    }
  } catch (err) {
    console.log(err)
  }
   

})
)

//Google strategy
passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://inventory-vista-1380f6b5a8bd.herokuapp.com/inventory",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo", // Adjust the URL as per your application setup
    },
    async (accessToken, refreshToken, profile, done) => {
    
      try {
        // Check if user exists in the database
        const user = await db.query('SELECT * FROM users WHERE user_email = $1', [profile.email]);
        if (user.rows.length === 0) {
          // If user doesn't exist, create a new user in the database
          const newUser = await db.query('INSERT INTO users (user_email, user_name,password) VALUES ($1, $2, $3) RETURNING *', [
            profile.email,
            profile.displayName,
            "Google"
          ]);
          done(null, newUser.rows[0]); 
          console.log(profile);// Pass the new user to done callback
        } else {
          done(null, user.rows[0]); // User exists, pass the user to done callback
        }
      } catch (err) {
        done(err); // Pass any errors to done callback
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.user_email); // Serialize the user ID
});

passport.deserializeUser(async (email, done) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE user_email = $1', [email]);
    if (result.rows.length > 0) {
      done(null, result.rows[0]); // Deserialize the user object
    } else {
      done(new Error('User not found'));
    }
  } catch (err) {
    done(err);
  }
});


export default passport;







