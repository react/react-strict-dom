---
draft: false
---

# css.keyframes

<p className="text-xl">How to define animation keyframes for cross-platform CSS animations.</p>

## Overview

React Strict DOM provides CSS animation support that works consistently across web and React Native platforms. The `css.keyframes()` function allows you to define animation keyframes using CSS-like syntax, which are then polyfilled on React Native using the Animated API.

## Basic Usage

```javascript
import * as css from 'react-strict-dom/css';
import * as html from 'react-strict-dom/html';

// Define keyframes
const bounce = css.keyframes({
  '0%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.2)' },
  '100%': { transform: 'scale(1)' }
});

// Use in styles
const styles = css.create({
  bouncing: {
    animationName: bounce,
    animationDuration: '1s',
    animationIterationCount: 'infinite'
  }
});

function BouncingComponent() {
  return (
    <html.div style={styles.bouncing}>
      This div bounces!
    </html.div>
  );
}
```

## Multiple Concurrent Animations

You can run multiple animations simultaneously by using comma-separated strings for animation properties:

```javascript
const bounce = css.keyframes({
  '0%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.2)' },
  '100%': { transform: 'scale(1)' }
});

const fade = css.keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 }
});

const styles = css.create({
  multiAnimation: {
    animationName: `${bounce}, ${fade}`,     // Multiple animations
    animationDuration: '0.6s, 1s',          // Different durations
    animationTimingFunction: 'ease-out, ease-in'
  }
});
```

## API Reference

### css.keyframes(keyframeObject)

Creates a keyframes definition that can be used with `animationName`.

**Parameters:**
- `keyframeObject` - Object defining animation keyframes with percentage keys

**Returns:**
- Keyframes identifier for use with `animationName`

**Example:**
```javascript
const slideIn = css.keyframes({
  '0%': {
    transform: 'translateX(-100%)',
    opacity: 0
  },
  '50%': {
    opacity: 0.5
  },
  '100%': {
    transform: 'translateX(0)',
    opacity: 1
  }
});
```
