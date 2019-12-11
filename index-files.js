const pull = require('pull-stream')
const path = require('path')
const fileType = require('file-type')

const extractorsPath = './extractors/'
const defaultExtractors = ['music-metadata'] // TODO put this somewhere else
const extractors = defaultExtractors.map(filename => require(extractorsPath + filename))

module.exports = function extract (data, filepath, callback) {
  const metadata = {
    mimeType: getMimeType(data),
    extension: path.extname(filepath)
  }
  pull(
    pull.values(extractors),
    pull.asyncMap((extractor, cb) => {
      try {
        extractor(data, metadata, cb)
      } catch (err) { cb() } // ignore errors and keep going
    }),
    // should this be a reducer?
    pull.collect((err, metadatas) => {
      if (err) return callback(err) // TODO: or ingore?
      Object.assign(metadata, ...metadatas)
      callback(null, metadata)
    })
  )
}

function getMimeType (data) {
  // TODO: file-type can also take a stream
  return (data.length >= fileType.minimumbytes)
    ? fileType(data).mime
    : undefined
}
