const NodeBuilder = require('./NodeBuilder').default
const ScaleHelper = require('./ScaleHelper').default

const X = [3, 12, 7]
const Y = [14, 12, 9]
const Areas = [16, 49, 25]
const Colors = [3, 8, 12]
const Rect = { width: 957, height: 319 }
const Projection = [
  [3, 14, 3, 16],
  [12, 12, 8, 49],
  [7, 9, 12, 25]
]

test('unzip data', () => {
  const builder = getNodeBuilder()
  expect(builder.x).toEqual(X)
  expect(builder.y).toEqual(Y)
  expect(builder.areas).toEqual(Areas)
  expect(builder.colors).toEqual(Colors)
})

test('get nodes in container', () => {
  const builder = getNodeBuilder()
  const fakeContainer = { getScales: () => new ScaleHelper(Rect).generate(X, Y, Areas, Colors) }
  const nodes = builder.getNodes(fakeContainer)
  nodes.forEach(element => {
    expect(element.x + element.radius).toBeLessThanOrEqual(957)
    expect(element.x - element.radius).toBeGreaterThanOrEqual(0)
    expect(element.y + element.radius).toBeLessThanOrEqual(319)
    expect(element.y - element.radius).toBeGreaterThanOrEqual(0)
  })
})

function getNodeBuilder () {
  return new NodeBuilder(Projection)
}
