const {optimizeLayout} = require('./optimize')
const {getXNodeBuilder, getXYNodeBuilder} = require('./NodeBuilder.test')

test('X placement optimization', () => {
  var builder = getXNodeBuilder()
  const nodes = builder.getNodes()
  const memento = nodes.map(o => Object.assign({}, o))
  optimizeLayout(nodes, builder.getContainer())
  const getY = (n) => Math.floor(n.y)
  expect(nodes.map(getY)).not.toEqual(memento.map(getY))
})

test('XY placement optimization', () => {
  var builder = getXYNodeBuilder()
  const nodes = builder.getNodes()
  const memento = nodes.map(o => Object.assign({}, o))
  optimizeLayout(nodes, builder.getContainer())
  const getXY = (n) => [Math.floor(n.x), Math.floor(n.y)]
  expect(nodes.map(getXY)).not.toEqual(memento.map(getXY))
})
