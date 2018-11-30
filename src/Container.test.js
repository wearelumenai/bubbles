const jsdom = require('jsdom')
const Container = require('./Container').default
const ScaleHelper = require('./ScaleHelper').default

const X = [3, 12, 7]
const Y = [14, 12, 9]
const Areas = [16, 49, 25]
const Colors = [3, 8, 12]
const Rect = { width: 957, height: 319 }

test('no dom', () => {
  expect(() => new Container('#bubble-chart')).toThrow(TypeError)
})

test('container provide scale functions', () => {
  let container = getContainer()
  let scales = container.getScales(X, Y, Areas, Colors)
  expect(typeof scales.radiusScale === 'function').toBe(true)
  expect(typeof scales.xScale === 'function').toBe(true)
  expect(typeof scales.yScale === 'function').toBe(true)
  expect(typeof scales.colorScale === 'function').toBe(true)
})

test('container element is svg', () => {
  let container = getContainer()
  let element = container.containerElement
  expect(element.node().tagName).toBe('svg')
})

test('select sub elements', () => {
  let container = getContainer()
  let element = container.containerElement
  let rect = element.append('rect').attr('class', 'selectme').node()
  let sel = container.selectAll('.selectme').node()
  expect(rect).toEqual(sel)
})

test('x in bound', () => {
  let container = getContainer()
  let xLowered = container.boundX({ radius: 57, x: 920 })
  expect(xLowered).toBe(900)
  let xRaised = container.boundX({ radius: 57, x: 20 })
  expect(xRaised).toBe(57)
  let xUnchanged = container.boundX({ radius: 57, x: 880 })
  expect(xUnchanged).toBe(880)
})

test('y in bound', () => {
  let container = getContainer()
  let yLowered = container.boundY({ radius: 19, y: 305 })
  expect(yLowered).toBe(300)
  let yRaised = container.boundY({ radius: 19, y: 5 })
  expect(yRaised).toBe(19)
  let yUnchanged = container.boundY({ radius: 19, y: 280 })
  expect(yUnchanged).toBe(280)
})

function getContainer () {
  let document = new jsdom.JSDOM('<body><div id="bubble-chart"></div></body>').window.document
  let container = new Container('#bubble-chart', document)
  // Tweak because JSDOM do not implement getClientBoundingRect
  container.boundingClientRect = Rect
  container.scaleHelper = new ScaleHelper(Rect)
  return container
}
