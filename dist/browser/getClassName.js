"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _optionsDefaults = _interopRequireDefault(require("./schemas/optionsDefaults"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var isNamespacedStyleName = function isNamespacedStyleName(styleName) {
  return styleName.includes('.');
};
var handleError = function handleError(message, handleMissingStyleName) {
  if (handleMissingStyleName === 'throw') {
    throw new Error(message);
  } else if (handleMissingStyleName === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(message);
  }
  return null;
};
var getClassNameForNamespacedStyleName = function getClassNameForNamespacedStyleName(styleName, styleModuleImportMap, handleMissingStyleNameOption) {
  // Note:
  // Do not use the desctructing syntax with Babel.
  // Desctructing adds _slicedToArray helper.
  var styleNameParts = styleName.split('.');
  var importName = styleNameParts[0];
  var moduleName = styleNameParts[1];
  var handleMissingStyleName = handleMissingStyleNameOption || _optionsDefaults["default"].handleMissingStyleName;
  if (!moduleName) {
    return handleError("Invalid style name: ".concat(styleName), handleMissingStyleName);
  }
  if (!styleModuleImportMap[importName]) {
    return handleError("CSS module import does not exist: ".concat(importName), handleMissingStyleName);
  }
  if (!styleModuleImportMap[importName][moduleName]) {
    return handleError("CSS module does not exist: ".concat(moduleName), handleMissingStyleName);
  }
  return styleModuleImportMap[importName][moduleName];
};
var getClassNameFromMultipleImports = function getClassNameFromMultipleImports(styleName, styleModuleImportMap, handleMissingStyleNameOption) {
  var handleMissingStyleName = handleMissingStyleNameOption || _optionsDefaults["default"].handleMissingStyleName;
  var importKeysWithMatches = Object.keys(styleModuleImportMap).map(function (importKey) {
    return styleModuleImportMap[importKey][styleName] && importKey;
  }).filter(function (importKey) {
    return importKey;
  });
  if (importKeysWithMatches.length > 1) {
    throw new Error("Cannot resolve styleName \"".concat(styleName, "\" because it is present in multiple imports:") + "\n\n\t".concat(importKeysWithMatches.join('\n\t'), "\n\nYou can resolve this by using a named import, e.g:") + "\n\n\timport foo from \"".concat(importKeysWithMatches[0], "\";") + "\n\t<div styleName=\"foo.".concat(styleName, "\" />") + '\n\n');
  }
  if (importKeysWithMatches.length === 0) {
    return handleError("Could not resolve the styleName '".concat(styleName, "'."), handleMissingStyleName);
  }
  return styleModuleImportMap[importKeysWithMatches[0]][styleName];
};
var _default = exports["default"] = function _default(styleNameValue, styleModuleImportMap, options) {
  var styleModuleImportMapKeys = Object.keys(styleModuleImportMap);
  var _ref = options || {},
    _ref$handleMissingSty = _ref.handleMissingStyleName,
    handleMissingStyleName = _ref$handleMissingSty === void 0 ? _optionsDefaults["default"].handleMissingStyleName : _ref$handleMissingSty,
    _ref$autoResolveMulti = _ref.autoResolveMultipleImports,
    autoResolveMultipleImports = _ref$autoResolveMulti === void 0 ? _optionsDefaults["default"].autoResolveMultipleImports : _ref$autoResolveMulti;
  if (!styleNameValue) {
    return '';
  }
  return styleNameValue.split(' ').filter(function (styleName) {
    return styleName;
  }).map(function (styleName) {
    if (isNamespacedStyleName(styleName)) {
      return getClassNameForNamespacedStyleName(styleName, styleModuleImportMap, handleMissingStyleName);
    }
    if (styleModuleImportMapKeys.length === 0) {
      throw new Error("Cannot use styleName attribute for style name '".concat(styleName, "' without importing at least one stylesheet."));
    }
    if (styleModuleImportMapKeys.length > 1) {
      if (!autoResolveMultipleImports) {
        throw new Error("Cannot use anonymous style name '".concat(styleName, "' with more than one stylesheet import without setting 'autoResolveMultipleImports' to true."));
      }
      return getClassNameFromMultipleImports(styleName, styleModuleImportMap, handleMissingStyleName);
    }
    var styleModuleMap = styleModuleImportMap[styleModuleImportMapKeys[0]];
    if (!styleModuleMap[styleName]) {
      return handleError("Could not resolve the styleName '".concat(styleName, "'."), handleMissingStyleName);
    }
    return styleModuleMap[styleName];
  })
  // Remove any styles which could not be found (if handleMissingStyleName === 'ignore')
  .filter(function (className) {
    return className;
  }).join(' ');
};

//# sourceMappingURL=getClassName.js.map