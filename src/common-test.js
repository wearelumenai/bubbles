const jsdom = require('jsdom')

export const X = [3, 12, 7]
export const Y = [14, 12, 9]
export const Areas = [16, 49, 25]
export const Colors = [3, 8, 12]
export const Rect = { width: 957, height: 319 }
export const Projection = [
  [3, 14, 3, 16],
  [12, 12, 8, 49],
  [7, 9, 12, 25]
]

export const document = new jsdom.JSDOM('<body><div id="bubble-chart"></div></body>').window.document

export function getXYBetween (n2, n1) {
  let combine = (v1, v2, r1, r2) => v2 + (v1 - v2) * r2 / (r1 + r2)
  const x = combine(n2.x, n1.x, n2.radius, n1.radius)
  const y = combine(n2.y, n1.y, n2.radius, n1.radius)
  return { x, y }
}

export function makeOverlap () {
  const projectionWithOverlap = Projection.slice()
  projectionWithOverlap[1][1] = 10
  projectionWithOverlap[2][0] = 11
  return projectionWithOverlap
}

export function makeScramble () {
  return [Projection[0], Projection[2], Projection[1]]
}

export function parseAttr (element, name) {
  return parseFloat(element.attr(name))
}
