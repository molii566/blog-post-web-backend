🚀 Backend Web Development Project
Welcome to my **backend web development** project built with **Node.js** and **Express**! This project demonstrates user registration, authentication, and dynamic content management with a focus on simplicity and security.  


🛠️ Features:  
    • 🔒 **User Authentication**: Register with a unique username and password. Passwords are **hashed** with **bcrypt** for security. Authentication via **JWT tokens** (stored in cookies) to manage user sessions.
    • 📚 **Dynamic Content**: Create, edit, and delete blog posts. Post data is stored in a **SQLite** database. Markdown support: posts are rendered with **marked** and sanitized with **sanitize-html**.
    • 🌐 **Views**: Uses **EJS** for dynamic HTML rendering.
    • 📝 **Validation**: Ensures input like usernames, passwords, and post content follow rules (e.g., username length, password strength).
    • 💅 **Frontend Styling**: Minimal and responsive design using **SimpleCSS**.
    • 🔒 **Security**: Sanitizes user input to avoid XSS vulnerabilities. Hashes passwords and uses **JWT tokens** for authentication.

🚀 How It Works:
    • 1. **User Registration**: Register with a **username** and **password**. Passwords are hashed and stored in the database. A **JWT token** is sent to the user's browser for authentication.
    • 2. **User Login**: Log in using the **username** and **password**. **JWT tokens** are used to validate the session.
    • 3. **Post Management**: Create, edit, or delete posts. Posts are rendered with **markdown** support.
    • 4. **Views**: **EJS** renders dynamic content, including the homepage, single posts, and the dashboard.
📥 Installation
1. Clone the repository:

   ```bash
   git clone https://github.com/molii566/blog-post-web-backend.git
   cd blog-post-web-backend
   ```
2. Install the dependencies:

   ```bash
   npm install
   ```
3. Start the server:

   ```bash
   npm start
   ```
4. Make sure you have a `.env` file with the following content:

   ```
   JWTSECRET=your_jwt_secret_key_here
   ```
🖥️ Project Structure
    • **`server.js`**: Main server file with route handlers, authentication, and post management.
    • **`/views`**: Contains EJS files for rendering dynamic HTML pages.
    • **`/public`**: Static assets like styles and images.
    • **`/db`**: SQLite database with user and post tables.
    • **`/node_modules`**: Dependencies installed via npm.
🚨 Security Features:
    • JWT Authentication: User sessions are managed with **JWT tokens** stored in cookies.
    • Password Hashing: User passwords are hashed using **bcrypt** before being saved in the database.
    • Input Validation & Sanitization: User input is validated and sanitized to prevent malicious content and security vulnerabilities.
🛠️ Technologies Used:
    • Node.js and Express for server-side logic.
    • SQLite for database management.
    • bcrypt for password hashing.
    • jsonwebtoken for JWT authentication.
    • marked and sanitize-html for rendering and sanitizing markdown content.
    • EJS for templating and rendering views.
