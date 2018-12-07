const Container = require('./Container').default
const common = require('./common-test')

test('no dom', () => {
  expect(() => new Container('#bubble-chart')).toThrow(TypeError)
})

test('container provide scale functions', () => {
  const container = getContainer()
  const scales = container.getScales(common.X, common.Y, common.Areas, common.Colors)
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
  const sel = container.selectChart('.selectme').node()
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

test('chart interface', () => {
  const container = getContainer().asChartContainer()
  container.selectChart('svg')
  container.boundX({ x: 1, radius: 1 })
  container.boundY({ y: 1, radius: 1 })
})

test('axis interface', () => {
  const container = getContainer().asAxisContainer()
  container.selectXAxis('svg')
  container.selectYAxis('svg')
})

test('tooltip interface', () => {
  const container = getContainer().asToolTipContainer()
  container.onMouse((info, x, y) => {}, (info) => {})
  container.boundX({ x: 1, radius: 1 })
  container.boundY({ y: 1, radius: 1 })
})

test('copy container', () => {
  const container = getContainer()
  const other = new Container(container)
  expect(other._containerElement).toBe(container._containerElement)
})

test('unable to build container', () => {
  expect(() => new Container()).toThrow(TypeError)
})

function getContainer () {
  return new Container('#bubble-chart', {}, common.document, common.Rect)
}
