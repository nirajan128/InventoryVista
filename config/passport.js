import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth2';
import db from './database.js';//importing databse connection

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/inventory",
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
  done(null, user); // Serialize the user object
});

passport.deserializeUser((user, done) => {
  done(null, user); // Deserialize the user object
});

export default passport;







