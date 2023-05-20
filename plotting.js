import {
    select,
    csv,
    scaleLinear,
    extent,
    axisLeft,
    axisBottom
} from 'https://cdn.skypack.dev/d3@5.16.0';

export const parityPlot = (selection, props) => {
    const {
        xValue,
        yValue,
        circleRadius,
        margin,
        width,
        height,
        dataC,
        dataCH
    } = props;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const dataCValues = dataC ? dataC.map(d => [xValue(d), yValue(d)]) : [];
    const dataCHValues = dataCH ? dataCH.map(d => [xValue(d), yValue(d)]) : [];
    const allValues = dataCValues.concat(dataCHValues).flat();
    const extentAll = extent(allValues);

    const xScale = scaleLinear()
        .domain(extentAll)
        .range([0, innerWidth])
        .nice();

    const yScale = scaleLinear()
        .domain(extentAll)
        .range([innerHeight, 0])
        .nice();


    const g = selection.selectAll('.container').data([null]);
    const gEnter = g
        .enter().append('g')
        .attr("class", "container");
    gEnter.merge(g)
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xAxis = axisBottom(xScale)
        .tickValues(xScale.ticks().filter((_, i) => i % 2 === 0))
        .tickSize(-innerHeight)
        .tickPadding(15);

    const yAxis = axisLeft(yScale)
        .tickValues(yScale.ticks().filter((_, i) => i % 2 === 0))
        .tickSize(-innerWidth)
        .tickPadding(10);

    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
        .append('g')
        .attr("class", "y-axis");
    yAxisG
        .merge(yAxisGEnter)
        .call(yAxis)
        .selectAll('.domain').remove();

    const xAxisG = g.select('.x-axis');
    const xAxisGEnter = gEnter
        .append('g')
        .attr("class", "x-axis");
    xAxisG
        .merge(xAxisGEnter)
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('.domain').remove();


    var circlesC = g.merge(gEnter)
        .selectAll('.circle-c')
        .data(dataC || [], d => d.id);

    circlesC.exit().remove();

    if (dataC != null) {
        circlesC = g.merge(gEnter)
            .selectAll('.circle-c')
            .data(dataC);

        circlesC.enter().append('circle')
            .attr('class', 'circle-c')
            .merge(circlesC)
            .attr('cy', d => yScale(yValue(d)))
            .attr('cx', d => xScale(xValue(d)))
            .attr('r', circleRadius)
            .attr("fill", d => d.set === "train" ? "#a4a2a8" : "#009fff")
            .attr("opacity", 0.4);
    };

    var circlesCH = g.merge(gEnter)
        .selectAll('.circle-ch')
        .data(dataCH || [], d => d.id);

    circlesCH.exit().remove();

    if (dataCH != null) {
        circlesCH = g.merge(gEnter)
            .selectAll('.circle-ch')
            .data(dataCH);

        circlesCH.enter().append('circle')
            .attr('class', 'circle-ch')
            .merge(circlesCH)
            .attr('cy', d => yScale(yValue(d)))
            .attr('cx', d => xScale(xValue(d)))
            .attr('r', circleRadius)
            .attr("fill", d => d.set === "train" ? "#2e2b28" : "#0000b3")
            .attr("opacity", 0.4);
    }

    gEnter.append('line')
        .attr('class', 'parity-line')
        .attr('stroke', 'dimgray')
        .attr('stroke-dasharray', '5 5')
        .attr('x1', xScale.range()[0])
        .attr('y1', yScale.range()[0])
        .attr('x2', xScale.range()[1])
        .attr('y2', yScale.range()[1]);


    // Legend
    // const legendData = [
    //     { set: 'train', type: 'C', color: '#a4a2a8' },
    //     { set: 'train', type: 'CH', color: '#2e2b28' },
    //     { set: 'test', type: 'C', color: '#009fff' },
    //     { set: 'test', type: 'CH', color: '#0000b3' },
    // ];

    // const legend = selection
    //     .selectAll('.legend')
    //     .data([null])
    //     .enter()
    //     .append('g')
    //     .attr('class', 'legend')
    //     .attr('transform', `translate(${margin.left},${margin.top})`);

    // const legendCircles = legend
    //     .selectAll('.legend-circle')
    //     .data(legendData)
    //     .enter()
    //     .append('circle')
    //     .attr('class', 'legend-circle')
    //     .attr('cx', (d, i) => i % 2 ? innerWidth - circleRadius : 0)
    //     .attr('cy', (d, i) => {
    //         const column = Math.floor(i / 2);
    //         const row = i % 2;
    //         return (row === 0 ? 2 : 4) * circleRadius + column * 3 * circleRadius;
    //     })
    //     .attr('r', 14)
    //     .attr('fill', d => d.color)
    //     .attr('opacity', 0.7);

    // const legendLabels = legend
    //     .selectAll('.legend-label')
    //     .data(legendData)
    //     .enter()
    //     .append('text')
    //     .attr('class', 'legend-label')
    //     .attr('x', (d, i) => {
    //         const isTest = d.set === 'test';
    //         const xOffset = isTest ? 4 * circleRadius : 0;
    //         const column = Math.floor(i / 2);
    //         const row = i % 2;
    //         const yOffset = (row === 0 ? 2 : 4) * circleRadius + column * 3 * circleRadius;
    //         return isTest ? innerWidth - xOffset : xOffset;
    //     })
    //     .attr('y', (d, i) => {
    //         const column = Math.floor(i / 2);
    //         const row = i % 2;
    //         const yOffset = (row === 0 ? 2 : 4) * circleRadius + column * 3 * circleRadius;
    //         return yOffset;
    //     })
    //     .attr('text-anchor', (d, i) => i % 2 ? 'end' : 'start')
    //     .attr('alignment-baseline', 'middle')
    //     .text(d => d.type)
    //     .attr('font-size', '24px');

    // const legendTitles = legend
    //     .selectAll('.legend-title')
    //     .data([{ set: 'train' }, { set: 'test' }])
    //     .enter()
    //     .append('text')
    //     .attr('class', 'legend-title')
    //     .attr('x', (d, i) => i === 0 ? -2 * circleRadius : innerWidth + 2 * circleRadius)
    //     .attr('y', 0)
    //     .attr('text-anchor', 'middle')
    //     .attr('alignment-baseline', 'middle')
    //     .text(d => d.set)
    //     .attr('font-size', '20px');

};


