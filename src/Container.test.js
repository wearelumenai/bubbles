const containers = require('./Container')
const common = require('./common-test')

test('no dom', () => {
  expect(() => new containers.XYContainer('#bubble-chart')).toThrow(TypeError)
})

test('container provide scale functions', () => {
  const container = getContainer()
  const scales = container.getScales(common.X, common.Y, common.Areas, common.Colors)
  expect(typeof scales.radiusScale === 'function').toBe(true)
  expect(typeof scales.xScale === 'function').toBe(true)
  expect(typeof scales.yScale === 'function').toBe(true)
  expect(typeof scales.colorScale === 'function').toBe(true)
})

test('container shape', () => {
  const container = getContainer()
  expect(container.getShape()).toEqual(common.Rect)
})
test('container has relative position', () => {
  const container = getContainer()
  expect(container._containerElement.style('position')).toBe('relative')
})

test('container element has svg components', () => {
  const container = getContainer()
  const chartElement = container._containerElement.select('svg.chart')
  expect(chartElement.size()).toBeGreaterThan(0)
  const xAxisElement = container._containerElement.select('svg.x-axis')
  expect(xAxisElement.size()).toBeGreaterThan(0)
  const yAxisElement = container._containerElement.select('svg.y-axis')
  expect(yAxisElement.size()).toBeGreaterThan(0)
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
  const rect = element.append('rect').classed('selectme', true).node()
  const sel = element.selectAll('.selectme').node()
  expect(rect).toEqual(sel)
})

test('select element in svg', () => {
  const container = getContainer()
  const element = container._containerElement.select('svg')
  const rect = element.append('rect').classed('selectme', true).node()
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
  container.onMouse(
    () => {
      mouseMoved = true
    },
    () => {
      mouseOut = true
    }
  )
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
  container.onMouse((info, x, y) => {
  }, (info) => {
  })
  container.boundX({ x: 1, radius: 1 })
  container.boundY({ y: 1, radius: 1 })
})

test('copy container in XYContainer', () => {
  const container = getContainer()
  const other = new containers.XYContainer(container)
  expect(other._containerElement).toBe(container._containerElement)
  expect(parseInt(other._yAxisElement.style('width'))).toBeGreaterThan(0)
  expect(parseInt(other._chartElement.style('left'))).toBeGreaterThan(0)
  expect(parseInt(other._xAxisElement.style('left'))).toBeGreaterThan(0)
})

test('copy container in XContainer', () => {
  const container = getContainer()
  const other = new containers.XContainer(container)
  expect(other._containerElement).toBe(container._containerElement)
  expect(parseInt(other._yAxisElement.style('width'))).toBe(0)
  expect(parseInt(other._chartElement.style('left'))).toBe(0)
  expect(parseInt(other._xAxisElement.style('left'))).toBe(0)
})

test('unable to build container', () => {
  expect(() => new containers.XYContainer()).toThrow(TypeError)
})

test('same containers', () => {
  const container0 = getContainer()
  const container1 = getContainer()
  expect(container0.same(container1)).toBe(true)
})

function getContainer () {
  return new containers.XYContainer('#bubble-chart', {}, common.document)
}
