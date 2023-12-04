import logo from './logo.svg';
import './App.css';
import React, { Component, useState ,useEffect} from 'react';
import User from './User';
import LandingPage from './LandingPage';
import AuthenticatedSuperheroApp from './AuthenticatedSuperheroApp';
import SuperheroApp from './SuperheroApp';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for token in localStorage on initial render
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Function to handle login (this is just an example)
  const handleLoginSuccess = (token) => {
    setIsAuthenticated(true);
    // Optionally, store the token in localStorage or Context
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <div>
      {!isAuthenticated ? (
        <>
          <User onLoginSuccess={handleLoginSuccess} />
          <LandingPage />
          <SuperheroApp />
        </>
      ) : (
        <AuthenticatedSuperheroApp onLogout={handleLogout} />
      )}
    </div>
  );
}
  
  export default App; 