// Bar plot function
export const barPlot = (selection, props) => {
    const {
        data,
        width,
        height,
        margin,
    } = props;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Extract unique responses and features from the data
    const responses = Array.from(new Set(data.map(d => d.response)));

    // Define x and y scales
    const xScale = d3
        .scaleBand()
        .domain(responses)
        .range([0, innerWidth])
        .padding(0.1);

    const yScale = d3
        .scaleLinear()
        .domain([d3.min(data, d => d['R^2']), d3.max(data, d => d['R^2'])])
        .range([innerHeight, 0]);

    const nestedData = d3.nest()
        .key(d => d.response)
        .key(d => d.feature)
        .key(d => d.set)
        .rollup(group => d3.mean(group, d => d['R^2']))
        .entries(data);

    selection.selectAll('*').remove();

    const svg = selection.append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const gEnter = g.enter().append('g')
        .attr('class', 'container');
    gEnter.merge(g)
        .attr('transform', `translate(${margin.left},${margin.top})`);


    const bars = g.selectAll(".bar")
        .data(nestedData)
        .enter()
        .append("g")
        .attr("class", "bar");


    bars.exit().remove();

    bars.each(function (response) {
        // Get features from response dictionary
        const features = response.values;

        // Iterate over features in pairs
        for (let i = 0; i < features.length - 1; i += 2) {
            const feature1 = features[i];
            const feature2 = features[i + 1];

            // Get sets from feature dictionaries
            const topo_sets = feature1.values;
            const spatial_sets = feature2.values;

            // Get values from sets dictionaries
            const topo_test_value = topo_sets[0].value;
            const topo_train_value = topo_sets[1].value;

            const spatial_test_value = spatial_sets[0].value;
            const spatial_train_value = spatial_sets[1].value;


            // Graph the bars using the values
            const x1 = xScale(response.key) + xScale.bandwidth() * i / 2;
            const x2 = xScale(response.key) + xScale.bandwidth() * (i + 1) / 2;

            // Plot the training bars
            const topo_train = yScale(topo_train_value);
            const spatial_train = yScale(spatial_train_value);
            const height1 = innerHeight - topo_train;
            const height2 = innerHeight - spatial_train;

            d3.select(this)
                .append("rect")
                .attr("class", "train-bar")
                .attr("x", x1)
                .attr("y", topo_train)
                .attr("width", xScale.bandwidth() / 2)
                .attr("height", height1)
                .attr("fill", "steelblue");

            d3.select(this)
                .append("rect")
                .attr("class", "train-bar")
                .attr("x", x2)
                .attr("y", spatial_train)
                .attr("width", xScale.bandwidth() / 2)
                .attr("height", height2)
                .attr("fill", "orange");

            // Plot the test R^2 values on top of the bars
            const topo_test = yScale(topo_test_value);
            const spatial_test = yScale(spatial_test_value);
            const height3 = innerHeight - topo_test;
            const height4 = innerHeight - spatial_test;

            d3.select(this)
                .append("rect")
                .attr("class", "test-r2")
                .attr("x", x1)
                .attr("y", topo_test)
                .attr("width", xScale.bandwidth() / 2)
                .attr("height", height3)
                .attr("fill", "rgba(0, 0, 0, 0.5)");

            d3.select(this)
                .append("rect")
                .attr("class", "test-r2")
                .attr("x", x2)
                .attr("y", spatial_test)
                .attr("width", xScale.bandwidth() / 2)
                .attr("height", height4)
                .attr("fill", "rgba(0, 0, 0, 0.5)");
        }
    });

    g.select('.x-axis').remove();
    g.select('.y-axis').remove();

    const xAxis = d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickPadding(15);

    const yAxis = d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickPadding(10);

    g.append('g')
        .attr("class", "x-axis")
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('.domain').remove();

    g.append('g')
        .attr("class", "y-axis")
        .call(yAxis)
        .selectAll('.domain').remove();
};


