const fs = require('fs')

module.exports = function ($, filename) {
  const modifiedHtml = $.xml();
  // modifiedHtml = modifiedHtml.replace(//g, '')
  
  // Write the modified XML as HTML to a file
  fs.writeFileSync('output/' + filename, modifiedHtml, 'utf8');
}