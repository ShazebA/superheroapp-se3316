import React, { useState, useEffect } from 'react';
import './StyleSheet.css'; // Adjust the path as necessary

const AuthenticatedSuperheroApp = () => {
    // State variables for input fields and data
    const [name, setName] = useState('');
    const [race, setRace] = useState('');
    const [publisher, setPublisher] = useState('');
    const [powers, setPowers] = useState('');
    const [numberOfResults, setNumberOfResults] = useState('');
    const [superheroId, setSuperheroId] = useState('');
    const [superheroPowersId, setSuperheroPowersId] = useState('');
    const [sortCriteria, setSortCriteria] = useState('');
    const [listSortCriteria, setlistSortCriteria] = useState('');
    const [listName, setListName] = useState('');
    const [heroIdInput, setHeroIdInput] = useState('');
    const [existingLists, setExistingLists] = useState([]);
    const [listContents, setListContents] = useState([]);
    const [superheroDetails, setSuperheroDetails] = useState(null);
    const [superheroPowers, setSuperheroPowers] = useState(null);
    const [publishers, setPublishers] = useState([]);
    const [selectedList, setSelectedList] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [viewMore, setViewMore] = useState(null); // New state for tracking expanded hero details
    const [viewMoreList, setViewMoreList] = useState(null); // New state


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

    // Function to get Superhero Details
    const getSuperheroDetails = () => {
        if (!validateInput(superheroId)) {
            console.error('Invalid ID');
            return;
        }
        fetch(`/superheroID/${superheroId}`)
            .then(response => response.json())
            .then(data => setSuperheroDetails(data))
            .catch(error => console.error('Error:', error));
    };

    const tryConnection = () => {
        fetch(`/express_backend`)
            .then(response => response.json())
            .then(data => setSuperheroDetails(data))
            .catch(error => console.error('Error:', error));
    };

    // Function to get Superhero Powers
    const getSuperheroPowers = () => {
        if (!validateInput(superheroPowersId)) {
            console.error('Invalid ID');
            return;
        }
        fetch(`/superheroPow/${superheroPowersId}/powers`)
            .then(response => response.json())
            .then(data => setSuperheroPowers(data))
            .catch(error => console.error('Error:', error));
    };

    // Function to get Publishers
    const getPublishers = () => {
        fetch('/publishers')
            .then(response => response.json())
            .then(data => setPublishers(data))
            .catch(error => console.error('Error:', error));
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
                // const resultsDiv = document.getElementById('results');
                // // Clear previous results
                // resultsDiv.innerHTML = '';
    
                // // Add the header
                // const header = document.createElement('h1');
                // header.textContent = 'Search Results';
                // resultsDiv.appendChild(header);
    
                // // Generate HTML content for each hero
                // data.forEach(hero => {
                //     const heroDiv = document.createElement('div');
                //     heroDiv.innerHTML = `
                //         <h2>${hero.name}</h2>
                //         <p>HeroID: ${hero.id}</p>
                //         <p>Gender: ${hero.Gender}</p>
                //         <p>Eye color: ${hero["Eye color"]}</p>
                //         <p>Race: ${hero.Race}</p>
                //         <p>Hair color: ${hero["Hair color"]}</p>
                //         <p>Height: ${hero.Height} cm</p>
                //         <p>Publisher: ${hero.Publisher}</p>
                //         <p>Skin color: ${hero["Skin color"]}</p>
                //         <p>Alignment: ${hero.Alignment}</p>
                //         <p>Weight: ${hero.Weight} kg</p>
                //         <p>Powers: ${hero.powers.length > 0 ? hero.powers.join(', ') : 'None'}</p>
                //     `;
                //     resultsDiv.appendChild(heroDiv);
                // });
            })
            .catch(error => {   
                console.error('Error:', error);
            });
    }

    function clearSearch() {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';
    }
    
    
    function createList() {
        const listName = document.getElementById('listNameInput').value;
        if (!validateInput(listName)) {
            console.error('Invalid list name');
            return;
        }
        
        fetch(`/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: listName })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadExistingLists();  // Refresh the list dropdown
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    function loadExistingLists() {
        fetch(`/lists`)
            .then(response => response.json())
            .then(data => {
                setExistingLists(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    
    function loadList() {
        const listName = document.getElementById('existingLists').value;
        const sortValue = document.getElementById('sortCriteria').value;
    
        fetch(`/list/details/${listName}?sort=${sortValue}`)
            .then(response => response.json())
            .then(data => {
                setListContents(data); // Update state with fetched data
            })
            .catch(error => console.error('Error:', error));
    }
    
    
                    
    
    function deleteList() {
        const listName = document.getElementById('existingLists').value;
    
        fetch(`/list/${listName}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadExistingLists();  // Refresh the list dropdown
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    function addHeroToList() {
        const listName = document.getElementById('existingLists').value;
        const heroIdsInput = document.getElementById('heroIdInput').value;
    
        // Validate the input
        if (!validateHeroIds(heroIdsInput)) {
            console.error('Invalid input for hero IDs');
            return;
        }
    
        const heroIds = heroIdsInput.split(',').map(id => parseInt(id.trim(), 10));
    
        fetch(`/list/${listName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: heroIds })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadList();  // Refresh the list content
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function searchFromDuckDuckGo(heroName, publisher) {
        const query = encodeURIComponent(`${heroName} ${publisher}`);
        const url = `https://duckduckgo.com/?q=${query}`;
        window.open(url, '_blank'); // Open in a new tab
    }


    useEffect(() => {
        loadExistingLists();

    }, []);

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
    
            {/* <div className="search-section">
                <h2>Superhero Details</h2>
                <input type="number" id="superheroId" placeholder="Enter Superhero ID" value={superheroId} onChange={e => setSuperheroId(e.target.value)} />
                <button id="getSuperheroDetails" onClick={getSuperheroDetails}>Get Details</button>
                <div id="superheroInfo" className="result-section">
            
                </div>
            </div> */}
    
            {/* Section for Superhero Powers */}
            {/* <div className="search-section">
                <h2>Superhero Powers</h2>
                <input type="number" id="superheroPowersId" placeholder="Enter Superhero ID for Powers" value={superheroPowersId} onChange={e => setSuperheroPowersId(e.target.value)} />
                <button id="getSuperheroPowers" onClick={getSuperheroPowers}>Get Powers</button>
                <div id="powersInfo" className="result-section">
                </div>
            </div> */}
    
            {/* Section for Publishers */}
            {/* <div className="search-section">
                <h2>Publishers</h2>
                <button id="getPublishers" onClick={getPublishers}>Get List of Publishers</button>
            
            </div> */}
    
            {/* Display Search Results */}
            <div className="results-section">
                <label className="search-label" htmlFor="sortCriteria">Sort by:</label>
                <select id="sortCriteria" value={sortCriteria} onChange={e => setSortCriteria(e.target.value)}>
                    <option value="">Select Sorting Criteria</option>
                    <option value="Name">Name</option>
                    <option value="Race">Race</option>
                    <option value="Publisher">Publisher</option>
                    <option value="Powers">Powers</option>
                </select>
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

            <div className="list-section">
                <h2>Manage Superhero Lists</h2>
                <input type="text" id="listNameInput" placeholder="Enter List Name" value={listName} onChange={e => setListName(e.target.value)} />
                <button id="createList" onClick={createList}>Create List</button>
                
                <h3>Existing Lists</h3>
                <select id="existingLists" value={selectedList} onChange={e => setSelectedList(e.target.value)}>
                    {existingLists.map(list => <option key={list} value={list}>{list}</option>)}
                </select>
                <button id="loadExistingLists" onClick={loadExistingLists}>Load All Lists</button>
                <button id="loadList" onClick={loadList}>Load List</button>
                <button id="deleteList" onClick={deleteList}>Delete List</button>
                
                <h3>Add Superheroes to List</h3>
                <input type="text" id="heroIdInput" placeholder="Enter Superhero ID" value={heroIdInput} onChange={e => setHeroIdInput(e.target.value)} />
                <button id="addHeroToList" onClick={addHeroToList}>Add to List</button>

                <h3>Sort List</h3>
                <label htmlFor="listSortCriteria">Sort by:</label>
                <select id="listSortCriteria" value={listSortCriteria} onChange={e => setlistSortCriteria(e.target.value)}>
                    <option value="Name">Name</option>
                    <option value="Race">Race</option>
                    <option value="Publisher">Publisher</option>
                    <option value="Powers">Power</option>
                </select>
                <button id="sortList" onClick={loadList}>Sort</button>
                
                <h3>List Contents</h3>
                <div id="listContents" className="list-contents-section">
                    {listContents.map(hero => (
                        <div key={hero.id}>
                            <h2>{hero.name}</h2>
                            <p>Publisher: {hero.Publisher}</p>
                            {viewMore === hero.id && (
                                <div>
                                    <p>Gender: {hero.Gender}</p>
                                    <p>Eye color: {hero["Eye color"]}</p>
                                    <p>Race: {hero.Race}</p>
                                    <p>Hair color: {hero["Hair color"]}</p>
                                    <p>Height: {hero.Height} cm</p>
                                    <p>Publisher: {hero.Publisher}</p>
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

        </div>
    );
    
};

export default AuthenticatedSuperheroApp;

