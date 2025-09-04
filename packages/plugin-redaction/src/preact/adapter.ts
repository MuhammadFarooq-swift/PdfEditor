import { JSX } from 'preact';
export { Fragment } from 'preact';
export { useEffect, useRef, useState, useMemo, useCallback } from 'preact/hooks';
export type { ComponentChildren as ReactNode } from 'preact';

export type HTMLAttributes<T = any> = import('preact').JSX.HTMLAttributes<
  T extends EventTarget ? T : never
>;
export type CSSProperties = import('preact').JSX.CSSProperties;

export type MouseEvent<T = Element> = JSX.TargetedMouseEvent<T extends EventTarget ? T : never>;
export type PointerEvent<T = Element> = JSX.TargetedPointerEvent<T extends EventTarget ? T : never>;
export type ChangeEvent<T = Element> = JSX.TargetedInputEvent<T extends EventTarget ? T : never>;
export type TouchEvent<T = Element> = JSX.TargetedTouchEvent<T extends EventTarget ? T : never>;
