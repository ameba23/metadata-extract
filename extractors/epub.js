const EPub = require('epub')

module.exports = async function (filename, { mimeType }) {
  if (mimeType !== 'application/epub+zip') return
  return new Promise((resolve, reject) => {
    const epub = new EPub(filename)
    epub.on('end', () => {
      epub.metadata.toc = epub.toc.map(e => e.title)
      resolve(epub.metadata)
    })
    epub.on('error', reject)
    epub.parse()
  })
}
