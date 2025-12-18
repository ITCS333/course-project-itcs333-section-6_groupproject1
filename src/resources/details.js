/*
  Requirement: Populate the resource detail page and discussion forum.

  Instructions:
  1. Link this file to `details.html` using:
     <script src="details.js" defer></script>

  2. In `details.html`, add the following IDs:
     - To the <h1>: `id="resource-title"`
     - To the description <p>: `id="resource-description"`
     - To the "Access Resource Material" <a> tag: `id="resource-link"`
     - To the <div> for comments: `id="comment-list"`
     - To the "Leave a Comment" <form>: `id="comment-form"`
     - To the <textarea>: `id="new-comment"`

  3. Implement the TODOs below.
*/

// --- Global Data Store ---
// These will hold the data related to *this* resource.
let currentResourceId = null;
let currentComments = [];

// --- Element Selections ---
// TODO: Select all the elements you added IDs for in step 2.
const resourceTitleElement = document.getElementById('resource-title');
const resourceDescriptionElement = document.getElementById('resource-description');
const resourceLinkElement = document.getElementById('resource-link');
const commentListElement = document.getElementById('comment-list');
const commentFormElement = document.getElementById('comment-form');
const newCommentTextarea = document.getElementById('new-comment');

// --- Functions ---

/**
 * TODO: Implement the getResourceIdFromURL function.
 * It should:
 * 1. Get the query string from `window.location.search`.
 * 2. Use the `URLSearchParams` object to get the value of the 'id' parameter.
 * 3. Return the id.
 */
function getResourceIdFromURL() {
    // 1. Get the query string from `window.location.search`
    const queryString = window.location.search;
    
    // 2. Use the `URLSearchParams` object to get the value of the 'id' parameter
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');
    
    // 3. Return the id
    return id;
}

/**
 * TODO: Implement the renderResourceDetails function.
 * It takes one resource object.
 * It should:
 * 1. Set the `textContent` of `resourceTitle` to the resource's title.
 * 2. Set the `textContent` of `resourceDescription` to the resource's description.
 * 3. Set the `href` attribute of `resourceLink` to the resource's link.
 */
function renderResourceDetails(resource) {
    // 1. Set the `textContent` of `resourceTitle` to the resource's title
    resourceTitleElement.textContent = resource.title;
    
    // 2. Set the `textContent` of `resourceDescription` to the resource's description
    resourceDescriptionElement.textContent = resource.description;
    
    // 3. Set the `href` attribute of `resourceLink` to the resource's link
    resourceLinkElement.href = resource.link;
    // Also update the link text to be more descriptive
    resourceLinkElement.textContent = `Access Resource: ${resource.title}`;
}

/**
 * TODO: Implement the createCommentArticle function.
 * It takes one comment object {author, text}.
 * It should return an <article> element matching the structure in `details.html`.
 * (e.g., an <article> containing a <p> and a <footer>).
 */
function createCommentArticle(comment) {
    // Create the article element
    const article = document.createElement('article');
    article.className = 'comment';
    
    // Create the paragraph for comment text
    const paragraph = document.createElement('p');
    paragraph.textContent = comment.text;
    
    // Create the footer for author
    const footer = document.createElement('footer');
    footer.textContent = `Posted by: ${comment.author}`;
    
    // Add timestamp if available
    if (comment.timestamp) {
        const timeElement = document.createElement('span');
        timeElement.className = 'comment-time';
        timeElement.textContent = ` (${new Date(comment.timestamp).toLocaleDateString()})`;
        footer.appendChild(timeElement);
    }
    
    // Append paragraph and footer to article
    article.appendChild(paragraph);
    article.appendChild(footer);
    
    return article;
}

/**
 * TODO: Implement the renderComments function.
 * It should:
 * 1. Clear the `commentList`.
 * 2. Loop through the global `currentComments` array.
 * 3. For each comment, call `createCommentArticle()`, and
 * append the resulting <article> to `commentList`.
 */
function renderComments() {
    // 1. Clear the `commentList`
    commentListElement.innerHTML = '';
    
    // Check if there are no comments
    if (currentComments.length === 0) {
        const noCommentsMessage = document.createElement('p');
        noCommentsMessage.textContent = 'No comments yet. Be the first to comment!';
        noCommentsMessage.className = 'no-comments';
        commentListElement.appendChild(noCommentsMessage);
        return;
    }
    
    // 2. Loop through the global `currentComments` array
    currentComments.forEach(comment => {
        // 3. For each comment, call `createCommentArticle()`, and
        // append the resulting <article> to `commentList`
        const commentArticle = createCommentArticle(comment);
        commentListElement.appendChild(commentArticle);
    });
}

