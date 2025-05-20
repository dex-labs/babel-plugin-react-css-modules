"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = require("path");
var _core = require("@babel/core");
var _pluginSyntaxJsx = _interopRequireDefault(require("@babel/plugin-syntax-jsx"));
var _types = _interopRequireDefault(require("@babel/types"));
var _ajv = _interopRequireDefault(require("ajv"));
var _ajvKeywords = _interopRequireDefault(require("ajv-keywords"));
var _attributeNameExists = _interopRequireDefault(require("./attributeNameExists"));
var _createObjectExpression = _interopRequireDefault(require("./createObjectExpression"));
var _createSpreadMapper = _interopRequireDefault(require("./createSpreadMapper"));
var _handleSpreadClassName = _interopRequireDefault(require("./handleSpreadClassName"));
var _replaceJsxExpressionContainer = _interopRequireDefault(require("./replaceJsxExpressionContainer"));
var _requireCssModule = _interopRequireDefault(require("./requireCssModule"));
var _resolveStringLiteral = _interopRequireDefault(require("./resolveStringLiteral"));
var _optionsDefaults = _interopRequireDefault(require("./schemas/optionsDefaults"));
var _optionsSchema = _interopRequireDefault(require("./schemas/optionsSchema.json"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const ajv = new _ajv.default({
  $data: true
});
(0, _ajvKeywords.default)(ajv);
const validate = ajv.compile(_optionsSchema.default);
const getTargetResourcePath = (importedPath, stats) => {
  const targetFileDirectoryPath = (0, _path.dirname)(stats.file.opts.filename);
  if (importedPath.startsWith('.')) {
    return (0, _path.resolve)(targetFileDirectoryPath, importedPath);
  }
  return require.resolve(importedPath);
};
const isFilenameExcluded = (filename, exclude) => filename.match(new RegExp(exclude, 'u'));
const notForPlugin = (importedPath, stats) => {
  const extension = importedPath.lastIndexOf('.') > -1 ? importedPath.slice(importedPath.lastIndexOf('.')) : null;
  if (extension !== '.css') {
    const {
      filetypes
    } = stats.opts;
    if (!filetypes || !filetypes[extension]) return true;
  }
  const filename = getTargetResourcePath(importedPath, stats);
  if (stats.opts.exclude && isFilenameExcluded(filename, stats.opts.exclude)) {
    return true;
  }
  return false;
};
var _default = ({
  types
}) => {
  const styleMapsForFileByName = {};
  const styleMapsForFileByPath = {};
  let skip = false;
  const setupFileForRuntimeResolution = (path, filename) => {
    const programPath = path.findParent(parentPath => parentPath.isProgram());
    styleMapsForFileByName[filename].importedHelperIndentifier = programPath.scope.generateUidIdentifier('getClassName');
    styleMapsForFileByName[filename].styleModuleImportMapIdentifier = programPath.scope.generateUidIdentifier('styleModuleImportMap');
    programPath.unshiftContainer('body', types.importDeclaration([types.importDefaultSpecifier(styleMapsForFileByName[filename].importedHelperIndentifier)], types.stringLiteral('@dr.pogodin/babel-plugin-react-css-modules/dist/browser/getClassName.js')));
    const firstNonImportDeclarationNode = programPath.get('body').find(node => !types.isImportDeclaration(node));
    firstNonImportDeclarationNode.insertBefore(types.variableDeclaration('const', [types.variableDeclarator(types.cloneNode(styleMapsForFileByName[filename].styleModuleImportMapIdentifier), (0, _createObjectExpression.default)(types, styleMapsForFileByName[filename].styleModuleImportMap))]));
  };

  /**
   * Adds Webpack "hot module accept" code "a-la CommonJS" style,
   * i.e. using module.hot.
   * @param {object} path
   */
  const addCommonJsWebpackHotModuleAccept = (path, importedPath) => {
    const test = types.memberExpression(types.identifier('module'), types.identifier('hot'));
    const consequent = types.blockStatement([types.expressionStatement(types.callExpression(types.memberExpression(types.memberExpression(types.identifier('module'), types.identifier('hot')), types.identifier('accept')), [types.stringLiteral(importedPath), types.functionExpression(null, [], types.blockStatement([types.expressionStatement(types.callExpression(types.identifier('require'), [types.stringLiteral(importedPath)]))]))]))]);
    const programPath = path.findParent(parentPath => parentPath.isProgram());
    const firstNonImportDeclarationNode = programPath.get('body').find(node => !types.isImportDeclaration(node));
    const hotAcceptStatement = types.ifStatement(test, consequent);
    if (firstNonImportDeclarationNode) {
      firstNonImportDeclarationNode.insertBefore(hotAcceptStatement);
    } else {
      programPath.pushContainer('body', hotAcceptStatement);
    }
  };

  /**
   * Adds Webpack "hot module accept" code "a-la ESM" style,
   * i.e. using import.meta.webpackHot
   * @param {object} path
   */
  const addEsmWebpackHotModuleAccept = (path, importedPath) => {
    const test = types.memberExpression(types.memberExpression(types.identifier('import'), types.identifier('meta')), types.identifier('webpackHot'));
    const consequent = types.blockStatement([types.expressionStatement(types.callExpression(types.memberExpression(types.memberExpression(types.memberExpression(types.identifier('import'), types.identifier('meta')), types.identifier('webpackHot')), types.identifier('accept')), [types.stringLiteral(importedPath), types.functionExpression(null, [], types.blockStatement([types.expressionStatement(types.callExpression(types.identifier('require'), [types.stringLiteral(importedPath)]))]))]))]);
    const programPath = path.findParent(parentPath => parentPath.isProgram());
    const firstNonImportDeclarationNode = programPath.get('body').find(node => !types.isImportDeclaration(node));
    const hotAcceptStatement = types.ifStatement(test, consequent);
    if (firstNonImportDeclarationNode) {
      firstNonImportDeclarationNode.insertBefore(hotAcceptStatement);
    } else {
      programPath.pushContainer('body', hotAcceptStatement);
    }
  };
  const loadStyleMap = (name, importedPath, resolvedPath, path, stats) => {
    const {
      file: {
        opts: {
          filename
        }
      },
      opts: {
        context,
        filetypes = {},
        generateScopedName,
        transform
      }
    } = stats;
    const mapsByName = styleMapsForFileByName[filename].styleModuleImportMap;
    let styleMap = mapsByName[name];

    // In case it was loaded under a different name before.
    if (!styleMap) {
      styleMap = styleMapsForFileByPath[filename][importedPath];
      mapsByName[name] = styleMap;
    }

    // Loading a map for the first time.
    if (!styleMap) {
      styleMap = (0, _requireCssModule.default)(resolvedPath, {
        context,
        filetypes,
        generateScopedName,
        transform
      });
      mapsByName[name] = styleMap;
      styleMapsForFileByPath[filename][importedPath] = styleMap;
      const {
        replaceImport,
        webpackHotModuleReloading
      } = stats.opts;

      // replaceImport flag means we target server-side environment,
      // thus client-side Webpack's HMR code should not be injected.
      if (!replaceImport) {
        if (webpackHotModuleReloading === 'commonjs') {
          addCommonJsWebpackHotModuleAccept(path, importedPath);
        } else if (webpackHotModuleReloading) {
          addEsmWebpackHotModuleAccept(path, importedPath);
        }
      }
    }
    return styleMap;
  };
  return {
    inherits: _pluginSyntaxJsx.default,
    visitor: {
      // const styles = require('./styles.css');
      CallExpression(path, stats) {
        const {
          callee: {
            name: calleeName
          },
          arguments: args
        } = path.node;
        if (skip || calleeName !== 'require' || !args.length || !types.isStringLiteral(args[0])) return;
        const importedPath = args[0].value;
        if (notForPlugin(importedPath, stats)) return;
        const targetResourcePath = getTargetResourcePath(importedPath, stats);
        const isAssigned = path.parentPath.type === 'VariableDeclarator';
        const styleImportName = isAssigned ? path.parentPath.node.id.name : importedPath;
        const styleMap = loadStyleMap(styleImportName, importedPath, targetResourcePath, path, stats);
        if (stats.opts.replaceImport) {
          if (isAssigned) {
            path.replaceWith((0, _createObjectExpression.default)(types, styleMap));
          } else path.remove();
        } else if (stats.opts.removeImport) {
          path.remove();
        }
      },
      // All these are supposed to be supported by this visitor:
      // import styles from './style.css';
      // import * as styles from './style.css';
      // import { className } from './style.css';
      // import Style, { className } from './style.css';
      ImportDeclaration(path, stats) {
        const importedPath = path.node.source.value;
        if (skip || notForPlugin(importedPath, stats)) return;
        const targetResourcePath = getTargetResourcePath(importedPath, stats);
        let styleImportName;
        const {
          specifiers
        } = path.node;
        const guardStyleImportNameIsNotSet = () => {
          if (styleImportName) {
            // If this throws, it means we are missing something in our logic
            // below, and although it might look functional, it does not produce
            // determenistic style import selection.
            console.warn('Please report your use case. https://github.com/birdofpreyru/babel-plugin-react-css-modules/issues/new?title=Unexpected+use+case.');
            throw Error('Style import name is already selected');
          }
        };
        for (let i = 0; i < specifiers.length; ++i) {
          const specifier = specifiers[i];
          switch (specifier.type) {
            // import Style from './style.css';
            case 'ImportDefaultSpecifier':
              guardStyleImportNameIsNotSet();
              styleImportName = specifier.local.name;
              break;

            // import * as Style from './style.css';
            case 'ImportNamespaceSpecifier':
              guardStyleImportNameIsNotSet();
              styleImportName = specifier.local.name;
              break;

            // These are individual class names in the named import:
            // import { className } from './style.css';
            // we just ignore them, falling back to either the default
            // import, or the imported path.
            case 'ImportSpecifier':
              break;
            default:
              // eslint-disable-next-line no-console
              console.warn('Please report your use case. https://github.com/birdofpreyru/babel-plugin-react-css-modules/issues/new?title=Unexpected+use+case.');
              throw new Error('Unexpected use case.');
          }
        }

        // Fallback for anonymous style import:
        // import './style.css';
        if (styleImportName === undefined) styleImportName = importedPath;
        const styleMap = loadStyleMap(styleImportName, importedPath, targetResourcePath, path, stats);
        if (stats.opts.replaceImport) {
          const variables = [];
          for (let i = 0; i < specifiers.length; ++i) {
            const specifier = specifiers[i];
            switch (specifier.type) {
              case 'ImportDefaultSpecifier':
              case 'ImportNamespaceSpecifier':
                variables.push(types.variableDeclarator(types.identifier(specifier.local.name), (0, _createObjectExpression.default)(types, styleMap)));
                break;
              case 'ImportSpecifier':
                {
                  const value = styleMap[specifier.imported.name];
                  variables.push(types.variableDeclarator(types.identifier(specifier.local.name), value === undefined ? undefined : types.stringLiteral(value)));
                  break;
                }
              default:
                throw Error('Unsupported kind of import');
            }
          }
          if (variables.length) {
            path.replaceWith(types.variableDeclaration('const', variables));
          } else path.remove();
        } else if (stats.opts.removeImport) {
          path.remove();
        }
      },
      JSXElement(path, stats) {
        if (skip) {
          return;
        }
        const {
          filename
        } = stats.file.opts;
        if (stats.opts.exclude && isFilenameExcluded(filename, stats.opts.exclude)) {
          return;
        }
        let {
          attributeNames
        } = _optionsDefaults.default;
        if (stats.opts && stats.opts.attributeNames) {
          attributeNames = {
            ...attributeNames,
            ...stats.opts.attributeNames
          };
        }
        const attributes = path.node.openingElement.attributes.filter(attribute => typeof attribute.name !== 'undefined' && typeof attributeNames[attribute.name.name] === 'string');
        if (attributes.length === 0) {
          return;
        }
        const {
          handleMissingStyleName = _optionsDefaults.default.handleMissingStyleName,
          autoResolveMultipleImports = _optionsDefaults.default.autoResolveMultipleImports
        } = stats.opts || {};
        const spreadMap = (0, _createSpreadMapper.default)(path, stats);
        attributes.forEach(attribute => {
          const destinationName = attributeNames[attribute.name.name];
          const options = {
            autoResolveMultipleImports,
            handleMissingStyleName
          };
          if (types.isStringLiteral(attribute.value)) {
            (0, _resolveStringLiteral.default)(path, styleMapsForFileByName[filename].styleModuleImportMap, attribute, destinationName, options);
          } else if (types.isJSXExpressionContainer(attribute.value)) {
            if (!styleMapsForFileByName[filename].importedHelperIndentifier) {
              setupFileForRuntimeResolution(path, filename);
            }
            (0, _replaceJsxExpressionContainer.default)(types, path, attribute, destinationName, styleMapsForFileByName[filename].importedHelperIndentifier, types.cloneNode(styleMapsForFileByName[filename].styleModuleImportMapIdentifier), options);
          }
          if (spreadMap[destinationName]) {
            (0, _handleSpreadClassName.default)(path, destinationName, spreadMap[destinationName]);
          }
        });
      },
      Program(path, stats) {
        if (!validate(stats.opts)) {
          // eslint-disable-next-line no-console
          console.error(validate.errors);
          throw new Error('Invalid configuration');
        }
        const {
          filename
        } = stats.file.opts;
        styleMapsForFileByName[filename] = {
          styleModuleImportMap: {}
        };
        styleMapsForFileByPath[filename] = {};
        if (stats.opts.skip && !(0, _attributeNameExists.default)(path, stats)) {
          skip = true;
        }
      }
    }
  };
};
exports.default = _default;
//# sourceMappingURL=index.js.map