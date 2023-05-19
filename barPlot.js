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

let features = ["topo", "spatial"];
let response = "ACTIVITY";
let responses = ["ACTIVITY", "GROWTH", "SYMMETRY"];
let model = "MLR";
let models = ["MLR", "RF", "SVR", "MLP"];

let dataPath = "data/predicted/topo_spatial_r2.csv"

const render = () => {
    // Save button
    if (!document.querySelector('button')) {
        document.body.appendChild(saveButton);
    }

    // Dropdowns
    // select("#response-menu")
    //     .call(dropDownMenu, {
    //         options: responses,
    //         onOptionClicked: onResponseClicked
    //     });

    select("#model-menu")
        .call(dropDownMenu, {
            options: models,
            onOptionClicked: onModelClicked
        });

    // select("#feature-menu")
    //     .call(dropDownMenu, {
    //         options: ["topo"],
    //         onOptionClicked: onFeatureClicked
    //     });

    const filterData = (dataset) => {
        const filteredDataset = dataset.filter((row, index) => {
            let modelMatch = row["model"] === model;
            let responseMatch = row["response"] === response;

            let contextMatch;
            if (showCHData && showCData) {
                contextMatch = row["context"] === "C" || row["context"] === "CH";
            } else if (showCHData) {
                contextMatch = row["context"] === "CH";
            } else if (showCData) {
                contextMatch = row["context"] === "C";
            }
            return modelMatch && responseMatch && contextMatch;
        });

        return filteredDataset;
    };


    let filteredData = filterData(rawData);

    // Plot
    svg.call(linePlot, {
        xValue: d => d["timepoint"],
        yValue: d => d["R^2"],
        margin: { top: 60, right: 40, bottom: 88, left: 150 },
        width: width,
        height: height,
        data: filteredData,
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
const dataPromise = loadTemporalData(dataPath).then(newData => {
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

const onFeatureClicked = feat => {
    features = feat;
    render();
};