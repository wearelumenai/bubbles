const { XYNodeBuilder, XNodeBuilder } = require('./NodeBuilder')
const Container = require('./Container').default
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
  const container = new Container('#bubble-chart', {}, common.document, common.Rect)
  const builder = new XNodeBuilder(common.Projection, container)
  const nodes = builder.getNodes()
  nodes.forEach(element => {
    expect(element.fx).toBe(element.x)
    expect(element.y).toBe(common.Rect.height / 2)
    expect(element.vy).toBe(1)
  })
  expect(builder.orderY()).toEqual([])
  const { updatedBuilder } = builder.updateContainer(container)
  expect(updatedBuilder).toBeInstanceOf(XNodeBuilder)
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

test('update container', () => {
  const builder = getNodeBuilder()
  const { updatedBuilder } = builder.updateContainer(builder.container)
  expect(updatedBuilder).toBeInstanceOf(XYNodeBuilder)
})

function getNodeBuilder () {
  const container = new Container('#bubble-chart', {}, common.document, common.Rect)
  return new XYNodeBuilder(common.Projection, container)
}
