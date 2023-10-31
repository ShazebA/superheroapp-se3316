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