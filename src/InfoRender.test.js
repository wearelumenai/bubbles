const Container = require('./Container').default
const CircleRender = require('./CircleRender').default
const InfoRender = require('./InfoRender').default
const NodeBuilder = require('./NodeBuilder').default
const common = require('./common-test')

test('display infos', () => {
  const infoRender = getInfoRender()
  const infoElement = infoRender.container._infoElement
  const { x, y } = common.getXYBetween(infoRender.clusters[2], infoRender.clusters[1])
  infoRender._displayInfo(infoElement, x, y)
  expect(infoElement.empty()).toBe(false)
  expect(infoElement.style('display')).toBe('block')
})

test('hide info when no cluster', () => {
  const infoRender = getInfoRender()
  const infoElement = infoRender.container._infoElement
  const { x, y } = common.getXYBetween(infoRender.clusters[0], infoRender.clusters[2])
  infoRender._displayInfo(infoElement, x, y)
  expect(infoElement.empty()).toBe(false)
  expect(infoElement.style('display')).toBe('none')
})

test('display infos on mouse move', done => {
  const infoRender = getInfoRender()
  const { x, y } = common.getXYBetween(infoRender.clusters[2], infoRender.clusters[1])
  infoRender.container.getMousePosition = () => [x, y]
  infoRender.container._chartElement.dispatch('mousemove')
  done()
  const infoElement = infoRender.container._infoElement
  expect(infoElement.style('display')).toBe('block')
})

test('hide infos on mouse out', done => {
  const infoRender = getInfoRender()
  infoRender.container._chartElement.dispatch('mouseout')
  done()
  const infoElement = infoRender.container._infoElement
  expect(infoElement.style('display')).toBe('none')
})

function getInfoRender () {
  const container = new Container('#bubble-chart', {}, common.document, common.Rect)
  const circleRender = new CircleRender(container)
  const infoRender = new InfoRender(container, circleRender)
  const builder = new NodeBuilder(common.makeOverlap(), container)
  circleRender.apply(builder)
  infoRender.apply(builder)
  return infoRender
}
