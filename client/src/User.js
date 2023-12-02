import { Modal, Tab, Tabs, Button } from 'react-bootstrap';
import Login from './login';
import Register from './Register';
import React, { useState } from 'react';

function User() {
    const [showModal, setShowModal] = useState(false);
  
    return (
      <>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Login/Register
        </Button>
  
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Login/Register</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tabs defaultActiveKey="login" id="login-register-tabs">
              <Tab eventKey="login" title="Login">
                <Login />
              </Tab>
              <Tab eventKey="register" title="Register">
                <Register />
              </Tab>
            </Tabs>
          </Modal.Body>
        </Modal>
      </>
    );
  };

export default User;