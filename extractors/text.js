const readline = require('readline')
const MAXBYTES = 1024

module.exports = function (data, input, callback) {
  const mimeType = input.mimeType
  if (mimeType) {
    if (mimeType.split('/')[0] !== 'text') return callback()
  }
  let previewText = ''
  const rl = readline.createInterface({
    input: data // stream
  })
  rl.on('line', (line) => {
    previewText += `${line}\n`
    if (Buffer.from(previewText).length > MAXBYTES) {
      // TODO destroy stream
      callback(null, { previewText })
    }
  })
  rl.on('end', () => { // 'close' ?
    if (previewText === '') previewText = undefined
    callback(null, { previewText })
  })
}
