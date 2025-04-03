'use client';

import { FaPlus } from 'react-icons/fa';

interface AddTodoButtonProps {
  onClick: () => void;
}

export default function AddTodoButton({ onClick }: AddTodoButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95"
      aria-label="添加待办事项"
    >
      <FaPlus className="text-xl" />
    </button>
  );
} 