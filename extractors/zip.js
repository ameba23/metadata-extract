const yauzl = require('yauzl')

module.exports = function (filename, inputMetadata, callback) {
  const mimeType = inputMetadata.mimeType
  if (mimeType !== 'application/zip') return callback()

  const files = {}
  yauzl.open(filename, { lazyEntries: true }, (err, zipfile) => {
    if (err) return callback(err)
    zipfile.readEntry()
    zipfile.on('entry', (entry) => {
      if (!/\/$/.test(entry.fileName)) {
        files[entry.fileName] = {
          size: entry.uncompressedSize
          // comment? fileComment?
        }
      }
      zipfile.readEntry()
    })
    zipfile.on('end', () => {
      callback(null, { files })
    })
  })
}
