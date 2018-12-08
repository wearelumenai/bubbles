const { XYNodeBuilder } = require('./NodeBuilder')

export function apply (render, projection) {
  const container = render.container || render.getContainer()
  const builder = new XYNodeBuilder(projection, container)
  const updatedChart = render.apply(builder)
  const nodes = new XYNodeBuilder(projection, container).getNodes()
  return { updatedChart, nodes }
}
