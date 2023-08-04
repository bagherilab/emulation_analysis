import {
    select,
} from 'https://cdn.skypack.dev/d3@5.16.0';

import { dropDownMenu } from './dropdown.js';
import { checkBox } from './checkbox.js';
import { parityPCAPlot } from './plotting.js';
import { loadParityPCAData } from './csvLoader.js';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let showXAxis = true;
let showYAxis = true;

let rawData;

let context = "C";
let contexts = ["C", "CH"];
let pca = 1;
let pcas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let dataPath = "data/predicted/pca_parity.csv"

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
            link.download = "pca_parity_plot_" + pca + "_" + context + ".svg";
            link.href = url;

            link.click();
        });
        document.body.appendChild(saveButton);
    };

    // Dropdowns
    select("#pca-menu")
        .call(dropDownMenu, {
            options: pcas,
            onOptionClicked: onPCAClicked
        });

    select("#context-menu")
        .call(dropDownMenu, {
            options: contexts,
            onOptionClicked: onContextClicked
        });

    select("#x-check")
        .call(checkBox, {
            checked: true,
            onCheckClicked: check => {
                showXAxis = check;
                render();
            }
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
        const filteredDataset = dataset.filter((row, index) => {
            let contextMatch = row["CONTEXT"] === context;

            return contextMatch;
        });
        return filteredDataset;

    };

    let filteredData = filterData(rawData);

    // Plot
    const margin = { top: 60, right: 40, bottom: 88, left: 150 }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    svg.call(parityPCAPlot, {
        xValue: d => d["PC" + pca + "_syn"],
        yValue: d => d["PC" + pca + "_true"],
        circleRadius: 6,
        margin: { top: 60, right: 40, bottom: 88, left: 150 },
        innerWidth: innerWidth,
        innerHeight: innerHeight,
        data: filteredData,
        r2Data: [],
        showXAxis: showXAxis,
        showYAxis: showYAxis,
        time: 0,
        showInitial: false,
        showML: false
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
const dataPromise = loadParityPCAData(dataPath).then(newData => {
    rawData = newData;
});

Promise.all([dataPromise]).then(() => { render(); });


const onPCAClicked = pc => {
    pca = pc;
    render();
};

const onContextClicked = cont => {
    context = cont;
    render();
};