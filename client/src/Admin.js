import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
    const [userLists, setUserLists] = useState([]);
    const [reviewLists, setReviewLists] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedReview, setSelectedReview] = useState('');
    

    const handleGrantAdmin = async () => {
        if (!selectedUser) {
            alert("Please enter a user ID");
            return;
        }
        console.log(selectedUser);
        const token = localStorage.getItem('token');
    
        try {
            const response = await fetch(`/api/admin/grant-admin/${selectedUser}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to grant admin privileges');
            }
    
            const result = await response.json();
            alert(`Admin privileges granted to user: ${result.user.name}`);
        } catch (error) {
            console.error('Error:', error);
            alert('Error granting admin privileges');
        }
    };

    const handleRevokeAdmin = async () => {
        if (!selectedUser) {
            alert("Please enter a user ID");
            return;
        }
        console.log(selectedUser);
        const token = localStorage.getItem('token');
    
        try {
            const response = await fetch(`/api/admin/revoke-admin/${selectedUser}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to grant revoke privileges');
            }
    
            const result = await response.json();
            alert(`Admin privileges revoked for user: ${result.user.name}`);
        } catch (error) {
            console.error('Error:', error);
            alert('Error granting admin privileges');
        }
    };
    

    const handleDeactivateUser = async () => {
        if (!selectedUser) {
            alert("Please enter a user ID");
            return;
        }
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`/api/admin/deactivate-user/${selectedUser}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to deactivate user');
            }
    
            const result = await response.json();
            alert(`User account deactivated: ${result.userId}`);
        } catch (error) {
            console.error('Error:', error);
            alert('Error deactivating user');
        }
    };
    

    const handleReactivateUser = async () => {
        if (!selectedUser) {
            alert("Please enter a user ID");
            return;
        }

        const token = localStorage.getItem('token');

    
        try {
            const response = await fetch(`/api/admin/reactivate-user/${selectedUser}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to reactivate user');
            }
    
            const result = await response.json();
            alert(`User account reactivated: ${result.userId}`);
        } catch (error) {
            console.error('Error:', error);
            alert('Error reactivating user');
        }
    };
    
    const handleHideReview = async () => {
        if (!selectedReview) {
            alert("Please enter a review ID");
            return;
        }

        const token = localStorage.getItem('token');

    
        try {
            const response = await fetch(`/api/admin/hide-review/${selectedReview}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to hide review');
            }
    
            const result = await response.json();
            alert(`Review hidden successfully: ${result.reviewId}`);
        } catch (error) {
            console.error('Error:', error);
            alert('Error hiding review');
        }
    };

    const handleUnhideReview = async () => {
        if (!selectedReview) {
            alert("Please enter a review ID");
            return;
        }

        const token = localStorage.getItem('token');

    
        try {
            const response = await fetch(`/api/admin/unhide-review/${selectedReview}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to unhide review');
            }
    
            const result = await response.json();
            alert(`Review visibility restored: ${result.reviewId}`);
        } catch (error) {
            console.error('Error:', error);
            alert('Error unhiding review');
        }
    };

    useEffect(() => {
        // Fetch users and reviews when the component mounts
        const fetchUsersAndReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                const userResponse = await fetch('/api/admin/users', {
                    headers: { 'Authorization': token }
                });
                const reviewResponse = await fetch('/api/admin/reviews', {
                    headers: { 'Authorization': token }
                });

                if (!userResponse.ok || !reviewResponse.ok) {   
                    throw new Error('Failed to fetch data');
                }

                const users = await userResponse.json();
                const reviews = await reviewResponse.json();

                setUserLists(users);
                setReviewLists(reviews);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchUsersAndReviews();
    }, []);

    return (
        <div>
            <h2>Admin Panel</h2>
            <div>
                <h3>Grant Admin Privileges</h3>
                <div>
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                    <option value="">Select a User</option>
                    {userLists.map(user => (
                        <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                </select>
            </div>
                <button onClick={handleGrantAdmin}>Grant Admin</button>
                <button onClick={handleRevokeAdmin}>Revoke Admin</button>
            </div>
            <div>
                <h3>Deactivate/Reactivate User</h3>
                <div>
                <label>User:</label>
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                    <option value="">Select a User</option>
                    {userLists.map(user => (
                        <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                </select>
            </div>
                <button onClick={handleDeactivateUser}>Deactivate User</button>
                <button onClick={handleReactivateUser}>Reactivate User</button>
            </div>
            <div>
                <h3>Hide/Unhide Review</h3>
                <div>
                <label>Review:</label>
                <select value={selectedReview} onChange={e => setSelectedReview(e.target.value)}>
                    <option value="">Select a Review</option>
                    {reviewLists.map(review => (
                        <option key={review._id} value={review._id}>{review._id}</option>
                    ))}
                </select>
            </div>
                <button onClick={handleHideReview}>Hide Review</button>
                <button onClick={handleUnhideReview}>Unhide Review</button>
            </div>
        </div>
    );
};


export default AdminPanel;

