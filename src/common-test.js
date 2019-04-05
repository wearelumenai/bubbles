import { ScaleHelper } from './ScaleHelper'

const containers = require('./Container')
containers.XContainer = jest.fn(FakeContainer)
containers.XYContainer = jest.fn(FakeContainer)

export const X = [3, 12, 7, 14, 10, 8, 2]
export const Y = [14, 12, 9, 7, 17, 10, 11]
export const Colors = [3, 8, 12, 15, 4, 5, 1]
export const Areas = [16, 49, 25, 36, 16, 49, 9]
export const Rect = { width: 400, height: 300, left: 0 }
export const dimensions = ['wisdom', 'beauty', 'intelligence', 'loyalty']

export function getProjection () {
  return X.map((x, i) => [x, Y[i], Colors[i], Areas[i]])
}

export function FakeContainer () {
  const container = new containers.Bounded()
  const scaleHelper = new ScaleHelper(Rect)

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
