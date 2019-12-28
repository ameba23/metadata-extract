const mm = require('music-metadata')

// TODO music metadata can also parse streams - maybe this is better

// TODO: can add 'duration:true' but calculating it is expensive (whole file must be parsed)
// skipCovers: true stops covers being extracted
module.exports = function (data, input, callback) {
  const mimeType = input.mimeType
  if (mimeType) {
    if (mimeType.split('/')[0] !== 'audio') return callback()
  } else {
    // TODO mimetype from extension
    if (!['mp3', 'flac'].includes(input.extension)) return callback()
  }
  mm.parseBuffer(data, mimeType, { skipCovers: true })
    .then((output) => {
      const metadata = output.common
      metadata.comment = uniq(metadata.comment)
      metadata.artists = uniq(metadata.artists)
      if ((metadata.artists.length === 1) && (metadata.artists[0] === metadata.artist)) delete metadata.artists
      metadata.genre = uniq(metadata.genre)
      if ((metadata.genre.length === 1) && (metadata.genre[0] === 'Other')) delete metadata.genre
      if (output.format) {
        ['bitrate', 'lossless', 'sampleRate', 'codec', 'duration'].forEach((property) => {
          metadata[property] = output.format[property]
        })
      }
      callback(null, { 'music-metadata': metadata })
    }).catch(callback)
}

function uniq (array) {
  return Array.isArray(array)
    ? Array.from(new Set(array))
    : array
}
