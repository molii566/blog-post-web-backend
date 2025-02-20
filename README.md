# Backend Web Development Project 🚀

This project demonstrates my work in **backend web development** using **Node.js** and **Express**.
The application handles user registration, authentication, and serves dynamic content through an **EJS** templating engine.

*This project is still a work in progress. I'm actively developing and improving it, so feel free to check back for updates.* ✨

## Features 🔧:
- **Backend**: Built with **Node.js** and **Express** to handle HTTP requests, routing, and business logic.
- **User Registration**: Implements form validation for user input, ensuring that usernames and passwords meet specific criteria.
- **Views**: Uses **EJS** as the templating engine to render dynamic HTML content.
- **Frontend Styling**: The frontend is styled with **[SimpleCSS](https://simplecss.eu)**, a lightweight and minimalist CSS framework. 🎨
- **User Input Validation**: Handles errors in user input (e.g., username and password) and displays error messages if necessary. ⚠️

## Code Breakdown 📝:
- **`server.js`**: Contains the Express server setup, routes for rendering views (`homepage`, `login`), and logic for handling user registration requests.
- **Validation**: Validates the user’s username and password input, checking for length, format, and required fields.
- **Static Files**: Uses the `public` folder for static assets like CSS and JavaScript files.

## Frontend Styling 🎨:
The frontend uses **[SimpleCSS](https://simplecss.eu)** for clean, responsive, and minimalist design. It's a small, easy-to-use framework that helps achieve a modern look without the need for complex CSS.

## Installation 💻:
To run this project locally, clone the repository and install the required dependencies:

```bash
git clone https://github.com/molii566/blog-post-web-backend.git
cd blog-post-web-backend
npm install express
npm install nodemon
npm start
