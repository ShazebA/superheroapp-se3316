import React, { useState, useEffect } from 'react';
import './StyleSheet.css'; 

const AuthenticatedSuperheroApp = (props) => {
    
    const [name, setName] = useState('');
    const [race, setRace] = useState('');
    const [publisher, setPublisher] = useState('');
    const [powers, setPowers] = useState('');
    const [numberOfResults, setNumberOfResults] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [viewMore, setViewMore] = useState(null); 
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
    const [viewMoreListId, setViewMoreListId] = useState(null); 
    const [heroDetails, setHeroDetails] = useState({}); 
    const [newListHeroes, setNewListHeroes] = useState('');
    const [editListHeroes, setEditListHeroes] = useState('');
    const [createListError, setCreateListError] = useState('');
    const [editListError, setEditListError] = useState('');
    const [publicLists, setPublicLists] = useState([]);
    const [expandedListDetails, setExpandedListDetails] = useState({}); 




    const MIN_HERO_ID = 0;
    const MAX_HERO_ID = 733;



    
    const validateInput = (input) => {
        return input && input.trim().length > 0;
    };


    
    function searchSuperheroes() {
        const nameQuery = document.getElementById('name').value;
        const raceQuery = document.getElementById('race').value;
        const publisherQuery = document.getElementById('publisher').value;
        const powersQuery = document.getElementById('powers').value;
        const nResults = document.getElementById('numberOfResults').value; 
        const sortCriteria = document.getElementById('sortCriteria').value; 
    
        if (!validateInput(nameQuery) && !validateInput(raceQuery) && !validateInput(publisherQuery) && !validateInput(powersQuery)) {
            console.error('Invalid search parameters');
            return;
        }
        
    
        let queryParams = `name=${encodeURIComponent(nameQuery)}&race=${encodeURIComponent(raceQuery)}&publisher=${encodeURIComponent(publisherQuery)}&powers=${encodeURIComponent(powersQuery)}`;
        if (nResults) {
            queryParams += `&n=${encodeURIComponent(nResults)}`;
        }
        if (sortCriteria) { 
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
                setSearchResults(data); 
                setViewMore(null); 
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
        window.open(url, '_blank'); 
    }

    const handleCreateList = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token'); 
        const heroIds = newListHeroes.split(',')
        .map(id => id.trim())
        .filter(id => id !== '' && !isNaN(id) && parseInt(id) >= MIN_HERO_ID && parseInt(id) <= MAX_HERO_ID);

        if (heroIds.length !== newListHeroes.split(',').filter(id => id.trim() !== '').length) {
            console.error('One or more hero IDs are invalid');
            
            return;
        }

        try {
            const response = await fetch('/api/authenticated/create-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token 
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

            setUserLists(prevLists => [...prevLists, data]);

            
            setNewListName('');
            setNewListDescription('');
            setIsPublic(false);
            setNewListHeroes('');
            

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchUserLists = async () => {
        const token = localStorage.getItem('token'); 

        try {
            const response = await fetch('/api/authenticated/my-lists', {
                method: 'GET',
                headers: {
                    'Authorization': token 
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

    const fetchPublicLists = async () => {
        try {
            const response = await fetch('/api/public-lists');
            if (!response.ok) {
                throw new Error('Failed to fetch public lists');
            }
            const lists = await response.json();
            setPublicLists(lists);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const expandList = async (listId) => {
        if (expandedListDetails[listId]) {
            
            setExpandedListDetails(prev => ({ ...prev, [listId]: null }));
            return;
        }

        try {
            const response = await fetch(`/api/public-lists/${listId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch list details');
            }
            const listInfo = await response.json();
            setExpandedListDetails(prev => ({ ...prev, [listId]: listInfo }));
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
        .filter(id => id !== '' && !isNaN(id) && parseInt(id) >= MIN_HERO_ID && parseInt(id) <= MAX_HERO_ID);

        if (heroIds.length !== editListHeroes.split(',').filter(id => id.trim() !== '').length) {
            console.error('One or more hero IDs are invalid');
            
            return;
        }

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

            
            await fetchUserLists();
            setSelectedList(null); 
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDeleteList = async (listId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this list?');
        if (!confirmDelete) {
            return; 
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
                fetchHeroDetails(listId); 
            }
        }
    };

    useEffect(() => {
        fetchUserLists();
    }, []);

    useEffect(() => {
        fetchPublicLists();
    }, []);



    const handleViewMoreClick = (heroId) => {
        setViewMore(viewMore === heroId ? null : heroId); 
    };

    const handleLogout = () => {
        
        localStorage.removeItem('token'); 

        
        if (props.onLogout) {
            props.onLogout();
        }
    };


    return (
        <div>
            <div className="logout-button-container">
                <button onClick={handleLogout}>Logout</button>
            </div>
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

    
            <div className="results-section">                
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

            <div className="public-lists-section">
                <h2>Public Lists</h2>
                {publicLists.map(list => (
                    <div key={list.id}>
                        <h3>{list.name}</h3>
                        <p>Creator: {list.creatorNickname}</p>
                        <p>Number of heroes: {list.numberOfHeroes}</p>
                        <p>Average rating: {list.averageRating}</p>
                        <button onClick={() => expandList(list.id)}>View More</button>
                        {expandedListDetails[list.id] && (
                            <div>
                                <p>Description: {expandedListDetails[list.id].description}</p>
                                <ul>
                                    {expandedListDetails[list.id].heroes.map(hero => (
                                        <li key={hero.id}>
                                            <h2>{hero.name}</h2>
                                            <p>Publisher: {hero.Publisher}</p>
                                            {viewMore === hero.id && (
                                                <div>
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
                                <div>
                                <h3>Reviews</h3>
                                    {list.reviews.length > 0 ? (
                                        <ul>
                                            {list.reviews.map(review => (
                                                <li key={review.id}>
                                                    <p>User: {review.userName}</p>
                                                    <p>Rating: {review.rating}</p>
                                                    <p>Comment: {review.comment}</p>
                                                    <p>Date: {new Date(review.creationDate).toLocaleDateString()}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No reviews available.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>


        </div>
    );
    
};

export default AuthenticatedSuperheroApp;

