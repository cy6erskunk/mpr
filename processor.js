var DEBUG = false;

function debug() {
    DEBUG && console.log.apply(console, arguments);
}

function tokenize(input) {
    var tokens = [],
        curArg = '',
        pushArg = function() {
            if (curArg.length) {
                tokens.push({
                    type: 'arg',
                    value: parseInt(curArg, 10)
                });
                curArg = '';
            }
        };

    input.replace(/[\s]/g, '').split('').forEach(function(char) {
        var operation, l, r;
        if (/\d/.test(char)) {
            debug('digit', char);
            curArg += char;
        } else if (/[+\-]/.test(char)) {
            debug('operation', char);
            pushArg();

            tokens.push({
                type: 'op',
                value: char
            });
        } else if (/[()]/.test(char)) {
            debug('paren');
            tokens.push({
                type: 'paren',
                value: char
            });
        } else {
            throw new Error('unrecognised symbol: "' + char + '"');
        }
    });

    pushArg();

    return tokens;
}

function parse(tokens) {
    var tokenIndex = 0;
    var ast = {
        type: 'ArithmeticOperation'
    };
    var getCurrentToken = function() { return tokens[tokenIndex]};

    function processSingleOperation(parentNode) {
        var state = 'START'; // other states: LARG, OP, RARG
        while (state !== 'FINISH') {
            debug(tokenIndex, tokens.length, state);
            switch (state) {
            case 'START':
                if (getCurrentToken().type === 'arg') {
                    parentNode.larg = {
                        type: 'NumberLiteral',
                        value: getCurrentToken().value
                    };
                    state = 'LARG';
                    tokenIndex++;
                } else if (getCurrentToken().type === 'paren' && getCurrentToken().value === '(') {
                    parentNode.larg = {
                        type: 'ArithmeticOperation'
                    };
                    tokenIndex++;
                    processSingleOperation(parentNode.larg);
                } else {
                    throw new TypeError('unexpected token: ' + getCurrentToken().type + ' ' + getCurrentToken().value);
                }
                break;
            case 'LARG': 
                if (getCurrentToken().type == 'op') {
                    parentNode.op = {
                        type: 'operator',
                        value: getCurrentToken().value
                    };
                    state = 'OP';
                    tokenIndex++;
                }
                break;
            case 'OP':
                if (getCurrentToken().type === 'arg') {
                    parentNode.rarg = {
                        type: 'NumberLiteral',
                        value: getCurrentToken().value
                    };
                    state = 'RARG';
                    tokenIndex++;
                }
            case 'RARG':
                if (tokenIndex == tokens.length) {
                    state = 'FINISH';
                } else if (getCurrentToken().type == 'op') {

                }
                break;
            default:
                throw new Error('unknown state of the tree: ' + state);
            }
            if (state !== 'FINISH' && tokenIndex >= tokens.length) {
                throw new Error('unexpected end of tokens');
            }
        }
    }

    processSingleOperation(ast);

    return ast;
}

function stringify(ast) {
    var result = '';
    var operations = {
        '+': 'add',
        '-': 'sub'
    };

    var node = ast;

    if (node.type == 'ArithmeticOperation' && node.op.type == 'operator') {
        result += operations[node.op.value] + '(';
        result += node.larg.value + ', ';
        result += node.rarg.value;
        result += ')';
    }

    return result;
}

module.exports = {
    tokenize: tokenize,
    parse: parse,
    stringify: stringify,
    debug: function (isDebugEnabled) {
        DEBUG = isDebugEnabled;
    }
};
