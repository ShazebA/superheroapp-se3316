import React, { useState } from 'react';

const DMCARequestForm = ({ onSubmit }) => {
    const [dateNoticeSent, setDateNoticeSent] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ dateNoticeSent, notes });
    };

    

    return (
        <form onSubmit={handleSubmit}>
            <input type="date" value={dateNoticeSent} onChange={e => setDateNoticeSent(e.target.value)} required />
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes"></textarea>
           
            <button type="submit">Submit</button>
        </form>
    );
};

export default DMCARequestForm;
