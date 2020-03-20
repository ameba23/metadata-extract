const mm = require('music-metadata')

// TODO music metadata can also parse streams - maybe this is better

// TODO: can add 'duration:true' but calculating it is expensive (whole file must be parsed)
// skipCovers: true stops covers being extracted
module.exports = function (filename, inputMetadata, callback) {
  const mimeType = inputMetadata.mimeType
  if (mimeType) {
    console.log(mimeType)
    if (mimeType.split('/')[0] !== 'audio') return callback()
    // TODO handle m3u
    if (mimeType === 'audio/x-mpegurl') return callback()
  } else {
    // TODO mimetype from extension
    if (!['mp3', 'flac'].includes(inputMetadata.extension)) return callback()
  }
  mm.parseFile(filename, { skipCovers: true })
    .then((output) => {
      const metadata = output.common
      metadata.comment = uniq(metadata.comment)
      metadata.artists = uniq(metadata.artists)
      if (metadata.artists && (metadata.artists.length === 1) && (metadata.artists[0] === metadata.artist)) delete metadata.artists
      metadata.genre = uniq(metadata.genre)
      if (metadata.genre && (metadata.genre.length === 1) && (metadata.genre[0] === 'Other')) delete metadata.genre
      if (output.format) {
        ['bitrate', 'lossless', 'sampleRate', 'codec', 'duration'].forEach((property) => {
          metadata[property] = output.format[property]
        })
      }
      callback(null, { 'music-metadata': metadata })
    }).catch((err) => { return callback(err) })
}

function uniq (array) {
  return Array.isArray(array)
    ? Array.from(new Set(array))
    : array
}
