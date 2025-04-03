'use client';

import { useState } from 'react';
import { format, parseISO, isToday, isPast } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { FaCheck, FaTrash, FaEdit, FaStar, FaClock, FaEllipsisV } from 'react-icons/fa';

// 待办事项类型
interface Todo {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  priority: number;
  color: string;
  icon?: string;
  tags: {
    id: number;
    name: string;
    color: string;
  }[];
}

interface TodoItemProps {
  todo: Todo;
  onStatusChange: (id: number, completed: boolean) => void;
}

export default function TodoItem({ todo, onStatusChange }: TodoItemProps) {
  const [showActions, setShowActions] = useState(false);

  // 处理完成状态切换
  const handleStatusToggle = () => {
    onStatusChange(todo.id, !todo.completed);
  };

  // 显示/隐藏操作菜单
  const toggleActions = () => {
    setShowActions(!showActions);
  };

  // 获取日期显示格式
  const getDateDisplay = () => {
    if (!todo.due_date) return null;
    
    const dueDate = parseISO(todo.due_date);
    
    if (isToday(dueDate)) {
      return '今天';
    } else {
      return format(dueDate, 'MM月dd日', { locale: zhCN });
    }
  };

  // 根据优先级获取颜色
  const getPriorityColor = () => {
    switch (todo.priority) {
      case 2: // 高
        return 'text-red-500';
      case 1: // 中
        return 'text-orange-500';
      default: // 低
        return 'text-gray-400';
    }
  };

  // 获取优先级显示文本
  const getPriorityText = () => {
    switch (todo.priority) {
      case 2:
        return '高';
      case 1:
        return '中';
      default:
        return '低';
    }
  };

  // 获取卡片样式
  const getCardStyle = () => {
    const baseStyle = 'card-cute transform transition-all duration-300';
    
    if (todo.completed) {
      return `${baseStyle} opacity-60 border-gray-200`;
    }
    
    // 使用自定义颜色
    if (todo.color && todo.color !== '#FFFFFF') {
      return `${baseStyle} border-l-4`; 
    }
    
    return `${baseStyle} border-l-4 border-l-primary-500`;
  };

  // 根据待办事项状态和日期获取日期文本样式
  const getDateStyle = () => {
    if (!todo.due_date) return 'text-gray-400';
    
    const dueDate = parseISO(todo.due_date);
    
    if (todo.completed) {
      return 'text-gray-400';
    } else if (isPast(dueDate) && !isToday(dueDate)) {
      return 'text-red-500';
    } else if (isToday(dueDate)) {
      return 'text-orange-500';
    } else {
      return 'text-blue-500';
    }
  };

  return (
    <div 
      className={getCardStyle()}
      style={{ borderLeftColor: todo.color !== '#FFFFFF' ? todo.color : undefined }}
    >
      <div className="flex items-start">
        <button
          onClick={handleStatusToggle}
          className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            todo.completed 
              ? 'bg-primary-500 border-primary-500 text-white' 
              : 'border-gray-300 hover:border-primary-500'
          }`}
        >
          {todo.completed && <FaCheck className="text-xs" />}
        </button>
        
        <div className="ml-3 flex-1">
          <div className="flex justify-between">
            <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {todo.title}
            </h3>
            
            <div className="flex items-center space-x-1">
              {todo.priority > 0 && (
                <span className={`text-xs ${getPriorityColor()}`}>
                  {getPriorityText()}优先级
                </span>
              )}
              
              <div className="relative">
                <button
                  onClick={toggleActions}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <FaEllipsisV className="text-sm" />
                </button>
                
                {showActions && (
                  <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg py-1 z-10 w-32">
                    <button className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">
                      <FaEdit className="mr-2 text-blue-500" />
                      编辑
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">
                      <FaStar className="mr-2 text-yellow-500" />
                      标为重要
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100 text-sm">
                      <FaTrash className="mr-2" />
                      删除
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {todo.description && (
            <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {todo.description}
            </p>
          )}
          
          <div className="mt-2 flex items-center flex-wrap gap-2">
            {todo.due_date && (
              <div className={`flex items-center text-xs ${getDateStyle()}`}>
                <FaClock className="mr-1" />
                {getDateDisplay()}
              </div>
            )}
            
            {todo.tags?.map(tag => (
              <span
                key={tag.id}
                className="tag-cute text-xs"
                style={{ 
                  backgroundColor: `${tag.color}20`, 
                  color: tag.color
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 