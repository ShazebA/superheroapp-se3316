import logo from './logo.svg';
import './App.css';
import React, { Component, useState ,useEffect} from 'react';
import User from './User';
import LandingPage from './LandingPage';
import AuthenticatedSuperheroApp from './AuthenticatedSuperheroApp';
import SuperheroApp from './SuperheroApp';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminPanel from './Admin';
import { Modal, Tab, Tabs, Button } from 'react-bootstrap';
import Footer from './Footer';



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); 


  useEffect(() => {
    
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAdminPanelToggle = () => {
    setShowAdminPanel(!showAdminPanel);
  };

  useEffect(() => {
    
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin'); 
    if (token) {
      setIsAuthenticated(true);
      setIsAdmin(isAdmin);
    }

    if (isAdmin) {
      setIsAdmin(true);
      console.log("isAdmin");
    }
  }, []);

  
  const handleLoginSuccess = (token) => {
    setIsAuthenticated(true);
    
    localStorage.setItem('token', token);
    localStorage.setItem('isAdmin', isAdmin);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
  };

return (
  <div className='App'>

      {isAuthenticated && (
        <div className="welcome-message">
          Welcome {isAdmin ? "Site Manager" : "User"}!
        </div>
      )}
    {!isAuthenticated ? (
      <>
          <User onLoginSuccess={handleLoginSuccess} />
          <LandingPage />
          <SuperheroApp />
        </>
            ) : (
              <>
              <AuthenticatedSuperheroApp onLogout={handleLogout} />
              {isAdmin && (
                <Button variant="primary" onClick={handleAdminPanelToggle}>
                  Admin Panel
                </Button>
              )}
    
              <Modal show={showAdminPanel} onHide={handleAdminPanelToggle} size="lg">
                <Modal.Header closeButton>
                  <Modal.Title>Admin Panel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <AdminPanel />
                </Modal.Body>
              </Modal>
            </>
          )}
        <Footer />

        </div>

      );
    }
    

  
  export default App; 