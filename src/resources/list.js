/*
  Requirement: Populate the "Course Resources" list page.

  Instructions:
  1. Link this file to `list.html` using:
     <script src="list.js" defer></script>

  2. In `list.html`, add an `id="resource-list-section"` to the
     <section> element that will contain the resource articles.

  3. Implement the TODOs below.
*/

// --- Element Selections ---
// TODO: Select the section for the resource list ('#resource-list-section').
const resourceListSection = document.getElementById('resource-list-section');

// --- Functions ---

/**
 * TODO: Implement the createResourceArticle function.
 * It takes one resource object {id, title, description}.
 * It should return an <article> element matching the structure in `list.html`.
 * The "View Resource & Discussion" link's `href` MUST be set to `details.html?id=${id}`.
 * (This is how the detail page will know which resource to load).
 */
function createResourceArticle(resource) {
    // Create the article element
    const article = document.createElement('article');
    article.className = 'resource';
    article.dataset.id = resource.id;
    
    // Create the heading for resource title
    const heading = document.createElement('h2');
    heading.textContent = resource.title;
    
    // Create paragraph for resource description
    const description = document.createElement('p');
    description.textContent = resource.description;
    
    // Create anchor tag for "View Resource & Discussion"
    const link = document.createElement('a');
    link.href = `details.html?id=${resource.id}`;
    link.textContent = 'View Resource & Discussion';
    
    // Append elements to article
    article.appendChild(heading);
    article.appendChild(description);
    article.appendChild(link);
    
    return article;
}

/**
 * TODO: Implement the renderResources function.
 * It should:
 * 1. Clear the `resourceListSection`.
 * 2. Loop through the provided resources array.
 * 3. For each resource, call `createResourceArticle()`, and
 * append the resulting <article> to `resourceListSection`.
 */
function renderResources(resources) {
    // 1. Clear the `resourceListSection`
    resourceListSection.innerHTML = '';
    
    // 2. Loop through the provided resources array
    resources.forEach(resource => {
        // 3. For each resource, call `createResourceArticle()`, and
        // append the resulting <article> to `resourceListSection`
        const article = createResourceArticle(resource);
        resourceListSection.appendChild(article);
    });
}

/**
 * TODO: Implement an `initializePage` function.
 * This function needs to be 'async'.
 * It should:
 * 1. `fetch` the 'resources.json' file.
 * 2. Parse the JSON response.
 * 3. Call `renderResources()` with the array of resources.
 * 4. Handle errors gracefully (e.g., show a message if the fetch fails).
 */
async function loadResources() {
    try {
        // Show loading state
        resourceListSection.innerHTML = '<p class="loading">Loading resources...</p>';
        
        // 1. `fetch` the 'resources.json' file
        const response = await fetch('api/resources.json');
        
        // Check if fetch was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 2. Parse the JSON response
        const resources = await response.json();
        
        // Check if resources array is empty
        if (!resources || resources.length === 0) {
            resourceListSection.innerHTML = '<p class="no-resources">No resources available at this time.</p>';
            return;
        }
        
        // 3. Call `renderResources()` with the array of resources
        renderResources(resources);
        
    } catch (error) {
        console.error('Error loading resources:', error);
        
        // 4. Handle errors gracefully
        resourceListSection.innerHTML = `
            <p class="error-message">
                Unable to load resources at this time. 
                <br>
                <small>Error: ${error.message}</small>
            </p>
            
            <!-- Fallback: Show some example resources -->
            <article class="resource">
                <h2>Example Resource 1</h2>
                <p>This is an example resource that would normally be loaded from the server.</p>
                <a href="details.html?id=example_1">View Resource & Discussion</a>
            </article>
            
            <article class="resource">
                <h2>Example Resource 2</h2>
                <p>Another example resource demonstrating the expected format.</p>
                <a href="details.html?id=example_2">View Resource & Discussion</a>
            </article>
        `;
    }
}

// --- Initial Page Load ---
// Call the main async function to start the application.
loadResources();
