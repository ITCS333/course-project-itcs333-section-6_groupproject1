/*
  Requirement: Make the "Manage Resources" page interactive.

  Instructions:
  1. Link this file to `admin.html` using:
     <script src="admin.js" defer></script>
  
  2. In `admin.html`, add an `id="resources-tbody"` to the <tbody> element
     inside your `resources-table`.
  
  3. Implement the TODOs below.
*/

// --- Global Data Store ---
// This will hold the resources loaded from the JSON file.
let resources = [];
let isEditing = false;
let currentEditId = null;

// --- Element Selections ---
// TODO: Select the resource form ('#resource-form').
const resourceForm = document.querySelector('#resource-form');
// TODO: Select the resources table body ('#resources-tbody').
const resourcesTbody = document.querySelector('#resources-tbody');
const submitButton = document.querySelector('#add-resource');

// --- Functions ---

/**
 * TODO: Implement the createResourceRow function.
 * It takes one resource object {id, title, description}.
 * It should return a <tr> element with the following <td>s:
 * 1. A <td> for the `title`.
 * 2. A <td> for the `description`.
 * 3. A <td> containing two buttons:
 * - An "Edit" button with class "edit-btn" and `data-id="${id}"`.
 * - A "Delete" button with class "delete-btn" and `data-id="${id}"`.
 */
function createResourceRow(resource) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${resource.title}</td>
        <td>${resource.description}</td>
        <td>
            <button class="edit-btn" data-id="${resource.id}">Edit</button>
            <button class="delete-btn" data-id="${resource.id}">Delete</button>
        </td>
    `;
    return tr;
}

/**
 * TODO: Implement the renderTable function.
 * It should:
 * 1. Clear the `resourcesTableBody`.
 * 2. Loop through the global `resources` array.
 * 3. For each resource, call `createResourceRow()`, and
 * append the resulting <tr> to `resourcesTableBody`.
 */
function renderTable() {
    resourcesTbody.innerHTML = '';
    resources.forEach(resource => {
        const row = createResourceRow(resource);
        resourcesTbody.appendChild(row);
    });
}

/**
 * TODO: Implement the handleAddResource function.
 * This is the event handler for the form's 'submit' event.
 * It should:
 * 1. Prevent the form's default submission.
 * 2. Get the values from the title, description, and link inputs.
 * 3. Create a new resource object with a unique ID (e.g., `id: \`res_${Date.now()}\``).
 * 4. Add this new resource object to the global `resources` array (in-memory only).
 * 5. Call `renderTable()` to refresh the list.
 * 6. Reset the form.
 */
function handleAddResource(event) {
    event.preventDefault();
    
    const title = document.querySelector('#resource-title').value;
    const description = document.querySelector('#resource-description').value;
    const link = document.querySelector('#resource-link').value;
    
    if (!title.trim() || !link.trim()) {
        alert('Please fill in required fields: Title and Link');
        return;
    }
    
    if (isEditing) {
        // Update existing resource
        const index = resources.findIndex(resource => resource.id === currentEditId);
        if (index !== -1) {
            resources[index] = {
                ...resources[index],
                title,
                description,
                link
            };
        }
        
        // Reset form state
        isEditing = false;
        currentEditId = null;
        submitButton.textContent = 'Add Resource';
        document.querySelector('h2').textContent = 'Add a New Resource';
    } else {
        // Add new resource
        const newResource = {
            id: `res_${Date.now()}`,
            title: title,
            description: description,
            link: link
        };
        resources.push(newResource);
    }
    
    renderTable();
    resourceForm.reset();
}

/**
 * Function to handle edit button click
 */
function handleEdit(id) {
    const resource = resources.find(resource => resource.id === id);
    if (resource) {
        // Fill form with resource data
        document.querySelector('#resource-title').value = resource.title;
        document.querySelector('#resource-description').value = resource.description;
        document.querySelector('#resource-link').value = resource.link;
        
        // Change form state to editing
        isEditing = true;
        currentEditId = id;
        submitButton.textContent = 'Update Resource';
        document.querySelector('h2').textContent = 'Edit Resource';
        
        // Scroll to form
        document.querySelector('#resource-form').scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * TODO: Implement the handleTableClick function.
 * This is an event listener on the `resourcesTableBody` (for delegation).
 * It should:
 * 1. Check if the clicked element (`event.target`) has the class "delete-btn".
 * 2. If it does, get the `data-id` attribute from the button.
 * 3. Update the global `resources` array by filtering out the resource
 * with the matching ID (in-memory only).
 * 4. Call `renderTable()` to refresh the list.
 */
function handleTableClick(event) {
    if (event.target.classList.contains('delete-btn')) {
        const id = event.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this resource?')) {
            resources = resources.filter(resource => resource.id !== id);
            renderTable();
        }
    } else if (event.target.classList.contains('edit-btn')) {
        const id = event.target.getAttribute('data-id');
        handleEdit(id);
    }
}

/**
 * TODO: Implement the loadAndInitialize function.
 * This function needs to be 'async'.
 * It should:
 * 1. Use `fetch()` to get data from 'resources.json'.
 * 2. Parse the JSON response and store the result in the global `resources` array.
 * 3. Call `renderTable()` to populate the table for the first time.
 * 4. Add the 'submit' event listener to `resourceForm` (calls `handleAddResource`).
 * 5. Add the 'click' event listener to `resourcesTableBody` (calls `handleTableClick`).
 */
async function loadAndInitialize() {
    try {
        const response = await fetch('resources.json'); // Adjust path as needed
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        resources = await response.json();
        renderTable();
        resourceForm.addEventListener('submit', handleAddResource);
        resourcesTbody.addEventListener('click', handleTableClick);
        
        // Add cancel button functionality
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.id = 'cancel-edit';
        cancelButton.textContent = 'Cancel Edit';
        cancelButton.style.display = 'none';
        cancelButton.addEventListener('click', () => {
            isEditing = false;
            currentEditId = null;
            resourceForm.reset();
            submitButton.textContent = 'Add Resource';
            document.querySelector('h2').textContent = 'Add a New Resource';
            cancelButton.style.display = 'none';
        });
        
        document.querySelector('.form-group:last-child').appendChild(cancelButton);
        
    } catch (error) {
        console.error('Error loading resources:', error);
        // Use initial dummy data if fetch fails
        resources = [
            { id: 'res_1', title: 'Chapter 1 Notes', description: 'Introduction to the course and basic concepts', link: '#' },
            { id: 'res_2', title: 'Helpful Website', description: 'Link to external resource with examples', link: 'https://example.com' }
        ];
        renderTable();
        resourceForm.addEventListener('submit', handleAddResource);
        resourcesTbody.addEventListener('click', handleTableClick);
    }
}

// --- Initial Page Load ---
// Call the main async function to start the application.
loadAndInitialize();
