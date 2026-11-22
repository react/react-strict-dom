/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

const { transformSync } = require('@babel/core');
const migratePlugin = require('../babel/migrate');

function transform(source) {
  return transformSync(source, {
    filename: 'test.js',
    parserOpts: {
      flow: 'all',
      plugins: ['jsx', 'flow']
    },
    plugins: ['@babel/plugin-syntax-jsx', migratePlugin],
    babelrc: false,
    configFile: false
  }).code;
}

describe('react-strict-dom-migrate', () => {
  test('full example', () => {
    const code = `
import * as React from 'react';
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#eee'
  },
  text: {
    fontSize: 20
  }
})

export default function ReactNativeElementTransform(props) {
  const { color } = props;
  return (
    <View style={styles.root}>
      <Text style={[styles.text, {color}]}>Hello World</Text>
      <Image alt="test1" source={{uri: 'https://example.com/image.png'}} />
      <Image alt="test2" src="https://example.com/image.png" />
      <ScrollView>
        <View />
      </ScrollView>
      <TextInput />
      <Switch />
      <Button onPress={onButtonPress} title="Launch Unicorns" />
    </View>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('StyleSheet.create()', () => {
    const code = `
import {StyleSheet} from 'react-native';
const styles = StyleSheet.create({
  basic: {
    backgroundColor: '#eee',
    flex: 1,
    flexDirection: 'column',
  },
  logicalBorder: {
    borderBottomEndRadius: '1px',
    borderBottomStartRadius: 2,
    borderEndColor: 3,
    borderEndStyle: 4,
    borderEndWidth: 5,
    borderStartColor: 6,
    borderStartStyle: 7,
    borderStartWidth: 8,
    borderTopEndRadius: 9,
    borderTopStartRadius: null,
  },
  logicalInset: {
    end: 10,
    start: '20%',
  },
  logicalMargin: {
    marginEnd: 'auto',
    marginStart: 6,
    marginHorizontal: 10,
    marginVertical: 15,
  },
  logicalPadding: {
    paddingEnd: 7,
    paddingStart: 8,
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  transforms: {
    transform: [
      { perspective: 50 },
      { scaleX: 20 },
      { translateX: 20 },
      { rotate: '20deg' },
      { matrix: [1, 2, 3, 4, 5, 6] },
      { matrix3d: [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4] }
    ],
    transformOrigin: [2, '30%', 10]
  },
  text: {
    fontSize: 20,
    fontVariant: ['common-ligatures', 'small-caps'],
    textAlignVertical: 'center',
    writingDirection: 'ltr'
  },
});
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('<Button> element and props', () => {
    const code = `
import * as React from 'react';
import { Button } from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <Button onPress={onButtonPress} title="Launch Unicorns" />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('<Image> element and props', () => {
    const code = `
import * as React from 'react';
import { Image } from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <Image alt="test1" source={{uri: 'https://example.com/image.png'}} />
      <Image alt="test2" src="https://example.com/image.png" />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('<ScrollView> element and props', () => {
    const code = `
import * as React from 'react';
import { ScrollView, View } from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <ScrollView>
      <View />
    </ScrollView>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('<Switch> element and props', () => {
    const code = `
import * as React from 'react';
import { Switch } from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <Switch />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('<Text> element and props', () => {
    const code = `
import * as React from 'react';
import { Text } from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <Text>Hello World</Text>
      <Text>{text}</Text>
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('<Text> element with styles', () => {
    const code = `
import * as React from 'react';
import { Text, StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  root: {
    borderColor: 'red',
    borderWidth: 1
  },
  child: {
    backgroundColor: 'green'
  },
  padding: {
    padding: 10
  }
});
export default function ReactNativeElementTransform(props) {
  return (
    <Text style={styles.root}>
      <Text style={[styles.child, [styles.padding, {color: props.color}]]}>
        <Text />
      </Text>
    </Text>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('<TextInput> element and props', () => {
    const code = `
import * as React from 'react';
import { TextInput } from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <TextInput />
      <TextInput multiline />
      <TextInput multiline={true} numberOfLines={5} />
      <TextInput multiline={multiline} numberOfLines={numberOfLines} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('<TextInput> element with styles', () => {
    const code = `
import * as React from 'react';
import { TextInput, StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  root: {
    borderColor: 'red',
    borderWidth: 1
  },
  padding: {
    padding: 10
  }
});
export default function ReactNativeElementTransform(props) {
  return (
    <>
      <TextInput style={styles.root} />
      <TextInput style={[styles.root, [styles.padding, {color: props.color}]]} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('<View> element and props', () => {
    const code = `
import * as React from 'react';
import { View } from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <View>
      <View />
    </View>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('<View> element with styles', () => {
    const code = `
import * as React from 'react';
import { View, StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  root: {
    borderColor: 'red',
    borderWidth: 1
  },
  child: {
    backgroundColor: 'green'
  },
  padding: {
    padding: 10
  }
});
export default function ReactNativeElementTransform(props) {
  return (
    <View style={styles.root}>
      <View style={[styles.child, [styles.padding, {color: props.color}]]}>
        <View />
      </View>
    </View>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('"accessibilityElementsHidden" prop', () => {
    const code = `
import * as React from 'react';
import {View} from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <View accessibilityElementsHidden={false} />
      <View accessibilityElementsHidden={true} />
      <View accessibilityElementsHidden={accessibilityElementsHidden} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('"accessibilityLabel" prop', () => {
    const code = `
import * as React from 'react';
import {View} from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <View accessibilityLabel="Hello world" />
      <View accessibilityLabel={accessibilityLabel} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('"accessibilityLabelledBy" prop', () => {
    const code = `
import * as React from 'react';
import {View} from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <View accessibilityLabelledBy="abc123" />
      <View accessibilityLabelledBy={accessibilityLabelledBy} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('"accessibilityLiveRegion" prop', () => {
    const code = `
import * as React from 'react';
import {View} from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <View accessibilityLiveRegion="none" />
      <View accessibilityLiveRegion="polite" />
      <View accessibilityLiveRegion="assertive" />
      <View accessibilityLiveRegion={accessibilityLiveRegion} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('"accessibilityRole" prop', () => {
    const code = `
import * as React from 'react';
import {View} from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <View accessibilityRole="adjustable" />
      <View accessibilityRole="alert" />
      <View accessibilityRole="button" />
      <View accessibilityRole="checkbox" />
      <View accessibilityRole="combobox" />
      <View accessibilityRole="header" />
      <View accessibilityRole="image" />
      <View accessibilityRole="link" />
      <View accessibilityRole="menu" />
      <View accessibilityRole="menubar" />
      <View accessibilityRole="menuitem" />
      <View accessibilityRole="none" />
      <View accessibilityRole="progressbar" />
      <View accessibilityRole="radio" />
      <View accessibilityRole="radiogroup" />
      <View accessibilityRole="scrollbar" />
      <View accessibilityRole="search" />
      <View accessibilityRole="spinbutton" />
      <View accessibilityRole="switch" />
      <View accessibilityRole="tab" />
      <View accessibilityRole="tablist" />
      <View accessibilityRole="timer" />
      <View accessibilityRole="toolbar" />
      <View accessibilityRole={accessibilityRole} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('"accessibilityState" prop', () => {
    const code = `
import * as React from 'react';
import {View} from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <View accessibilityState={{ busy: false }} />
      <View accessibilityState={{ busy: true }} />
      <View accessibilityState={{ checked: false }} />
      <View accessibilityState={{ checked: true }} />
      <View accessibilityState={{ checked: 'mixed' }} />
      <View accessibilityState={{ disabled: false }} />
      <View accessibilityState={{ disabled: true }} />
      <View accessibilityState={{ expanded: false }} />
      <View accessibilityState={{ expanded: true }} />
      <View accessibilityState={{ selected: false }} />
      <View accessibilityState={{ selected: true }} />
      <View accessibilityState={{
        busy: false,
        checked: 'mixed',
        disabled: false,
        expanded: true,
        selected: true
      }} />
      <View accessibilityState={accessibilityState} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('"accessibilityValue" prop', () => {
    const code = `
import * as React from 'react';
import {View} from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <View accessibilityValue={{ max: 10 }} />
      <View accessibilityValue={{ min: 1 }} />
      <View accessibilityValue={{ now: 5 }} />
      <View accessibilityValue={{ text: 'Five' }} />
      <View accessibilityValue={{
        max: 10,
        min: 1,
        now: 5,
        text: 'Five'
      }} />
      <View accessibilityValue={accessibilityValue} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('"accessibilityViewIsModal" prop', () => {
    const code = `
import * as React from 'react';
import {View} from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <View accessibilityViewIsModal={false} />
      <View accessibilityViewIsModal={true} />
      <View accessibilityViewIsModal={accessibilityViewIsModal} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('"focusable" prop', () => {
    const code = `
import * as React from 'react';
import {View} from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <View focusable />
      <View focusable={true} />
      <View focusable={false} />
      <View focusable={focusable} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('"importantForAccessibility" prop', () => {
    const code = `
import * as React from 'react';
import {View} from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <View importantForAccessibility="no-hide-descendants" />
      <View importantForAccessibility={importantForAccessibility} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('"nativeID" prop', () => {
    const code = `
import * as React from 'react';
import {View} from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <View nativeID="codemod" />
      <View nativeID={nativeID} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('"testID" prop', () => {
    const code = `
import * as React from 'react';
import {View} from 'react-native';
export default function ReactNativeElementTransform() {
  return (
    <>
      <View testID="codemod" />
      <View testID={testID} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });

  test('Spread props', () => {
    const code = `
import * as React from 'react';
import {View} from 'react-native';
export default function ReactNativeElementTransform(props) {
  return (
    <>
      <View {...props} />
    </>
  );
}
`;
    expect(transform(code)).toMatchSnapshot();
  });
});
