import { BasePluginConfig } from '@embedpdf/core';
import { Rotation } from '@embedpdf/models';

export interface RotatePluginConfig extends BasePluginConfig {
  defaultRotation?: Rotation;
}

export interface RotateCapability {
  onRotateChange(handler: (rotation: Rotation) => void): void;
  setRotation(rotation: Rotation): void;
  getRotation(): Rotation;
  rotateForward(): void;
  rotateBackward(): void;
  getMatrix(opts?: {
    w?: number;
    h?: number;
    asString?: boolean;
  }): string | [number, number, number, number, number, number];
}

export interface RotateState {
  rotation: Rotation;
}
