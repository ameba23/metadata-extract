const yauzl = require('yauzl')

module.exports = async function (filename, inputMetadata) {
  const mimeType = inputMetadata.mimeType
  if (mimeType !== 'application/zip') return

  const files = new Promise((resolve, reject) => {
    yauzl.open(filename, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err)

      const files = {}
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
      zipfile.on('error', (err) => {
        reject(err)
      })
      zipfile.on('end', () => {
        resolve({ files })
      })
    })
  })

  return files
}
