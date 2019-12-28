const pull = require('pull-stream')
const path = require('path')
const fileType = require('file-type')
const assert = require('assert')

const extractorsPath = './extractors/'
const defaultExtractors = ['music-metadata']

module.exports = function extract (data, opts = {}, callback) {
  if (typeof opts === 'function' && !callback) {
    callback = opts
    opts = {}
  }

  const log = opts.log || console.log
  const extractorNames = opts.extractors || defaultExtractors
  assert(Array.isArray(extractorNames), 'opts.extractors must be an array')

  const extractors = extractorNames.map((e) => {
    if (typeof e === 'string') return require(extractorsPath + e)
    assert(typeof e === 'function', 'opts.extractors must contain strings or functions')
  })

  const metadata = { mimeType: getMimeType(data) }
  if (opts.filename) metadata.extension = path.extname(opts.filename)
  log('mimetype: ', metadata.mimeType)

  pull(
    pull.values(extractors),
    pull.asyncMap((extractor, cb) => {
      try {
        extractor(data, metadata, cb)
      } catch (err) {
        log('Error from extractor: ', extractor.name, err)
        cb(null, data)
      } // ignore errors and keep going
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
        if (typeof value === 'object') return sanitise(value)
        // Dont allow buffers
        if (Buffer.isBuffer(value) && !opts.allowBuffers) delete metadata[key]
      })
    } else { log('WARNING - returned metadata is badly formed: ', metadata) } // TODO
    return metadata
  }
}

function getMimeType (data) {
  // TODO: file-type can also take a stream
  let ft
  if (data.length >= fileType.minimumBytes) {
    ft = fileType(data)
  }
  // TODO if ft undefined, get ft from extension
  return ft
    ? ft.mime
    : undefined
}
