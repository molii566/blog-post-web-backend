const bcrypt = require("bcrypt");
const express = require("express");
const db = require("better-sqlite3")("database.db")
db.pragma("journal_mode = WAL");
// database starts here
const createTables = db.transaction(() => {
    db.prepare(
        `
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        username STRING NOT NULL UNIQUE, 
        password STRING NOT NULL)`
    ).run()
})

createTables()
// database ends here
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
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    stmt.run(req.body.username, hash);

  //give user cookie to login

    res.send("User registered");

    
});

const port = 8000;
app.listen(port, () => {
    console.log(`I'm on port ${port}`);
});
