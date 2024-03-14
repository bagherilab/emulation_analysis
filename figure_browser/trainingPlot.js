import {
    select,
} from 'https://cdn.skypack.dev/d3@5.16.0';

import { dropDownMenu } from './dropdown.js';
import { checkBox } from './checkbox.js';
import { trainingBarPlot } from './plotting.js';
import { loadTrainingBarData } from './csvLoader.js';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let showYAxis = true;
let showXAxis = true;

let rawData;

let model = "MLR";
let models = ["MLR", "RF", "SVR", "MLP"];
let context = "C";
let contexts = ["C", "CH"];
let response = "ACTIVITY";
let responses = ["ACTIVITY", "GROWTH", "SYMMETRY"];

let dataPath = "data/predicted/train_r2.csv"

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
            link.download = "training_bar_plot_" + model + "_" + response + "_" + context + ".svg";
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

    select("#response-menu")
        .call(dropDownMenu, {
            options: responses,
            onOptionClicked: onResponseClicked
        });

    select("#y-check")
        .call(checkBox, {
            checked: true,
            onCheckClicked: check => {
                showYAxis = check;
                render();
            }
        });

    select("#x-check")
        .call(checkBox, {
            checked: true,
            onCheckClicked: check => {
                showXAxis = check;
                render();
            }
        });

    select("#context-menu")
        .call(dropDownMenu, {
            options: contexts,
            onOptionClicked: onContextClicked
        });

    const filterData = (dataset) => {
        const filteredDataset = dataset.filter((row) => {
            // make model upper case
            model = model.toUpperCase();
            response = response.toUpperCase();
            let modelMatch = row["model"] === model;
            let contextMatch = row["context"] === context;
            let responseMatch = row["response"] === response;

            return modelMatch && contextMatch && responseMatch;
        });
        return filteredDataset;
    };


    let filteredData = filterData(rawData);

    // Plot
    const margin = { top: 60, right: 40, bottom: 88, left: 150 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    svg.call(trainingBarPlot, {
        data: filteredData,
        innerWidth: innerWidth,
        innerHeight: innerHeight,
        margin: { top: 60, right: 40, bottom: 88, left: 150 },
        context: context,
        showYAxis: showYAxis,
        showXAxis: showXAxis,
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
const dataPromise = loadTrainingBarData(dataPath).then(newData => {
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

const onResponseClicked = resp => {
    response = resp;
    render();
};