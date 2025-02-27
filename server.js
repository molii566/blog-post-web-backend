require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const cookieParser = require("cookie-parser"); // Add this line
const db = require("better-sqlite3")("database.db");

db.pragma("journal_mode = WAL");

// database starts here
const createTables = db.transaction(() => {
    db.prepare(
        `
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        username STRING NOT NULL UNIQUE, 
        password STRING NOT NULL)`
    ).run();
});

createTables();
// database ends here

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(cookieParser()); // Add this line
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
    res.locals.errors = [];

    // decoding the incoming cookie
    try {
        const decoded = jwt.verify(req.cookies.mysimpleapp, process.env.JWTSECRET);
        req.user = decoded;
    } catch (err) {
        req.user = false;
    }
    res.locals.user = req.user;
    console.log("User:", req.user); // Debugging statement
    next();
});

app.get("/", (req, res) => {
    if(req.user){
     return res.render("dashboard");
    }
    res.render("homepage" );
});

app.get("/create-post", (req, res) => {
    if (!req.user) {
        return res.redirect("/login");
    }
    res.render("create-post");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/logout", (req, res) => {
    res.clearCookie("mysimpleapp", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });
    res.redirect("/");
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
    if (req.body.password && req.body.password.length < 8) errors.push("Password must be more than 8 characters");
    if (req.body.password && req.body.password.length > 24) errors.push("Password must be 24 or fewer characters");

    if (errors.length) {
        return res.render("homepage", { errors: errors });
    }

    // to save user to database
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    stmt.run(req.body.username, hash);
    const lookupstmt = db.prepare("SELECT * FROM users WHERE username = ?");
    const ouruser = lookupstmt.get(req.body.username);

    // give user cookie to login
    const ourtoken = jwt.sign(
        { exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, skycolor: "blue", userid: ouruser.id, username: ouruser.username },
        process.env.JWTSECRET
    );
    res.cookie("mysimpleapp", ourtoken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24,
    });

    res.send("User registered");
});

app.post("/login", (req, res) => {
    const errors = [];
    if (typeof req.body.username !== "string") req.body.username = "";
    if (typeof req.body.password !== "string") req.body.password = "";

    req.body.username = req.body.username.trim();
    if (!req.body.username) errors.push("You must enter a username");
    if (req.body.username && req.body.username.length < 3) errors.push("Username must be more than 3 characters");
    if (req.body.username && req.body.username.length > 10) errors.push("Username must be 10 or fewer characters");
    if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username must contain only numbers and letters");
    if (errors.length) {
        return res.render("login", { errors: errors });
    }
    const lookupstmt = db.prepare("SELECT * FROM users WHERE username = ?");
    const ouruser = lookupstmt.get(req.body.username);
    if (!ouruser) {
        return res.render("login", { errors: ["Invalid Username / Password"] });
    }

    const matchornot = bcrypt.compareSync(req.body.password, ouruser.password);
    if (!matchornot) {
        return res.render("login", { errors: ["Invalid Username / Password"] });
    }
    // give the user a cookie
    const ourtoken = jwt.sign(
        { exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, skycolor: "blue", userid: ouruser.id, username: ouruser.username },
        process.env.JWTSECRET
    );
    res.cookie("mysimpleapp", ourtoken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24,
    });
    res.redirect("/");
});

const port = 8000;
app.listen(port, () => {
    console.log(`I'm on port ${port}`);
});
