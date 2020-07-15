const pdf = require('pdf-parse')
const fs = require('fs')
const MAXDATA = 2000 // character length of preview
const MAXPAGES = 3 // Max pages to parse

// Extract text from pdfs

module.exports = function (filename, { mimeType }, callback) {
  if (mimeType !== 'application/pdf') return callback()
  fs.readFile(filename, (err, pdfBuffer) => {
    if (err) return callback(err)
    pdf(pdfBuffer, { max: MAXPAGES }).then((data) => {
      delete data.metadata
      delete data.version
      delete data.numrender
      data.text = data.text.slice(0, MAXDATA)
      callback(null, data)
    }).catch(console.log)
  })
}
