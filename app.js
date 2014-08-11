var fs = require('fs');

var args = process.argv.slice(0);

var inFileName = args.pop();
var outFileName = './out.xml';

var nextIsOut = false;
for (var i = 0; i < args.length; ++i) {
    if (nextIsOut) {
        outFileName = args[ i ];
        nextIsOut = false;
    }
    else {
        if (args[ i ] === '-o') {
            nextIsOut = true;
        }
    }
}

if (nextIsOut) {
    throw new Error('Bad arguments. Usage: "nodejs app.js [-o outfile.xml] infile.txt"');
}

var prefix = '<!DOCTYPE KEEPASSX_DATABASE>\n<database>\n  <group>\n    <title>Imported</title>\n';
var suffix = '  </group>\n</database>\n';
var output = prefix;
var tags = [];
var contents = '' + fs.readFileSync(inFileName);
contents.split('\n').forEach(function (row, rowIndex) {
    var allEmpty = true;
    var rowContent = '';
    row.split('\t')
        .map(function (column) {
            var col = column.trim()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            allEmpty = allEmpty && col === '';
            return col;
        })
        .forEach(function (column, columIndex) {
            if (allEmpty) {
                return;
            }

            if (rowIndex === 0) {
                if (column.toLowerCase().indexOf('url') === 0) {
                    column = 'url';
                }
                else if (column.toLowerCase().indexOf('notes') === 0) {
                    column = 'comment';
                }
                tags.push(column)
                return;
            }

            var tag = tags[columIndex];
            rowContent += '      <' + tag + '>' + column + '</' + tag + '>\n';
        });

    if (!allEmpty) {
        output += '    <entry>\n' + rowContent + '    </entry>\n';
    }
});

output += suffix;

fs.writeFileSync(outFileName, output);
