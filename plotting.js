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
        innerWidth,
        innerHeight,
        data,
        showXAxis,
        showYAxis,
    } = props;

    selection.selectAll('*').remove();

    const g = selection.selectAll('.container').data([null]);
    const gEnter = g
        .enter().append('g')
        .attr("class", "container");
    gEnter.merge(g)
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // get largest extend from both x and y values
    const extentX = d3.extent(data, d => parseFloat(xValue(d)));
    const extentY = d3.extent(data, d => parseFloat(yValue(d)));
    const extentXY = [Math.min(extentX[0], extentY[0]), Math.max(extentX[1], extentY[1])];

    const xScale = scaleLinear()
        .domain(extentXY)
        .range([0, innerWidth])
        .nice();

    const yScale = scaleLinear()
        .domain(extentXY)
        .range([innerHeight, 0])
        .nice();

    // Parity line
    gEnter.append('line')
        .attr('class', 'parity-line')
        .attr('stroke', 'gray')
        .attr('stroke-dasharray', '5 5')
        .attr('stroke-width', 5)
        .attr('x1', xScale.range()[0])
        .attr('y1', yScale.range()[0])
        .attr('x2', xScale.range()[1])
        .attr('y2', yScale.range()[1]);

    var markers = g.merge(gEnter)
        .selectAll('.dot')
        .data(data, d => d.id);

    markers.exit().remove();

    // Training points
    markers.enter().append('g')
        .attr('class', '.dot')
        .merge(markers)
        .attr('transform', d => `translate(${xScale(xValue(d))},${yScale(yValue(d))})`)
        .each(function (d) {
            if (d.set === "train") {
                if (d.feature === "naive") {
                    d3.select(this).append('circle')
                        .attr('class', 'circle')
                        .attr('r', circleRadius / 1.4)
                        .attr('fill', "none")
                        .attr('stroke', getColor(d.context + "-" + d.feature + "-" + d.set.toUpperCase()))
                        .attr('stroke-width', 2);
                } else if (d.feature === "topo") {
                    d3.select(this).append('rect')
                        .attr('class', 'square')
                        .attr('x', -circleRadius)
                        .attr('y', -circleRadius)
                        .attr('width', circleRadius * 1.4)
                        .attr('height', circleRadius * 1.4)
                        .attr('fill', "none")
                        .attr('stroke', getColor(d.context + "-" + d.feature + "-" + d.set.toUpperCase()))
                        .attr('stroke-width', 2);
                } else if (d.feature === "spatial") {
                    d3.select(this).append('polygon')
                        .attr('class', 'triangle')
                        .attr('points', `${-circleRadius / 1.4},${circleRadius / 1.4} ${circleRadius / 1.4},${circleRadius / 1.4} 0,${-circleRadius * 1}`)
                        .attr('fill', "none")
                        .attr('stroke', getColor(d.context + "-" + d.feature + "-" + d.set.toUpperCase()))
                        .attr('stroke-width', 2);
                }
            }
        });

    // Test points
    markers.enter().append('g')
        .attr('class', '.dot')
        .merge(markers)
        .attr('transform', d => `translate(${xScale(xValue(d))},${yScale(yValue(d))})`)
        .each(function (d) {
            if (d.set === "test") {
                if (d.feature === "naive") {
                    d3.select(this).append('circle')
                        .attr('class', 'circle')
                        .attr('r', circleRadius)
                        .attr('fill', d => getColor(d.context + "-" + d.feature + "-" + d.set.toUpperCase()))
                        .attr('stroke', "none")
                        .attr('stroke-width', 2);
                } else if (d.feature === "topo") {
                    d3.select(this).append('rect')
                        .attr('class', 'square')
                        .attr('x', -circleRadius)
                        .attr('y', -circleRadius)
                        .attr('width', circleRadius * 2)
                        .attr('height', circleRadius * 2)
                        .attr('fill', d => getColor(d.context + "-" + d.feature + "-" + d.set.toUpperCase()))
                        .attr('stroke', "none")
                        .attr('stroke-width', 2);
                } else if (d.feature === "spatial") {
                    d3.select(this).append('polygon')
                        .attr('class', 'triangle')
                        .attr('points', `${-circleRadius},${circleRadius} ${circleRadius},${circleRadius} 0,${-circleRadius * 1.4}`)
                        .attr('fill', d => getColor(d.context + "-" + d.feature + "-" + d.set.toUpperCase()))
                        .attr('stroke', "none")
                        .attr('stroke-width', 2);
                }
            }

        });

    let xAxis;
    if (showXAxis) {
        xAxis = axisBottom(xScale)
            .ticks(3)
            .tickFormat(d3.format(".1f"))
            .tickSize(3)
            .tickPadding(15);
    } else {
        xAxis = axisBottom(xScale)
            .ticks(0)
            .tickFormat(d3.format(".1f"))
            .tickSize(3)
            .tickPadding(15);
    }

    let yAxis;
    if (showYAxis) {
        yAxis = axisLeft(yScale)
            .ticks(3)
            .tickFormat(d3.format(".1f"))
            .tickSize(3)
            .tickPadding(15);
    } else {
        yAxis = axisLeft(yScale)
            .ticks(0)
            .tickFormat(d3.format(".1f"))
            .tickSize(3)
            .tickPadding(15);
    }


    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
        .append('g')
        .attr("class", "y-axis");

    yAxisG
        .merge(yAxisGEnter)
        .call(yAxis)
        .attr("font-size", "50px");

    const xAxisG = g.select('.x-axis');
    const xAxisGEnter = gEnter
        .append('g')
        .attr("class", "x-axis");
    xAxisG
        .merge(xAxisGEnter)
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .attr("font-size", "50px");

};

