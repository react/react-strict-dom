/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type { SpringAnimationConfig } from '../../shared/SharedAnimatedTypes';
import type {
  AnimatedAnimation,
  GenerateResult,
  KeyframeMap
} from './Animation';

import { TIMESTEP_COEFFICIENT } from '../utils/constants';
import * as SpringConfig from '../utils/SpringConfig';

export default class SpringAnimation implements AnimatedAnimation {
  #overshootClamping: boolean;
  #restDisplacementThreshold: number;
  #restSpeedThreshold: number;

  #toValue: number;
  #delay: number;
  #fromValue: number;

  #damping: number;
  #mass: number;
  #stiffness: number;
  #initialVelocity: number;

  #timeline: Array<number>;
  #duration: number;

  constructor(config: SpringAnimationConfig) {
    this.#overshootClamping = config.overshootClamping ?? false;
    this.#restDisplacementThreshold = config.restDisplacementThreshold ?? 0.001;
    this.#restSpeedThreshold = config.restSpeedThreshold ?? 0.001;
    this.#initialVelocity = config.velocity ?? 0;

    this.#fromValue = 0;
    this.#toValue = config.toValue;
    this.#delay = config.delay ?? 0;

    if (
      config.stiffness !== undefined ||
      config.damping !== undefined ||
      config.mass !== undefined
    ) {
      if (
        !(
          config.bounciness === undefined &&
          config.speed === undefined &&
          config.tension === undefined &&
          config.friction === undefined
        )
      ) {
        throw new Error(
          'You can define one of bounciness/speed, tension/friction, or stiffness/damping/mass, but not more than one'
        );
      }
      this.#stiffness = config.stiffness ?? 100;
      this.#damping = config.damping ?? 10;
      this.#mass = config.mass ?? 1;
    } else if (config.bounciness !== undefined || config.speed !== undefined) {
      // Convert the origami bounciness/speed values to stiffness/damping
      // We assume mass is 1.
      if (
        !(
          config.tension === undefined &&
          config.friction === undefined &&
          config.stiffness === undefined &&
          config.damping === undefined &&
          config.mass === undefined
        )
      ) {
        throw new Error(
          'You can define one of bounciness/speed, tension/friction, or stiffness/damping/mass, but not more than one'
        );
      }
      const springConfig = SpringConfig.fromBouncinessAndSpeed(
        config.bounciness ?? 8,
        config.speed ?? 12
      );
      this.#stiffness = springConfig.stiffness;
      this.#damping = springConfig.damping;
      this.#mass = 1;
    } else {
      // Convert the origami tension/friction values to stiffness/damping
      // We assume mass is 1.
      const springConfig = SpringConfig.fromOrigamiTensionAndFriction(
        config.tension ?? 40,
        config.friction ?? 7
      );
      this.#stiffness = springConfig.stiffness;
      this.#damping = springConfig.damping;
      this.#mass = 1;
    }

    this.#timeline = [];
    this.#duration = 0;

    if (this.#stiffness <= 0) {
      throw new Error('Stiffness value must be greater than 0');
    }
    if (this.#damping <= 0) {
      throw new Error('Damping value must be greater than 0');
    }
    if (this.#mass <= 0) {
      throw new Error('Mass value must be greater than 0');
    }
  }

  getDuration(): number {
    return this.#duration;
  }

  getTimeline(): Array<number> {
    return this.#timeline;
  }

  generate(
    fromValue: number,
    onUpdate: (value: number, keyframeMap: KeyframeMap) => void
  ): GenerateResult {
    const keyframeMap: KeyframeMap = new Map();

    this.#fromValue = fromValue;

    let elapsedTime = 0;
    let finished = false;
    while (!finished) {
      const [nextValue, isFinished] = this.#sampleSpring(elapsedTime);
      this.#timeline.push(nextValue);
      onUpdate(nextValue, keyframeMap);
      if (!isFinished) {
        elapsedTime += TIMESTEP_COEFFICIENT;
      }
      finished = isFinished;
    }

    this.#duration = elapsedTime;

    const config: Partial<EffectTiming> = {
      delay: this.#delay,
      direction: 'normal',
      duration: this.#duration,
      easing: 'linear',
      fill: 'backwards',
      iterations: 1,
      iterationStart: 0
    };

    return { config, keyframeMap };
  }

  #sampleSpring(elapsedTime: number): [number, boolean] {
    // spring operates on a "seconds" scale while the elapasedTime is in
    // "milliseconds"
    const t = elapsedTime / 1000;

    const c = this.#damping;
    const m = this.#mass;
    const k = this.#stiffness;
    const v0 = this.#initialVelocity;

    const zeta = c / (2 * Math.sqrt(k * m)); // damping ratio
    const omega0 = Math.sqrt(k / m); // undamped angular frequency of the oscillator (rad/ms)
    const omega1 = omega0 * Math.sqrt(1.0 - zeta * zeta); // exponential decay
    const x0 = this.#toValue - this.#fromValue; // calculate the oscillation from x0 = 1 to x = 0

    let position = 0;
    let velocity = 0;
    if (zeta < 1) {
      // Under damped
      const envelope = Math.exp(-zeta * omega0 * t);
      position =
        this.#toValue -
        envelope *
          (((v0 + zeta * omega0 * x0) / omega1) * Math.sin(omega1 * t) +
            x0 * Math.cos(omega1 * t));
      // This looks crazy -- it's actually just the derivative of the
      // oscillation function
      velocity =
        zeta *
          omega0 *
          envelope *
          ((Math.sin(omega1 * t) * (v0 + zeta * omega0 * x0)) / omega1 +
            x0 * Math.cos(omega1 * t)) -
        envelope *
          (Math.cos(omega1 * t) * (v0 + zeta * omega0 * x0) -
            omega1 * x0 * Math.sin(omega1 * t));
    } else {
      // Critically damped
      const envelope = Math.exp(-omega0 * t);
      position = this.#toValue - envelope * (x0 + (v0 + omega0 * x0) * t);
      velocity =
        envelope * (v0 * (t * omega0 - 1) + t * x0 * (omega0 * omega0));
    }

    // Conditions for stopping the spring animation
    let finished = false;
    let isOvershooting = false;
    if (this.#overshootClamping && this.#stiffness !== 0) {
      if (this.#fromValue < this.#toValue) {
        isOvershooting = position > this.#toValue;
      } else {
        isOvershooting = position < this.#toValue;
      }
    }
    const isVelocity = Math.abs(velocity) <= this.#restSpeedThreshold;
    let isDisplacement = true;
    if (this.#stiffness !== 0) {
      isDisplacement =
        Math.abs(this.#toValue - position) <= this.#restDisplacementThreshold;
    }

    if (isOvershooting || (isVelocity && isDisplacement)) {
      if (this.#stiffness !== 0) {
        // Ensure that we end up with a round value
        position = this.#toValue;
      }
      finished = true;
    }

    return [position, finished];
  }
}
