// src/App.tsx
import React from 'react'; // <-- Added this import to fix the JSX error
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SessionDetails from './pages/SessionDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Layout from './components/Layout';

// The "Bouncer" Component
// Changed JSX.Element to React.ReactNode (Industry standard for children props)
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('parea_token');
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

function App() {
  // We will replace this with your real Client ID from Google Cloud Console later!
  const GOOGLE_CLIENT_ID = "108248352105-3115m4rrko7s3d2ptu8dbfpr15uu91sg.apps.googleusercontent.com"; 

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes (Anyone can visit these) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes (Wrapped in our Bouncer!) */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/sessions/:id" 
            element={
              <PrivateRoute>
                <SessionDetails />
              </PrivateRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;