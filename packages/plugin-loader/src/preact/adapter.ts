import { JSX } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

export { useEffect, useRef };

export type ChangeEvent<T = Element> = JSX.TargetedEvent<T extends EventTarget ? T : never>;