export const quantityPlot = (selection, props) => {
    const {
        xValue,
        yValue,
        margin,
        width,
        height,
        data,
    } = props;

    const sortedData = data.sort((a, b) => xValue(a) - xValue(b));

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
        .domain(d3.extent(sortedData, xValue))
        .range([0, innerWidth])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(d3.extent(sortedData, yValue))
        .range([innerHeight, 0])
        .nice();

    const lineGenerator = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)));

    const nestedData = d3.nest()
        .key(d => d.context)
        .key(d => d.set)
        .entries(sortedData);

    const linesData = nestedData.flatMap(contextData =>
        contextData.values.flatMap(setData => {
            const key = `${contextData.key}-${setData.key}`;
            return {
                key,
                values: setData.values,
            };
        })
    );

    const g = selection.selectAll('.container').data([null]);
    const gEnter = g.enter().append('g')
        .attr('class', 'container');
    gEnter.merge(g)
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const lines = g.merge(gEnter)
        .selectAll('.line')
        .data(linesData, d => d.key);

    lines.exit().remove();

    lines.enter().append('path')
        .attr('class', 'line')
        .merge(lines)
        .attr('d', d => lineGenerator(d.values))
        .attr('fill', 'none')
        .attr('stroke', d => getColor(d.key))
        .attr('stroke-width', 3);


    const xAxis = axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickPadding(15);

    const yAxis = axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickPadding(10);

    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
        .append('g')
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(".1f"));
    yAxisG
        .merge(yAxisGEnter)
        .call(yAxis)
        .selectAll('.domain').remove();

    const xAxisG = g.select('.x-axis');
    const xAxisGEnter = gEnter
        .append('g')
        .attr("class", "x-axis");
    xAxisG
        .merge(xAxisGEnter)
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('.domain').remove();

};


export const temporalPlot = (selection, props) => {
    const {
        xValue,
        yValue,
        margin,
        width,
        height,
        data,
    } = props;

    const sortedData = data.sort((a, b) => xValue(a) - xValue(b));

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
        .domain(d3.extent(sortedData, xValue))
        .range([0, innerWidth])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(d3.extent(sortedData, yValue))
        .range([innerHeight, 0])
        .nice();

    const lineGenerator = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)));

    const nestedData = d3.nest()
        .key(d => d.context)
        .key(d => d.set)
        .entries(sortedData);

    const linesData = nestedData.flatMap(contextData =>
        contextData.values.flatMap(setData => {
            const key = `${contextData.key}-${setData.key}`;
            return {
                key,
                values: setData.values,
            };
        })
    );

    const g = selection.selectAll('.container').data([null]);
    const gEnter = g.enter().append('g')
        .attr('class', 'container');
    gEnter.merge(g)
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const lines = g.merge(gEnter)
        .selectAll('.line')
        .data(linesData, d => d.key);

    lines.exit().remove();

    lines.enter().append('path')
        .attr('class', 'line')
        .merge(lines)
        .attr('d', d => lineGenerator(d.values))
        .attr('fill', 'none')
        .attr('stroke', d => getColor(d.key))
        .attr('stroke-width', 3);


    const xAxis = axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickPadding(15);

    const yAxis = axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickPadding(10);

    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
        .append('g')
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(".1f"));
    yAxisG
        .merge(yAxisGEnter)
        .call(yAxis)
        .selectAll('.domain').remove();

    const xAxisG = g.select('.x-axis');
    const xAxisGEnter = gEnter
        .append('g')
        .attr("class", "x-axis");
    xAxisG
        .merge(xAxisGEnter)
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('.domain').remove();

};

const getColor = key => {
    const colorMap = {
        'C-TEST': '#009fff',
        'C-TRAIN': '#a4a2a8',
        'CH-TEST': '#0000b3',
        'CH-TRAIN': '#2e2b28',
    };
    return colorMap[key] || 'black';
};