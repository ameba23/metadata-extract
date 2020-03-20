const PDFParser = require('pdf2json')
const fs = require('fs')
const MAXDATA = 2000 // character length of preview

// Extract text from pdfs

module.exports = function (filename, { mimeType }, callback) {
  if (mimeType !== 'application/pdf') return callback()
  const inputStream = fs.createReadStream(filename)

  // would be better to use a stream and not parse the whole file - pdf2json can do this.
  const pdfParser = new PDFParser(this, 1)
  inputStream.pipe(pdfParser)

  pdfParser.on('pdfParser_dataError', errData => {
    return callback(errData.parserError)
  })

  pdfParser.on('pdfParser_dataReady', pdfData => {
    const fullText = pdfParser.getRawTextContent()
    const pdfText = (fullText.length > MAXDATA)
      ? fullText.slice(0, MAXDATA)
      : fullText
    callback(null, { pdfText })
  })
}
