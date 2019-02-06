const d3 = require('d3')
const ScaleHelper = require('./ScaleHelper.js').ScaleHelper
const common = require('./common-test')

test('get indices of min and max', () => {
  const scaleHelper = getScaleHelper()
  const { argmin, argmax } = scaleHelper.constructor._argrange([1, 0, 4, 3, 2])
  expect(argmin).toBe(1)
  expect(argmax).toBe(2)
})

test('get min and max', () => {
  const scaleHelper = getScaleHelper()
  const minmax = scaleHelper.constructor._range([1, 0, 4, 3, 2])
  expect(minmax).toEqual([0, 4])
})

test('container bounding rectangle', () => {
  const scaleHelper = getScaleHelper()
  const rect = scaleHelper.boundingRect
  expect(rect.width).toBe(common.Rect.width)
  expect(rect.height).toBe(common.Rect.height)
})

test('ensure positive area unchanged', () => {
  const scaleHelper = getScaleHelper()
  const { domain, positiveArea } = scaleHelper._ensurePositiveArea(common.Areas)
  expect(domain).toEqual([9, 49])
  expect(positiveArea).toEqual(common.Areas)
})

test('ensure positive area becomes positive', () => {
  const scaleHelper = getScaleHelper()
  const { domain, positiveArea } = scaleHelper._ensurePositiveArea([-20, -2, 20])
  expect(domain[0]).toBeGreaterThan(0)
  expect(domain[1]).toBeGreaterThan(domain[0])
  expect(positiveArea[0]).toBe(domain[0])
  expect(positiveArea[1]).toBeGreaterThan(positiveArea[0])
  expect(positiveArea[1]).toBeLessThan(positiveArea[2])
  expect(positiveArea[2]).toBe(domain[1])
})

test('area ratio', () => {
  const scaleHelper = getScaleHelper()
  const ratio = scaleHelper._getAreaRatio(common.Areas)
  expect(ratio).toBeGreaterThan(100)
  expect(ratio).toBeLessThan(1000)
})

test('radius scale', () => {
  const scaleHelper = getScaleHelper()
  const radiusScale = scaleHelper._getRadiusScale(common.Areas)
  assertRadiusScale(radiusScale)
})

test('radius of lower and upper clusters', () => {
  const scaleHelper = getScaleHelper()
  const radiusScale = scaleHelper._getRadiusScale(common.Areas)
  const { lowerRadius, upperRadius } = scaleHelper.constructor._getBoundRadius(common.X, radiusScale)
  expect(lowerRadius).toBe(radiusScale(6))
  expect(upperRadius).toBe(radiusScale(3))
})

test('x scale', () => {
  const scaleHelper = getScaleHelper()
  const radiusScale = scaleHelper._getRadiusScale(common.Areas)
  const xScale = scaleHelper._getXScale(common.X, radiusScale)
  assertXScale(xScale)
})

test('y scale', () => {
  const scaleHelper = getScaleHelper()
  const radiusScale = scaleHelper._getRadiusScale(common.Areas)
  const yScale = scaleHelper._getYScale(common.Y, radiusScale)
  assertYScale(yScale)
})

test('color scale', () => {
  const scaleHelper = getScaleHelper()
  const colorScale = scaleHelper._getColorScale(common.Colors)
  assertColorScale(colorScale)
})

test('generate scales', () => {
  const scaleHelper = getScaleHelper()
  const scales = scaleHelper.generate(common.X, common.Y, common.Areas, common.Colors)
  assertRadiusScale(scales.radiusScale)
  assertXScale(scales.xScale)
  assertYScale(scales.yScale)
  assertColorScale(scales.colorScale)
})

function assertRadiusScale (radiusScale) {
  expect(radiusScale(0)).toBeLessThan(common.Rect.height / 2)
  expect(radiusScale(1)).toBeLessThan(common.Rect.height / 2)
  expect(radiusScale(2)).toBeLessThan(radiusScale(1))
  expect(radiusScale(2)).toBeGreaterThan(radiusScale(0))
}

function assertXScale (xScale) {
  expect(xScale(0)).toBeLessThan(common.Rect.width / 2)
  expect(xScale(1)).toBeGreaterThan(common.Rect.width / 2)
  expect(xScale(2)).toBeLessThan(xScale(1))
  expect(xScale(2)).toBeGreaterThan(xScale(0))
}

function assertYScale (yScale) {
  expect(yScale(0)).toBeLessThan(common.Rect.height / 2)
  expect(yScale(2)).toBeGreaterThan(common.Rect.height / 2)
  expect(yScale(1)).toBeGreaterThan(yScale(0))
  expect(yScale(1)).toBeLessThan(yScale(2))
}

function assertColorScale (colorScale) {
  const color0 = d3.color(colorScale(0))
  const color1 = d3.color(colorScale(1))
  const color2 = d3.color(colorScale(2))
  expect(color2.r < color1.r || color2.g < color1.g || color2.b < color1.b).toBe(true)
  expect(color2.r > color0.r || color2.g > color0.g || color2.b > color0.b).toBe(true)
}

function getScaleHelper () {
  return new ScaleHelper(common.Rect)
}
