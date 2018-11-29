const jsdom = require('jsdom')
const _require = require('esm')(module)
const container = _require('./Container.js')

test('get indices of min and max', () => {
  const contain = getContainer()
  let { argmin, argmax } = contain.rangeHelper.constructor._argRange([1, 0, 4, 3, 2])
  expect(argmin).toBe(1)
  expect(argmax).toBe(2)
})

test('container bounding rectangle', () => {
  const contain = getContainer()
  let rect = contain.rangeHelper.boundingRect
  expect(rect.width).toBe(957)
  expect(rect.height).toBe(319)
})

test('get radius of leftmost and rightmost clusters', () => {
  const contain = getContainer()
  let radiusRange = contain.rangeHelper._getRadiusRange([16, 49, 25])
  expect(radiusRange(0)).toBeCloseTo(72, 1)
  expect(radiusRange(1)).toBeCloseTo(126, 1)
  expect(radiusRange(2)).toBeCloseTo(90, 1)
})

test('get bound radius', () => {
  const contain = getContainer()
  let radiusRange = contain.rangeHelper._getRadiusRange([16, 49, 25])
  let { lowerRadius, upperRadius } = contain.rangeHelper.constructor._getBoundRadius([3, 12, 7], radiusRange)
  expect(lowerRadius).toBe(radiusRange(0))
  expect(upperRadius).toBe(radiusRange(1))
})

function getContainer () {
  var document = new jsdom.JSDOM(`<!DOCTYPE html><div id="chart" style="width=957px; height=319px"></div>`).window.document
  const contain = container.create('#chart', document)
  contain.rangeHelper.boundingRect = { width: 957, height: 319 }
  return contain
}
