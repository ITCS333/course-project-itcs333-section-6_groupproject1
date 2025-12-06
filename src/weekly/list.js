/*
  Requirement: Populate the "Weekly Course Breakdown" list page.

  Instructions:
  1. Link this file to `list.html` using:
     <script src="list.js" defer></script>

  2. In `list.html`, add an `id="week-list-section"` to the
     <section> element that will contain the weekly articles.

  3. Implement the TODOs below.
*/

// --- Element Selections ---
// TODO: Select the section for the week list ('#week-list-section').
const listSection = document.getElementById('week-list-section');

// --- Functions ---

/**
 * TODO: Implement the createWeekArticle function.
 * It takes one week object {id, title, startDate, description}.
 * It should return an <article> element matching the structure in `list.html`.
 * - The "View Details & Discussion" link's `href` MUST be set to `details.html?id=${id}`.
 * (This is how the detail page will know which week to load).
 */
function createWeekArticle(week) {
  // ... your implementation here ...
  const article = document.createElement('article');
  article.className = 'week-card';

  // Create heading
  const heading = document.createElement('h2');
  heading.textContent = week.title;
  article.appendChild(heading);

  // Create start date paragraph
  const startDate = document.createElement('p');
  startDate.className = 'start-date';
  startDate.textContent = `Starts on: ${week.startDate}`;
  article.appendChild(startDate);

  // Create description paragraph
  const description = document.createElement('p');
  description.className = 'week-description';
  description.textContent = week.description;
  article.appendChild(description);

  // Create details link
  const detailsLink = document.createElement('a');
  detailsLink.href = `details.html?id=${week.id}`;
  detailsLink.textContent = 'View Details & Discussion';
  detailsLink.className = 'details-link';
  article.appendChild(detailsLink);

  return article;
}

/**
 * TODO: Implement the loadWeeks function.
 * This function needs to be 'async'.
 * It should:
 * 1. Use `fetch()` to get data from 'weeks.json'.
 * 2. Parse the JSON response into an array.
 * 3. Clear any existing content from `listSection`.
 * 4. Loop through the weeks array. For each week:
 * - Call `createWeekArticle()`.
 * - Append the returned <article> element to `listSection`.
 */
async function loadWeeks() {
  // ... your implementation here ...
   try {
    // Fetch weeks data from JSON file
    const response = await fetch('weeks.json');
    const weeks = await response.json();
    
    // Clear existing content
    listSection.innerHTML = '';
    
    // Create and append articles for each week
    weeks.forEach(week => {
      const weekArticle = createWeekArticle(week);
      listSection.appendChild(weekArticle);
    });
    
  } catch (error) {
    console.error('Error loading weeks data:', error);
    listSection.innerHTML = '<p>Error loading course content. Please try again later.</p>';
  }
}

// --- Initial Page Load ---
// Call the function to populate the page.
loadWeeks();
