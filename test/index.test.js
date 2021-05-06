const test = require('tape')
const extract = require('..')
const fs = require('fs')
const path = require('path')
const assets = path.join(__dirname, 'test-media')

test('index a directory', async t => {
  const files = await new Promise((resolve, reject) => {
    fs.readdir(assets, (err, files) => {
      if (err) return reject(err)
      resolve(files)
    })
  })
  console.log(files)
  for (const file of files) {
    const filename = path.join(assets, file)
    const metadata = await extract(filename)
    console.log(metadata)
    t.ok(metadata, `No error on extracting from ${file}`)
  }
  t.end()
})
