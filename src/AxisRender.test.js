const d3 = require('d3')
const Container = require('./Container').default
const AxisRender = require('./AxisRender').default
const common = require('./common-test')
const apply = require('./apply-test').apply

test('draw axis', () => {
  const axisRender = getAxisRender()
  const axisAtFixedPosition = apply(axisRender, common.Projection)
  axisRender.displayAxis()
  assertXAxis(axisRender, axisAtFixedPosition)
  assertYAxis(axisRender, axisAtFixedPosition)
})

test('hide axis', () => {
  const axisRender = getAxisRender()
  apply(axisRender, common.Projection)
  axisRender.displayAxis()
  expect(axisRender._getXAxis().style('display')).toBe('block')
  expect(axisRender._getYAxis().style('display')).toBe('block')
  axisRender.hideAxis()
  expect(axisRender._getXAxis().style('display')).toBe('none')
  expect(axisRender._getYAxis().style('display')).toBe('none')
})

test('x collide', () => {
  const axisRender = getAxisRender()
  apply(axisRender, common.Projection)
  axisRender.displayAxis()
  let xValues = [{ x: 0 }, { x: 5 }, { x: 10 }, { x: 15 }, { x: 20 }]
  axisRender._collideXAxis(xValues)
  expect(xValues[1].y).toBe('1em')
  expect(xValues[3].y).toBe('1em')
})

test('y collide', () => {
  const axisRender = getAxisRender()
  apply(axisRender, common.Projection)
  axisRender.displayAxis()
  let yValues = [{ y: 20 }, { y: 15 }, { y: 10 }, { y: 5 }, { y: 20 }]
  axisRender._collideYAxis(yValues)
  expect(yValues[1]).not.toBe(10)
  expect(yValues[2]).not.toBe(20)
  expect(yValues[3]).not.toBe(30)
})

test('x do not collide', () => {
  const axisRender = getAxisRender()
  apply(axisRender, common.Projection)
  axisRender.displayAxis()
  let xValues = [{ x: 0 }, { x: 50 }, { x: 100 }, { x: 150 }, { x: 200 }]
  axisRender._collideXAxis(xValues)
  expect(xValues[1].y).toBeUndefined()
  expect(xValues[3].y).toBeUndefined()
  expect(xValues[1]).not.toBe(50)
  expect(xValues[2]).not.toBe(100)
  expect(xValues[3]).not.toBe(150)
})

test('y do not collide', () => {
  const axisRender = getAxisRender()
  apply(axisRender, common.Projection)
  axisRender.displayAxis()
  let yValues = [{ y: 200 }, { y: 150 }, { y: 100 }, { y: 50 }, { y: 0 }]
  axisRender._collideYAxis(yValues)
  expect(yValues[1]).not.toBe(50)
  expect(yValues[2]).not.toBe(100)
  expect(yValues[3]).not.toBe(150)
})

function assertXAxis (axisRender, axisAtFixedPosition) {
  const xAxis = axisRender._getXAxis()
  xAxis.each(function (_, i) {
    const value = d3.select(this)
    const label = common.parseLabel(value)
    let expectedLabel = i === 0 ? 0 : i < 3 ? 2 : 1
    expect(label).toBe(expectedLabel)
    let x = common.parseAttr(value, 'x')
    if (i === 0) {
      expect(x).toBe(0)
    } else if (i === 4) {
      expect(x).toBe(common.Rect.width)
    } else {
      expect(x).toBeGreaterThanOrEqual(axisAtFixedPosition[0].x)
      expect(x).toBeLessThanOrEqual(axisAtFixedPosition[1].x)
    }
  })
}

function assertYAxis (axisRender, axisAtFixedPosition) {
  const yAxis = axisRender._getYAxis()
  yAxis.each(function (_, i) {
    const value = d3.select(this)
    const label = common.parseLabel(value)
    let expectedLabel = i === 0 ? 2 : i < 3 ? 1 : 0
    expect(label).toBe(expectedLabel)
    let y = common.parseAttr(value, 'y')
    if (i === 4) {
      expect(y).toBe(0)
    } else if (i === 0) {
      expect(y).toBe(common.Rect.height)
    } else {
      expect(y).toBeLessThanOrEqual(axisAtFixedPosition[2].y)
      expect(y).toBeGreaterThanOrEqual(axisAtFixedPosition[0].y)
    }
  })
}

function getAxisRender () {
  const container = new Container('#bubble-chart', {}, common.document, common.Rect)
  return new AxisRender(container)
}
