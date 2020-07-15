const EPub = require('epub')

module.exports = function (filename, { mimeType }, callback) {
  if (mimeType !== 'application/epub+zip') return callback()
  const epub = new EPub(filename)
  epub.on('end', () => {
    epub.metadata.toc = epub.toc.map(e => e.title)
    callback(null, epub.metadata)
  })
  epub.on('error', callback)
  epub.parse()
}
