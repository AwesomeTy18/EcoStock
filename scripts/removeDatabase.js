const fs = require('fs');

const filePath = 'database.db';
if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
  console.log(`Successfully removed ${filePath}`);
} else {
  console.log(`${filePath} does not exist.`);
}
