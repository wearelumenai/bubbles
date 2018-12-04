const jsdom = require('jsdom')
const ScaleHelper = require('./ScaleHelper').default
const NodeBuilder = require('./NodeBuilder').default
const bubbles = require('./Bubbles')

const Rect = { width: 957, height: 319 }
const Projection = [
  [3, 14, 3, 16],
  [12, 12, 8, 49],
  [7, 9, 12, 25]
]

test('display infos', () => {
  const infoRender = getInfoRender()
  const infoElement = infoRender.container._infoElement
  infoRender._displayInfo(infoElement, 800, 200)
  expect(infoElement.empty()).toBe(false)
  expect(infoElement.style('display')).toBe('block')
})

test('hide info when no cluster', () => {
  const infoRender = getInfoRender()
  const infoElement = infoRender.container._infoElement
  infoRender._displayInfo(infoElement, 150, 180)
  expect(infoElement.empty()).toBe(false)
  expect(infoElement.style('display')).toBe('none')
})

test('display infos on mouse move', done => {
  const infoRender = getInfoRender()
  infoRender.container.getMousePosition = () => [800, 200]
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

function makeOverlap () {
  const projectionWithOverlap = Projection.slice()
  projectionWithOverlap[1][1] = 10
  projectionWithOverlap[2][0] = 11
  return projectionWithOverlap
}

function getInfoRender () {
  const document = new jsdom.JSDOM('<body><div id="bubble-chart"></div></body>').window.document
  const bub = bubbles.create('#bubble-chart', {}, document)
  // Tweak because JSDOM do not implement getClientBoundingRect
  bub.container._chartBoundingRect = Rect
  bub.container.scaleHelper = new ScaleHelper(Rect)
  const projectionWithOverlap = makeOverlap()
  bub.clusters = new NodeBuilder(projectionWithOverlap).getNodes(bub.container)
  bub.infoRender.clusters = bub.clusters
  return bub.infoRender
}
