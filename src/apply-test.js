const NodeBuilder = require('./NodeBuilder').default

export function apply (render, projection) {
  const container = render.container || render.getContainer()
  const builder = new NodeBuilder(projection, container)
  render.apply(builder)
  return new NodeBuilder(projection, container).getNodes()
}
