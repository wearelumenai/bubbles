import { AxisRender } from './AxisRender'
import { CircleRender } from './CircleRender'
import { LabelRender } from './LabelRender'
import { InfoRender } from './InfoRender'
import * as bubbles from './Bubbles'

const { XYNodeBuilder } = require('./NodeBuilder')
const containers = require('./Container')
const common = require('./common-test')

const container = new containers.XYContainer('#bubble-chart', {}, common.document)

export function update (render, projection, ...params) {
  return {
    nodes: new XYNodeBuilder(projection, container).getNodes(),
    updated: doUpdate(render, projection, ...params)
  }
}

function doUpdate (render, projection, ...params) {
  const builder = new XYNodeBuilder(projection, container)
  if (render instanceof AxisRender) {
    return new AxisRender(container, render.percentileFactory, builder)
  } else if (render instanceof CircleRender) {
    return new CircleRender(container, builder)
  } else if (render instanceof LabelRender) {
    return new LabelRender(container, params[0], builder)
  } else if (render instanceof InfoRender) {
    return new InfoRender(container, params[0], render.getInfoText, builder)
  } else {
    return bubbles.apply(render, builder)
  }
}
