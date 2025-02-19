const express = require("express");
const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(function (req, res, next) {
    res.locals.errors = []; // Corrected spelling to `res.locals.errors`
    next();
});

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("homepage");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/register", (req, res) => {
    const errors = [];

    if (typeof req.body.username !== "string") req.body.username = "";
    if (typeof req.body.password !== "string") req.body.password = "";

    req.body.username = req.body.username.trim();

    if (!req.body.username) errors.push("You must enter a username");
    if (req.body.username && req.body.username.length < 3) errors.push("Username must be more than 3 characters");
    if (req.body.username && req.body.username.length > 10) errors.push("Username must be 10 or fewer characters");
    if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username must contain only numbers and letters");

    

    if (!req.body.password) errors.push("You must enter a password");
    if (req.body.password && req.body.password.length < 8) errors.push("password must be more than 8 characters");
    if (req.body.password && req.body.password.length > 24) errors.push("password must be 24 or fewer characters");


    if (errors.length) {
       
        return res.render("homepage", { errors: errors });
    } 

  //to save user to database
  //give user cookie to login

    console.log(req.body);
});

const port = 8000;
app.listen(port, () => {
    console.log(`I'm on port ${port}`);
});
