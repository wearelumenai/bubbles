const d3 = require('d3')
const containers = require('./Container')
const axis = require('./AxisRender')
const common = require('./common-test')
const update = require('./apply-test').update

test('draw axis', () => {
  const axisRender = getAxisRender()
  const start = update(axisRender, common.Projection)
  start.updated.displayAxis()
  assertXLabels(start.updated)
  assertXLine(start.updated)
  assertYLabels(start.updated)
})

const dummy = [
  [1, 2, 3, 4],
  [1, 2, 3, 4],
  [1, 2, 3, 4],
  [1, 2, 3, 4],
  [1, 2, 3, 4]
]

/*
test('x collide', () => {
  const axisRender = getAxisRender()
  const start = update(axisRender, dummy)
  start.updated.displayAxis()
  let xClusters = [{ x: 0 }, { x: 5 }, { x: 10 }, { x: 15 }, { x: 20 }]
  start.updated._xPercentiles._collideXAxis(start.updated._getXLabels(), xClusters)
  expect(xClusters[1].y).toBe('1em')
  expect(xClusters[3].y).toBe('1em')
})

test('y collide', () => {
  const axisRender = getAxisRender()
  const start = update(axisRender, dummy)
  start.updated.displayAxis()
  let yClusters = [{ y: 20 }, { y: 15 }, { y: 10 }, { y: 5 }, { y: 20 }]
  start.updated._yPercentiles._collideYAxis(start.updated._getYLabels(), yClusters)
  expect(yClusters[1]).not.toBe(10)
  expect(yClusters[2]).not.toBe(20)
  expect(yClusters[3]).not.toBe(30)
})
*/

test('x do not collide', () => {
  const axisRender = getAxisRender()
  const start = update(axisRender, dummy)
  start.updated.displayAxis()
  let xClusters = [{ x: 0 }, { x: 50 }, { x: 100 }, { x: 150 }, { x: 200 }]
  start.updated._xPercentiles._collideXAxis(start.updated._getXLabels(), xClusters)
  expect(xClusters[1].y).toBeUndefined()
  expect(xClusters[3].y).toBeUndefined()
  expect(xClusters[1]).not.toBe(50)
  expect(xClusters[2]).not.toBe(100)
  expect(xClusters[3]).not.toBe(150)
})

test('y do not collide', () => {
  const axisRender = getAxisRender()
  const start = update(axisRender, dummy)
  start.updated.displayAxis()
  let yClusters = [{ y: 200 }, { y: 150 }, { y: 100 }, { y: 50 }, { y: 0 }]
  start.updated._yPercentiles._collideYAxis(start.updated._getYLabels(), yClusters)
  expect(yClusters[1]).not.toBe(50)
  expect(yClusters[2]).not.toBe(100)
  expect(yClusters[3]).not.toBe(150)
})

function assertXLabels (axisRender) {
  const xAxis = axisRender._getXLabels()
  xAxis.each(function (_, i) {
    const value = d3.select(this)
    const label = common.parseLabel(value)
    let expectedLabel = i === 0 ? 0 : 1
    expect(label).toBe(expectedLabel)
    let x = common.parseAttr(value, 'x')
    if (i === 0) {
      expect(x).toBe(0)
    } else {
      expect(x).toBe(common.Rect.width)
    }
  })
}

function assertXLine (axisRender) {
  const xAxis = axisRender._getXAxis()
  expect(xAxis.node().tagName).toBe('path')
  var re = new RegExp('^M[ .0-9]*V[ .0-9]*H[ .0-9]*V[ .0-9]*$')
  let d = xAxis.attr('d')
  expect(re.test(d)).toBe(true)
}

function assertYLabels (axisRender) {
  const yAxis = axisRender._getYLabels()
  yAxis.each(function (_, i) {
    const value = d3.select(this)
    const label = common.parseLabel(value)
    let expectedLabel = i === 0 ? 2 : 0
    expect(label).toBe(expectedLabel)
    let y = common.parseAttr(value, 'y')
    if (i === 1) {
      expect(y).toBe(0)
    } else {
      expect(y).toBe(common.Rect.height)
    }
  })
}

function getAxisRender () {
  const container = new containers.XYContainer('#bubble-chart', {}, common.document)
  return new axis.AxisRender(container, axis.factoryWithQuartiles())
}
