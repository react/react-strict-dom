/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Mapping of React Native's non-standard logical properties to their
// W3C standard equivalents, as used by React Strict DOM.
const LOGICAL_PROPERTY_TRANSFORMS = {
  borderBottomEndRadius: 'borderEndEndRadius',
  borderBottomStartRadius: 'borderEndStartRadius',
  borderEndColor: 'borderInlineEndColor',
  borderEndStyle: 'borderInlineEndStyle',
  borderEndWidth: 'borderInlineEndWidth',
  borderStartColor: 'borderInlineStartColor',
  borderStartStyle: 'borderInlineStartStyle',
  borderStartWidth: 'borderInlineStartWidth',
  borderTopEndRadius: 'borderStartEndRadius',
  borderTopStartRadius: 'borderStartStartRadius',
  end: 'insetInlineEnd',
  marginEnd: 'marginInlineEnd',
  marginHorizontal: 'marginInline',
  marginStart: 'marginInlineStart',
  marginVertical: 'marginBlock',
  paddingEnd: 'paddingInlineEnd',
  paddingHorizontal: 'paddingInline',
  paddingStart: 'paddingInlineStart',
  paddingVertical: 'paddingBlock',
  start: 'insetInlineStart'
};

// Handle style property name transformations
function transformStyleProperty(t, styleDeclarationPath) {
  const styleDeclaration = styleDeclarationPath.node;
  if (styleDeclaration.key?.type !== 'Identifier') {
    return;
  }
  const styleProperty = styleDeclaration.key;
  const styleValue = styleDeclaration.value;

  const currentPropertyName = styleProperty.name;

  // Transform non-standard logical CSS properties
  const standardLogicalPropertyName =
    LOGICAL_PROPERTY_TRANSFORMS[currentPropertyName];

  if (standardLogicalPropertyName) {
    if (
      styleValue?.type === 'StringLiteral' ||
      styleValue?.type === 'NumericLiteral' ||
      styleValue?.type === 'NullLiteral'
    ) {
      // Number values
      const isValueNumber = styleValue.type === 'NumericLiteral';
      // String 'auto'
      const isValueAuto =
        styleValue.type === 'StringLiteral' && styleValue.value === 'auto';
      // Strings ending with 'px' or '%'
      const isValueLength =
        styleValue.type === 'StringLiteral' &&
        (styleValue.value.endsWith('px') || styleValue.value.endsWith('%'));
      // null values
      const isValidNull = styleValue.type === 'NullLiteral';
      // Color values (for borderEndColor, borderStartColor, etc.)
      const isColorProperty =
        currentPropertyName.includes('Color') &&
        styleValue.type === 'StringLiteral';

      const isValidValue =
        isValueNumber ||
        isValueAuto ||
        isValueLength ||
        isValidNull ||
        isColorProperty;

      if (isValidValue) {
        styleProperty.name = standardLogicalPropertyName;
      }
    }
  }

  // Transform 'fontVariant'
  // From array of strings to space-separated string
  if (
    currentPropertyName === 'fontVariant' &&
    styleValue?.type === 'ArrayExpression'
  ) {
    const elements = styleValue.elements;
    const stringValues = [];
    let allValid = true;

    for (const element of elements) {
      if (element?.type === 'StringLiteral') {
        stringValues.push(element.value);
      } else {
        allValid = false;
        break;
      }
    }

    if (allValid && stringValues.length > 0) {
      styleDeclarationPath.node.value = t.stringLiteral(stringValues.join(' '));
    }
  }

  // Transform 'textAlignVertical' (Android)
  if (
    currentPropertyName === 'textAlignVertical' &&
    styleValue?.type === 'StringLiteral'
  ) {
    const value = styleValue.value;
    styleDeclarationPath.node.key = t.identifier('verticalAlign');
    styleDeclarationPath.node.value = t.stringLiteral(
      value === 'center' ? 'middle' : value
    );
  }

  // Transform 'transform'
  // From React Native transform array to CSS transform string
  if (
    currentPropertyName === 'transform' &&
    styleValue?.type === 'ArrayExpression'
  ) {
    const elements = styleValue.elements;
    const transformFunctions = [];
    let allValid = true;

    for (const element of elements) {
      // Each item in the array is an object
      // e.g. { perspective: 50 }
      if (
        element?.type === 'ObjectExpression' &&
        element.properties.length === 1
      ) {
        const property = element.properties[0];
        if (
          property?.type === 'ObjectProperty' &&
          property.key?.type === 'Identifier'
        ) {
          const transformType = property.key.name;

          if (transformType === 'matrix' || transformType === 'matrix3d') {
            // For matrix transforms, the value should be an ArrayExpression
            if (property.value?.type === 'ArrayExpression') {
              const matrixValues = [];
              let matrixValid = true;

              for (const matrixElement of property.value.elements) {
                if (matrixElement?.type === 'NumericLiteral') {
                  matrixValues.push(matrixElement.value);
                } else {
                  matrixValid = false;
                  break;
                }
              }

              if (matrixValid && matrixValues.length > 0) {
                transformFunctions.push(
                  `${transformType}(${matrixValues.join(',')})`
                );
              } else {
                allValid = false;
                break;
              }
            } else {
              allValid = false;
              break;
            }
          } else {
            // For other transforms, the value should be a Literal
            if (
              property.value?.type === 'NumericLiteral' ||
              property.value?.type === 'StringLiteral'
            ) {
              const transformValue = property.value.value;
              let normalizedValue;

              if (typeof transformValue === 'number') {
                // Don't add px suffix for scale transforms
                if (
                  transformType === 'scale' ||
                  transformType === 'scaleX' ||
                  transformType === 'scaleY' ||
                  transformType === 'scaleZ'
                ) {
                  normalizedValue = transformValue.toString();
                } else {
                  normalizedValue = `${transformValue}px`;
                }
              } else if (typeof transformValue === 'string') {
                normalizedValue = transformValue;
              } else {
                allValid = false;
                break;
              }
              transformFunctions.push(`${transformType}(${normalizedValue})`);
            } else {
              allValid = false;
              break;
            }
          }
        } else {
          allValid = false;
          break;
        }
      } else {
        allValid = false;
        break;
      }
    }

    if (allValid && transformFunctions.length > 0) {
      styleDeclarationPath.node.value = t.stringLiteral(
        transformFunctions.join(' ')
      );
    }
  }

  // Transform 'transformOrigin'
  // From array of strings/numbers to space-separated string
  if (
    currentPropertyName === 'transformOrigin' &&
    styleValue?.type === 'ArrayExpression'
  ) {
    const elements = styleValue.elements;
    const stringValues = [];
    let allValid = true;

    for (const element of elements) {
      if (element?.type === 'StringLiteral') {
        stringValues.push(element.value);
      } else if (element?.type === 'NumericLiteral') {
        stringValues.push(`${element.value}px`);
      } else {
        allValid = false;
        break;
      }
    }

    if (allValid && stringValues.length > 0) {
      styleDeclarationPath.node.value = t.stringLiteral(stringValues.join(' '));
    }
  }

  // Transform 'writingDirection' (iOS)
  if (
    currentPropertyName === 'writingDirection' &&
    styleValue?.type === 'StringLiteral'
  ) {
    styleProperty.name = 'direction';
  }
}

