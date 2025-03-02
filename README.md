Backend Web Development Project 🚀

This project demonstrates my work in backend web development using Node.js and Express. The application handles user registration, authentication, dynamic content management, and more. It features a simple blog where users can create, edit, and delete posts, with user input being validated and stored in a SQLite database.

This project is still a work in progress. I'm actively developing and improving it, so feel free to check back for updates. ✨
Features 🔧:

    Backend: Built with Node.js and Express to handle HTTP requests, routing, and business logic.
    User Registration & Authentication: Users can register with a unique username and password. Passwords are hashed and stored securely using bcrypt. JWT tokens are used for authentication, and user sessions are managed with cookies.
    Dynamic Content: Users can create, edit, and delete blog posts. Posts are stored in a SQLite database and associated with the user's account.
    Views: Uses EJS as the templating engine to render dynamic HTML content.
    Input Validation: Ensures that user input, including usernames, passwords, and post content, meets specific criteria.
    Frontend Styling: The frontend is styled with SimpleCSS, a lightweight and minimalist CSS framework. 🎨
    Security: Implements basic security features like input sanitization, password hashing, and JWT token validation.

Code Breakdown 📝:

    server.js: Contains the Express server setup, routes for rendering views (homepage, login, create-post, edit-post, single-post), and logic for handling user registration, login, and post management.
    dotenv: Used to load environment variables (e.g., JWT secret) from a .env file for security.
    JWT Authentication: Uses JWT tokens for user authentication. Tokens are stored in cookies for session management.
    SQLite Database: Uses SQLite for database management. The database is initialized with tables for users and posts.
    Markdown Rendering: Uses marked and sanitize-html to allow users to submit markdown-formatted posts, which are rendered safely on the frontend.

Frontend Styling 🎨:

The frontend uses SimpleCSS for clean, responsive, and minimalist design. It's a small, easy-to-use framework that helps achieve a modern look without the need for complex CSS.
Installation 💻:

To run this project locally, clone the repository and install the required dependencies:

git clone https://github.com/molii566/blog-post-web-backend.git
cd blog-post-web-backend
npm install express
npm install nodemon
npm install bcrypt jsonwebtoken better-sqlite3 sanitize-html marked dotenv cookie-parser
npm start

Ensure you have a .env file in the root of the project with the following environment variable:

JWTSECRET=your_jwt_secret_key_here

How It Works 📋:

    User Registration:
        Users register by providing a username and password.
        Passwords are hashed using bcrypt before being stored in the database.
        Once registered, users receive a JWT token for authentication.

    User Login:
        Users log in using their username and password.
        Upon successful login, a JWT token is generated and sent to the user's browser as a cookie.

    Post Management:
        Users can create, edit, and delete posts.
        Posts are stored in a SQLite database and associated with the logged-in user.
        User input (e.g., post content) is sanitized to prevent malicious code execution.

    Views:
        EJS is used to render dynamic pages for the homepage, dashboard, single post view, and forms for creating and editing posts.
