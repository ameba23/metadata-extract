# metadata-extract

Extract metadata from various types of media file using 'pluggable' extractors.

## API
```js
const extract = require('metadata-extract')
const metadata = await extract(sourceFilename, options)
```

`options` is an optional object which may include:
  - `options.extractors` - An array of extractors to use. These should be either filenames of the extractors included in the `extractors` directory of this module, or promise-returning functions of the form: 
    ```js
    async function (data, input) {
      return metadata
    }
    ```
    - `input` is existing metadata found by other extractors.  `input.mimetype` will contain the mime-type if detected.
    - `metadata` must be an object containing the metadata found, or undefined if nothing was extracted.
  - `options.log` - A logger function (defaults to [debug](https://github.com/visionmedia/debug))
  - `options.allowBuffers` - If true, buffers will be allowed in 

`metadata` is an object containing the metadata found.

## Included extractors

- `extractors/music-metadata` - Extract [music-metdata](https://github.com/borewit/music-metadata)
- `extractors/exif-tool` - Extract using [exiftool](https://www.sno.phy.queensu.ca/~phil/exiftool/) - requires exiftool to be installed as an external dependency. Disabled by default.
- `extractors/image-size` - Get the size of images using [image-size](https://github.com/image-size/image-size)
- `extractors/pdf-text` - extracts text from PDFs using [pdf2json](https://github.com/modesty/pdf2json)
- `extractors/text` - extracts the beginning of text files
- `extractors/zip` - extracts directory listing from zip files
- `extractors/epub` - extracts text preview or contents listing from `epub` files
