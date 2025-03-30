const fs = require("fs");
const path = require("path");

// log directory path
const logDirectory = path.join(__dirname, "..", "..", "logs");

function clearLogs() {
  fs.readdir(logDirectory, (err, files) => {
    if (err) {
      console.error("Error reading log directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(logDirectory, file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting log file:", file, err);
        } else {
          console.log("Deleted log file:", file);
        }
      });
    });
  });
}

module.exports = clearLogs;
