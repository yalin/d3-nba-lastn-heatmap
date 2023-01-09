// heatmap d3 chart

const width = 900
const height = 500
const margin = {
  top: 40,
  right: 20,
  bottom: 30,
  left: 40
} // margin of chart

const cellsize = 20
const tooltipmargin = 80

const chart = d3.select('#heatmap')
const svg = chart.append('svg')
svg.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
svg.attr('width', width).attr('height', height)

const xg = svg.append('g').attr('class', 'xaxis') // x axis group
const yg = svg.append('g').attr('class', 'yaxis') // y axis group
const ig = svg.append('g').attr('class', 'itemgroup') // heatmap square group

const xband = d3.scaleBand()
const yband = d3.scaleBand()
const colorFn = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 100]) // 0 - 100 because I used ratio values for colors

const tooltip = chart
  .append('div')
  .style('position', 'absolute')
  .style('background-color', 'white')
  .style('border', 'solid')
  .style('border-width', '2px')
  .style('border-radius', '5px')
  .style('padding', '5px')
  .style('visibility', 'hidden')

d3.json('../data/x_date_most_n.json').then(data => {
  // x axis
  var xValues = _.uniq(
    _.orderBy(
      _.map(data, x => x['date']),
      x => x
    )
  )

  xg.attr('transform', 'translate(10,20)')

  xg.selectAll('text')
    .data(xValues)
    .join('text')
    .text(d => d)
    .attr('x', (d, i) => (i + 1) * cellsize + margin.left)
    .attr('y', height / 2 + margin.top)

  xg.selectAll('text')
    .attr('text-anchor', 'end')
    .attr('transform', function (d, i) {
      var x = d3.select(this).attr('x')
      var y = d3.select(this).attr('y')
      return 'rotate(-90, ' + x + ', ' + y + ')'
    })

  xband.domain(xValues).range([0, xValues.length])

  // y axis
  var yValues = _.uniq(
    _.orderBy(
      _.map(data, x => x['lastn']),
      x => x
    )
  )
  yg.selectAll('text')
    .data(yValues)
    .join('text')
    .text(d => d)
    .attr('x', margin.left)
    .attr('y', (d, i) => height / 4 - margin.bottom + (i + 1) * cellsize)

  yband.domain(yValues).range([0, yValues.length])

  // squares - items
  var items = ig
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('width', cellsize - 1)
    .attr('height', cellsize - 1)
    .style('stroke-width', 4)
    .style('stroke', 'none')
    .attr('rx', 4)
    .attr('ry', 4)
    .style('fill', (d, i) => {
      return colorFn(d.game_ratio)
    })
    .attr('x', (d, i) => {
      return margin.left * 1.5 + xband(d.date) * cellsize
    })
    .attr('y', (d, i) => {
      return height * 0.5 - margin.top + yband(d.lastn) * cellsize
    })
    .attr('transform', 'translate(0,-110)')

  items
    .on('mouseenter', function (e, val) {
      d3.select(e.target).style('stroke', 'black')
      tooltip.style('visibility', 'visible')
    })
    .on('mouseleave', function (e, val) {
      d3.select(e.target).style('stroke', 'none')
      tooltip.style('visibility', 'hidden')
    })
    .on('mousemove', function (e, val) {
      tooltip
        .html(
          'Games: <b>' +
            val.game +
            '/' +
            val.total_game +
            '</b><br>' +
            'Pct: <b>' +
            val.game_ratio +
            '%</b>'
        )
        .style('left', e.layerX + 'px')
        .style('top', e.layerY + tooltipmargin + 'px')
    })
})
