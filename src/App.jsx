import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Feed from './components/Feed';
import Messages from './components/Messages';
import Functions from './components/Functions';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Navigation = () => {
  const { logout, session } = useAuth();
  
  return (
    <nav className="nav">
      <div className="nav-content">
        <Link to="/" className="logo">cycl3 ♾️</Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
            @{session?.handle}
          </span>
          <Link to="/" className="btn btn-secondary">Feed</Link>
          <Link to="/messages" className="btn btn-secondary">Messages</Link>
          <Link to="/functions" className="btn btn-secondary">Functions</Link>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </div>
    </nav>
  );
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" /> : <Login />
      } />
      <Route path="/" element={
        <PrivateRoute>
          <>
            <Navigation />
            <Feed />
          </>
        </PrivateRoute>
      } />
      <Route path="/messages" element={
        <PrivateRoute>
          <>
            <Navigation />
            <Messages />
          </>
        </PrivateRoute>
      } />
      <Route path="/functions" element={
        <PrivateRoute>
          <>
            <Navigation />
            <Functions />
          </>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
