const { getXEndPoints, getYEndPoints, factoryWithQuartiles, factoryWithRange } = require('./quantiles')
const { getXNodeBuilder, getXYNodeBuilder } = require('./NodeBuilder.test')

test('endpoints', () => {
  const builder = getXYNodeBuilder()
  const nodes = builder.getNodes()
  const xEndPoints = getXEndPoints(nodes, builder.orderX())
  expect(xEndPoints[0]).toBe(nodes[6].x)
  expect(xEndPoints[1]).toBe(nodes[3].x)
  const yEndPoints = getYEndPoints(nodes, builder.orderY())
  expect(yEndPoints[0]).toBe(nodes[3].y)
  expect(yEndPoints[1]).toBe(nodes[4].y)
})

test('factoryWithRange has 2 ticks', () => {
  const builder = getXYNodeBuilder()
  const nodes = builder.getNodes()
  const factory = factoryWithRange()
  const xAxisTicks = factory._getXPercentile(nodes, builder.orderX()).getAxisTicks([])
  expect(xAxisTicks.length).toBe(2)
  const yAxisTicks = factory._getYPercentile(nodes, builder.orderY()).getAxisTicks([])
  expect(yAxisTicks.length).toBe(2)
})

test('factoryWithQuartiles has 5 ticks', () => {
  const builder = getXYNodeBuilder()
  const nodes = builder.getNodes()
  const factory = factoryWithQuartiles()
  const xAxisTicks = factory._getXPercentile(nodes, builder.orderX()).getAxisTicks([])
  expect(xAxisTicks.length).toBe(5)
  const yAxisTicks = factory._getYPercentile(nodes, builder.orderY()).getAxisTicks([])
  expect(yAxisTicks.length).toBe(5)
})

test('X quartiles collide', () => {
  const builder = getXNodeBuilder()
  const nodes = builder.getNodes()
  const xQuartiles = factoryWithQuartiles()._getXPercentile(nodes, builder.orderX())
  const ticks = xQuartiles.getAxisTicks(Array(5).fill(200))
  expect(ticks[0].y === '1em')
  expect(ticks[2].y === '1em')
  expect(ticks[3].y === '1em')
  expect(ticks[1].y === '2em')
  expect(ticks[3].y === '2em')
})

test('Y quartiles collide', () => {
  const builder = getXYNodeBuilder()
  const nodes = builder.getNodes()
  const yQuartiles = factoryWithQuartiles()._getYPercentile(nodes, builder.orderY())
  const ticks = yQuartiles.getAxisTicks(Array(5).fill(60))
  for (let i = 1; i < ticks.length; i++) {
    expect(ticks[i].y).toBeLessThanOrEqual(ticks[i - 1].y - 60)
  }
})
