"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("@babel/core");
var _optionsDefaults = _interopRequireDefault(require("./schemas/optionsDefaults"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const attributeNameExists = (programPath, stats) => {
  let exists = false;
  let {
    attributeNames
  } = _optionsDefaults.default;
  if (stats.opts && stats.opts.attributeNames) {
    attributeNames = {
      ...attributeNames,
      ...stats.opts.attributeNames
    };
  }
  programPath.traverse({
    JSXAttribute(attributePath) {
      if (exists) {
        return;
      }
      const attribute = attributePath.node;
      if (typeof attribute.name !== 'undefined' && typeof attributeNames[attribute.name.name] === 'string') {
        exists = true;
      }
    }
  });
  return exists;
};
var _default = exports.default = attributeNameExists;
//# sourceMappingURL=attributeNameExists.js.map