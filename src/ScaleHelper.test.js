const ScaleHelper = require('./ScaleHelper.js').default

const X = [3, 12, 7]
const Y = [14, 12, 9]
const Areas = [16, 49, 25]
const Colors = [3, 8, 12]

test('get indices of min and max', () => {
  const scaleHelper = getScaleHelper()
  let { argmin, argmax } = scaleHelper.constructor._argrange([1, 0, 4, 3, 2])
  expect(argmin).toBe(1)
  expect(argmax).toBe(2)
})

test('get min and max', () => {
  const scaleHelper = getScaleHelper()
  let minmax = scaleHelper.constructor._range([1, 0, 4, 3, 2])
  expect(minmax).toEqual([0, 4])
})

test('container bounding rectangle', () => {
  const scaleHelper = getScaleHelper()
  let rect = scaleHelper.boundingRect
  expect(rect.width).toBe(957)
  expect(rect.height).toBe(319)
})

test('radius scale', () => {
  const scaleHelper = getScaleHelper()
  let radiusScale = scaleHelper._getRadiusScale(Areas)
  checkRadiusScale(radiusScale)
})

test('area ratio', () => {
  const scaleHelper = getScaleHelper()
  let ratio = scaleHelper._getAreaRatio(Areas)
  expect(ratio).toBeCloseTo(1017.6, 1)
})

test('radius of lower and upper clusters', () => {
  const scaleHelper = getScaleHelper()
  let radiusScale = scaleHelper._getRadiusScale(Areas)
  let { lowerRadius, upperRadius } = scaleHelper.constructor._getBoundRadius(X, radiusScale)
  expect(lowerRadius).toBe(radiusScale(0))
  expect(upperRadius).toBe(radiusScale(1))
})

test('x scale', () => {
  const scaleHelper = getScaleHelper()
  let radiusScale = scaleHelper._getRadiusScale(Areas)
  let xScale = scaleHelper._getXScale(X, radiusScale)
  checkXScale(xScale)
})

test('y scale', () => {
  const scaleHelper = getScaleHelper()
  let radiusScale = scaleHelper._getRadiusScale(Areas)
  let yScale = scaleHelper._getYScale(Y, radiusScale)
  checkYScale(yScale)
})

test('color scale', () => {
  const scaleHelper = getScaleHelper()
  let colorScale = scaleHelper._getColorScale(Colors)
  checkColorScale(colorScale)
})

test('generate scales', () => {
  const scaleHelper = getScaleHelper()
  let scales = scaleHelper.generate(X, Y, Areas, Colors)
  checkRadiusScale(scales.radiusScale)
  checkXScale(scales.xScale)
  checkYScale(scales.yScale)
  checkColorScale(scales.colorScale)
})

function checkRadiusScale (radiusScale) {
  expect(radiusScale(0)).toBeCloseTo(72, 1)
  expect(radiusScale(1)).toBeCloseTo(126, 1)
  expect(radiusScale(2)).toBeCloseTo(90, 1)
}

function checkXScale (xScale) {
  expect(xScale(0)).toBeCloseTo(72, 1)
  expect(xScale(1)).toBeCloseTo(831, 1)
  expect(xScale(2)).toBeCloseTo(409.3, 1)
}

function checkYScale (yScale) {
  expect(yScale(0)).toBeCloseTo(90, 1)
  expect(yScale(1)).toBeCloseTo(152.8, 1)
  expect(yScale(2)).toBeCloseTo(247, 1)
}

function checkColorScale (colorScale) {
  expect(colorScale(0)).toEqual('rgb(255, 165, 0)')
  expect(colorScale(1)).toEqual('rgb(255, 73, 0)')
  expect(colorScale(2)).toEqual('rgb(255, 0, 0)')
}

function getScaleHelper () {
  return new ScaleHelper({ width: 957, height: 319 })
}
