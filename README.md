# Instagram MERN Stack

A full-stack application that mimics the core features of Instagram, built using the MERN stack (MongoDB, Express, React, Node.js). This project showcases user authentication, image uploading, and real-time interactions.

## Features

- **User Authentication**: Register and log in users with JWT (JSON Web Tokens).
- **Image Uploads**: Users can upload images and share them with others.
- **Feed**: View posts from users you follow in a visually appealing feed.
- **Likes and Comments**: Users can like and comment on posts.
- **User Profiles**: Each user has a profile displaying their posts and information.
- **Responsive Design**: Mobile-friendly UI built with React and CSS.

## Technologies Used

- **Frontend**: React, Redux, Axios, React Router, Bootstrap/CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **Cloud Storage**: [Cloudinary](https://cloudinary.com/) for image uploads
- **Real-Time Functionality**: Socket.io for real-time notifications

## Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB installed locally or access to a MongoDB Atlas account
- Cloudinary account for image storage

### Installation

1. Clone the repository:
   git clone https://github.com/khirod24/INSTAGRAM.git
   cd INSTAGRAM

2. Set up the backend:
   - Navigate to the server directory:
     cd backend

   - Install dependencies:
     npm install
   - Create a `.env` file and add your environment variables (like MongoDB URI, JWT secret, Cloudinary credentials).

3. Start the backend server:
   npm run dev

4. Set up the frontend:
   - Navigate to the client directory:
     cd frontend

   - Install dependencies:
     npm install
     
   - Start the frontend development server:
     npm start

### Usage

- Navigate to `http://localhost:3000` to view the application.
- Register a new account or log in with an existing account.
- Start sharing your photos and interacting with other users!

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a pull request.

## Acknowledgements

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)
- [Cloudinary](https://cloudinary.com/)

## Contact

For any inquiries or feedback, please reach out to [khirod4300dav@gmail.com]

Feel free to customize it further based on your project's specific features and requirements!