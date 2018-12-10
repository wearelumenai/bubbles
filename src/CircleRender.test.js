const d3 = require('d3')
const containers = require('./Container')
const CircleRender = require('./CircleRender').default
const common = require('./common-test')
const update = require('./apply-test').update

test('draw circles', () => {
  const circleRender = getCircleRender()
  const start = update(circleRender, common.Projection)
  start.updated.drawCircles()
  const circles = start.updated._getCircles()
  circles.each(function () {
    const circle = d3.select(this)
    const i = common.parseLabel(circle)
    expect(common.parseAttr(circle, 'cx')).toBe(start.nodes[i].x)
    expect(common.parseAttr(circle, 'cy')).toBe(start.nodes[i].y)
    expect(common.parseAttr(circle, 'r')).toBe(start.nodes[i].radius)
    expect(circle.attr('fill')).toBe(start.nodes[i].color)
  })
})

test('move circles', done => {
  const circleRender = getCircleRender()
  const start = update(circleRender, common.Projection)
  start.updated.drawCircles()
  const moved = update(start.updated, common.makeScramble())
  moved.updated.moveCircles()
  setTimeout(() => {
    const circles = moved.updated._getCircles()
    circles.each(function () {
      const circle = d3.select(this)
      const i = common.parseLabel(circle)
      if (i !== 0) {
        expect(common.parseAttr(circle, 'cx')).not.toBe(start.nodes[i].x)
        expect(common.parseAttr(circle, 'cy')).not.toBe(start.nodes[i].y)
        expect(common.parseAttr(circle, 'r')).not.toBe(start.nodes[i].radius)
        expect(circle.attr('fill')).not.toBe(start.nodes[i].color)
      }
    })
    done()
  }, 500)
})

test('progressive bound to rect', () => {
  const valueAtTick1 = CircleRender._progressiveBound(1, 3, 1, [1, 3])
  expect(valueAtTick1).toBe(1)
  const valueAtTick2 = CircleRender._progressiveBound(1, 3, 2, [1, 3])
  expect(valueAtTick2).toBe(2)
  const valueAtTick3 = CircleRender._progressiveBound(1, 3, 3, [1, 3])
  expect(valueAtTick3).toBe(3)
})

test('two clusters at position', () => {
  const circleRender = getCircleRender()
  const start = update(circleRender, common.makeOverlap())
  let { x, y } = common.getXYBetween(start.updated.clusters[2], start.updated.clusters[1])
  const clusters = start.updated.getClustersAtPosition(x, y)
  expect(clusters).toEqual([2, 1])
})

test('no cluster at position', () => {
  const circleRender = getCircleRender()
  const start = update(circleRender, common.makeOverlap())
  let { x, y } = common.getXYBetween(start.updated.clusters[2], start.updated.clusters[0])
  const clusters = start.updated.getClustersAtPosition(x, y)
  expect(clusters).toEqual([])
})

test('get position with uninitialized clusters', () => {
  const circleRender = getCircleRender()
  const clusters = circleRender.getClustersAtPosition(1, 1)
  expect(clusters).toEqual([])
})

function getCircleRender () {
  const container = new containers.XYContainer('#bubble-chart', {}, common.document)
  return new CircleRender(container)
}
