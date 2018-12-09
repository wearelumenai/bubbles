const d3 = require('d3')
const Container = require('./Container').default
const CircleRender = require('./CircleRender').default
const common = require('./common-test')
const apply = require('./apply-test').apply

test('draw circles', () => {
  const circleRender = getCircleRender()
  const clustersAtFixedPosition = apply(circleRender, common.Projection)
  circleRender.drawCircles()
  const circles = circleRender._getCircles()
  circles.each(function () {
    const circle = d3.select(this)
    const i = common.parseLabel(circle)
    expect(common.parseAttr(circle, 'cx')).toBe(clustersAtFixedPosition[i].x)
    expect(common.parseAttr(circle, 'cy')).toBe(clustersAtFixedPosition[i].y)
    expect(common.parseAttr(circle, 'r')).toBe(clustersAtFixedPosition[i].radius)
    expect(circle.attr('fill')).toBe(clustersAtFixedPosition[i].color)
  })
})

test('move circles', () => {
  const circleRender = getCircleRender()
  const clustersBeforeMove = apply(circleRender, common.Projection)
  circleRender.drawCircles()
  apply(circleRender, common.makeScramble())
  circleRender.moveCircles()
  setTimeout(() => {
    const circles = circleRender._getCircles()
    circles.each(function () {
      const circle = d3.select(this)
      const i = common.parseLabel(circle)
      if (i !== 0) {
        expect(common.parseAttr(circle, 'cx')).not.toBe(clustersBeforeMove[i].x)
        expect(common.parseAttr(circle, 'cy')).not.toBe(clustersBeforeMove[i].y)
      }
      expect(common.parseAttr(circle, 'r')).toBe(clustersBeforeMove[i].radius)
      expect(circle.attr('fill')).toBe(clustersBeforeMove[i].color)
    })
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
  apply(circleRender, common.makeOverlap())
  let { x, y } = common.getXYBetween(circleRender.clusters[2], circleRender.clusters[1])
  const clusters = circleRender.getClustersAtPosition(x, y)
  expect(clusters).toEqual([2, 1])
})

test('no cluster at position', () => {
  const circleRender = getCircleRender()
  apply(circleRender, common.makeOverlap())
  let { x, y } = common.getXYBetween(circleRender.clusters[2], circleRender.clusters[0])
  const clusters = circleRender.getClustersAtPosition(x, y)
  expect(clusters).toEqual([])
})

test('get position with uninitialized clusters', () => {
  const circleRender = getCircleRender()
  const clusters = circleRender.getClustersAtPosition(1, 1)
  expect(clusters).toEqual([])
})

function getCircleRender () {
  const container = new Container('#bubble-chart', {}, common.document, common.Rect)
  return new CircleRender(container)
}
