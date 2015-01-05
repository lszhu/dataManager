var xlsx = require('xlsx');
var path = require('path');

var fullPath = path.join(__dirname, 'test.xlsx');

try {
    var xlsxData = xlsx.readFile(fullPath);
    var sheetName = xlsxData.SheetNames[0];
    xlsxData = xlsx.utils.sheet_to_json(
        xlsxData.Sheets[sheetName],
        {raw: true}
    );
} catch (e) {
    console.log('read file error.');
}

console.log(xlsxData);