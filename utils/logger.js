const fs = require("fs");
const path = require("path");

// Define the log directory
const logDirectory = path.join(__dirname, "logs");

// Ensure the log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Function to get the current date as a string (YYYY-MM-DD)
function getCurrentDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Function to log a message
function log(message) {
  const dateStr = getCurrentDateString();
  const logFilePath = path.join(logDirectory, `${dateStr}.log`);
  const timeStr = new Date().toISOString();
  const logMessage = `[${timeStr}] : ${message}\n`;

  // Append the log message to the file
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Error writing log message:", err);
    }
  });
}

module.exports = log;
