const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Array to store quotes
let quotes = JSON.parse(localStorage.getItem("quotes") || "[]");
if (quotes.length === 0) {
  quotes = [
    {
      text: "The best way to predict the future is to invent it.",
      category: "Inspiration",
    },
    {
      text: "Life is what happens when you're busy making other plans.",
      category: "Life",
    },
    // Add more predefined quotes here
  ];
  saveQuotes();
}

// Function to save quotes to Local Storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to fetch data from the server
async function fetchQuotesFromServer() {
  const response = await fetch(SERVER_URL);
  const serverQuotes = await response.json();
  return serverQuotes.map((q) => ({ text: q.title, category: "Server" })); // Adjust as needed
}

// Function to post data to the server
async function postServerData(data) {
  const response = await fetch(SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
}

// Function to resolve conflicts between local and server data
function resolveConflicts(serverQuotes) {
  const localQuotes = JSON.parse(localStorage.getItem("quotes") || "[]");

  // Simple conflict resolution: Server data takes precedence
  const mergedQuotes = [...serverQuotes];
  localQuotes.forEach((localQuote) => {
    if (
      !mergedQuotes.some((serverQuote) => serverQuote.text === localQuote.text)
    ) {
      mergedQuotes.push(localQuote);
    }
  });

  localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
  displayNotification("Data synced with server. Conflicts resolved.");
}

// Function to display notification to users
function displayNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  // Remove notification after 5 seconds
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 5000);
}

// Function to sync quotes with the server
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  resolveConflicts(serverQuotes);

  // Post local quotes to the server (could be further refined to only post new quotes)
  const localQuotes = JSON.parse(localStorage.getItem("quotes") || "[]");
  for (const quote of localQuotes) {
    await postServerData(quote);
  }
}

// Periodic data fetching to simulate receiving updates from the server
setInterval(syncQuotes, 30000); // Sync every 30 seconds

// Function to display a random quote or filter quotes based on category
function showQuote(quote) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote)); // Save last viewed quote to Session Storage
}

// Function to display a random quote
function showRandomQuote() {
  const filteredQuotes = filterQuotes();
  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    showQuote(filteredQuotes[randomIndex]);
  } else {
    document.getElementById("quoteDisplay").innerHTML =
      "<p>No quotes available in this category.</p>";
  }
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);
    saveQuotes();
    postServerData(newQuote); // Post new quote to the server
    populateCategories();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Function to create and display the form for adding quotes
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const newQuoteInput = document.createElement("input");
  newQuoteInput.id = "newQuoteText";
  newQuoteInput.type = "text";
  newQuoteInput.placeholder = "Enter a new quote";
  formContainer.appendChild(newQuoteInput);

  const newQuoteCategoryInput = document.createElement("input");
  newQuoteCategoryInput.id = "newQuoteCategory";
  newQuoteCategoryInput.type = "text";
  newQuoteCategoryInput.placeholder = "Enter quote category";
  formContainer.appendChild(newQuoteCategoryInput);

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// Function to export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const exportFileDefaultName = "quotes.json";

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", url);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
  URL.revokeObjectURL(url); // Clean up the URL object after the download
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to populate categories dynamically
function populateCategories() {
  const categories = [...new Set(quotes.map((quote) => quote.category))]; // Extract unique categories
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset categories dropdown
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  loadLastSelectedFilter();
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory); // Save selected category to Local Storage
  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((quote) => quote.category === selectedCategory);
  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    showQuote(filteredQuotes[randomIndex]);
  } else {
    document.getElementById("quoteDisplay").innerHTML =
      "<p>No quotes available in this category.</p>";
  }
  return filteredQuotes;
}

// Function to load the last selected filter from Local Storage
function loadLastSelectedFilter() {
  const selectedCategory = localStorage.getItem("selectedCategory");
  if (selectedCategory) {
    document.getElementById("categoryFilter").value = selectedCategory;
  }
}

// Add event listener to the "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Create the form for adding new quotes and display a random quote on page load
document.addEventListener("DOMContentLoaded", () => {
  showRandomQuote();
  createAddQuoteForm();
  populateCategories();

  // Display the last viewed quote from Session Storage
  const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
  if (lastQuote) {
    showQuote(lastQuote);
  }

  // Add import and export buttons
  createImportExportButtons();
});

// Add import and export buttons
function createImportExportButtons() {
  const importButton = document.createElement("input");
  importButton.id = "importFile";
  importButton.type = "file";
  importButton.accept = ".json";
  importButton.onchange = importFromJsonFile;
  document.body.appendChild(importButton);

  const exportButton = document.createElement("button");
  exportButton.textContent = "Export Quotes to JSON";
  exportButton.onclick = exportToJsonFile;
  document.body.appendChild(exportButton);
}
