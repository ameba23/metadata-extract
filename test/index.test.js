const test = require('tape')
const extract = require('..')
const pull = require('pull-stream')
const fs = require('fs')
const path = require('path')
const assets = path.join(__dirname, 'test-media')

test('index a directory', t => {
  fs.readdir(assets, (err, files) => {
    t.error(err, 'No error on reading test media directory')
    pull(
      pull.values(files),
      pull.asyncMap((file, cb) => {
        fs.readFile(path.join(assets, file), (err, data) => {
          t.error(err, 'No error on reading file')
          extract(data, { filename: file }, (err, metadata) => {
            console.log(metadata)
            t.error(err, `No error on extracting from ${file}`)
            cb(null, metadata)
          })
        })
      }),
      pull.collect((err) => {
        t.error(err, 'No error from reading all files')
        t.end()
      })
    )
  })
})
