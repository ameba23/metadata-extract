const path = require('path')
const fileType = require('file-type')
const mime = require('mime') // or mime/lite is only 2kb
const assert = require('assert')
const debug = require('debug')

const extractorsPath = './extractors/'
const defaultExtractors = ['music-metadata', 'text', 'pdf-text', 'image-size', 'zip', 'epub']

module.exports = async function extract (filename, opts = {}) {
  const metadata = {}
  const log = opts.log || debug('metadata-extract')
  const extractorNames = opts.extractors || defaultExtractors
  assert(Array.isArray(extractorNames), 'opts.extractors must be an array')

  const extractors = extractorNames.map((e) => {
    if (typeof e === 'string') return require(extractorsPath + e)
    assert(typeof e === 'function', 'opts.extractors must contain strings or functions')
  })

  // if (opts.filename) metadata.extension = path.extname(opts.filename)
  metadata.extension = path.extname(filename)
  // metadata.mimeType = getMimeType(dataStream, metadata.extension)
  //
  const mimeType = await getMimeType(filename, metadata.extension).catch(() => {})
  metadata.mimeType = mimeType

  log('Mimetype: ', metadata.mimeType)

  for (const extractor of extractors) {
    const output = await extractor(filename, metadata).catch((err) => {
      log('Error from extractor: ', extractor.name, err)
    })
    if (!output) continue
    Object.assign(metadata, sanitise(output))
  }

  return metadata

  function sanitise (metadata) {
    if (metadata && typeof metadata === 'object') {
      Object.keys(metadata).forEach((key) => {
        const value = metadata[key]
        if (!value) {
          delete metadata[key]
          return
        }
        if (typeof value === 'object') {
          if (isEmptyObject(value) || isEmptyArray(value)) {
            delete metadata[key]
          } else {
            metadata[key] = sanitise(value)
            if (isEmptyObject(metadata[key]) || isEmptyArray(metadata[key])) delete metadata[key]
          }
        }
        // Dont allow buffers
        if (Buffer.isBuffer(value) && !opts.allowBuffers) delete metadata[key]
      })
    }
    return metadata
  }
}

async function getMimeType (filename, extension) {
  const fileTypeObject = await fileType.fromFile(filename)
  // if we cannot determine mime type from data,
  // use the extension. (this is less reliable)
  // console.log(fileTypeObject)
  const type = fileTypeObject
    ? fileTypeObject.mime
    : extension ? mime.getType(extension) : undefined
  return type
}

function isEmptyObject (thing) {
  return (Object.keys(thing).length === 0 && thing.constructor === Object)
}

function isEmptyArray (thing) {
  return (Array.isArray(thing) && !thing.length)
}
