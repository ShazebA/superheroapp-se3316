import React, { useState, useEffect } from 'react';
import './StyleSheet.css'; // Adjust the path as necessary

const SuperheroApp = () => {
    // State variables for input fields and data
    const [name, setName] = useState('');
    const [race, setRace] = useState('');
    const [publisher, setPublisher] = useState('');
    const [powers, setPowers] = useState('');
    const [numberOfResults, setNumberOfResults] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [viewMore, setViewMore] = useState(null); // New state for tracking expanded hero details
    const [publicLists, setPublicLists] = useState([]);
    const [expandedListDetails, setExpandedListDetails] = useState({}); // Store expanded list details
    const [viewMoreHeros, setViewMoreHeroes] = useState(null); // New state for tracking expanded hero details

    
    const handleViewMoreHeroesClick = (heroId) => {
        setViewMoreHeroes(viewMoreHeros === heroId ? null : heroId); // Toggle view more state
    };

    


    // Helper functions
    const validateInput = (input) => {
        return input && input.trim().length > 0;
    };

    const validateHeroIds = (input) => {
        if (!input || input.trim().length === 0) {
            return false;
        }
        const ids = input.split(',');
        return ids.every(id => /^\d+$/.test(id.trim()));
    };
    useEffect(() => {
        fetchPublicLists();
    }, []);

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
            // If already expanded, collapse it
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


    const handleViewMoreClick = (heroId) => {
        setViewMore(viewMore === heroId ? null : heroId); // Toggle view more state
    };


    return (
        <div>
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
    
            <div className="results-section">
                <label className="search-label" htmlFor="sortCriteria">Sort by:</label>
                
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
                                <div>
                                    <h3>Reviews</h3>
                                    
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>


        </div>
    );
    
};

export default SuperheroApp;

