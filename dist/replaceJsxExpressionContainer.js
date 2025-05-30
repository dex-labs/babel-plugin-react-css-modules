"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = _interopRequireWildcard(require("@babel/types"));
var _conditionalClassMerge = _interopRequireDefault(require("./conditionalClassMerge"));
var _createObjectExpression = _interopRequireDefault(require("./createObjectExpression"));
var _optionsDefaults = _interopRequireDefault(require("./schemas/optionsDefaults"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
var _default = (types, path, sourceAttribute, destinationName, importedHelperIndentifier, styleModuleImportMapIdentifier, options) => {
  const expressionContainerValue = sourceAttribute.value;
  const destinationAttribute = path.node.openingElement.attributes.find(attribute => typeof attribute.name !== 'undefined' && attribute.name.name === destinationName);
  if (destinationAttribute) {
    path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(destinationAttribute), 1);
  }
  path.node.openingElement.attributes.splice(path.node.openingElement.attributes.indexOf(sourceAttribute), 1);
  const args = [expressionContainerValue.expression, styleModuleImportMapIdentifier];

  // Only provide options argument if the options are something other than default
  // This helps save a few bits in the generated user code
  if (options.handleMissingStyleName !== _optionsDefaults.default.handleMissingStyleName || options.autoResolveMultipleImports !== _optionsDefaults.default.autoResolveMultipleImports) {
    args.push((0, _createObjectExpression.default)(types, options));
  }
  const styleNameExpression = types.callExpression(types.clone(importedHelperIndentifier), args);
  if (destinationAttribute) {
    if ((0, _types.isStringLiteral)(destinationAttribute.value)) {
      path.node.openingElement.attributes.push((0, _types.jSXAttribute)((0, _types.jSXIdentifier)(destinationName), (0, _types.jSXExpressionContainer)((0, _types.binaryExpression)('+', types.stringLiteral(`${destinationAttribute.value.value} `), styleNameExpression))));
    } else if ((0, _types.isJSXExpressionContainer)(destinationAttribute.value)) {
      path.node.openingElement.attributes.push((0, _types.jSXAttribute)((0, _types.jSXIdentifier)(destinationName), (0, _types.jSXExpressionContainer)((0, _conditionalClassMerge.default)(destinationAttribute.value.expression, styleNameExpression))));
    } else {
      throw new Error(`Unexpected attribute value: ${destinationAttribute.value}`);
    }
  } else {
    path.node.openingElement.attributes.push((0, _types.jSXAttribute)((0, _types.jSXIdentifier)(destinationName), (0, _types.jSXExpressionContainer)(styleNameExpression)));
  }
};
exports.default = _default;
//# sourceMappingURL=replaceJsxExpressionContainer.js.map