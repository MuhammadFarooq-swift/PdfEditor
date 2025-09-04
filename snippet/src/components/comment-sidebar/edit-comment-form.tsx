import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

interface EditCommentFormProps {
  initialText: string;
  onSave: (newText: string) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export const EditCommentForm = ({
  initialText,
  onSave,
  onCancel,
  autoFocus = false,
}: EditCommentFormProps) => {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea and move the cursor to the end when the component mounts
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(text.length, text.length);
    }
  }, [autoFocus, text.length]);

  const handleSaveClick = (e: MouseEvent) => {
    e.stopPropagation();
    onSave(text);
  };

  const handleCancelClick = (e: MouseEvent) => {
    e.stopPropagation();
    onCancel();
  };

  return (
    <div className="flex-1 space-y-2">
      <textarea
        ref={textareaRef}
        value={text}
        onInput={(e) => setText(e.currentTarget.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        rows={3}
      />
      <div className="flex space-x-2">
        <button
          onClick={handleSaveClick}
          className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
        >
          Save
        </button>
        <button
          onClick={handleCancelClick}
          className="rounded-md bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
