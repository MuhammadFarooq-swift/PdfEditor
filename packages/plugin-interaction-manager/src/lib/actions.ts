import { Action } from '@embedpdf/core';

export const ACTIVATE_MODE = 'INTERACTION/ACTIVATE_MODE';
export const PAUSE_INTERACTION = 'INTERACTION/PAUSE';
export const RESUME_INTERACTION = 'INTERACTION/RESUME';
export const SET_CURSOR = 'INTERACTION/SET_CURSOR';
export const SET_DEFAULT_MODE = 'INTERACTION/SET_DEFAULT_MODE';

export interface ActivateModeAction extends Action {
  type: typeof ACTIVATE_MODE;
  payload: { mode: string };
}

export interface PauseInteractionAction extends Action {
  type: typeof PAUSE_INTERACTION;
}

export interface ResumeInteractionAction extends Action {
  type: typeof RESUME_INTERACTION;
}

export interface SetCursorAction extends Action {
  type: typeof SET_CURSOR;
  payload: { cursor: string };
}

export interface SetDefaultModeAction extends Action {
  type: typeof SET_DEFAULT_MODE;
  payload: { mode: string };
}

export const activateMode = (mode: string): ActivateModeAction => ({
  type: ACTIVATE_MODE,
  payload: { mode },
});

export const setCursor = (cursor: string): SetCursorAction => ({
  type: SET_CURSOR,
  payload: { cursor },
});

export const setDefaultMode = (mode: string): SetDefaultModeAction => ({
  type: SET_DEFAULT_MODE,
  payload: { mode },
});

export const pauseInteraction = (): PauseInteractionAction => ({
  type: PAUSE_INTERACTION,
});

export const resumeInteraction = (): ResumeInteractionAction => ({
  type: RESUME_INTERACTION,
});

export type InteractionManagerAction =
  | ActivateModeAction
  | PauseInteractionAction
  | ResumeInteractionAction
  | SetCursorAction
  | SetDefaultModeAction;
