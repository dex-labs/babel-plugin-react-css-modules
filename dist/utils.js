"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLocalIdent = exports.generateScopedNameFactory = void 0;
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _cssesc = _interopRequireDefault(require("cssesc"));
var _loaderUtils = require("loader-utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// This module provides a stable implementation of getLocalIdent(),
// and generateScopedName() functions, which may be used to override
// default classname generation algorithms of `css-loader` and this
// plugin, to be independent of internal `css-loader` changes that
// from time-to-time alter the output classnames without solid reasons.

/**
 * Normalizes file path to OS-independent format (adopted from css-loader).
 *
 * @ignore
 * @param {string} file
 * @returns {string}
 */
const normalizePath = file => _path.default.sep === '\\' ? file.replace(/\\/gu, '/') : file;
const filenameReservedRegex = /["*/:<>?\\|]/gu;

// eslint-disable-next-line no-control-regex
const reControlChars = /[\u0000-\u001F\u0080-\u009F]/gu;
const escapeLocalident = localident => (0, _cssesc.default)(localident
// For `[hash]` placeholder
.replace(/^((-?\d)|--)/u, '_$1').replace(filenameReservedRegex, '-').replace(reControlChars, '-').replace(/\./gu, '-'), {
  isIdentifier: true
});

/**
 * Returns the name of package containing the folder; i.e. it recursively looks
 * up from the folder for the closest package.json file, and returns the name in
 * that file. It also caches the results from previously fisited folders.
 *
 * @ignore
 * @param {string} folder
 * @returns {string}
 */
const getPackageInfo = folder => {
  let res = getPackageInfo.cache[folder];
  if (!res) {
    const pp = _path.default.resolve(folder, 'package.json');
    /* eslint-disable global-require, import/no-dynamic-require */
    res = _fs.default.existsSync(pp) ? {
      name: require(pp).name,
      root: folder
    } : getPackageInfo(_path.default.resolve(folder, '..'));
    /* eslint-enable global-require, import/no-dynamic-require */
    getPackageInfo.cache[folder] = res;
  }
  return res;
};
getPackageInfo.cache = {};
const getLocalIdent = ({
  resourcePath
}, localIdentName, localName, options = {}) => {
  const packageInfo = getPackageInfo(_path.default.dirname(resourcePath));
  const request = normalizePath(_path.default.relative(packageInfo.root, resourcePath));
  return (0, _loaderUtils.interpolateName)({
    resourcePath
  }, localIdentName, {
    ...options,
    content: `${packageInfo.name + request}\u0000${localName}`,
    context: packageInfo.root
  }).replace(/\[package\]/giu, packageInfo.name).replace(/\[local\]/giu, localName).replace(/[@+/]/gu, '-');
};
exports.getLocalIdent = getLocalIdent;
const generateScopedNameFactory = localIdentName => (localName, assetPath) => escapeLocalident(getLocalIdent({
  resourcePath: assetPath
}, localIdentName, localName, {}));
exports.generateScopedNameFactory = generateScopedNameFactory;
//# sourceMappingURL=utils.js.map