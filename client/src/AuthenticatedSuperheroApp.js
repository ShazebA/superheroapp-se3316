import React, { useState, useEffect } from 'react';
import './StyleSheet.css'; // Adjust the path as necessary

const AuthenticatedSuperheroApp = (props) => {
    // State variables for input fields and data
    const [name, setName] = useState('');
    const [race, setRace] = useState('');
    const [publisher, setPublisher] = useState('');
    const [powers, setPowers] = useState('');
    const [numberOfResults, setNumberOfResults] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [viewMore, setViewMore] = useState(null); // New state for tracking expanded hero details
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [userLists, setUserLists] = useState([]);
    const [selectedList, setSelectedList] = useState(null);
    const [editListName, setEditListName] = useState('');
    const [editListDescription, setEditListDescription] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(false);
    const [reviewListName, setReviewListName] = useState('');
    const [reviewRating, setReviewRating] = useState(1);
    const [reviewComment, setReviewComment] = useState('');
    const [viewMoreListId, setViewMoreListId] = useState(null); // State for tracking expanded list details
    const [heroDetails, setHeroDetails] = useState({}); // To store hero details for each list
    const [newListHeroes, setNewListHeroes] = useState('');
    const [editListHeroes, setEditListHeroes] = useState('');


    // Helper functions
    const validateInput = (input) => {
        return input && input.trim().length > 0;
    };


    // Function to search Superheroes
    function searchSuperheroes() {
        const nameQuery = document.getElementById('name').value;
        const raceQuery = document.getElementById('race').value;
        const publisherQuery = document.getElementById('publisher').value;
        const powersQuery = document.getElementById('powers').value;
        const nResults = document.getElementById('numberOfResults').value; // Assume this is the new HTML input for 'n'
        const sortCriteria = document.getElementById('sortCriteria').value; // New input for sorting criteria
    
        if (!validateInput(nameQuery) && !validateInput(raceQuery) && !validateInput(publisherQuery) && !validateInput(powersQuery)) {
            console.error('Invalid search parameters');
            return;
        }
        // Make an asynchronous request to the backend
    
        let queryParams = `name=${encodeURIComponent(nameQuery)}&race=${encodeURIComponent(raceQuery)}&publisher=${encodeURIComponent(publisherQuery)}&powers=${encodeURIComponent(powersQuery)}`;
        if (nResults) {
            queryParams += `&n=${encodeURIComponent(nResults)}`;
        }
        if (sortCriteria) { // Append sort criteria if provided
            queryParams += `&sort=${encodeURIComponent(sortCriteria)}`;
        }
    
        fetch(`/superhero/search?${queryParams}`)
            .then(response => {
                if (!response.ok) {
                console.log(response);
                throw new Error('Network response was not ok');
            }
            return response.json();})
            .then(data => {
                setSearchResults(data); // Save the fetched data in state
                setViewMore(null); // Reset the view more state
            })
            .catch(error => {   
                console.error('Error:', error);
            });
    }

    function clearSearch() {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';
    }
    
    

    function searchFromDuckDuckGo(heroName, publisher) {
        const query = encodeURIComponent(`${heroName} ${publisher}`);
        const url = `https://duckduckgo.com/?q=${query}`;
        window.open(url, '_blank'); // Open in a new tab
    }

    const handleCreateList = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token'); // Get the auth token
        const heroIds = newListHeroes.split(',')
        .map(id => id.trim())
        .filter(id => id !== '' && !isNaN(id))
        .map(id => parseInt(id));


        try {
            const response = await fetch('/api/authenticated/create-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token // Include the token in the request header
                },
                body: JSON.stringify({
                    name: newListName,
                    description: newListDescription,
                    isPublic: isPublic,
                    items: heroIds
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('List created:', data);

            // Optionally, clear the form or update the state
            setNewListName('');
            setNewListDescription('');
            setIsPublic(false);
            setNewListHeroes('');
            // You might also want to refresh the list of user's lists here

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchUserLists = async () => {
        const token = localStorage.getItem('token'); // Get the auth token

        try {
            const response = await fetch('/api/authenticated/my-lists', {
                method: 'GET',
                headers: {
                    'Authorization': token // Include the token in the request header
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const lists = await response.json();
            setUserLists(lists);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const selectListForEditing = (list) => {
        setSelectedList(list);
        setEditListName(list.name);
        setEditListDescription(list.description || '');
        setEditIsPublic(list.isPublic);
        setEditListHeroes(list.items.join(', '));
    };

    const handleEditList = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const heroIds = newListHeroes.split(',')
        .map(id => id.trim())
        .filter(id => id !== '' && !isNaN(id))
        .map(id => parseInt(id));

        try {
            const response = await fetch(`/api/authenticated/edit-list/${selectedList._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    name: editListName,
                    description: editListDescription,
                    isPublic: editIsPublic,
                    items: heroIds
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Refresh the lists to show the updated list
            await fetchUserLists();
            setSelectedList(null); // Optionally, clear the selection
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDeleteList = async (listId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this list?');
        if (!confirmDelete) {
            return; // Do nothing if user cancels the deletion
        }

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`/api/authenticated/delete-list/${listId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Refresh the lists to reflect the deletion
            await fetchUserLists();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/api/authenticated/add-review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    listName: reviewListName,
                    rating: reviewRating,
                    comment: reviewComment
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Review added:', data);

            // Optionally, clear the form or update the state
            setReviewListName('');
            setReviewRating(1);
            setReviewComment('');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchHeroDetails = async (listId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/authenticated/list-heroes/${listId}`, {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setHeroDetails(prevDetails => ({ ...prevDetails, [listId]: data }));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const toggleViewMoreList = (listId) => {
        if (viewMoreListId === listId) {
            setViewMoreListId(null);
        } else {
            setViewMoreListId(listId);
            if (!heroDetails[listId]) {
                fetchHeroDetails(listId); // Fetch details if not already loaded
            }
        }
    };

    useEffect(() => {
        fetchUserLists();
    }, []);


    const handleViewMoreClick = (heroId) => {
        setViewMore(viewMore === heroId ? null : heroId); // Toggle view more state
    };

    const handleLogout = () => {
        // Clear the token from storage
        localStorage.removeItem('token'); // Or sessionStorage.removeItem('token');

        // Call the logout handler passed from the parent component (App.js)
        if (props.onLogout) {
            props.onLogout();
        }
    };


    return (
        <div>
            <div className="logout-button-container">
                <button onClick={handleLogout}>Logout</button>
            </div>
            {/* Search form */}
            <div className="search-section">
                <label className="search-label" htmlFor="name">Name:</label>
                <input className="search-input" type="text" id="name" name="name" value={name} onChange={e => setName(e.target.value)} />
    
                <label className="search-label" htmlFor="race">Race:</label>
                <input className="search-input" pattern="[A-Za-z]+" type="text" id="race" name="race" value={race} onChange={e => setRace(e.target.value)} />
    
                <label className="search-label" htmlFor="publisher">Publisher:</label>
                <input className="search-input" pattern="[A-Za-z]+" type="text" id="publisher" name="publisher" value={publisher} onChange={e => setPublisher(e.target.value)} />
    
                <label className="search-label" htmlFor="powers">Powers:</label>
                <input className="search-input" pattern="[A-Za-z]+" type="text" id="powers" name="powers" placeholder="Enter powers (comma-separated)" value={powers} onChange={e => setPowers(e.target.value)} />
    
                <label className="search-label" htmlFor="numberOfResults">Number of Results:</label>
                <input type="number" id="numberOfResults" name="numberOfResults" placeholder="Enter number of results (n)" value={numberOfResults} onChange={e => setNumberOfResults(e.target.value)} />
    
                <button id="searchSuperheroes" onClick={searchSuperheroes}>Search</button>
            </div>

    
            {/* Display Search Results */}
            <div className="results-section">                
                <button id="sortSearch" onClick={searchSuperheroes}>Sort</button>
                <button id="clearSearch" onClick={clearSearch}>Clear</button>
                <div id="results">
                    {searchResults.map(hero => (
                        <div key={hero.id}>
                            <h2>{hero.name}</h2>
                            <p>Publisher: {hero.Publisher}</p>
                            {viewMore === hero.id && (
                                <div>
                                    {/* All other hero details */}
                                    <p>HeroID: {hero.id}</p>
                                    <p>Gender: {hero.Gender}</p>
                                    <p>Eye color: {hero["Eye color"]}</p>
                                    <p>Race: {hero.Race}</p>
                                    <p>Hair color: {hero["Hair color"]}</p>
                                    <p>Height: {hero.Height} cm</p>
                                    <p>Skin color: {hero["Skin color"]}</p>
                                    <p>Alignment: {hero.Alignment}</p>
                                    <p>Weight: {hero.Weight} kg</p>
                                    <p>Powers: {hero.powers.length > 0 ? hero.powers.join(', ') : 'None'}</p>
                                </div>
                            )}
                            <button onClick={() => handleViewMoreClick(hero.id)}>View More</button>
                            <button onClick={() => searchFromDuckDuckGo(hero.name, hero.Publisher)}>Search</button>
                        </div>
                    ))}
                </div>

                <div>
                <h2>Create New List</h2>
                <form onSubmit={handleCreateList}>
                    <input 
                        type="text" 
                        placeholder="List Name" 
                        value={newListName} 
                        onChange={(e) => setNewListName(e.target.value)} 
                        required 
                    />
                    <textarea 
                        placeholder="Description (optional)" 
                        value={newListDescription} 
                        onChange={(e) => setNewListDescription(e.target.value)} 
                    />
                    <label>
                        <input 
                            type="checkbox" 
                            checked={isPublic} 
                            onChange={(e) => setIsPublic(e.target.checked)} 
                        />
                        Public List
                    </label>
                    <input 
                    type="text" 
                    placeholder="Hero IDs (e.g., 1, 5, 8)" 
                    value={newListHeroes} 
                    onChange={(e) => setNewListHeroes(e.target.value)} 
                />
                    <button type="submit">Create List</button>
                </form>
            </div>

            <div>
                <h2>My Lists</h2>
                <ul>
                    {userLists.map(list => (
                        <li key={list._id}>
                            {list.name}
                            <button onClick={() => toggleViewMoreList(list._id)}>View More</button>
                            {viewMoreListId === list._id && (
                                <div>
                                    <p>Description: {list.description}</p>
                                    <p>Visibility: {list.isPublic ? 'Public' : 'Private'}</p>
                                    <ul>
                                        {heroDetails[list._id]?.map(hero => (
                                            <li key={hero.id}>
                                               <h2>{hero.name}</h2>
                                                <p>Publisher: {hero.Publisher}</p>
                                                {viewMore === hero.id && (
                                                    <div>
                                                        {/* All other hero details */}
                                                        <p>HeroID: {hero.id}</p>
                                                        <p>Gender: {hero.Gender}</p>
                                                        <p>Eye color: {hero["Eye color"]}</p>
                                                        <p>Race: {hero.Race}</p>
                                                        <p>Hair color: {hero["Hair color"]}</p>
                                                        <p>Height: {hero.Height} cm</p>
                                                        <p>Skin color: {hero["Skin color"]}</p>
                                                        <p>Alignment: {hero.Alignment}</p>
                                                        <p>Weight: {hero.Weight} kg</p>
                                                        <p>Powers: {hero.powers.length > 0 ? hero.powers.join(', ') : 'None'}</p>
                                                    </div>
                                                )}
                                                <button onClick={() => handleViewMoreClick(hero.id)}>View More</button>
                                                <button onClick={() => searchFromDuckDuckGo(hero.name, hero.Publisher)}>Search</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h2>Edit List</h2>
                {selectedList && (
                    <form onSubmit={handleEditList}>
                        <input 
                            type="text" 
                            value={editListName} 
                            onChange={(e) => setEditListName(e.target.value)} 
                            required 
                        />
                        <textarea 
                            value={editListDescription} 
                            onChange={(e) => setEditListDescription(e.target.value)} 
                        />
                        <label>
                            <input 
                                type="checkbox" 
                                checked={editIsPublic} 
                                onChange={(e) => setEditIsPublic(e.target.checked)} 
                            />
                            Public List
                        </label>
                        <input 
                        type="text" 
                        value={editListHeroes} 
                        onChange={(e) => setEditListHeroes(e.target.value)} 
                    />
                        <button type="submit">Save Changes</button>
                    </form>
                )}
            </div>

            {/* Display user's lists with an option to select for editing */}
            <div>
                <h2>My Lists</h2>
                <ul>
                    {userLists.map(list => (
                        <li key={list._id}>
                            {list.name} - {list.description}
                            <button onClick={() => selectListForEditing(list)}>Edit</button>
                            <button onClick={() => handleDeleteList(list._id)}>Delete</button>

                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h2>Add Review to a List</h2>
                <form onSubmit={handleAddReview}>
                    <input 
                        type="text" 
                        placeholder="List Name" 
                        value={reviewListName} 
                        onChange={(e) => setReviewListName(e.target.value)} 
                        required 
                    />
                    <input 
                        type="number" 
                        min="1" 
                        max="5" 
                        value={reviewRating} 
                        onChange={(e) => setReviewRating(e.target.value)} 
                        required 
                    />
                    <textarea 
                        placeholder="Comment" 
                        value={reviewComment} 
                        onChange={(e) => setReviewComment(e.target.value)} 
                        required 
                    />
                    <button type="submit">Add Review</button>
                </form>
            </div>

            </div>

        </div>
    );
    
};

export default AuthenticatedSuperheroApp;

