export const checkBox = (selection, props) => {
    const {
        checked,
        onCheckClicked
    } = props;

    let labelElement = selection.selectAll('label').data([null]);
    labelElement = labelElement.enter().append('label')
        .merge(labelElement);

    let inputElement = labelElement.selectAll('input').data([null]);
    inputElement = inputElement.enter().append('input')
        .attr('type', 'checkbox')
        .merge(inputElement);

    inputElement
        .attr('checked', checked)
        .on("change", function () {
            onCheckClicked(this.checked)
        });
};