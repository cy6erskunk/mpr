var processor = require('./processor');

var input = process.argv[2] || '';
var DEBUG = !!process.env.DEBUG;
var tokens,
    ast;

processor.debug(DEBUG);

tokens = processor.tokenize(input);
DEBUG && console.dir(tokens);
ast = processor.parse(tokens);
DEBUG && console.dir(ast);
console.log(processor.stringify(ast));