/**
 * TODO: Implement the handleAddComment function.
 * This is the event handler for the `commentForm` 'submit' event.
 * It should:
 * 1. Prevent the form's default submission.
 * 2. Get the text from `newComment.value`.
 * 3. If the text is empty, return.
 * 4. Create a new comment object: { author: 'Student', text: commentText }
 * (For this exercise, 'Student' is a fine hardcoded author).
 * 5. Add the new comment to the global `currentComments` array (in-memory only).
 * 6. Call `renderComments()` to refresh the list.
 * 7. Clear the `newComment` textarea.
 */
function handleAddComment(event) {
    // 1. Prevent the form's default submission
    event.preventDefault();
    
    // 2. Get the text from `newComment.value`
    const commentText = newCommentTextarea.value.trim();
    
    // 3. If the text is empty, return
    if (!commentText) {
        alert('Please enter a comment before posting.');
        return;
    }
    
    // 4. Create a new comment object
    const newComment = {
        author: 'Student',
        text: commentText,
        timestamp: new Date().toISOString() // Add timestamp for better UX
    };
    
    // 5. Add the new comment to the global `currentComments` array
    currentComments.unshift(newComment); // Add to beginning to show newest first
    
    // 6. Call `renderComments()` to refresh the list
    renderComments();
    
    // 7. Clear the `newComment` textarea
    newCommentTextarea.value = '';
    
    // Focus back on the textarea for user convenience
    newCommentTextarea.focus();
}

/**
 * TODO: Implement an `initializePage` function.
 * This function needs to be 'async'.
 * It should:
 * 1. Get the `currentResourceId` by calling `getResourceIdFromURL()`.
 * 2. If no ID is found, set `resourceTitle.textContent = "Resource not found."` and stop.
 * 3. `fetch` both 'resources.json' and 'resource-comments.json' (you can use `Promise.all`).
 * 4. Parse both JSON responses.
 * 5. Find the correct resource from the resources array using the `currentResourceId`.
 * 6. Get the correct comments array from the comments object using the `currentResourceId`.
 * Store this in the global `currentComments` variable. (If no comments exist, use an empty array).
 * 7. If the resource is found:
 * - Call `renderResourceDetails()` with the resource object.
 * - Call `renderComments()` to show the initial comments.
 * - Add the 'submit' event listener to `commentForm` (calls `handleAddComment`).
 * 8. If the resource is not found, display an error in `resourceTitle`.
 */
async function initializePage() {
    // 1. Get the `currentResourceId` by calling `getResourceIdFromURL()`
    currentResourceId = getResourceIdFromURL();
    
    // 2. If no ID is found, set `resourceTitle.textContent = "Resource not found."` and stop
    if (!currentResourceId) {
        resourceTitleElement.textContent = "Resource not found.";
        document.title = "Resource Not Found";
        return;
    }
    
    try {
        // 3. `fetch` both 'resources.json' and 'resource-comments.json'
        // Note: Adjusted paths based on likely project structure
        const [resourcesResponse, commentsResponse] = await Promise.all([
            fetch('../api/resources.json').catch(() => ({ ok: false })),
            fetch('../api/comments.json').catch(() => ({ ok: false }))
        ]);
        
        let resources = [];
        let allComments = {};
        
        // 4. Parse both JSON responses (with error handling)
        if (resourcesResponse.ok) {
            resources = await resourcesResponse.json();
        } else {
            console.warn('Could not load resources.json, using fallback data');
            // Fallback dummy data
            resources = [
                { id: 'res_1', title: 'Chapter 1 Notes', description: 'Introduction to the course and basic concepts', link: '#' },
                { id: 'res_2', title: 'Helpful Website', description: 'Link to external resource with examples', link: 'https://example.com' }
            ];
        }
        
        if (commentsResponse.ok) {
            allComments = await commentsResponse.json();
        } else {
            console.warn('Could not load comments.json, using empty comments');
            allComments = {};
        }
        
        // 5. Find the correct resource from the resources array using the `currentResourceId`
        const resource = resources.find(r => r.id === currentResourceId);
        
        // 6. Get the correct comments array from the comments object using the `currentResourceId`
        currentComments = allComments[currentResourceId] || [];
        
        // 7. If the resource is found:
        if (resource) {
            // Update page title
            document.title = `${resource.title} - Resource Details`;
            
            // - Call `renderResourceDetails()` with the resource object
            renderResourceDetails(resource);
            // - Call `renderComments()` to show the initial comments
            renderComments();
            // - Add the 'submit' event listener to `commentForm`
            commentFormElement.addEventListener('submit', handleAddComment);
        } else {
            // 8. If the resource is not found, display an error in `resourceTitle`
            resourceTitleElement.textContent = "Resource not found.";
            document.title = "Resource Not Found";
            
            // Disable the comment form
            commentFormElement.style.display = 'none';
        }
    } catch (error) {
        console.error('Error initializing page:', error);
        resourceTitleElement.textContent = "Error loading resource.";
        document.title = "Error";
    }
}

// --- Initial Page Load ---
initializePage();
