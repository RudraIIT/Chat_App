import SignupPage from './components/signup';
import LoginPage from './components/login';
import WhatsAppLayout from './components/chat';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/context/AuthContext';
import { SocketProvider } from './components/context/SocketContext.tsx';
import { PeerProvider } from './components/context/PeerContext.tsx';
import './App.css';
import { useEffect } from 'react';

function AppRoutes() {
  const { user } = useAuth();
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  },[]);
  return (
    <Routes>
      <Route path="/" element={user ? <WhatsAppLayout /> : <Navigate to="/login" />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <PeerProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </PeerProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
