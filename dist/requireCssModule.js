"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fs = require("fs");
var _path = require("path");
var _postcssModulesParser = _interopRequireDefault(require("@dr.pogodin/postcss-modules-parser"));
var _postcss = _interopRequireDefault(require("postcss"));
var _postcssModulesExtractImports = _interopRequireDefault(require("postcss-modules-extract-imports"));
var _postcssModulesLocalByDefault = _interopRequireDefault(require("postcss-modules-local-by-default"));
var _postcssModulesScope = _interopRequireDefault(require("postcss-modules-scope"));
var _postcssModulesValues = _interopRequireDefault(require("postcss-modules-values"));
var _getLocalIdent = _interopRequireWildcard(require("./getLocalIdent"));
var _optionsDefaults = _interopRequireDefault(require("./schemas/optionsDefaults"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* eslint-enable flowtype/no-mixed */
/* eslint-disable flowtype/no-weak-types */
/* eslint-enable flowtype/no-weak-types */
const getFiletypeOptions = (cssSourceFilePath, filetypes) => {
  const extension = cssSourceFilePath.slice(cssSourceFilePath.lastIndexOf('.'));
  const filetype = filetypes ? filetypes[extension] : null;
  return filetype;
};
const getSyntax = filetypeOptions => {
  if (!filetypeOptions || !filetypeOptions.syntax) {
    return null;
  }

  // eslint-disable-next-line global-require, import/no-dynamic-require
  return require(filetypeOptions.syntax);
};
const getExtraPlugins = filetypeOptions => {
  if (!filetypeOptions || !filetypeOptions.plugins) {
    return [];
  }
  return filetypeOptions.plugins.map(plugin => {
    if (Array.isArray(plugin)) {
      const [pluginName, pluginOptions] = plugin;

      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(pluginName)(pluginOptions);
    }

    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(plugin);
  });
};
const getTokens = (extraPluginsRunner, runner, cssSourceFilePath, filetypeOptions, pluginOptions) => {
  const options = {
    from: cssSourceFilePath
  };
  if (filetypeOptions) {
    options.syntax = getSyntax(filetypeOptions);
  }
  let res;
  try {
      res = (0, _fs.readFileSync)(cssSourceFilePath, "utf-8");
  } catch (e) {
      res = "";
  }
  if (pluginOptions.transform) {
    res = pluginOptions.transform(res, cssSourceFilePath, pluginOptions);
  }
  if (extraPluginsRunner) {
    res = extraPluginsRunner.process(res, options);
  }
  res = runner.process(res, options);
  res.warnings().forEach(message => {
    // eslint-disable-next-line no-console
    console.warn(message.text);
  });
  return res.root.tokens;
};
var _default = (cssSourceFilePath, options) => {
  // eslint-disable-next-line prefer-const
  let runner;
  let generateScopedName;
  if (options.generateScopedName && typeof options.generateScopedName === 'function') {
    generateScopedName = options.generateScopedName;
  } else {
    generateScopedName = (clazz, resourcePath) => (0, _getLocalIdent.default)(
    // TODO: The loader context used by "css-loader" may has additional
    // stuff inside this argument (loader context), allowing for some edge
    // cases (though, presumably not with a typical configurations)
    // we don't support (yet?).
    {
      resourcePath
    }, options.generateScopedName || _optionsDefaults.default.generateScopedName, (0, _getLocalIdent.unescape)(clazz), {
      clazz,
      context: options.context || process.cwd(),
      // TODO: These options should match their counterparts in Webpack
      // configuration:
      //  - https://webpack.js.org/configuration/output/#outputhashdigest
      //  - https://webpack.js.org/configuration/output/#outputhashdigestlength
      //  - https://webpack.js.org/configuration/output/#outputhashfunction
      //  - https://webpack.js.org/configuration/output/#outputhashsalt
      // and they should be exposed as babel-plugin-react-css-modules
      // options. However, for now they are just hardcoded equal to
      // the Webpack's default settings.
      hashDigest: 'hex',
      hashDigestLength: 20,
      hashFunction: 'md4',
      hashSalt: '',
      // TODO: This option was introduced by css-loader@6.6.0.
      // To keep getLocalIdent() in sync with css-loader implementation,
      // I updated the code there, but similar to the parameters above,
      // it is not yet exposed as this plugin's option.
      hashStrategy: 'resource-path-and-local-name',
      // TODO: This one allows for some path modifications during
      // the transform. Probably, not a Webpack param.
      regExp: ''
    });
  }
  const filetypeOptions = getFiletypeOptions(cssSourceFilePath, options.filetypes);
  const extraPlugins = getExtraPlugins(filetypeOptions);
  const extraPluginsRunner = extraPlugins.length && (0, _postcss.default)(extraPlugins);
  const fetch = (to, from) => {
    const fromDirectoryPath = (0, _path.dirname)(from);
    const toPath = (0, _path.resolve)(fromDirectoryPath, to);
    return getTokens(extraPluginsRunner, runner, toPath, filetypeOptions, options);
  };
  const plugins = [_postcssModulesValues.default, _postcssModulesLocalByDefault.default, _postcssModulesExtractImports.default, (0, _postcssModulesScope.default)({
    generateScopedName
  }), new _postcssModulesParser.default({
    fetch
  })];
  runner = (0, _postcss.default)(plugins);
  return getTokens(extraPluginsRunner, runner, cssSourceFilePath, filetypeOptions, options);
};
exports.default = _default;
//# sourceMappingURL=requireCssModule.js.map
