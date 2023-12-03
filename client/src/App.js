import logo from './logo.svg';
import './App.css';
import React, { Componeny, useState} from 'react';
import User from './User';
import LandingPage from './LandingPage';
import AuthenticatedSuperheroApp from './AuthenticatedSuperheroApp';
import SuperheroApp from './SuperheroApp';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to handle login (this is just an example)
  const handleLoginSuccess = (token) => {
    setIsAuthenticated(true);
    // Optionally, store the token in localStorage or Context
    sessionStorage.setItem('token', token);
  };

  return (
    <div>
      <User onLoginSuccess={handleLoginSuccess} />
      {!isAuthenticated ? (
        <>
          <LandingPage />
          <SuperheroApp />
        </>
      ) : (
        <AuthenticatedSuperheroApp />
      )}
    </div>
  );
}
  
  export default App; 