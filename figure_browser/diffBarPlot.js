import {
    select,
} from 'https://cdn.skypack.dev/d3@5.16.0';

import { dropDownMenu } from './dropdown.js';
import { checkBox } from './checkbox.js';
import { diffBarPlot } from './plotting.js';
import { loadBarData } from './csvLoader.js';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let showYAxis = true;

let rawData;

let response = "ACTIVITY";
let responses = ["ACTIVITY", "GROWTH", "SYMMETRY"];
let end_time = 8;
let end_times = [8, 15]
let context = "C";

let dataPath = "data/predicted/diff_bar.csv"

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
            link.download = "bar_plot_" + response + "_" + context + "_" + end_time + ".svg";
            link.href = url;

            // Simulate a click on the link element to trigger the download
            link.click();
        });
        document.body.appendChild(saveButton);
    };

    select("#model-menu")
        .call(dropDownMenu, {
            options: responses,
            onOptionClicked: onResponseClicked
        });

    select("#time-menu")
        .call(dropDownMenu, {
            options: end_times,
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

    const filterData = (dataset) => {
        const filteredDataset = dataset.filter((row) => {
            let responseMatch = row["response"] === response;
            let contextMatch = row["context"] === context;
            let endTimeMatch = parseInt(row["timepoint"]) === parseInt(end_time);

            return responseMatch && contextMatch && endTimeMatch;
        });

        return filteredDataset;
    };

    let filteredData = filterData(rawData);

    // Plot
    const margin = { top: 60, right: 40, bottom: 88, left: 150 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    svg.call(diffBarPlot, {
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

const onResponseClicked = resp => {
    response = resp;
    render();
};

const onTimeClicked = time => {
    end_time = time;
    render();
};