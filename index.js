/* eslint no-labels: ["error", { "allowLoop": true }] */
export async function getCropped (source, opts) {
  const img = new Image()
  img.src = source instanceof File ? URL.createObjectURL(source) : source
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  await new Promise(resolve => {
    img.onload = resolve
    if (img.complete) resolve()
  })
  URL.revokeObjectURL(img.src)
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { top, bottom, left, right } = getBorders(imgData, opts)
  canvas.width = img.width - left - right
  canvas.height = img.height - top - bottom
  ctx.drawImage(img, -left, -top)
  return [canvas.toDataURL('image/png'), ctx.getImageData(0, 0, canvas.width, canvas.height)]
}

export function getBorders (imgData, options = {}) {
  if (!imgData) return null
  const { threshold = 15, margin = 2, padding = 5 } = options
  const { data, width, height } = imgData
  const opts = { whitethreshold: 255 - threshold, blackthreshold: threshold, margin, data: new Uint32Array(data.buffer), width, height }
  return {
    top: Math.max(0, topBorder(opts) - padding),
    bottom: Math.max(0, bottomBorder(opts) - padding),
    left: Math.max(0, leftBorder(opts) - padding),
    right: Math.max(0, rightBorder(opts) - padding)
  }
}

function topBorder ({ whitethreshold, blackthreshold, margin, data, height, width }) {
  let white = margin
  let black = margin
  bbwl: for (; white < height - margin * 2; ++white) {
    const offset = white * width
    for (let wid = margin; wid < width - margin * 2; ++wid) {
      const color = data[offset + wid]
      if ((color & 0xff) < whitethreshold || ((color >> 8) & 0xff) < whitethreshold || ((color >> 16) & 0xff) < whitethreshold) break bbwl
    }
  }
  bbbl: for (; black < height - margin * 2; ++black) {
    const offset = black * width
    for (let wid = margin; wid < width - margin * 2; ++wid) {
      const color = data[offset + wid]
      if ((color & 0xff) > blackthreshold || ((color >> 8) & 0xff) > blackthreshold || ((color >> 16) & 0xff) > blackthreshold) break bbbl
    }
  }
  return Math.max(black, white)
}

function bottomBorder ({ whitethreshold, blackthreshold, margin, data, height, width }) {
  let white = height - 1 - margin
  let black = height - 1 - margin
  tbwl: for (; white >= margin; --white) {
    const offset = white * width
    for (let wid = margin; wid < width - margin * 2; ++wid) {
      const color = data[offset + wid]
      if ((color & 0xff) < whitethreshold || ((color >> 8) & 0xff) < whitethreshold || ((color >> 16) & 0xff) < whitethreshold) break tbwl
    }
  }
  tbbl: for (; black >= margin; --black) {
    const offset = black * width
    for (let wid = margin; wid < width - margin * 2; ++wid) {
      const color = data[offset + wid]
      if ((color & 0xff) > blackthreshold || ((color >> 8) & 0xff) > blackthreshold || ((color >> 16) & 0xff) > blackthreshold) break tbbl
    }
  }

  return height - Math.min(white, black) - 1
}

function leftBorder ({ whitethreshold, blackthreshold, margin, data, height, width }) {
  let white = margin
  let black = margin
  lbwl: for (; white < width - margin * 2; ++white) {
    for (let hei = margin; hei < height - margin * 2; ++hei) {
      const color = data[hei * width + white]
      if ((color & 0xff) < whitethreshold || ((color >> 8) & 0xff) < whitethreshold || ((color >> 16) & 0xff) < whitethreshold) break lbwl
    }
  }
  lbbl: for (; black < width - margin * 2; ++black) {
    for (let hei = margin; hei < height - margin * 2; ++hei) {
      const color = data[hei * width + black]
      if ((color & 0xff) > blackthreshold || ((color >> 8) & 0xff) > blackthreshold || ((color >> 16) & 0xff) > blackthreshold) break lbbl
    }
  }
  return Math.max(white, black)
}

function rightBorder ({ whitethreshold, blackthreshold, margin, data, height, width }) {
  let white = width - 1 - margin
  let black = width - 1 - margin

  rbwl: for (; white >= margin; --white) {
    for (let hei = margin; hei < height - margin * 2; ++hei) {
      const color = data[hei * width + white]
      if ((color & 0xff) < whitethreshold || ((color >> 8) & 0xff) < whitethreshold || ((color >> 16) & 0xff) < whitethreshold) break rbwl
    }
  }
  rbbl: for (; black >= margin; --black) {
    for (let hei = margin; hei < height - margin * 2; ++hei) {
      const color = data[hei * width + black]
      if ((color & 0xff) < blackthreshold || ((color >> 8) & 0xff) < blackthreshold || ((color >> 16) & 0xff) < blackthreshold) break rbbl
    }
  }

  return width - Math.min(white, black) - 1
}
