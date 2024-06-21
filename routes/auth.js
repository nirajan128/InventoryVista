
import passport from "passport";
import express from "express";
import "../config/passport.js"

const router = express();

router.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );
  
// Google OAuth callback route
router.get("/auth/google/inventory",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect("/inventory");
    }
);

  export default router;