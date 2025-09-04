import { Fragment, createContext, ComponentChildren, render } from 'preact';
import { useEffect, useRef, useState, useContext } from 'preact/hooks';

export {
  Fragment,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  ComponentChildren as ReactNode,
  render,
};
export type CSSProperties = import('preact').JSX.CSSProperties;
export type HTMLAttributes<T = any> = import('preact').JSX.HTMLAttributes<
  T extends EventTarget ? T : never
>;
