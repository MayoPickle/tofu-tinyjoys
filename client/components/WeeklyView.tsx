'use client';

import { useState } from 'react';
import { 
  format, 
  addWeeks, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isToday,
  isSameDay,
  parseISO
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import TodoItem from './TodoItem';
import { FaChevronLeft, FaChevronRight, FaCalendarWeek } from 'react-icons/fa';

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

export default function WeeklyView() {
  const { token } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // 本周起始日（周一）
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  });
  
  // 计算本周结束日
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  
  // 格式化日期范围，用于API请求
  const startDateFormatted = format(currentWeekStart, 'yyyy-MM-dd');
  const endDateFormatted = format(currentWeekEnd, 'yyyy-MM-dd');
  
  // 获取本周内的所有日期
  const daysOfWeek = eachDayOfInterval({
    start: currentWeekStart,
    end: currentWeekEnd,
  });
  
  // 获取本周的待办事项
  const { data: todos, isLoading, error, refetch } = useQuery<Todo[]>(
    ['todos', startDateFormatted, endDateFormatted],
    async () => {
      const response = await axios.get(`${process.env.API_URL}/todos`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start_date: `${startDateFormatted}T00:00:00`,
          end_date: `${endDateFormatted}T23:59:59`,
        },
      });
      return response.data.todos;
    },
    {
      enabled: !!token,
    }
  );

  // 前一周
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, -1));
  };

  // 后一周
  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  // 本周
  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
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

  // 根据日期获取当天的待办事项
  const getTodosByDay = (day: Date) => {
    if (!todos) return [];
    
    return todos.filter(todo => {
      if (!todo.due_date) return false;
      const todoDate = parseISO(todo.due_date);
      return isSameDay(todoDate, day);
    }).sort((a, b) => {
      // 首先按完成状态排序
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // 其次按优先级排序（优先级高的排在前面）
      return b.priority - a.priority;
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-gray-800 flex items-center">
          <FaCalendarWeek className="text-tofupink-500 mr-2" />
          周视图
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaChevronLeft className="text-gray-600" />
          </button>
          
          <button
            onClick={goToCurrentWeek}
            className="px-3 py-1 rounded-md text-sm font-medium bg-tofupink-500 text-white"
          >
            本周
          </button>
          
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaChevronRight className="text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="mb-4 text-center">
        <p className="text-lg font-bold text-gray-800">
          {format(currentWeekStart, 'yyyy年MM月dd日', { locale: zhCN })} - {format(currentWeekEnd, 'MM月dd日', { locale: zhCN })}
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-tofupink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4">
          加载待办事项失败，请稍后再试
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-7 gap-4">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="flex flex-col h-full">
              <div className={`p-2 text-center mb-2 rounded-lg ${isToday(day) ? 'bg-tofupink-500 text-white' : 'bg-gray-100'}`}>
                <p className="font-bold">
                  {format(day, 'EEE', { locale: zhCN })}
                </p>
                <p className="text-sm">
                  {format(day, 'MM/dd')}
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2">
                {getTodosByDay(day).length === 0 ? (
                  <div className="text-center p-2 text-gray-400 text-sm">
                    <p>无待办事项</p>
                  </div>
                ) : (
                  getTodosByDay(day).map(todo => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onStatusChange={handleTodoStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 