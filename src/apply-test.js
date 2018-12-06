const NodeBuilder = require('./NodeBuilder').default

export function apply (render, projection) {
  const builder = new NodeBuilder(projection, render.container)
  render.apply(builder)
  return builder.getNodes()
}
