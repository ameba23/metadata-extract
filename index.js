const pull = require('pull-stream')
const path = require('path')
const fileType = require('file-type')
const mime = require('mime') // or mime/lite is only 2kb
const assert = require('assert')

const extractorsPath = './extractors/'
const defaultExtractors = ['music-metadata']

module.exports = function extract (data, opts = {}, callback) {
  if (typeof opts === 'function' && !callback) {
    callback = opts
    opts = {}
  }

  const metadata = {}
  const log = opts.log || console.log  // TODO should use debug
  const extractorNames = opts.extractors || defaultExtractors
  assert(Array.isArray(extractorNames), 'opts.extractors must be an array')

  const extractors = extractorNames.map((e) => {
    if (typeof e === 'string') return require(extractorsPath + e)
    assert(typeof e === 'function', 'opts.extractors must contain strings or functions')
  })

  if (opts.filename) metadata.extension = path.extname(opts.filename)
  metadata.mimeType = getMimeType(data, metadata.extension)
  log('mimetype: ', metadata.mimeType)

  pull(
    pull.values(extractors),
    pull.asyncMap((extractor, cb) => {
      try {
        extractor(data, metadata, cb)
      } catch (err) {
        log('Error from extractor: ', extractor.name, err)
        cb(null, data) // ignore errors and keep going
      }
    }),
    // pull.filter(Boolean),
    pull.filter(t => !!t),
    pull.map(sanitise),
    // should this be a reducer?
    pull.collect((err, metadatas) => {
      if (err) return callback(err) // TODO: or ingore?
      Object.assign(metadata, ...metadatas)
      callback(null, metadata)
    })
  )

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

function getMimeType (data, extension) {
  // TODO: file-type can also take a stream
  let ft
  if (data.length >= fileType.minimumBytes) {
    ft = fileType(data)
  }

  // if we cannot determine mime type from data,
  // use the extension. (this is less reliable)
  return ft
    ? ft.mime
    : extension ? mime.getType(extension) : undefined
}

function isEmptyObject (thing) {
  return (Object.keys(thing).length === 0 && thing.constructor === Object)
}

function isEmptyArray (thing) {
  return (Array.isArray(thing) && !thing.length)
}
