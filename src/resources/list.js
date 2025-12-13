
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
  // ... your implementation here ...
      // Create the article element
    const article = document.createElement('article');
    article.className = 'resource';
    
    // Create the heading for resource title
    const heading = document.createElement('h2');
    heading.textContent = resource.title;
    
    // Create the paragraph for resource description
    const paragraph = document.createElement('p');
    paragraph.textContent = resource.description;
    
    // Create the anchor tag for the link
    const link = document.createElement('a');
    link.href = `details.html?id=${resource.id}`;
    link.textContent = 'View Resource & Discussion';
    
    // Append all elements to the article
    article.appendChild(heading);
    article.appendChild(paragraph);
    article.appendChild(link);
    
    return article;
}

/**
 * TODO: Implement the loadResources function.
 * This function needs to be 'async'.
 * It should:
 * 1. Use `fetch()` to get data from 'resources.json'.
 * 2. Parse the JSON response into an array.
 * 3. Clear any existing content from `listSection`.
 * 4. Loop through the resources array. For each resource:
 * - Call `createResourceArticle()`.
 * - Append the returned <article> element to `listSection`.
 */
async function loadResources() {
  // ... your implementation here ...
     try {
        // 1. Use `fetch()` to get data from 'resources.json'
        const response = await fetch('api/resources.json');
        
        // 2. Parse the JSON response into an array
        const resources = await response.json();
        
        // 3. Clear any existing content from `listSection`
        resourceListSection.innerHTML = '';
        
        // 4. Loop through the resources array
        resources.forEach(resource => {
            // Call `createResourceArticle()`
            const resourceArticle = createResourceArticle(resource);
            // Append the returned <article> element to `listSection`
            resourceListSection.appendChild(resourceArticle);
        });
    } catch (error) {
        console.error('Error loading resources:', error);
        resourceListSection.innerHTML = '<p>Error loading resources. Please try again later.</p>';
    }
}

// --- Initial Page Load ---
// Call the function to populate the page.
loadResources();
