const { XYNodeBuilder } = require('./NodeBuilder')
const containers = require('./Container')
const common = require('./common-test')

export function update (render, projection, ...params) {
  const container = new containers.XYContainer('#bubble-chart', {}, common.document)
  return {
    nodes: new XYNodeBuilder(projection, container).getNodes(),
    updated: doUpdate(render, projection, container, ...params)
  }
}

function doUpdate (render, projection, container, ...params) {
  const xyNodeBuilder = new XYNodeBuilder(projection, container)
  if (typeof render.updateBuilder === 'function') {
    return render.updateBuilder(xyNodeBuilder)
  } else {
    return render.update(xyNodeBuilder, container, ...params)
  }
}
