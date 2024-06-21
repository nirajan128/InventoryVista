import express from "express"

const router = express();


/**
 * Routes for pages
 */
router.get("/", (req,res) => {
    res.render("home.ejs")
})

router.get("/inventory", (req,res) =>{
    if (req.isAuthenticated()) {
        res.render("index.ejs");
      } else {
        res.redirect("/login");
      }
})

router.get("/login", (req,res) => {
    res.render("login.ejs")
})

router.get("/register", (req,res) => {
    res.render("register.ejs")
})



export default router;