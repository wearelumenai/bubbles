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

test('collide x', () => {
  const axisRender = getAxisRender()
  apply(axisRender, common.Projection)
  axisRender.xClusters.reverse()
  axisRender.yClusters.reverse()
  axisRender.displayAxis()
  axisRender.displayAxis()
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
