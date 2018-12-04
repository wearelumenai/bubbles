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
  const container = getContainer()
  const scales = container.getScales(X, Y, Areas, Colors)
  expect(typeof scales.radiusScale === 'function').toBe(true)
  expect(typeof scales.xScale === 'function').toBe(true)
  expect(typeof scales.yScale === 'function').toBe(true)
  expect(typeof scales.colorScale === 'function').toBe(true)
})

test('container has relative position', () => {
  const container = getContainer()
  expect(container._containerElement.style('position')).toBe('relative')
})

test('container element has svg components', () => {
  const container = getContainer()
  const chartElement = container._containerElement.select('.chart')
  expect(chartElement.node().tagName.toLowerCase()).toBe('svg')
  const xAxisElement = container._containerElement.select('.x-axis')
  expect(xAxisElement.node().tagName.toLowerCase()).toBe('svg')
  const yAxisElement = container._containerElement.select('.y-axis')
  expect(yAxisElement.node().tagName.toLowerCase()).toBe('svg')
})

test('container element has p', () => {
  const container = getContainer()
  const element = container._containerElement.select('.info')
  expect(element.empty()).toBe(false)
  expect(element.node().tagName.toLowerCase()).toBe('p')
})

test('container element is svg', () => {
  const container = getContainer()
  const element = container._containerElement
  expect(element.node().tagName).toBe('DIV')
})

test('container element is svg', () => {
  const container = getContainer()
  const element = container._containerElement
  expect(element.node().tagName).toBe('DIV')
})

test('select sub elements', () => {
  const container = getContainer()
  const element = container._containerElement
  const rect = element.append('rect').attr('class', 'selectme').node()
  const sel = element.selectAll('.selectme').node()
  expect(rect).toEqual(sel)
})

test('select element in svg', () => {
  const container = getContainer()
  const element = container._containerElement.select('svg')
  const rect = element.append('rect').attr('class', 'selectme').node()
  const sel = container.selectSVG('.selectme').node()
  expect(rect).toEqual(sel)
})

test('x in bound, circle case', () => {
  const container = getContainer()
  const xLowered = container.boundX({ radius: 57, x: 920 })
  expect(xLowered).toBe(900)
  const xRaised = container.boundX({ radius: 57, x: 20 })
  expect(xRaised).toBe(57)
  const xUnchanged = container.boundX({ radius: 57, x: 880 })
  expect(xUnchanged).toBe(880)
})

test('x in bound, rectangle case', () => {
  const container = getContainer()
  const xLowered = container.boundX({ width: 57, left: 920 })
  expect(xLowered).toBe(900)
  const xNotRaised = container.boundX({ width: 57, left: 20 })
  expect(xNotRaised).toBe(20)
  const xUnchanged = container.boundX({ width: 57, left: 880 })
  expect(xUnchanged).toBe(880)
})

test('y in bound when, circle case', () => {
  const container = getContainer()
  const yLowered = container.boundY({ radius: 19, y: 305 })
  expect(yLowered).toBe(300)
  const yRaised = container.boundY({ radius: 19, y: 5 })
  expect(yRaised).toBe(19)
  const yUnchanged = container.boundY({ radius: 19, y: 280 })
  expect(yUnchanged).toBe(280)
})

test('y in bound when, rectangle case', () => {
  const container = getContainer()
  const yLowered = container.boundY({ height: 19, top: 305 })
  expect(yLowered).toBe(300)
  const yNotRaised = container.boundY({ height: 19, top: 5 })
  expect(yNotRaised).toBe(5)
  const yUnchanged = container.boundY({ height: 19, top: 280 })
  expect(yUnchanged).toBe(280)
})

test('unknown bound', () => {
  const container = getContainer()
  expect(() => container.boundX({ unboundable: true })).toThrow(TypeError)
  expect(() => container.boundY({ unboundable: true })).toThrow(TypeError)
})

test('check mouse events', done => {
  const container = getContainer()
  let mouseMoved = false
  let mouseOut = false
  container.onMouse((info, x, y) => {
    mouseMoved = true
  }, () => {
    mouseOut = true
  })
  container._chartElement.dispatch('mousemove')
  container._chartElement.dispatch('mouseout')
  done()
  expect(mouseMoved).toBe(true)
  expect(mouseOut).toBe(true)
})

test('check listeners', done => {
  const container = getContainer()
  container._applyListeners()
  let clicked = false
  const listeners = {
    click: () => {
      clicked = true
    }
  }
  container._applyListeners(listeners)
  container._chartElement.dispatch('click')
  done()
  expect(clicked).toBe(true)
})

function getContainer () {
  const document = new jsdom.JSDOM('<body><div id="bubble-chart"></div></body>').window.document
  const container = new Container('#bubble-chart', {}, document)
  // Tweak because JSDOM do not implement getClientBoundingRect
  container._chartBoundingRect = Rect
  container.scaleHelper = new ScaleHelper(Rect)
  return container
}
