const exif = require('exiftool')
const fs = require('fs')
const { keysWeWant } = require('./exif-keys.json')

module.exports = async function (filename, metadata) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) return reject(err)
      exif.metadata(data, (err, metadata) => {
        if (err) return reject(err)
        resolve(reduceMetadata(metadata))
      })
    })
  })
}
// TODO binary option -b extracts 'picture' or 'thumbnail'

module.exports.isInstalled = function () {
  try {
    exif.metadata(Buffer.from(''), () => {})
  } catch (err) { return false }
  return true
}

function reduceMetadata (metadataObj) {
  const reducedMetadata = {}
  Object.keys(metadataObj).forEach(key => {
    if ((keysWeWant.indexOf(key) > -1) && (metadataObj[key])) reducedMetadata[key] = metadataObj[key]
  })
  return reducedMetadata
}
