function validateInput(input) {
    return input && input.trim().length > 0;
}

function validateHeroIds(input) {
    if (!input || input.trim().length === 0) {
        return false;
    }

    const ids = input.split(',');
    for (let id of ids) {
        id = id.trim();
        if (!id.match(/^\d+$/)) {
            return false;
        }
    }
    return true;
}

function getSuperheroDetails() {
    const id = document.getElementById('superheroId').value;
    if (!validateInput(id)) {
        console.error('Invalid ID');
        return;
    }
    fetch(`/superheroID/${id}`)
      .then(response => response.json())
      .then(hero => {
        const infoDiv = document.getElementById('superheroInfo');
        infoDiv.innerHTML = '';
        infoDiv.innerHTML = `
                <h2>${hero.name}</h2>
                <p>HeroID: ${hero.id}</p>
                <p>Gender: ${hero.Gender}</p>
                <p>Eye color: ${hero["Eye color"]}</p>
                <p>Race: ${hero.Race}</p>
                <p>Hair color: ${hero["Hair color"]}</p>
                <p>Height: ${hero.Height} cm</p>
                <p>Publisher: ${hero.Publisher}</p>
                <p>Skin color: ${hero["Skin color"]}</p>
                <p>Alignment: ${hero.Alignment}</p>
                <p>Weight: ${hero.Weight} kg</p>
            `;
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
//   <p>Powers: ${hero.powers && hero.powers.length > 0 ? hero.powers.join(', ') : 'None'}</p>

  
  // Function to get Superhero Powers
  function getSuperheroPowers() {
    const id = document.getElementById('superheroPowersId').value;
    if (!validateInput(id)) {
        console.error('Invalid ID');
        return;
    }
    fetch(`/superheroPow/${id}/powers`)
      .then(response => response.json())
      .then(data => {
        const powersDiv = document.getElementById('powersInfo');
        powersDiv.innerHTML = `
                <h2>Powers of ${data.name}</h2>
                <p>${data.powers && data.powers.length > 0 ? data.powers.join(', ') : 'None'}</p>
            `;
      })
      .catch(error => { 
        console.error('Error:', error);
      });
  }
  
  // Function to get Publishers
  function getPublishers() {

    fetch('/publishers')
      .then(response => response.json())
      .then(data => {
        const publishersUl = document.getElementById('publisherInfo');
        publishersUl.innerHTML = data.map(publisher => `<li>${publisher}</li>`).join('');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  
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
            const resultsDiv = document.getElementById('results');
            // Clear previous results
            resultsDiv.innerHTML = '';

            // Add the header
            const header = document.createElement('h1');
            header.textContent = 'Search Results';
            resultsDiv.appendChild(header);

            // Generate HTML content for each hero
            data.forEach(hero => {
                const heroDiv = document.createElement('div');
                heroDiv.innerHTML = `
                    <h2>${hero.name}</h2>
                    <p>HeroID: ${hero.id}</p>
                    <p>Gender: ${hero.Gender}</p>
                    <p>Eye color: ${hero["Eye color"]}</p>
                    <p>Race: ${hero.Race}</p>
                    <p>Hair color: ${hero["Hair color"]}</p>
                    <p>Height: ${hero.Height} cm</p>
                    <p>Publisher: ${hero.Publisher}</p>
                    <p>Skin color: ${hero["Skin color"]}</p>
                    <p>Alignment: ${hero.Alignment}</p>
                    <p>Weight: ${hero.Weight} kg</p>
                    <p>Powers: ${hero.powers.length > 0 ? hero.powers.join(', ') : 'None'}</p>
                `;
                resultsDiv.appendChild(heroDiv);
            });
        })
        .catch(error => {   
            console.error('Error:', error);
        });
}

function searchSuperheroPowers() {
    const query = document.getElementById('searchPowers').value;
    if (!validateInput(id)) {
        console.error('Invalid ID');
        return;
    }

    // Make an asynchronous request to the backend
    fetch(`/superhero/${query}/powers`)
        .then(response => response.json())
        .then(data => {
            // Display the results
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = JSON.stringify(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
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
            const dropdown = document.getElementById('existingLists');
            dropdown.innerHTML = data.map(name => `<option value="${name}">${name}</option>`).join('');
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function loadList() {
    const listName = document.getElementById('existingLists').value;
    const sortValue = document.getElementById('sortCriteria').value; // Get the selected sort criteria

    fetch(`/list/details/${listName}?sort=${sortValue}`)
        .then(response => response.json())
        .then(data => {
            const listContentDiv = document.getElementById('listContents');
            listContentDiv.innerHTML = data.map(hero => `
            <div>
                <h2>${hero.name}</h2>
                <p>HeroID: ${hero.id}</p>
                <p>Gender: ${hero.Gender}</p>
                <p>Eye color: ${hero["Eye color"]}</p>
                <p>Race: ${hero.Race}</p>
                <p>Hair color: ${hero["Hair color"]}</p>
                <p>Height: ${hero.Height} cm</p>
                <p>Publisher: ${hero.Publisher}</p>
                <p>Skin color: ${hero["Skin color"]}</p>
                <p>Alignment: ${hero.Alignment}</p>
                <p>Weight: ${hero.Weight} kg</p>
                <p>Powers: ${hero.powers.length > 0 ? hero.powers.join(', ') : 'None'}</p>
            </div>
        `).join('');
        })
        .catch(error => {
            console.error('Error:', error);
        });
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

window.onload = function() {
    document.getElementById('searchSuperheroes').addEventListener('click', searchSuperheroes);
    document.getElementById('getSuperheroDetails').addEventListener('click', getSuperheroDetails);
    document.getElementById('getSuperheroPowers').addEventListener('click', getSuperheroPowers);
    document.getElementById('getPublishers').addEventListener('click', getPublishers);
    document.getElementById('createList').addEventListener('click', createList);
    document.getElementById('loadExistingLists').addEventListener('click', loadExistingLists);
    document.getElementById('loadList').addEventListener('click', loadList);
    document.getElementById('deleteList').addEventListener('click', deleteList);
    document.getElementById('addHeroToList').addEventListener('click', addHeroToList);
    document.getElementById('sortList').addEventListener('click', loadList);
    document.getElementById('sortSearch').addEventListener('click', searchSuperheroes);

    loadExistingLists(); // Call this at the start to load lists initially
};