function reactNativeMigratePlugin({ types: t }) {
  const reactNativeElementMap = new Map([
    ['View', 'html.div'],
    ['Text', 'html.span'],
    ['Image', 'html.img'],
    ['ScrollView', 'html.div'],
    ['TextInput', 'html.input'],
    ['Switch', 'html.input'],
    ['Button', 'html.button']
  ]);

  return {
    name: 'react-native-migrate',
    visitor: {
      Program: {
        enter(path, state) {
          state.hasTransformedElements = false;
          state.hasStyleSheetCreate = false;
          state.hasReactNativeStyles = false;
          state.usedReactNativeElements = new Set();
        },
        exit(path, state) {
          if (!state.hasTransformedElements && !state.hasStyleSheetCreate) {
            return;
          }

          let unusedReactNativeImportPath = null;
          let hasStyleSheetImport = false;
          let hasReactNativeStylesImport = false;

          // Remove unused React Native imports and check for StyleSheet
          path.traverse({
            ImportDeclaration(importPath) {
              if (importPath.node.source.value === 'react-native') {
                const remainingSpecifiers = importPath.node.specifiers.filter(
                  (spec) => {
                    if (
                      spec.type === 'ImportSpecifier' &&
                      spec.imported?.name
                    ) {
                      if (spec.imported.name === 'StyleSheet') {
                        hasStyleSheetImport = true;
                        return false; // Remove StyleSheet import
                      }
                      return !state.usedReactNativeElements.has(
                        spec.imported.name
                      );
                    }
                    return true;
                  }
                );

                if (remainingSpecifiers.length === 0) {
                  unusedReactNativeImportPath = importPath;
                } else if (
                  remainingSpecifiers.length !==
                  importPath.node.specifiers.length
                ) {
                  importPath.node.specifiers = remainingSpecifiers;
                }
              }
              // Check if reactNativeStyles is already imported
              if (importPath.node.source.value === 'reactNativeStyles') {
                hasReactNativeStylesImport = true;
              }
            }
          });

          const newImports = [];

          // Add react-strict-dom import if we transformed elements
          if (state.hasTransformedElements) {
            const rsdImportDecl = createImport(t, ['html'], 'react-strict-dom');
            newImports.push(rsdImportDecl);
          }

          // Add reactNativeStyles import if we added styles and it's not already imported
          if (state.hasReactNativeStyles && !hasReactNativeStylesImport) {
            const reactNativeStylesImportDecl = createDefaultImport(
              t,
              'reactNativeStyles',
              'reactNativeStyles'
            );
            newImports.push(reactNativeStylesImportDecl);
          }

          // Add stylex import if we found StyleSheet usage
          if (state.hasStyleSheetCreate && hasStyleSheetImport) {
            const stylexImportDecl = createDefaultImport(t, 'stylex', 'stylex');
            newImports.push(stylexImportDecl);
          }

          if (newImports.length > 0) {
            if (unusedReactNativeImportPath != null) {
              unusedReactNativeImportPath.remove();
            }
            path.unshiftContainer('body', newImports);
          }
        }
      },
      CallExpression(path, state) {
        const node = path.node;
        // Handle StyleSheet.create() calls
        if (
          node.callee?.type === 'MemberExpression' &&
          node.callee.object?.type === 'Identifier' &&
          node.callee.object.name === 'StyleSheet' &&
          node.callee.property?.type === 'Identifier' &&
          node.callee.property.name === 'create'
        ) {
          // Replace StyleSheet.create with stylex.create
          node.callee.object.name = 'stylex';
          state.hasStyleSheetCreate = true;

          // Process the argument object to modify style rules
          if (
            node.arguments.length > 0 &&
            node.arguments[0].type === 'ObjectExpression'
          ) {
            const styleRulesPath = path.get('arguments.0');

            // Iterate through each style key (e.g., 'root', 'container', 'text', etc.)
            for (const propertyPath of styleRulesPath.get('properties')) {
              if (
                propertyPath.node.type === 'ObjectProperty' &&
                propertyPath.node.value?.type === 'ObjectExpression'
              ) {
                // Iterate through each style declaration within the style rule
                for (const styleDeclarationPath of propertyPath.get(
                  'value.properties'
                )) {
                  if (styleDeclarationPath.node.type === 'ObjectProperty') {
                    transformStyleProperty(t, styleDeclarationPath);
                  }
                }
              }
            }
          }
        }
      },
      JSXElement(path, state) {
        const node = path.node;
        const openingElement = node.openingElement;
        const closingElement = node.closingElement;

        if (openingElement.name.type !== 'JSXIdentifier') {
          return;
        }

        const reactNativeElementName = openingElement.name.name;
        let targetElement = reactNativeElementMap.get(reactNativeElementName);

        if (targetElement == null) {
          return;
        }

        const attributes = openingElement.attributes || [];

        const newAttributes = [];

        // Check if we need conditional rendering for TextInput with multiline expression
        let needsConditionalTextInputRendering = false;
        let textInputMultilineValue = null;
        let textInputnumberOfLinesValue = null;

        // Iterate over all React Native attributes to build up the array
        // of React Strict DOM attributes. If we encounter literals, we can
        // perform more complete transforms. Otherwise we generate expressions
        // to resolve the correct value at runtime where possible.
        for (const attr of attributes) {
          if (attr.type === 'JSXSpreadAttribute') {
            newAttributes.push(attr);
          }
          // Transform 'accessibilityElementsHidden' (iOS) to 'aria-hidden'
          else if (isJSXAttributeNamed(attr, 'accessibilityElementsHidden')) {
            newAttributes.push(
              t.jsxAttribute(t.jsxIdentifier('aria-hidden'), attr.value)
            );
          }
          // Transform 'accessibilityLabel' to 'aria-label'
          else if (isJSXAttributeNamed(attr, 'accessibilityLabel')) {
            newAttributes.push(
              t.jsxAttribute(t.jsxIdentifier('aria-label'), attr.value)
            );
          }
          // Transform 'accessibilityLabelledBy' (Android) to 'aria-labelledby'
          else if (isJSXAttributeNamed(attr, 'accessibilityLabelledBy')) {
            newAttributes.push(
              t.jsxAttribute(t.jsxIdentifier('aria-labelledby'), attr.value)
            );
          }
          // Transform 'accessibilityLiveRegion' (Android) to 'aria-live'
          else if (isJSXAttributeNamed(attr, 'accessibilityLiveRegion')) {
            if (
              attr.value?.type === 'StringLiteral' &&
              typeof attr.value.value === 'string'
            ) {
              const value = attr.value.value;
              newAttributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('aria-live'),
                  t.stringLiteral(value === 'none' ? 'off' : value)
                )
              );
            } else if (
              attr.value != null &&
              attr.value.type === 'JSXExpressionContainer' &&
              attr.value.expression != null &&
              attr.value.expression.type !== 'JSXEmptyExpression'
            ) {
              const expression = attr.value.expression;
              newAttributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('aria-live'),
                  t.jsxExpressionContainer(
                    t.conditionalExpression(
                      t.binaryExpression(
                        '===',
                        expression,
                        t.stringLiteral('off')
                      ),
                      t.stringLiteral('none'),
                      expression
                    )
                  )
                )
              );
            }
          }
          // Transform 'accessibilityRole' to 'role' (or element)
          else if (isJSXAttributeNamed(attr, 'accessibilityRole')) {
            if (
              attr.value?.type === 'StringLiteral' &&
              typeof attr.value.value === 'string'
            ) {
              const roleValue = attr.value.value;
              // Special handling for "button" and "header" values.
              // These roles can map directly to `html.*` elements.
              if (roleValue === 'button' || roleValue === 'header') {
                // Skip this attribute (don't add to newAttributes)
                if (roleValue === 'button') {
                  targetElement = 'html.button';
                } else if (roleValue === 'header') {
                  targetElement = 'html.header';
                }
              } else {
                // For other values, transform to `role`.
                // Map to ARIA role as needed.
                let mappedValue;
                switch (roleValue) {
                  case 'adjustable':
                    mappedValue = 'slider';
                    break;
                  case 'image':
                    mappedValue = 'img';
                    break;
                  case 'alert':
                  case 'checkbox':
                  case 'combobox':
                  case 'link':
                  case 'menu':
                  case 'menubar':
                  case 'menuitem':
                  case 'none':
                  case 'progressbar':
                  case 'radio':
                  case 'radiogroup':
                  case 'scrollbar':
                  case 'search':
                  case 'spinbutton':
                  case 'switch':
                  case 'tab':
                  case 'tablist':
                  case 'timer':
                  case 'toolbar':
                    mappedValue = roleValue;
                    break;
                  default:
                    // Not a valid role
                    mappedValue = null;
                }
                if (mappedValue != null) {
                  // Change prop name to 'role' and update value
                  const newValue =
                    mappedValue !== roleValue
                      ? t.stringLiteral(mappedValue)
                      : attr.value;
                  newAttributes.push(
                    t.jsxAttribute(t.jsxIdentifier('role'), newValue)
                  );
                }
              }
            } else {
              newAttributes.push(
                t.jsxAttribute(t.jsxIdentifier('role'), attr.value)
              );
            }
          }
          // Transform 'accessibilityState' to ARIA props
          else if (isJSXAttributeNamed(attr, 'accessibilityState')) {
            if (
              attr.value?.type === 'JSXExpressionContainer' &&
              attr.value.expression?.type === 'ObjectExpression'
            ) {
              const objectExpr = attr.value.expression;
              // Process each property in the accessibilityState object
              for (const prop of objectExpr.properties) {
                if (
                  prop.type === 'ObjectProperty' &&
                  prop.key?.type === 'Identifier'
                ) {
                  const key = prop.key.name;
                  const value = prop.value;
                  // Create aria-* attribute for each property
                  const jsxValue =
                    value.type === 'StringLiteral'
                      ? t.stringLiteral(value.value)
                      : t.jsxExpressionContainer(value);
                  newAttributes.push(
                    t.jsxAttribute(t.jsxIdentifier(`aria-${key}`), jsxValue)
                  );
                }
              }
            } else if (
              attr.value?.type === 'JSXExpressionContainer' &&
              attr.value.expression != null &&
              attr.value.expression.type !== 'JSXEmptyExpression'
            ) {
              const expression = attr.value.expression;
              ['busy', 'checked', 'disabled', 'expanded', 'selected'].forEach(
                (key) => {
                  newAttributes.push(
                    t.jsxAttribute(
                      t.jsxIdentifier(`aria-${key}`),
                      t.jsxExpressionContainer(
                        t.optionalMemberExpression(
                          expression,
                          t.identifier(key),
                          false,
                          true
                        )
                      )
                    )
                  );
                }
              );
            }
          }
          // Transform 'accessibilityValue' to ARIA props
          else if (isJSXAttributeNamed(attr, 'accessibilityValue')) {
            if (
              attr.value?.type === 'JSXExpressionContainer' &&
              attr.value.expression?.type === 'ObjectExpression'
            ) {
              const objectExpr = attr.value.expression;
              // Process each property in the accessibilityValue object
              for (const prop of objectExpr.properties) {
                if (
                  prop.type === 'ObjectProperty' &&
                  prop.key?.type === 'Identifier'
                ) {
                  const key = prop.key.name;
                  const value = prop.value;
                  // Create aria-* attribute for each property
                  const jsxValue =
                    value.type === 'StringLiteral'
                      ? t.stringLiteral(value.value)
                      : t.jsxExpressionContainer(value);
                  newAttributes.push(
                    t.jsxAttribute(
                      t.jsxIdentifier(`aria-value${key}`),
                      jsxValue
                    )
                  );
                }
              }
            } else if (
              attr.value?.type === 'JSXExpressionContainer' &&
              attr.value.expression != null &&
              attr.value.expression.type !== 'JSXEmptyExpression'
            ) {
              const expression = attr.value.expression;
              ['max', 'min', 'now', 'text'].forEach((key) => {
                newAttributes.push(
                  t.jsxAttribute(
                    t.jsxIdentifier(`aria-value${key}`),
                    t.jsxExpressionContainer(
                      t.optionalMemberExpression(
                        expression,
                        t.identifier(key),
                        false,
                        true
                      )
                    )
                  )
                );
              });
            }
          }
          // Transform 'accessibilityViewIsModal' (iOS) to 'aria-modal'
          else if (isJSXAttributeNamed(attr, 'accessibilityViewIsModal')) {
            newAttributes.push(
              t.jsxAttribute(t.jsxIdentifier('aria-modal'), attr.value)
            );
          }
          // Transform 'focusable' (Android) to 'tabIndex'
          else if (isJSXAttributeNamed(attr, 'focusable')) {
            const isFocusable = isJSXAttributeBoolean(attr, true);
            const isFocusableFalse = isJSXAttributeBoolean(attr, false);
            if (isFocusable) {
              newAttributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('tabIndex'),
                  t.stringLiteral('0')
                )
              );
            } else if (
              !isFocusableFalse &&
              attr.value?.type === 'JSXExpressionContainer' &&
              attr.value.expression != null &&
              attr.value.expression.type !== 'JSXEmptyExpression'
            ) {
              const expression = attr.value.expression;
              newAttributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('tabIndex'),
                  t.jsxExpressionContainer(
                    t.conditionalExpression(
                      t.binaryExpression(
                        '===',
                        expression,
                        t.booleanLiteral(true)
                      ),
                      t.stringLiteral('0'),
                      t.identifier('undefined')
                    )
                  )
                )
              );
            }
          }
          // Transform 'importantForAccessibility' (Android) to 'aria-hidden'
          else if (isJSXAttributeNamed(attr, 'importantForAccessibility')) {
            const noHideDescendants = 'no-hide-descendants';
            if (
              attr.value?.type === 'StringLiteral' &&
              attr.value.value === noHideDescendants
            ) {
              newAttributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('aria-hidden'),
                  t.jsxExpressionContainer(t.booleanLiteral(true))
                )
              );
            } else if (
              attr.value?.type === 'JSXExpressionContainer' &&
              attr.value.expression != null &&
              attr.value.expression.type !== 'JSXEmptyExpression'
            ) {
              const expression = attr.value.expression;
              newAttributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('aria-hidden'),
                  t.jsxExpressionContainer(
                    t.conditionalExpression(
                      t.binaryExpression(
                        '===',
                        expression,
                        t.stringLiteral(noHideDescendants)
                      ),
                      t.booleanLiteral(true),
                      t.identifier('undefined')
                    )
                  )
                )
              );
            }
          }
          // Transform 'multiline' (TextInput)
          else if (
            reactNativeElementName === 'TextInput' &&
            isJSXAttributeNamed(attr, 'multiline')
          ) {
            if (isJSXAttributeBoolean(attr, true)) {
              // Change the targetElement and ignore the attribute
              targetElement = 'html.textarea';
            } else if (
              !isJSXAttributeBoolean(attr, false) &&
              attr.value?.type === 'JSXExpressionContainer' &&
              attr.value.expression != null &&
              attr.value.expression.type !== 'JSXEmptyExpression'
            ) {
              // Mark for conditional rendering
              needsConditionalTextInputRendering = true;
              textInputMultilineValue = attr.value.expression;
            }
          }
          // Transform 'nativeID' to 'id'
          else if (isJSXAttributeNamed(attr, 'nativeID')) {
            newAttributes.push(
              t.jsxAttribute(t.jsxIdentifier('id'), attr.value)
            );
          }
          // Transform 'numberOfLines'
          else if (isJSXAttributeNamed(attr, 'numberOfLines')) {
            // ...to "rows"
            if (reactNativeElementName === 'TextInput') {
              if (needsConditionalTextInputRendering) {
                // Store for conditional rendering
                textInputnumberOfLinesValue = attr.value;
              } else {
                newAttributes.push(
                  t.jsxAttribute(t.jsxIdentifier('rows'), attr.value)
                );
              }
            }
          }
          // Transform 'source' to 'src' (Image)
          else if (
            reactNativeElementName === 'Image' &&
            isJSXAttributeNamed(attr, 'source') &&
            attr.value?.type === 'JSXExpressionContainer' &&
            attr.value.expression?.type === 'ObjectExpression'
          ) {
            const objectExpr = attr.value.expression;
            const uriProperty = objectExpr.properties.find(
              (prop) =>
                prop.type === 'ObjectProperty' &&
                prop.key?.type === 'Identifier' &&
                prop.key.name === 'uri'
            );
            if (
              uriProperty?.type === 'ObjectProperty' &&
              uriProperty.value?.type === 'StringLiteral'
            ) {
              const uriValue = uriProperty.value.value;
              newAttributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('src'),
                  t.stringLiteral(uriValue)
                )
              );
            }
          }
          // Transform 'style' attribute
          else if (isJSXAttributeNamed(attr, 'style')) {
            newAttributes.push(attr);
          }
          // Transform 'testID' to 'data-testid'
          else if (isJSXAttributeNamed(attr, 'testID')) {
            newAttributes.push(
              t.jsxAttribute(t.jsxIdentifier('data-testid'), attr.value)
            );
          }
          // Forward all other attributes for now
          else {
            newAttributes.push(attr);
          }
        }

        // Element-specific RSD attribute additions
        // Modify the style attribute
        if (
          reactNativeElementName === 'ScrollView' ||
          reactNativeElementName === 'Text' ||
          reactNativeElementName === 'TextInput' ||
          reactNativeElementName === 'View'
        ) {
          state.hasReactNativeStyles = true;
          let hasStyle = false;
          const styleName = {
            ScrollView: 'view',
            Text: 'text',
            TextInput: 'textInput',
            View: 'view'
          };
          for (let i = 0; i < newAttributes.length; i++) {
            const attr = newAttributes[i];
            if (
              typeof attr === 'object' &&
              attr.type === 'JSXAttribute' &&
              attr.name?.type === 'JSXIdentifier' &&
              attr.name.name === 'style'
            ) {
              if (attr.value != null) {
                hasStyle = true;
                // There's already a style prop, prepend reactNativeStyles.view
                let existingExpression;
                if (
                  attr.value.type === 'JSXExpressionContainer' &&
                  attr.value.expression != null &&
                  attr.value.expression.type !== 'JSXEmptyExpression'
                ) {
                  existingExpression = attr.value.expression;
                } else if (attr.value.type === 'StringLiteral') {
                  existingExpression = attr.value;
                } else {
                  // Skip transformation if we can't extract a valid expression
                  continue;
                }
                // Create a JSX expression container with an array of styles
                const memberExpr = t.memberExpression(
                  t.identifier('reactNativeStyles'),
                  t.identifier(styleName[reactNativeElementName])
                );
                const arrayExpr = t.arrayExpression([
                  memberExpr,
                  existingExpression
                ]);
                // Update the RSD style attribute with our changes
                newAttributes[i] = t.jsxAttribute(
                  t.jsxIdentifier('style'),
                  t.jsxExpressionContainer(arrayExpr)
                );
              }
            }
          }
          if (!hasStyle) {
            newAttributes.push(
              t.jsxAttribute(
                t.jsxIdentifier('style'),
                t.jsxExpressionContainer(
                  t.memberExpression(
                    t.identifier('reactNativeStyles'),
                    t.identifier(styleName[reactNativeElementName])
                  )
                )
              )
            );
          }
        }
        if (reactNativeElementName === 'Switch') {
          // Add type="checkbox" if not present
          newAttributes.push(
            t.jsxAttribute(t.jsxIdentifier('type'), t.stringLiteral('checkbox'))
          );
        }

        // Replace the entire attributes array
        openingElement.attributes = newAttributes;

        // Other transforms once attributes are updated
        if (reactNativeElementName === 'Button') {
          // Move title prop to children
          const titleAttr = openingElement.attributes.find(
            (attr) =>
              attr.type === 'JSXAttribute' &&
              attr.name?.type === 'JSXIdentifier' &&
              attr.name.name === 'title'
          );
          if (
            titleAttr?.type === 'JSXAttribute' &&
            titleAttr.value?.type === 'StringLiteral'
          ) {
            const textValue = titleAttr.value.value;
            // Remove title attribute and ensure element is not self-closing
            openingElement.attributes = openingElement.attributes.filter(
              (attr) => attr !== titleAttr
            );
            openingElement.selfClosing = false;

            // Ensure there's a closing element
            if (!closingElement && targetElement != null) {
              node.closingElement = t.jsxClosingElement(
                t.jsxIdentifier(targetElement)
              );
            }

            // Add title as text content - create a simple text node
            node.children = [t.jsxText(textValue)];
          }
        }

        // Handle conditional rendering for TextInput with multiline expression
        if (
          needsConditionalTextInputRendering &&
          textInputMultilineValue != null
        ) {
          // Create textarea attributes (add rows if numberOfLines exists)
          const textareaAttributes = [...newAttributes];
          if (textInputnumberOfLinesValue != null) {
            textareaAttributes.push(
              t.jsxAttribute(
                t.jsxIdentifier('rows'),
                textInputnumberOfLinesValue
              )
            );
          }

          // Create input attributes (same as newAttributes)
          const inputAttributes = [...newAttributes];

          // Create the conditional expression
          const conditionalExpr = t.conditionalExpression(
            t.binaryExpression(
              '===',
              textInputMultilineValue,
              t.booleanLiteral(true)
            ),
            t.jsxElement(
              t.jsxOpeningElement(
                t.jsxIdentifier('html.textarea'),
                textareaAttributes,
                true
              ),
              null,
              [],
              true
            ),
            t.jsxElement(
              t.jsxOpeningElement(
                t.jsxIdentifier('html.input'),
                inputAttributes,
                true
              ),
              null,
              [],
              true
            )
          );

          // Replace the entire JSX element with the conditional expression wrapped in braces
          path.replaceWith(t.jsxExpressionContainer(conditionalExpr));
        }
        // Transform element names
        else if (targetElement != null) {
          openingElement.name.name = targetElement;
          if (closingElement?.name?.type === 'JSXIdentifier') {
            closingElement.name.name = targetElement;
          }
        }

        state.hasTransformedElements = true;
        state.usedReactNativeElements.add(reactNativeElementName);
      }
    }
  };
}

