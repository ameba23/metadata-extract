const sizeOf = require('image-size')

// Extract image size
// there is no point in using this as well as exiftool, as it does the
// same thing. but this is pure js (no external deps)

module.exports = async function (filename, { mimeType }) {
  return (mimeType && mimeType.split('/')[0] === 'image' && mimeType !== 'image/vnd.djvu')
    ? { imageSize: sizeOf(filename) }
    : undefined
}
