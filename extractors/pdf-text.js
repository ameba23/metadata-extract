const pdf = require('pdf-parse')
const fs = require('fs')
const MAXDATA = 2000 // character length of preview
const MAXPAGES = 3 // Max pages to parse

// Extract text from pdfs
// see also https://www.npmjs.com/package/pdf-text-reader

module.exports = async function (filename, { mimeType }) {
  if (mimeType !== 'application/pdf') return
  const pdfBuffer = await new Promise((resolve, reject) => {
    fs.readFile(filename, (err, pdfBuffer) => {
      if (err) return reject(err)
      resolve(pdfBuffer)
    })
  })
  const data = await pdf(pdfBuffer, { max: MAXPAGES })
  delete data.metadata
  delete data.version
  delete data.numrender
  data.text = data.text.slice(0, MAXDATA)
  return data
}
