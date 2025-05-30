"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("@babel/core");
var _types = require("@babel/types");
var _optionsDefaults = _interopRequireDefault(require("./schemas/optionsDefaults"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const createSpreadMapper = (path, stats) => {
  const result = {};
  let {
    attributeNames
  } = _optionsDefaults.default;
  if (stats.opts && stats.opts.attributeNames) {
    attributeNames = {
      ...attributeNames,
      ...stats.opts.attributeNames
    };
  }
  const attributes = Object.entries(attributeNames).filter(pair => pair[1]);
  const attributeKeys = attributes.map(pair => pair[0]);
  const spreadAttributes = path.node.openingElement.attributes.filter(attribute => (0, _types.isJSXSpreadAttribute)(attribute));
  spreadAttributes.forEach(spread => {
    attributeKeys.forEach(attributeKey => {
      const destinationName = attributeNames[attributeKey];
      if (result[destinationName]) {
        result[destinationName] = (0, _types.binaryExpression)('+', result[destinationName], (0, _types.conditionalExpression)((0, _types.cloneNode)(spread.argument), (0, _types.binaryExpression)('+', (0, _types.stringLiteral)(' '), (0, _types.logicalExpression)('||', (0, _types.memberExpression)((0, _types.cloneNode)(spread.argument), (0, _types.identifier)(destinationName)), (0, _types.stringLiteral)(''))), (0, _types.stringLiteral)('')));
      } else {
        result[destinationName] = (0, _types.conditionalExpression)((0, _types.cloneNode)(spread.argument), (0, _types.logicalExpression)('||', (0, _types.memberExpression)((0, _types.cloneNode)(spread.argument), (0, _types.identifier)(destinationName)), (0, _types.stringLiteral)('')), (0, _types.stringLiteral)(''));
      }
    });
  });
  return result;
};
var _default = exports.default = createSpreadMapper;
//# sourceMappingURL=createSpreadMapper.js.map