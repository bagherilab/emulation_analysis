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

let rawData;

let model = "MLR";
let models = ["MLR", "RF", "SVR", "MLP"];
let context = "C";

let dataPath = "data/predicted/topo_spatial_r2.csv"

const render = () => {

    // Save button
    if (!document.querySelector('button')) {
        document.body.appendChild(saveButton);
    }

    select("#model-menu")
        .call(dropDownMenu, {
            options: models,
            onOptionClicked: onModelClicked
        });


    const filterData = (dataset) => {
        const filteredDataset = dataset.filter((row) => {
            let modelMatch = row["model"] === model;
            let contextMatch = row["context"] === context;

            return modelMatch && contextMatch;
        });

        return filteredDataset;
    };


    let filteredData = filterData(rawData);

    // Plot
    svg.call(barPlot, {
        data: filteredData,
        width: width,
        height: height,
        margin: { top: 60, right: 40, bottom: 88, left: 150 }
    });
};

// Create a new button element
const saveButton = document.createElement('button');
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
    link.download = response + "_(" + features + "_" + time + ")_" + model + ".svg";
    link.href = url;

    // Simulate a click on the link element to trigger the download
    link.click();
});

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