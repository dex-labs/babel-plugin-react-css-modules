"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("@babel/types");
var _default = (classNameExpression, styleNameExpression) => (0, _types.binaryExpression)('+', (0, _types.conditionalExpression)((0, _types.cloneNode)(classNameExpression), (0, _types.binaryExpression)('+', (0, _types.cloneNode)(classNameExpression), (0, _types.stringLiteral)(' ')), (0, _types.stringLiteral)('')), (0, _types.cloneNode)(styleNameExpression));
exports.default = _default;
//# sourceMappingURL=conditionalClassMerge.js.map