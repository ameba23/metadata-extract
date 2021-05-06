const readline = require('readline')
const fs = require('fs')
const MAXBYTES = 1024

// Mime types which we process as if they are text
const treatAsText = ['audio/x-mpegurl', 'application/json']

module.exports = async function (filename, inputMetadata) {
  const mimeType = inputMetadata.mimeType
  // TODO allow extensions: .url, .txt, .nfo, .md
  if (!mimeType) return
  if ((mimeType.split('/')[0] !== 'text') && (!treatAsText.includes(mimeType))) return

  let previewText = ''
  const input = fs.createReadStream(filename)
  const rl = readline.createInterface({ input })

  for await (const line of rl) {
    previewText += `${line}\n`
    if (Buffer.from(previewText).length >= MAXBYTES) {
      break
    }
  }

  if (previewText === '') previewText = undefined
  input.destroy()
  return { previewText }
}
