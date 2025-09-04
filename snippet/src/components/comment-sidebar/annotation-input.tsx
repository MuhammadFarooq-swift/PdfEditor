import { h, RefObject } from 'preact';
import { useState, useRef } from 'preact/hooks';

interface AnnotationInputProps {
  placeholder: string;
  onSubmit: (text: string) => void;
  inputRef?: RefObject<HTMLInputElement>;
  isFocused?: boolean;
}

export const AnnotationInput = ({
  placeholder,
  onSubmit,
  inputRef,
  isFocused,
}: AnnotationInputProps) => {
  const [text, setText] = useState('');

  const handleSubmit = (e?: h.JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e?.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <form
      className="mt-4 flex items-end space-x-2 border-t border-gray-100 pt-4"
      onClick={(e) => e.stopPropagation()}
      onSubmit={handleSubmit}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={text}
        onInput={(e) => setText(e.currentTarget.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm placeholder-gray-500 transition-colors focus:border-transparent focus:outline-none focus:ring-2 ${
          isFocused ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
        }`}
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </form>
  );
};
