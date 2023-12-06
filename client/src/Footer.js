import React, {useState} from 'react';
import DMCARequestForm from './DMCArequest';
import './footer.css';
import { Modal, Button } from 'react-bootstrap';



const Footer = () => {

    const [showModal, setShowModal] = useState(false);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleDmcaFormSubmit = (formData) => {
        // Handle form submission here
        console.log(formData);
        handleCloseModal();
    };

    return (
        <div style={{bottom: 0, width: '100%', textAlign: 'center' }}>
            <a href="/security_privacy_policy.html" target="_blank">Security & Privacy Policy</a> | 
            <a href="/acceptable_use_policy.html" target="_blank">Acceptable Use Policy</a> | 
            <a href="/dmca_notice_takedown_policy.html" target="_blank">DMCA Notice & Takedown Policy</a>
            <Button variant="primary" onClick={handleShowModal}>
                File a DMCA Request
            </Button>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>DMCA Request Form</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DMCARequestForm onSubmit={handleDmcaFormSubmit} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Footer;
