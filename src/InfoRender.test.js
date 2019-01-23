const containers = require('./Container')
const { CircleRender } = require('./CircleRender')
const { InfoRender } = require('./InfoRender')
const common = require('./common-test')
const update = require('./apply-test').update

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
  const { x, y } = common.getXYBetween(infoRender.clusters[2], infoRender.clusters[0])
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
  const container = new containers.XYContainer('#bubble-chart', {}, common.document)
  const circleRender = new CircleRender(container)
  const infoRender = new InfoRender(container, circleRender)
  const circleStart = update(circleRender, common.makeOverlap())
  return update(infoRender, common.makeOverlap(), circleStart.updated).updated
}
