export function _makeToolTip (container, marginLeft) {
  return _setupTooltip(container.append('p'), marginLeft)
}

export function _setupTooltip (tooltip, marginLeft) {
  return tooltip
    .classed('info', true)
    .style('position', 'absolute')
    .style('width', '1em')
    .style('padding-left', marginLeft)
    .style('margin-bottom', '2em')
    .style('z-index', '100')
    .style('pointer-events', 'none')
}

export function _makeChart (container, left) {
  let chart = _setupChart(container.append('div'), left)
  chart.append('svg')
    .classed('chart', true)
    .style('position', 'absolute')
    .style('top', '0')
    .style('left', '0')
    .style('height', '100%')
    .style('width', '100%')
  return chart
}

export function _setupChart (chart, left) {
  return chart
    .classed('chart', true)
    .style('position', 'absolute')
    .style('top', '0')
    .style('bottom', '2em')
    .style('left', left)
    .style('right', '0')
}

export function _makeXAxis (container, left) {
  let xAxis = _setupXAxis(container.append('div'), left)
  xAxis.append('svg')
    .classed('x-axis', true)
    .style('position', 'absolute')
    .style('top', '0')
    .style('left', '0')
    .style('height', '100%')
    .style('width', '100%')
  return xAxis
}

export function _setupXAxis (xAxis, left) {
  return xAxis
    .classed('x-axis', true)
    .style('position', 'absolute')
    .style('height', '2em')
    .style('bottom', '0')
    .style('left', left)
    .style('right', '0')
}

export function _makeYAxis (container, width) {
  let yAxis = _setupYAxis(container.append('div'), width)
  yAxis.append('svg')
    .classed('y-axis', true)
    .style('position', 'absolute')
    .style('top', '0')
    .style('left', '0')
    .style('height', '100%')
    .style('width', '100%')
  return yAxis
}

export function _setupYAxis (yAxis, width) {
  return yAxis
    .classed('y-axis', true)
    .style('position', 'absolute')
    .style('top', '0')
    .style('bottom', '2em')
    .style('left', '0')
    .style('width', width)
}
