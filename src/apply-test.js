const { XYNodeBuilder } = require('./NodeBuilder')

export function update (render, projection, ...params) {
  const container = render.container || render.getContainer()
  return {
    nodes: new XYNodeBuilder(projection, container).getNodes(),
    updated: render.update(new XYNodeBuilder(projection, container), container, ...params)
  }
}
