// Function to resolve conflicts between local and server data
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
  alert("Data synced with server.");
}