export const barPlot = (selection, props) => {
    const {
        data,
        innerWidth,
        innerHeight,
        margin,
        context,
        showYAxis
    } = props;

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
        .domain([-0.1, 1.1])
        .range([innerHeight, 0])
        .nice();

    const nestedData = d3.nest()
        .key(d => d.response)
        .key(d => d.feature)
        .key(d => d.set)
        .rollup(group => d3.mean(group, d => d['R^2']))
        .entries(data);

    selection.selectAll('*').remove();

    const g = selection.selectAll('.container').data([null]);

    const gEnter = g.enter().append('g')
        .attr('class', 'container');
    gEnter.merge(g)
        .attr('transform', `translate(${margin.left},${margin.top})`);


    const zeroLine = g.merge(gEnter)
        .append("line")
        .attr("class", "zero-line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    const bars = g.merge(gEnter)
        .selectAll(".bar")
        .data(nestedData);


    bars.exit().remove();
    zeroLine.exit().remove();

    bars.enter()
        .append("g")
        .merge(bars)
        .each(function (response) {
            // Get features from response dictionary
            const features = response.values;

            // Iterate over features in triplets
            for (let i = 0; i < features.length - 1; i += 3) {
                const feature1 = features[i];
                const feature2 = features[i + 1];
                const feature3 = features[i + 2];


                // Get sets from feature dictionaries
                const naive_sets = feature1.values;
                const topo_sets = feature2.values;
                const spatial_sets = feature3.values;

                // Get values from sets dictionaries
                const naive_test_value = naive_sets[0].value;
                const naive_train_value = naive_sets[1].value;

                const topo_test_value = topo_sets[0].value;
                const topo_train_value = topo_sets[1].value;

                const spatial_test_value = spatial_sets[0].value;
                const spatial_train_value = spatial_sets[1].value;


                // Graph the bars using the values
                const x1 = xScale(response.key) + xScale.bandwidth() * i / 3;
                const x2 = xScale(response.key) + xScale.bandwidth() * (i + 1) / 3;
                const x3 = xScale(response.key) + xScale.bandwidth() * (i + 2) / 3;

                // Plot the training bars
                const naive_train = yScale(Math.max(0, naive_train_value)); // Use Math.max to ensure positive values start at 0
                const topo_train = yScale(Math.max(0, topo_train_value)); // Use Math.max to ensure positive values start at 0
                const spatial_train = yScale(Math.max(0, spatial_train_value)); // Use Math.max to ensure positive values start at 0
                const height1 = Math.abs(yScale(naive_train_value) - yScale(0)); // Calculate the height relative to 0
                const height2 = Math.abs(yScale(topo_train_value) - yScale(0)); // Calculate the height relative to 0
                const height3 = Math.abs(yScale(spatial_train_value) - yScale(0)); // Calculate the height relative to 0

                d3.select(this)
                    .append("rect")
                    .attr("class", "train-bar")
                    .attr("x", x1)
                    .attr("y", naive_train)
                    .attr("width", xScale.bandwidth() / 3)
                    .attr("height", height1)
                    .attr("fill", getColor("C-naive-TRAIN"));

                d3.select(this)
                    .append("rect")
                    .attr("class", "train-bar")
                    .attr("x", x2)
                    .attr("y", topo_train)
                    .attr("width", xScale.bandwidth() / 3)
                    .attr("height", height2)
                    .attr("fill", getColor("C-topo-TRAIN"));

                d3.select(this)
                    .append("rect")
                    .attr("class", "train-bar")
                    .attr("x", x3)
                    .attr("y", spatial_train)
                    .attr("width", xScale.bandwidth() / 3)
                    .attr("height", height3)
                    .attr("fill", getColor("CH-spatial-TRAIN"));

                // Plot the test R^2 values on top of the bars
                const naive_test = yScale(Math.max(0, naive_test_value)); // Use Math.max to ensure positive values start at 0
                const topo_test = yScale(Math.max(0, topo_test_value)); // Use Math.max to ensure positive values start at 0
                const spatial_test = yScale(Math.max(0, spatial_test_value)); // Use Math.max to ensure positive values start at 0
                const height4 = Math.abs(yScale(naive_test_value) - yScale(0)); // Calculate the height relative to 0
                const height5 = Math.abs(yScale(topo_test_value) - yScale(0)); // Calculate the height relative to 0
                const height6 = Math.abs(yScale(spatial_test_value) - yScale(0)); // Calculate the height relative to 0

                d3.select(this)
                    .append("rect")
                    .attr("class", "test-r2")
                    .attr("x", x1)
                    .attr("y", naive_test)
                    .attr("width", xScale.bandwidth() / 3)
                    .attr("height", height4)
                    .attr("fill", getColor(context + "-naive-TEST"));

                d3.select(this)
                    .append("rect")
                    .attr("class", "test-r2")
                    .attr("x", x2)
                    .attr("y", topo_test)
                    .attr("width", xScale.bandwidth() / 3)
                    .attr("height", height5)
                    .attr("fill", getColor(context + "-topo-TEST"));

                d3.select(this)
                    .append("rect")
                    .attr("class", "test-r2")
                    .attr("x", x3)
                    .attr("y", spatial_test)
                    .attr("width", xScale.bandwidth() / 3)
                    .attr("height", height6)
                    .attr("fill", getColor(context + "-spatial-TEST"));
            }
        });

    let yAxis;
    if (showYAxis) {
        yAxis = d3.axisLeft(yScale)
            .tickValues([0.0, 0.5, 1.0])
            .tickSize(0)
            .tickPadding(10);
    } else {
        yAxis = d3.axisLeft(yScale)
            .tickValues([])
            .tickSize(0)
            .tickPadding(0);
    }

    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
        .append('g')
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .attr("font-size", "50px");

    yAxisG
        .merge(yAxisGEnter)
        .call(yAxis)
        .selectAll('.tick line')
        .remove();
};

export const linePlot = (selection, props) => {
    const {
        xValue,
        yValue,
        margin,
        innerWidth,
        innerHeight,
        data,
        type,
        showXAxis,
        showYAxis
    } = props;

    const sortedData = data.sort((a, b) => xValue(a) - xValue(b));

    selection.selectAll('*').remove();

    const g = selection.selectAll('.container').data([null]);
    const gEnter = g.enter().append('g')
        .attr('class', 'container');
    gEnter.merge(g)
        .attr('transform', `translate(${margin.left},${margin.top})`);

    let xScale;
    if (type === "temporal") {
        xScale = d3.scaleLinear()
            .domain([-1, 14])
            .range([0, innerWidth]);
    } else {
        xScale = d3.scaleLinear()
            .domain([50, 500])
            .range([0, innerWidth]);
    }


    const minValue = d3.min(sortedData, yValue);
    const maxValue = d3.max(sortedData, yValue);
    let yScale;
    yScale = d3.scaleLinear()
        .domain([-0.1, 1.1])
        .range([innerHeight, 0]);

    const zeroLine = g.merge(gEnter)
        .append("line")
        .attr("class", "zero-line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    const lineGenerator = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)));

    const nestedData = d3.nest()
        .key(d => d.context)
        .key(d => d.feature)
        .key(d => d.set)
        .entries(sortedData);

    const linesData = nestedData.flatMap(contextData =>
        contextData.values.flatMap(featureData =>
            featureData.values.flatMap(setData => {
                const key = `${contextData.key}-${featureData.key}-${setData.key}`;
                return {
                    key,
                    values: setData.values,
                };
            })
        )
    );

    // Clip path
    g.merge(gEnter)
        .append("defs")
        .append("clipPath")
        .attr("id", "clip-path")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", innerWidth)
        .attr("height", innerHeight);

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
        .attr('stroke-width', 9)
        .attr('stroke-dasharray', d => d.key.endsWith("TRAIN") ? '20 5' : 'none')
        .attr("clip-path", "url(#clip-path)");

    let xAxis;
    if (showXAxis) {
        if (type === "quantity") {
            xAxis = axisBottom(xScale)
                .tickValues([100, 300, 500])
                .tickFormat(d3.format(".0f"))
                .tickSize(0)
                .tickPadding(10);
        } else if (type === "temporal") {
            xAxis = axisBottom(xScale)
                .tickValues([-1, 2, 5, 8, 11, 14])
                .tickFormat(d3.format(".0f"))
                .tickSize(0)
                .tickPadding(10);
        }
    } else {
        xAxis = axisBottom(xScale)
            .ticks(0)
            .tickSize(0)
            .tickPadding(10);
    }

    let yAxis;
    if (showYAxis) {
        yAxis = axisLeft(yScale)
            .tickValues([0.0, 0.5, 1.0])
            .tickFormat(d3.format(".1f"))
            .tickSize(3)
            .tickPadding(10);
    } else {
        yAxis = axisLeft(yScale)
            .ticks(0)
            .tickFormat(d3.format(".1f"))
            .tickSize(3)
            .tickPadding(10);
    }



    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
        .append('g')
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    yAxisG
        .merge(yAxisGEnter)
        .call(yAxis)
        .attr("font-size", "50px");

    const xAxisG = g.select('.x-axis');
    const xAxisGEnter = gEnter
        .append('g')
        .attr("class", "x-axis");

    xAxisG
        .merge(xAxisGEnter)
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .attr("font-size", "50px");
};

const getColor = key => {
    const colorMap = {
        "C-naive-TEST": "#006600",
        "CH-naive-TEST": "#006600", // dark green
        "C-topo-TEST": "#004c6d", // 
        "CH-topo-TEST": "#004c6d", // dark blue
        "C-spatial-TEST": "#FF2400", // 
        "CH-spatial-TEST": "#FF2400", // dark orange

        "C-naive-TRAIN": "#53d83a", // light green
        "CH-naive-TRAIN": "#53d83a",
        "C-topo-TRAIN": "#4cb6da", // light blue
        "CH-topo-TRAIN": "#4cb6da", // 
        "C-spatial-TRAIN": "#FF7F00", // light orange
        "CH-spatial-TRAIN": "#FF7F00", // 
    };
    return colorMap[key] || 'purple';
};
