require("dotenv").config();
const jwt = require("jsonwebtoken");
const sanitizeHTML = require("sanitize-html");
const marked = require("marked");
const bcrypt = require("bcrypt");
const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("better-sqlite3")("database.db");

db.pragma("journal_mode = WAL");

// database starts here
const createTables = db.transaction(() => {
    db.prepare(
        `
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username STRING NOT NULL UNIQUE,
        password STRING NOT NULL
        )
        `
    ).run()
    
    db.prepare(
        `
        CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        createdDate TEXT,
        title STRING NOT NULL,
        content TEXT NOT NULL,
        auther_id INTEGER,
        FOREIGN KEY (auther_id) REFERENCES users (id)
        )
        `
    ).run()
});

createTables();
// database ends here

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
    // make our markdown function available
    res.locals.filterUserHTML = function (content) {
      return sanitizeHTML(marked.parse(content), {
        allowedTags: ["p", "br", "ul", "li", "ol", "strong", "bold", "i", "em", "h1", "h2", "h3", "h4", "h5", "h6"],
        allowedAttributes: {}
      })
    }
  
    res.locals.errors = []
  
    // try to decode incoming cookie
    try {
      const decoded = jwt.verify(req.cookies.ourSimpleApp, process.env.JWTSECRET)
      req.user = decoded
    } catch (err) {
      req.user = false
    }
  
    res.locals.user = req.user
    console.log(req.user)
  
    next()
  })
app.get("/", (req, res) => {
    if(req.user){
        const postsStatement = db.prepare("SELECT * FROM posts WHERE auther_id = ? ORDER BY createdDate DESC")
        const posts = postsStatement.all(req.user.userid)
     return res.render("dashboard" , {posts});
    }
    res.render("homepage" );
});

function mustbeloggedin(req , res , next){
    if (req.user){
        return next()
    }
    return res.redirect("/")
}

function sharedpostvalidation(req) {
    const errors = [];
    if (typeof req.body.title !== "string") req.body.title = "";
    if (typeof req.body.content !== "string") req.body.content = "";

    req.body.title = sanitizeHTML(req.body.title.trim(), { allowedTags: [], allowedAttributes: [] });
    req.body.content = sanitizeHTML(req.body.content.trim(), { allowedTags: [], allowedAttributes: [] });

    if (!req.body.title) errors.push("You must enter a title");
    if (req.body.title && req.body.title.length < 3) errors.push("Title must be more than 3 characters");
    if (req.body.title && req.body.title.length > 50) errors.push("Title must be 50 or fewer characters");

    if (!req.body.content) errors.push("You must enter content");
    if (req.body.content && req.body.content.length < 10) errors.push("Content must be more than 10 characters");
    if (req.body.content && req.body.content.length > 500) errors.push("Content must be 500 or fewer characters");

    return errors
}

app.get("/create-post", mustbeloggedin, (req, res) => {
    res.render("create-post");
});

app.post("/create-post", mustbeloggedin, sharedpostvalidation, (req, res) => {

    // save to the database
    const stmt = db.prepare("INSERT INTO posts (title, content, auther_id , createdDate) VALUES (?, ?, ? , ?)");
    const result =stmt.run(req.body.title, req.body.content, req.user.userid ,new Date().toISOString());

    const getpoststmt = db.prepare("SELECT * FROM posts WHERE id = ?");
    const ourpost = getpoststmt.get(result.lastInsertRowid);

    res.redirect(`/post/${ourpost.id}`);
});

app.get("/post/:id", (req, res) => {
    const getpoststmt = db.prepare("SELECT posts.*, users.username FROM posts INNER JOIN users ON posts.auther_id = users.id WHERE posts.id = ?");
    const ourpost = getpoststmt.get(req.params.id);
    if (!ourpost) {
        return res.redirect("/")
    }
    res.render("single-post", { post: ourpost });
}
);
app.get("/edit-post/:id", mustbeloggedin, (req, res) => {
    // try to look up the post in question
    const statement = db.prepare("SELECT * FROM posts WHERE id = ?")
    const post = statement.get(req.params.id)
  
    if (!post) {
      return res.redirect("/")
    }
  
    // if you're not the author, redirect to homepage
    if (post.auther_id !== req.user.userid) {
      return res.redirect("/")
    }
  
    // otherwise, render the edit post template
    res.render("edit-post", { post })
  })
  app.post("/edit-post/:id", mustbeloggedin, (req, res) => {
    // try to look up the post in question
    const statement = db.prepare("SELECT * FROM posts WHERE id = ?")
    const post = statement.get(req.params.id)
  
    if (!post) {
      return res.redirect("/")
    }
  
    // if you're not the author, redirect to homepage
    if (post.auther_id !== req.user.userid) {
      return res.redirect("/")
    }
  
    const errors = sharedpostvalidation(req)
  
    if (errors.length) {
      return res.render("edit-post", { errors, post })
    }
  
    const updateStatement = db.prepare("UPDATE posts SET title = ?, content = ? WHERE id = ?")
    updateStatement.run(req.body.title, req.body.content, req.params.id)
  
    res.redirect(`/post/${req.params.id}`)
  })
  
  app.post("/delete-post/:id", mustbeloggedin, (req, res) => {
    // try to look up the post in question
    const statement = db.prepare("SELECT * FROM posts WHERE id = ?")
    const post = statement.get(req.params.id)
  
    if (!post) {
      return res.redirect("/")
    }
  
    // if you're not the author, redirect to homepage
    if (post.auther_id !== req.user.userid) {
      return res.redirect("/")
    }
  
    const deleteStatement = db.prepare("DELETE FROM posts WHERE id = ?")
    deleteStatement.run(req.params.id)
  
    res.redirect("/")
  })
app.get("/login", (req, res) => {
    if (!req.user) {
        return res.render("login");
    }
    res.redirect("/");
});

app.get("/logout", (req, res) => {
    res.clearCookie("mysimpleapp", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });
    return res.redirect("/");
});

app.post("/register", (req, res) => {
    const errors = [];

    if (typeof req.body.username !== "string") req.body.username = "";
    if (typeof req.body.password !== "string") req.body.password = "";

    req.body.username = req.body.username.trim();

    if (!req.body.username) errors.push("You must provide a username.");
    if (req.body.username && req.body.username.length < 3) errors.push("Username must be at least 3 characters.");
    if (req.body.username && req.body.username.length > 10) errors.push("Username cannot exceed 10 characters.");
    if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username can only contain letters and numbers.");

    // check if username exists already
    const usernameStatement = db.prepare("SELECT * FROM users WHERE username = ?");
    const usernameCheck = usernameStatement.get(req.body.username);

    if (usernameCheck) errors.push("That username is already taken.");

    if (!req.body.password) errors.push("You must provide a password.");
    if (req.body.password && req.body.password.length < 8) errors.push("Password must be at least 8 characters.");
    if (req.body.password && req.body.password.length > 70) errors.push("Password cannot exceed 70 characters.");

    if (errors.length) {
        return res.render("homepage", { errors });
    }

    try {
        // to save user to database
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        const result = stmt.run(req.body.username, hash);

        const lookupstmt = db.prepare("SELECT * FROM users WHERE id = ?");
        const ouruser = lookupstmt.get(result.lastInsertRowid);

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
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            errors.push("Username already exists");
            return res.render("homepage", { errors });
        } else {
            console.error(err);
            errors.push("An error occurred. Please try again.");
            return res.render("homepage", { errors });
        }
    }
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
