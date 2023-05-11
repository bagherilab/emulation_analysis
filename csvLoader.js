import {
    csv,
} from 'https://cdn.skypack.dev/d3@5.16.0';

export const loadPredData = (predDataPath, models) => {
    return csv(predDataPath).then(loadedData => {
        const data = loadedData;
        data.forEach(d => {
            models.forEach(model => {
                d[model] = +d[model];
            });
            d["set"] = d["set"];
        });
        return data;
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