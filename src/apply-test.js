const { XYNodeBuilder } = require('./NodeBuilder')

export function apply (render, projection) {
  const container = render.container || render.getContainer()
  const builder = new XYNodeBuilder(projection, container)
  render._apply(builder)
  return new XYNodeBuilder(projection, container).getNodes()
}
