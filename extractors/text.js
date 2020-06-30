const readline = require('readline')
const fs = require('fs')
const MAXBYTES = 1024

module.exports = function (filename, inputMetadata, callback) {
  const mimeType = inputMetadata.mimeType
  // TODO allow extensions: .url, .txt, .nfo, .md
  if (!mimeType) return callback()
  if ((mimeType.split('/')[0] !== 'text') && (mimeType !== 'audio/x-mpegurl')) return callback()

  let previewText = ''
  let closed = false
  const input = fs.createReadStream(filename)
  const rl = readline.createInterface({ input })
  // logEvents(rl)
  rl.on('line', (line) => {
    previewText += `${line}\n`
    if (Buffer.from(previewText).length >= MAXBYTES) {
      done()
    }
  })

  rl.on('close', () => {
    if (previewText === '') previewText = undefined
    done()
  })

  function done () {
    input.destroy()
    if (!closed) callback(null, { previewText })
    closed = true
  }
}
