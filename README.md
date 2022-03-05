# Image Trim
Trims back/whitespace from around an image from for example: shitty reposts, screenshot caps etc.

Usage:
```js
import { getCropped, getBorders } from 'image-trim'


const uri = await getCropped(pathToImage, opts)
img.src = uri



const ctx = canvas.getContext('2d')

const data = ctx.getImageData()
const { top, bottom, left, right } = getBorders(data, opts)

const width = data.width - left - right
const height = data.height - top - bottom
canvas.width = width
canvas.height = height
ctx.putImageData(data, -left, -top, width, height)
```

## API:
### `async getCropped(source, opts)`
Returns cropped image URI, generating which takes a lot of time.

source:
```js
String|Blob
```
opts:
```js
{
  threshold: Number, // Byte value for color which will still be treated as the border, to fix for example image compression artifacts: ex: threshold: 15 = white >= 255-15
  margin: Number, // Value in pixels of how many pixels to skip checking from around the edge of the image, some JPEG compression has color artifacts around the first 2 pixels of the edge of the image
  padding: Number // Value in pixels of how much space from the image edge to leave, overlaps margin
}
```
### `getBorders(imgData, opts)`
Direct function to find the borders, uses ImageData for source unlike getCropped and returns the border values rather than the cropped image which could allow you to use this with canvases for almost instant operations. Very fast.

You can run this function recursively until it returns 0 to return multiple black/white/black/white borders.

imgData:
```js
ImageData
```
opts: same as above

returns:
```js
{ // safe values in pixels, distance to the image from the given side 
  top: Number,
  bottom: Number,
  left: Number,
  right: Number
}
```
Given this image:

<img src=source.jpg>

The output will be:

<img src=example.jpg>

Where:
- red is the pixels from the edge ommited from checks by margin
- gray is the edges found
- green are the values returned, decreased by padding