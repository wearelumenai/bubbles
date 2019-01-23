const { XYNodeBuilder } = require('./NodeBuilder')
const containers = require('./Container')
const common = require('./common-test')

export function update (render, projection, ...params) {
  const container = new containers.XYContainer('#bubble-chart', {}, common.document)
  return {
    nodes: new XYNodeBuilder(projection, container).getNodes(),
    updated: render.update(new XYNodeBuilder(projection, container), container, ...params)
  }
}
