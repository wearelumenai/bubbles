const { XYNodeBuilder, XNodeBuilder } = require('./NodeBuilder')
const containers = require('./Container')
const common = require('./common-test')

test('unzip data', () => {
  const builder = getNodeBuilder()
  expect(builder.x).toEqual(common.X)
  expect(builder.y).toEqual(common.Y)
  expect(builder.areas).toEqual(common.Areas)
  expect(builder.colors).toEqual(common.Colors)
})

test('get nodes in builder', () => {
  const builder = getNodeBuilder()
  const nodes = builder.getNodes()
  nodes.forEach(element => {
    expect(element.x + element.radius).toBeLessThanOrEqual(957)
    expect(element.x - element.radius).toBeGreaterThanOrEqual(0)
    expect(element.y + element.radius).toBeLessThanOrEqual(319)
    expect(element.y - element.radius).toBeGreaterThanOrEqual(0)
  })
})

test('no Y builder', () => {
  const container = new containers.XYContainer('#bubble-chart', {}, common.document)
  const builder = new XNodeBuilder(common.Projection, container)
  const nodes = builder.getNodes()
  nodes.forEach(element => {
    expect(element.fx).toBe(element.x)
    expect(element.y).toBe(common.Rect.height / 2)
    expect(element.vy).toBe(1)
  })
  expect(builder.orderY()).toEqual([])
})

test('container update', () => {
  const container = new containers.XYContainer('#bubble-chart', {}, common.document)
  const xyBuilder = new XYNodeBuilder(common.Projection, container)
  const updatedXYBuilder = xyBuilder.updateContainer(container)
  expect(updatedXYBuilder).toBeInstanceOf(XYNodeBuilder)
  const xBuilder = new XNodeBuilder(common.Projection, container)
  const updatedXBuilder = xBuilder.updateContainer(container)
  expect(updatedXBuilder).toBeInstanceOf(XNodeBuilder)
})

test('container type changes', () => {
  const container = new containers.XYContainer('#bubble-chart', {}, common.document)
  const xBuilder = new XNodeBuilder(common.Projection, container)
  const xContainer = xBuilder.getContainer()
  expect(xContainer).toBeInstanceOf(containers.XContainer)
  const xyBuilder = new XYNodeBuilder(common.Projection, xContainer)
  const xyContainer = xyBuilder.getContainer()
  expect(xyContainer).toBeInstanceOf(containers.XYContainer)
})

test('x order', () => {
  const builder = getNodeBuilder()
  let xOrder = builder.orderX()
  expect(xOrder).toEqual([0, 2, 1])
})

test('y order', () => {
  const builder = getNodeBuilder()
  let yOrder = builder.orderY()
  expect(yOrder).toEqual([2, 1, 0])
})

test('XY container', () => {
  const builder = getNodeBuilder()
  const updatedBuilder = builder.updateContainer(builder.getContainer())
  expect(updatedBuilder).toBeInstanceOf(XYNodeBuilder)
})

test('get container', () => {
  const builder = getNodeBuilder()
  const container = builder.getContainer()
  expect(container).toBeInstanceOf(containers.XYContainer)
})

test('initial position are identical', () => {
  const builder0 = getNodeBuilder()
  const builder1 = getNodeBuilder()
  builder1.colors[0] = 'rgb(0, 0, 0)'
  expect(builder0.samePosition(builder1)).toBe(true)
  expect(builder1.samePosition(builder0)).toBe(true)
  builder1.x[0] = 333
  expect(builder0.samePosition(builder1)).toBe(false)
  expect(builder1.samePosition(builder0)).toBe(false)
})

test('update colors', () => {
  const black = 'rgb(0, 0, 0)'
  const builder0 = getNodeBuilder()
  const builder1 = getNodeBuilder()
  builder1.getNodes()[0].color = black
  const builder2 = builder0.updateColors(builder1)
  expect(builder2.nodes[0].color).toBe(black)
})

function getNodeBuilder () {
  const container = new containers.XYContainer('#bubble-chart', {}, common.document)
  return new XYNodeBuilder(common.Projection, container)
}
