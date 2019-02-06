import ScaleHelper from './ScaleHelper'

export const X = [3, 12, 7, 14, 10, 8, 2]
export const Y = [14, 12, 9, 7, 17, 15, 11]
export const Colors = [3, 8, 12, 15, 4, 5, 1]
export const Areas = [16, 49, 25, 36, 16, 9, 25]
export const Rect = { width: 957, height: 319, left: 0 }

export function getProjection () {
  return X.map((x, i) => [x, Y[i], Colors[i], Areas[i]])
}

export function FakeContainer (containerSelector, listeners) {
  const scaleHelper = new ScaleHelper(Rect)
  const container = {}

  container.getShape = () => {
    return Rect
  }
  container.getScales = () => {
    return scaleHelper.generate(X, Y, Areas, Colors)
  }

  return container
}

export function getXYBetween (n2, n1) {
  let combine = (v1, v2, r1, r2) => v2 + (v1 - v2) * r2 / (r1 + r2)
  const x = combine(n2.x, n1.x, n2.radius, n1.radius)
  const y = combine(n2.y, n1.y, n2.radius, n1.radius)
  return { x, y }
}

export function makeOverlap () {
  const projectionWithOverlap = getProjection().slice()
  projectionWithOverlap[1][1] = 10
  projectionWithOverlap[2][0] = 11
  return projectionWithOverlap
}

export function makeScramble () {
  const projection = getProjection()
  return [projection[0], projection[2], projection[1]]
}

export function parseAttr (element, name) {
  return parseFloat(element.attr(name))
}

export function parseLabel (element) {
  return parseInt(element.attr('data-label'))
}
