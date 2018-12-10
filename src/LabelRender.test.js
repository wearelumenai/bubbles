const d3 = require('d3')
const containers = require('./Container')
const LabelRender = require('./LabelRender').default
const common = require('./common-test')
const update = require('./apply-test').update

test('draw clusters', () => {
  const labelRender = getLabelRender()
  const start = update(labelRender, common.Projection)
  start.updated.displayLabels()
  const labels = start.updated._getLabels()
  labels.each(function () {
    const label = d3.select(this)
    const i = common.parseLabel(label)
    expect(common.parseAttr(label, 'x')).toBe(start.nodes[i].x)
    expect(common.parseAttr(label, 'y')).toBe(start.nodes[i].y)
  })
})

test('move labels', done => {
  const labelRender = getLabelRender()
  const start = update(labelRender, common.Projection)
  start.updated.displayLabels()
  const moved = update(start.updated, common.makeScramble())
  moved.updated.moveLabels()
  setTimeout(() => {
    const circles = moved.updated._getLabels()
    circles.each(function () {
      const label = d3.select(this)
      const i = common.parseLabel(label)
      if (i !== 0) {
        expect(common.parseAttr(label, 'x')).not.toBe(start.nodes[i].x)
        expect(common.parseAttr(label, 'y')).not.toBe(start.nodes[i].y)
      }
    })
    done()
  }, 500)
})

function getLabelRender () {
  const container = new containers.XYContainer('#bubble-chart', {}, common.document)
  return new LabelRender(container)
}
