function searchSuperheroes() {
    const query = document.getElementById('searchInput').value;

    // Make an asynchronous request to the backend
    fetch(`/search?query=${query}`)
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