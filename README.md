# Chat Application

A real-time chat application built using **Socket.io** for real-time communication, **Redis** for message brokering and scalability, and a modern front-end UI for a smooth user experience. This chat app allows users to send and receive messages instantly in multiple chat rooms or one-on-one conversations.

## Features

- **Real-time messaging**: Instant communication using WebSockets powered by Socket.io.
- **Scalability**: Redis as a message broker allows horizontal scaling for handling high traffic loads.
- **Responsive UI**: The front-end is built using React, ensuring a responsive and modern UI for both desktop and mobile devices.
- **Private Chat**: One-on-one private messaging is supported.
- **User Authentication**: Integration with user authentication systems like JWT (JSON Web Tokens) or OAuth for secure access.

## Technologies Used

- **Frontend**:
  - **React**: A JavaScript library for building user interfaces.
  - **Socket.io-client**: The client-side library to handle real-time communication over WebSockets.
  - **tailwind**: For styling the application and ensuring responsiveness.
  
- **Backend**:
  - **Node.js**: A JavaScript runtime for building scalable network applications.
  - **Express.js**: A web framework for Node.js to handle routing and HTTP requests.
  - **Socket.io**: A library for enabling real-time, bidirectional communication between web clients and servers.
  - **Redis**: Used for handling pub/sub messaging, enabling message distribution between multiple server instances.
  - **JWT** : For authenticating users securely with tokens.

## Installation

### Prerequisites

Ensure that you have the following installed on your machine:
- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Redis** (for local development)

### Steps to Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/RudraIIT/chat-app.git
   cd chat-app
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   cd frontend/vite-projec
   npm install
   ```

4. Set up your Redis server (you can install Redis locally or use a hosted service like Redis Labs).

   - Start Redis locally with the following command:

     ```bash
     redis-server
     ```
   - Or you can use docker for spinning a redis container

5. Set up environment variables for the backend. Create a `.env` file in the `backend` directory and add:

   ```env
   JWT_SECRET=your_jwt_secret
   And other options
   ```

6. Run the backend server:

   ```bash
   cd backend
   npm run dev
   ```

7. Run the frontend server:

   ```bash
   cd frontend/vite-project
   npm run dev
   ```

8. Open your browser and go to `http://localhost:5173` to access the chat app.

## Scalability

This app uses **Redis** for message brokering, enabling it to scale horizontally across multiple server instances. Redis Pub/Sub ensures that messages are broadcasted in real-time across all active WebSocket connections, regardless of which server the user is connected to.

- **Redis for Session Management**: Store user sessions in Redis to support scaling and ensure session consistency across multiple server instances.
- **Multiple Backend Instances**: Scale your Node.js backend across multiple instances to handle high traffic loads without affecting real-time communication.

## UI/UX

The front-end of the chat app is built with **React**, offering a modern, responsive user interface. The app is designed to work smoothly on both desktop and mobile devices, providing a consistent and engaging chat experience.

- **User-friendly chat interface**: Conversations are easy to read and navigate.
- **Message notifications**: Real-time notifications when new messages arrive.
