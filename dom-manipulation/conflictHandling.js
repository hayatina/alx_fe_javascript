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

// Update resolveConflicts function to include UI notification
function resolveConflicts(serverQuotes) {
  const localQuotes = JSON.parse(localStorage.getItem("quotes") || "[]");

  // Simple conflict resolution: Server data takes precedence
  const mergedQuotes = [...serverQuotes];
  localQuotes.forEach((localQuote) => {
    if (!mergedQuotes.some((serverQuote) => serverQuote.id === localQuote.id)) {
      mergedQuotes.push(localQuote);
    }
  });

  localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
  displayNotification("Data synced with server. Conflicts resolved.");
}
