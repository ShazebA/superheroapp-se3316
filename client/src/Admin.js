import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
    const [userId, setUserId] = useState('');
    const [reviewId, setReviewId] = useState('');

    const handleGrantAdmin = async () => {
        if (!userId) {
            alert("Please enter a user ID");
            return;
        }
    
        try {
            const response = await fetch(`/api/admin/grant-admin/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any necessary headers, like authorization tokens
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to grant admin privileges');
            }
    
            const result = await response.json();
            alert(`Admin privileges granted to user: ${result.user.name}`);
            setUserId(''); // Clear the input field
        } catch (error) {
            console.error('Error:', error);
            alert('Error granting admin privileges');
        }
    };
    

    const handleDeactivateUser = async () => {
        if (!userId) {
            alert("Please enter a user ID");
            return;
        }
    
        try {
            const response = await fetch(`/api/admin/deactivate-user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any necessary headers, like authorization tokens
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to deactivate user');
            }
    
            const result = await response.json();
            alert(`User account deactivated: ${result.userId}`);
            setUserId(''); // Clear the input field
        } catch (error) {
            console.error('Error:', error);
            alert('Error deactivating user');
        }
    };
    

    const handleReactivateUser = async () => {
        if (!userId) {
            alert("Please enter a user ID");
            return;
        }
    
        try {
            const response = await fetch(`/api/admin/reactivate-user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any necessary headers, like authorization tokens
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to reactivate user');
            }
    
            const result = await response.json();
            alert(`User account reactivated: ${result.userId}`);
            setUserId(''); // Clear the input field
        } catch (error) {
            console.error('Error:', error);
            alert('Error reactivating user');
        }
    };
    
    const handleHideReview = async () => {
        if (!reviewId) {
            alert("Please enter a review ID");
            return;
        }
    
        try {
            const response = await fetch(`/api/admin/hide-review/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any necessary headers, like authorization tokens
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to hide review');
            }
    
            const result = await response.json();
            alert(`Review hidden successfully: ${result.reviewId}`);
            setReviewId(''); // Clear the input field
        } catch (error) {
            console.error('Error:', error);
            alert('Error hiding review');
        }
    };

    const handleUnhideReview = async () => {
        if (!reviewId) {
            alert("Please enter a review ID");
            return;
        }
    
        try {
            const response = await fetch(`/api/admin/unhide-review/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any necessary headers, like authorization tokens
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to unhide review');
            }
    
            const result = await response.json();
            alert(`Review visibility restored: ${result.reviewId}`);
            setReviewId(''); // Clear the input field
        } catch (error) {
            console.error('Error:', error);
            alert('Error unhiding review');
        }
    };

    return (
        <div>
            <h2>Admin Panel</h2>
            <div>
                <h3>Grant Admin Privileges</h3>
                <input type="text" placeholder="Enter User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
                <button onClick={handleGrantAdmin}>Grant Admin</button>
            </div>
            <div>
                <h3>Deactivate/Reactivate User</h3>
                <input type="text" placeholder="Enter User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
                <button onClick={handleDeactivateUser}>Deactivate User</button>
                <button onClick={handleReactivateUser}>Reactivate User</button>
            </div>
            <div>
                <h3>Hide/Unhide Review</h3>
                <input type="text" placeholder="Enter Review ID" value={reviewId} onChange={(e) => setReviewId(e.target.value)} />
                <button onClick={handleHideReview}>Hide Review</button>
                <button onClick={handleUnhideReview}>Unhide Review</button>
            </div>
        </div>
    );
};

export default AdminPanel;

