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
    expect(Math.floor(element.xTarget + element.radius)).toBeLessThanOrEqual(common.Rect.width)
    expect(Math.ceil(element.xTarget - element.radius)).toBeGreaterThanOrEqual(0)
    expect(Math.floor(element.yTarget + element.radius)).toBeLessThanOrEqual(common.Rect.height)
    expect(Math.ceil(element.yTarget - element.radius)).toBeGreaterThanOrEqual(0)
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

test('X and XY do not have same position', () => {
  const builder0 = getXNodeBuilder()
  const builder1 = getXYNodeBuilder()
  expect(builder0.samePosition(builder1)).toBeFalsy()
  expect(builder1.samePosition(builder0)).toBeFalsy()
})

test('X same position', () => {
  const builder0 = getXNodeBuilder()
  const builder1 = getXNodeBuilder()
  builder1.colors[0] = 'rgb(0, 0, 0)'
  builder1.y[0] = 1
  expect(builder0.samePosition(builder1)).toBeTruthy()
  expect(builder1.samePosition(builder0)).toBeTruthy()
  builder1.x[0] = 333
  expect(builder0.samePosition(builder1)).toBeFalsy()
  expect(builder1.samePosition(builder0)).toBeFalsy()
})

test('XY same position', () => {
  const builder0 = getXYNodeBuilder()
  const builder1 = getXYNodeBuilder()
  builder1.colors[0] = 'rgb(0, 0, 0)'
  expect(builder0.samePosition(builder1)).toBeTruthy()
  expect(builder1.samePosition(builder0)).toBeTruthy()
  builder1.y[0] = 333
  expect(builder0.samePosition(builder1)).toBeFalsy()
  expect(builder1.samePosition(builder0)).toBeFalsy()
})

test('same radius', () => {
  const builder0 = getXYNodeBuilder()
  const builder1 = getXYNodeBuilder()
  expect(builder0.sameRadius(builder1)).toBeTruthy()
  expect(builder1.sameRadius(builder0)).toBeTruthy()
  builder1.areas[0] = 333
  expect(builder0.sameRadius(builder1)).toBeFalsy()
  expect(builder1.sameRadius(builder0)).toBeFalsy()
})

test('update colors', () => {
  const black = 'rgb(0, 0, 0)'
  const builder0 = getXNodeBuilder()
  const builder1 = getXNodeBuilder()
  builder1.colors[0] = 0
  builder1.projection.data[0][2] = 0
  builder1.getNodes()[0].color = black
  const builder2 = builder0.updateColors(builder1)
  assertSameBuilders(builder1, builder2)
})

test('update radius and colors', () => {
  const black = 'rgb(0, 0, 0)'
  const builder0 = getXYNodeBuilder()
  const builder1 = getXYNodeBuilder()
  builder1.areas[0] = 1000
  builder1.projection.data[0][3] = 1000
  builder1.getNodes()[0].radius = 400
  builder1.colors[0] = 0
  builder1.projection.data[0][2] = 0
  builder1.getNodes()[0].color = black
  const builder2 = builder0.updateRadiusAndColor(builder1)
  assertSameBuilders(builder1, builder2)
})

test('update scales', () => {
  const builder0 = getXYNodeBuilder()
  const builder1 = getXYNodeBuilder()
  builder1.container.getShape = () => {
    return { width: 200, height: 100 }
  }
  const builder2 = builder0.updateScales(builder1)
  const nodes0 = builder0.getNodes()
  const nodes1 = builder1.getNodes()
  const nodes2 = builder2.getNodes()
  for (let i = 0; i < builder0.projection.data.length; i++) {
    expect(nodes2[i].x).toBeCloseTo(nodes0[i].x / 2, 6)
    expect(nodes2[i].y).toBeCloseTo(nodes0[i].y / 3, 6)
    expect(nodes2[i].xTarget).toEqual(nodes1[i].xTarget)
    expect(nodes2[i].yTarget).toEqual(nodes1[i].yTarget)
  }
})

test('get node at position', () => {
  const builder = getXYNodeBuilder()
  const nodes = builder.getNodes()
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < 10; j++) {
      for (let k = 0; j < 10; j++) {
        let { x, y, radius } = nodes[i]
        expect(builder.getNodesAtPosition(x - j * radius / 10, y - k * radius / 10)).toContain(i)
        expect(builder.getNodesAtPosition(x + j * radius / 10, y - k * radius / 10)).toContain(i)
        expect(builder.getNodesAtPosition(x - j * radius / 10, y + k * radius / 10)).toContain(i)
        expect(builder.getNodesAtPosition(x + j * radius / 10, y + k * radius / 10)).toContain(i)
      }
    }
  }

  expect(builder.getNodesAtPosition(5, 5)).toEqual([])
  expect(builder.getNodesAtPosition(common.Rect.width - 5, 5)).toEqual([])
  expect(builder.getNodesAtPosition(common.Rect.height - 5)).toEqual([])
  expect(builder.getNodesAtPosition(common.Rect.width - 5, common.Rect.height - 5)).toEqual([])
})

test('get dimension names', () => {
  const builder = getXYNodeBuilder()
  const dimensions = builder.getDimensions()
  expect(dimensions).toEqual(common.dimensions)
})

function assertSameBuilders (builder1, builder2) {
  expect(Object.getPrototypeOf(builder1)).toBe(Object.getPrototypeOf(builder2))
  const nodes1 = builder1.getNodes()
  const nodes2 = builder2.getNodes()
  for (let i = 0; i < builder1.projection.data.length; i++) {
    expect(builder2.colors[i]).toEqual(builder1.colors[i])
    expect(builder2.areas[i]).toEqual(builder1.areas[i])
    expect(builder2.x[i]).toEqual(builder1.x[i])
    expect(builder2.y[i]).toEqual(builder1.y[i])
    expect(builder2.projection.data[i]).toEqual(builder1.projection.data[i])
    expect(nodes2[i].color).toEqual(nodes1[i].color)
    expect(nodes2[i].radius).toEqual(nodes1[i].radius)
    expect(nodes2[i].xTarget).toEqual(nodes1[i].xTarget)
    expect(nodes2[i].yTarget).toEqual(nodes1[i].yTarget)
    expect(nodes2[i].data).toEqual(nodes1[i].data)
  }
}

function getXNodeBuilder () {
  let projection = { data: common.getProjection(), dimensions: common.dimensions }
  return new XNodeBuilder(projection, new XContainer('#bubbles-chart', {}))
}

function getXYNodeBuilder () {
  let projection = { data: common.getProjection(), dimensions: common.dimensions }
  return new XYNodeBuilder(projection, new XYContainer('#bubbles-chart', {}))
}

module.exports = {
  getXNodeBuilder,
  getXYNodeBuilder
}
