'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isToday, addDays, isBefore } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import TodoItem from './TodoItem';
import { FaChevronLeft, FaChevronRight, FaCalendarDay } from 'react-icons/fa';

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

export default function DailyView() {
  const { token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  // 获取选定日期的待办事项
  const { data: todos, isLoading, error, refetch } = useQuery<Todo[]>(
    ['todos', formattedDate],
    async () => {
      const response = await axios.get(`${process.env.API_URL}/todos`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start_date: `${formattedDate}T00:00:00`,
          end_date: `${formattedDate}T23:59:59`,
        },
      });
      return response.data.todos;
    },
    {
      enabled: !!token,
    }
  );

  // 前一天
  const goToPreviousDay = () => {
    setSelectedDate(prev => addDays(prev, -1));
  };

  // 后一天
  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  // 回到今天
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // 更新待办事项状态
  const handleTodoStatusChange = async (id: number, completed: boolean) => {
    try {
      await axios.put(
        `${process.env.API_URL}/todos/${id}`,
        { completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refetch();
    } catch (error) {
      console.error('更新待办事项状态失败:', error);
    }
  };

  // 将待办事项按优先级和完成状态排序
  const sortedTodos = todos
    ? [...todos].sort((a, b) => {
        // 首先按完成状态排序
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        // 其次按优先级排序（优先级高的排在前面）
        return b.priority - a.priority;
      })
    : [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-gray-800 flex items-center">
          <FaCalendarDay className="text-primary-500 mr-2" />
          日视图
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousDay}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaChevronLeft className="text-gray-600" />
          </button>
          
          <button
            onClick={goToToday}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              isToday(selectedDate)
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            今天
          </button>
          
          <button
            onClick={goToNextDay}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaChevronRight className="text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-gray-800">
          {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })}
        </h3>
        <p className="text-gray-500">
          {format(selectedDate, 'EEEE', { locale: zhCN })}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            加载待办事项失败，请稍后再试
          </div>
        ) : sortedTodos.length === 0 ? (
          <div className="text-center py-10">
            <div className="mb-4">
              <span className="text-5xl">🎉</span>
            </div>
            <h3 className="text-xl font-display font-bold text-gray-800 mb-2">
              今日无待办事项
            </h3>
            <p className="text-gray-500">
              {isToday(selectedDate)
                ? '享受这美好的一天吧！'
                : isBefore(selectedDate, new Date())
                ? '这一天已经过去了'
                : '这一天还没有安排任务'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onStatusChange={handleTodoStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 