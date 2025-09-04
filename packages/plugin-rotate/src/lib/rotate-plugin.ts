import { BasePlugin, createBehaviorEmitter, PluginRegistry, setRotation } from '@embedpdf/core';
import { Rotation } from '@embedpdf/models';
import { RotateCapability, RotatePluginConfig } from './types';
import { rotationMatrix } from './utils';

function getNextRotation(current: Rotation): Rotation {
  return ((current + 1) % 4) as Rotation;
}

function getPreviousRotation(current: Rotation): Rotation {
  return ((current + 3) % 4) as Rotation; // +3 is equivalent to -1 in modulo 4
}

export class RotatePlugin extends BasePlugin<RotatePluginConfig, RotateCapability> {
  static readonly id = 'rotate' as const;
  private readonly rotate$ = createBehaviorEmitter<Rotation>();

  constructor(id: string, registry: PluginRegistry, cfg: RotatePluginConfig) {
    super(id, registry);
    this.resetReady();
    const rotation = cfg.defaultRotation ?? this.coreState.core.rotation;
    this.setRotation(rotation);
    this.markReady();
  }

  async initialize(_config: RotatePluginConfig): Promise<void> {}

  private setRotation(rotation: Rotation): void {
    const pages = this.coreState.core.pages;
    if (!pages) {
      throw new Error('Pages not loaded');
    }

    this.dispatchCoreAction(setRotation(rotation));
  }

  private rotateForward(): void {
    const rotation = getNextRotation(this.coreState.core.rotation);
    this.setRotation(rotation);
  }

  private rotateBackward(): void {
    const rotation = getPreviousRotation(this.coreState.core.rotation);
    this.setRotation(rotation);
  }

  protected buildCapability(): RotateCapability {
    return {
      onRotateChange: this.rotate$.on,
      setRotation: (rotation) => this.setRotation(rotation),
      getRotation: () => this.coreState.core.rotation,
      rotateForward: () => this.rotateForward(),
      rotateBackward: () => this.rotateBackward(),
      getMatrix: ({ w = 0, h = 0, asString = true } = {}) =>
        rotationMatrix(this.coreState.core.rotation, w, h, asString),
    };
  }

  async destroy(): Promise<void> {
    this.rotate$.clear();
    super.destroy();
  }
}
