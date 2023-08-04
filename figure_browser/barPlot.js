import {
    select,
} from 'https://cdn.skypack.dev/d3@5.16.0';

import { dropDownMenu } from './dropdown.js';
import { checkBox } from './checkbox.js';
import { barPlot } from './plotting.js';
import { loadBarData } from './csvLoader.js';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let showYAxis = true;

let rawData;

let model = "MLR";
let models = ["MLR", "RF", "SVR", "MLP"];
let context = "C";

let dataPath = "data/predicted/bar_points.csv"
// let dataPath = "data/predicted/bar_r2_points_8.csv"

const saveButtonId = 'saveButton';

const render = () => {
    // Save button
    if (!document.getElementById(saveButtonId)) {
        const saveButton = document.createElement('button');
        saveButton.id = saveButtonId;
        saveButton.textContent = 'Save SVG';

        saveButton.addEventListener('click', () => {
            const svgElement = document.querySelector('svg');

            const svgMarkup = new XMLSerializer().serializeToString(svgElement);

            const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });

            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.download = "bar_plot_" + model + "_" + context + ".svg";
            link.href = url;

            link.click();
        });
        document.body.appendChild(saveButton);
    };

    select("#model-menu")
        .call(dropDownMenu, {
            options: models,
            onOptionClicked: onModelClicked
        });

    select("#y-check")
        .call(checkBox, {
            checked: true,
            onCheckClicked: check => {
                showYAxis = check;
                render();
            }
        });

    const filterData = (dataset) => {
        const filteredDataset = dataset.filter((row) => {
            let modelMatch = row["model"] === model;
            let contextMatch = row["context"] === context;
            let timeMatch = parseInt(row["timepoint"]) === 0;

            return modelMatch && contextMatch && timeMatch;
        });

        return filteredDataset;
    };


    let filteredData = filterData(rawData);

    // Plot
    const margin = { top: 60, right: 40, bottom: 88, left: 150 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    svg.call(barPlot, {
        data: filteredData,
        innerWidth: innerWidth,
        innerHeight: innerHeight,
        margin: { top: 60, right: 40, bottom: 88, left: 150 },
        context: context,
        showYAxis: showYAxis
    });

    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", "1px");
};

// Load data
const dataPromise = loadBarData(dataPath).then(newData => {
    rawData = newData;
});
Promise.all([dataPromise]).then(() => { render(); });


// Get the radio buttons
const cRadio = document.getElementById('c-radio');
const chRadio = document.getElementById('ch-radio');

const onContextClicked = event => {
    context = event.target.value;
    render();
};

// Add event listener to radio buttons
cRadio.addEventListener('change', onContextClicked);
chRadio.addEventListener('change', onContextClicked);

const onModelClicked = mod => {
    model = mod;
    render();
};