function createImport(t, importNames, moduleName, importKind = 'value') {
  return t.importDeclaration(
    importNames.map((importName) =>
      t.importSpecifier(t.identifier(importName), t.identifier(importName))
    ),
    t.stringLiteral(moduleName)
  );
}

function createDefaultImport(t, importName, moduleName) {
  return t.importDeclaration(
    [t.importDefaultSpecifier(t.identifier(importName))],
    t.stringLiteral(moduleName)
  );
}

function isJSXAttributeNamed(attribute, attributeName) {
  return (
    attribute.type === 'JSXAttribute' &&
    attribute.name?.type === 'JSXIdentifier' &&
    attribute.name.name === attributeName
  );
}

function isJSXAttributeBoolean(attribute, bool) {
  const attributeBooleanValue =
    attribute.value?.type === 'JSXExpressionContainer' &&
    attribute.value.expression?.type === 'BooleanLiteral' &&
    attribute.value.expression.value;

  if (
    // is the attribute boolean?
    (bool == null && attributeBooleanValue) ||
    // is the attribute implicit boolean true
    (bool === true && attribute.value == null)
  ) {
    return true;
  } else {
    return (
      // does the attribute boolean match the arg
      attribute.value?.type === 'JSXExpressionContainer' &&
      attribute.value.expression?.type === 'BooleanLiteral' &&
      attribute.value.expression.value === bool
    );
  }
}

module.exports = reactNativeMigratePlugin;
