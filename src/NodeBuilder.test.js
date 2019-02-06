const common = require('./common-test')
const { XYContainer, XContainer } = require('./Container')
const { XYNodeBuilder, XNodeBuilder } = require('./NodeBuilder')

test('unzip data', () => {
  const builder = getXYNodeBuilder()
  expect(builder.x).toEqual(common.X)
  expect(builder.y).toEqual(common.Y)
  expect(builder.areas).toEqual(common.Areas)
  expect(builder.colors).toEqual(common.Colors)
})

test('get nodes in builder', () => {
  const builder = getXYNodeBuilder()
  const nodes = builder.getNodes()
  nodes.forEach(element => {
    expect(element.xTarget + element.radius).toBeLessThanOrEqual(common.Rect.width)
    expect(element.xTarget - element.radius).toBeGreaterThanOrEqual(0)
    expect(element.yTarget + element.radius).toBeLessThanOrEqual(common.Rect.height)
    expect(element.yTarget - element.radius).toBeGreaterThanOrEqual(0)
  })
})

test('XNodeBuilder has constant initial y and fixed x', () => {
  const builder = getXNodeBuilder()
  const nodes = builder.getNodes()
  nodes.forEach(element => {
    expect(element.fx).toBe(element.x)
    expect(element.y).toBe(common.Rect.height / 2)
    expect(element.vy).toBe(1)
  })
  expect(builder.orderY()).toEqual([])
})

test('x order', () => {
  const builder = getXYNodeBuilder()
  let xOrder = builder.orderX()
  for (let i = 1; i < xOrder.length; i++) {
    expect(common.X[xOrder[i]]).toBeGreaterThanOrEqual(common.X[xOrder[i - 1]])
  }
})

test('y order', () => {
  const builder = getXYNodeBuilder()
  let yOrder = builder.orderY()
  for (let i = 1; i < yOrder.length; i++) {
    expect(common.Y[yOrder[i]]).toBeGreaterThanOrEqual(common.Y[yOrder[i - 1]])
  }
})

test('same position', () => {
  const builder0 = getXYNodeBuilder()
  const builder1 = getXYNodeBuilder()
  builder1.colors[0] = 'rgb(0, 0, 0)'
  expect(builder0.samePosition(builder1)).toBe(true)
  expect(builder1.samePosition(builder0)).toBe(true)
  builder1.x[0] = 333
  expect(builder0.samePosition(builder1)).toBe(false)
  expect(builder1.samePosition(builder0)).toBe(false)
})

test('update colors', () => {
  const black = 'rgb(0, 0, 0)'
  const builder0 = getXYNodeBuilder()
  const builder1 = getXYNodeBuilder()
  builder1.colors[0] = 0
  builder1.projection[0][3] = 0
  builder1.getNodes()[0].color = black
  const builder2 = builder0.updateColors(builder1)
  assertSameBuilders(builder1, builder2)
})

test('update radius and colors', () => {
  const black = 'rgb(0, 0, 0)'
  const builder0 = getXYNodeBuilder()
  const builder1 = getXYNodeBuilder()
  builder1.areas[0] = 1000
  builder1.projection[0][4] = 1000
  builder1.getNodes()[0].radius = 400
  builder1.colors[0] = 0
  builder1.projection[0][3] = 0
  builder1.getNodes()[0].color = black
  const builder2 = builder0.updateRadiusAndColor(builder1)
  assertSameBuilders(builder1, builder2)
})

function assertSameBuilders (builder1, builder2) {
  const nodes1 = builder1.getNodes()
  const nodes2 = builder2.getNodes()
  for (let i = 0; i < builder1.projection.length; i++) {
    expect(builder2.colors[i]).toBe(builder1.colors[i])
    expect(builder2.areas[i]).toBe(builder1.areas[i])
    expect(builder2.x[i]).toBe(builder1.x[i])
    expect(builder2.y[i]).toBe(builder1.y[i])
    expect(builder2.projection[i]).toEqual(builder1.projection[i])
    expect(nodes2[i].color).toBe(nodes1[i].color)
    expect(nodes2[i].radius).toBe(nodes1[i].radius)
    expect(nodes2[i].xTarget).toBe(nodes1[i].xTarget)
    expect(nodes2[i].yTarget).toBe(nodes1[i].yTarget)
    expect(nodes2[i].data).toEqual(nodes1[i].data)
  }
}

function getXNodeBuilder () {
  return new XNodeBuilder(common.getProjection(), new XContainer('#bubbles-chart', {}))
}

function getXYNodeBuilder () {
  return new XYNodeBuilder(common.getProjection(), new XYContainer('#bubbles-chart', {}))
}

module.exports = {
  getXNodeBuilder,
  getXYNodeBuilder
}
