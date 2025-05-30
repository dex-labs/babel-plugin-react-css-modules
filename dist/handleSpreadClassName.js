"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("@babel/core");
var _types = require("@babel/types");
const handleSpreadClassName = (path, destinationName, classNamesFromSpread) => {
  const destinationAttribute = path.node.openingElement.attributes.find(attribute => typeof attribute.name !== 'undefined' && attribute.name.name === destinationName);
  if (!destinationAttribute) {
    return;
  }
  if ((0, _types.isStringLiteral)(destinationAttribute.value)) {
    destinationAttribute.value = (0, _types.jsxExpressionContainer)((0, _types.binaryExpression)('+', (0, _types.cloneNode)(destinationAttribute.value), (0, _types.binaryExpression)('+', (0, _types.stringLiteral)(' '), classNamesFromSpread)));
  } else if ((0, _types.isJSXExpressionContainer)(destinationAttribute.value)) {
    destinationAttribute.value = (0, _types.jsxExpressionContainer)((0, _types.binaryExpression)('+', (0, _types.cloneNode)(destinationAttribute.value.expression), (0, _types.binaryExpression)('+', (0, _types.stringLiteral)(' '), classNamesFromSpread)));
  }
};
var _default = exports.default = handleSpreadClassName;
//# sourceMappingURL=handleSpreadClassName.js.map