const test = require('tape')
const extract = require('..')
const pull = require('pull-stream')
const fs = require('fs')
const path = require('path')
const assets = path.join(__dirname, 'test-media')

test('index a directory', t => {
  fs.readdir(assets, (err, files) => {
    t.error(err, 'no error')
    pull(
      pull.values(files),
      pull.asyncMap((file, cb) => {
        fs.readFile(path.join(assets, file), (err, data) => {
          if (err) return cb(err)
          extract(data, { filename: file }, (err, metadata) => {
            console.log(metadata)
            t.error(err, `no error on extracting from ${file}`)
            cb(null, metadata)
          })
        })
      }),
      pull.collect((err) => {
        t.error(err, 'no error')
        t.end()
      })
    )
  })
})
