const fs = require('fs')

let getFileListByCreationDate = function (folderPath) {
  if (fs.existsSync(folderPath) === false) {
    return []
  }

  try {
    const files = fs.readdirSync(folderPath);
    const fileStats = files.map(file => {
      const filePath = `${folderPath}/${file}`;
      const stat = fs.statSync(filePath);
      return {
        name: file,
        createdAt: stat.ctime.getTime()
      };
    });

    // Sort the file list by creation date in ascending order
    // const sortedFiles = fileStats.sort((a, b) => a.createdAt - b.createdAt);
    const sortedFiles = fileStats.sort((a, b) => a.name.localeCompare(b.name));

    // Extract only the file names
    const fileList = sortedFiles.map(file => file.name);

    return fileList;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

module.exports = getFileListByCreationDate