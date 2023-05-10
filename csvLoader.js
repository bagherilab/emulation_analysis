import {
    csv,
} from 'https://cdn.skypack.dev/d3@5.16.0';

export const loadPredData = (folderPath) => {
    return new Promise((resolve, reject) => {
        fetch(folderPath)
            .then(response => response.text())
            .then(htmlString => {
                const parser = new DOMParser();
                const html = parser.parseFromString(htmlString, 'text/html');
                const fileList = [...html.querySelectorAll('a')].map(a => a.href);

                const csvList = fileList.filter(file => file.endsWith('.csv'));

                if (csvList.length === 0) {
                    reject(new Error(`No CSV files found in folder: ${folderPath}`));
                } else {
                    const csvPath = csvList[0]; // assume the first CSV file in the list is the one to load
                    csv(csvPath).then(parsedData => {
                        parsedData.forEach(d => {
                            d["y_pred"] = +d["y_pred"];
                            d["set"] = d["set"];
                        });
                        resolve(parsedData);
                    }).catch(reject);
                }
            }).catch(reject);
    });
};

export const loadTrueData = (trueDataPath, responses) => {
    return csv(trueDataPath).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            responses.forEach(response => {
                d[response] = +d[response];
            });
        });
        return data;
    });
};