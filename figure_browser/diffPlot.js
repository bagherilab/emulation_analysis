import {
    select,
} from 'https://cdn.skypack.dev/d3@5.16.0';

import { dropDownMenu } from './dropdown.js';
import { checkBox } from './checkbox.js';
import { rnnBarPlot, parityPlot } from './plotting.js';
import { loadRnnBarData, loadParityData } from './csvLoader.js';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let showYAxis = true;

let rawData;

let time = 8;
let times = [8, 15];
let context = "C";
let contexts = ["C", "CH"];
let response = "ACTIVITY";
let responses = ["ACTIVITY", "GROWTH", "SYMMETRY"];
let model = "MLR";
let models = ["MLR", "RF", "SVR", "MLP"]

let dataPath = "data/predicted/diff_parity.csv"

const saveButtonId = 'saveButton';

const render = () => {
    // Save button
    if (!document.getElementById(saveButtonId)) {
        const saveButton = document.createElement('button');
        saveButton.id = saveButtonId;
        saveButton.textContent = 'Save SVG';

        // Add a click event listener to the button
        saveButton.addEventListener('click', () => {
            // Get the SVG element
            const svgElement = document.querySelector('svg');

            // Get the SVG markup
            const svgMarkup = new XMLSerializer().serializeToString(svgElement);

            // Create a new Blob object from the SVG markup
            const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });

            // Create a URL for the Blob object
            const url = URL.createObjectURL(blob);

            // Create a new link element
            const link = document.createElement('a');
            link.download = "diff_plot_" + response + "_" + model + "_" + time + ".svg";
            link.href = url;

            // Simulate a click on the link element to trigger the download
            link.click();
        });
        document.body.appendChild(saveButton);
    };

    select("#response-menu")
        .call(dropDownMenu, {
            options: responses,
            onOptionClicked: onResponseClicked
        });

    select("#model-menu")
        .call(dropDownMenu, {
            options: models,
            onOptionClicked: onModelClicked
        });

    select("#time-menu")
        .call(dropDownMenu, {
            options: times,
            onOptionClicked: onTimeClicked
        });

    select("#y-check")
        .call(checkBox, {
            checked: true,
            onCheckClicked: check => {
                showYAxis = check;
                render();
            }
        });

    let filteredData;
    const filterData = (dataset) => {
        const filteredDataset = dataset.filter((row) => {
            let contextMatch = row["context"] === context;
            let responseMatch = row["response"] === response;
            let timeMatch = parseInt(row["timepoint"]) === parseInt(time);
            let modelFilter = row["model"] === model;

            return contextMatch && responseMatch && timeMatch && modelFilter;
        });

        return filteredDataset;
    };

    filteredData = filterData(rawData);

    // Plot
    const margin = { top: 60, right: 40, bottom: 88, left: 150 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;


    svg.call(parityPlot, {
        xValue: d => d["y_pred"],
        yValue: d => d["y_true"],
        circleRadius: 6,
        margin: { top: 60, right: 40, bottom: 88, left: 150 },
        innerWidth: innerWidth,
        innerHeight: innerHeight,
        data: filteredData,
        r2Data: [],
        showXAxis: showYAxis,
        showYAxis: showYAxis,
        time: time,
        showInitial: false,
        showML: true
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
const dataPromise = loadParityData(dataPath).then(newData => {
    rawData = newData;
});
Promise.all([dataPromise]).then(() => { render(); });

const onResponseClicked = resp => {
    response = resp;
    render();
};

const onModelClicked = mod => {
    model = mod;
    render();
};

const onContextClicked = event => {
    context = event.target.value;
    render();
};

const onTimeClicked = ti => {
    time = ti;
    render();
};


const cRadio = document.getElementById('c-radio');
const chRadio = document.getElementById('ch-radio');

cRadio.addEventListener('change', onContextClicked);
chRadio.addEventListener('change', onContextClicked);
