"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = _interopRequireWildcard(require("@babel/types"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Creates an AST representation of an InputObjectType shape object.
 */
const createObjectExpression = (types, object) => {
  const properties = [];
  Object.keys(object).forEach(name => {
    const value = object[name];
    let newValue;
    if (!types.isAnyTypeAnnotation(value)) {
      switch (typeof value) {
        case 'string':
          newValue = types.stringLiteral(value);
          break;
        case 'object':
          newValue = createObjectExpression(types, value);
          break;
        case 'boolean':
          newValue = types.booleanLiteral(value);
          break;
        case 'undefined':
          return;
        default:
          throw new TypeError(`Unexpected type: ${typeof value}`);
      }
    }
    properties.push(types.objectProperty(types.stringLiteral(name), newValue));
  });
  return types.objectExpression(properties);
};
var _default = exports.default = createObjectExpression;
//# sourceMappingURL=createObjectExpression.js.map