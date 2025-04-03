'use client';

import { useState } from 'react';
import { 
  format, 
  addMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isToday,
  isSameMonth,
  isSameDay,
  parseISO
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaCircle } from 'react-icons/fa';

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

export default function MonthlyView() {
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // 计算月份的开始和结束日期
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // 为了显示完整的日历网格，我们需要从月份开始的那周的第一天开始
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  // 获取日历显示的所有日期
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });
  
  // 格式化月份，用于显示和API请求
  const monthFormatted = format(currentDate, 'yyyy-MM');
  const startDateFormatted = format(monthStart, 'yyyy-MM-dd');
  const endDateFormatted = format(monthEnd, 'yyyy-MM-dd');
  
  // 获取月份的待办事项
  const { data: todos, isLoading, error } = useQuery<Todo[]>(
    ['todos', monthFormatted],
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

  // 前一个月
  const goToPreviousMonth = () => {
    setCurrentDate(prev => addMonths(prev, -1));
    setSelectedDate(null);
  };

  // 后一个月
  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
    setSelectedDate(null);
  };

  // 回到当月
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // 处理日期选择
  const handleDateSelect = (day: Date) => {
    setSelectedDate(day);
  };

  // 根据日期获取当天的待办事项
  const getTodosByDay = (day: Date) => {
    if (!todos) return [];
    
    return todos.filter(todo => {
      if (!todo.due_date) return false;
      const todoDate = parseISO(todo.due_date);
      return isSameDay(todoDate, day);
    });
  };

  // 获取日期单元格的样式
  const getDayClass = (day: Date) => {
    let className = 'h-10 w-10 rounded-full flex items-center justify-center cursor-pointer';
    
    if (isToday(day)) {
      className += ' bg-secondary-500 text-white';
    } else if (isSameMonth(day, currentDate)) {
      if (selectedDate && isSameDay(day, selectedDate)) {
        className += ' bg-secondary-200 text-secondary-800';
      } else {
        className += ' hover:bg-gray-100 text-gray-800';
      }
    } else {
      className += ' text-gray-400 hover:bg-gray-50';
    }
    
    return className;
  };

  // 获取选定日期的待办事项
  const selectedDayTodos = selectedDate ? getTodosByDay(selectedDate) : [];

  // 按完成状态和优先级排序
  const sortedTodos = [...(selectedDayTodos || [])].sort((a, b) => {
    // 首先按完成状态排序
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // 其次按优先级排序（优先级高的排在前面）
    return b.priority - a.priority;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-gray-800 flex items-center">
          <FaCalendarAlt className="text-secondary-500 mr-2" />
          月视图
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaChevronLeft className="text-gray-600" />
          </button>
          
          <button
            onClick={goToCurrentMonth}
            className="px-3 py-1 rounded-md text-sm font-medium bg-secondary-500 text-white"
          >
            本月
          </button>
          
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaChevronRight className="text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="mb-4 text-center">
        <h3 className="text-xl font-bold text-gray-800">
          {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
        </h3>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="md:col-span-5">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-10 h-10 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">
              加载待办事项失败，请稍后再试
            </div>
          ) : (
            <div className="card-cute-orange p-4">
              <div className="grid grid-cols-7 mb-2">
                {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
                  <div key={index} className="text-center font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dayTodos = getTodosByDay(day);
                  const hasTodos = dayTodos.length > 0;
                  
                  return (
                    <div 
                      key={index} 
                      className="p-1 h-24 border border-gray-100 text-center overflow-hidden"
                      onClick={() => handleDateSelect(day)}
                    >
                      <div className="flex justify-center mb-1">
                        <button className={getDayClass(day)}>
                          {format(day, 'd')}
                        </button>
                      </div>
                      
                      {isSameMonth(day, currentDate) && hasTodos && (
                        <div className="text-xs overflow-hidden space-y-1">
                          {dayTodos.slice(0, 2).map((todo, todoIndex) => (
                            <div 
                              key={todoIndex}
                              className="truncate px-1 rounded text-left flex items-center"
                              style={{ backgroundColor: `${todo.color}20`, color: todo.color || '#666' }}
                            >
                              <FaCircle className="text-xs mr-1" style={{ fontSize: '6px' }} />
                              <span>{todo.title}</span>
                            </div>
                          ))}
                          
                          {dayTodos.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayTodos.length - 2}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          <div className="card-cute-blue p-4 h-full">
            <h3 className="font-display font-bold text-lg mb-3">
              {selectedDate 
                ? format(selectedDate, 'MM月dd日 EEEE', { locale: zhCN })
                : '选择日期查看待办事项'
              }
            </h3>
            
            {selectedDate ? (
              sortedTodos.length > 0 ? (
                <div className="space-y-2 overflow-y-auto max-h-96">
                  {sortedTodos.map((todo, index) => (
                    <div 
                      key={index}
                      className="p-2 rounded-lg border-l-4"
                      style={{ borderLeftColor: todo.color || '#e5e7eb' }}
                    >
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${todo.completed ? 'bg-gray-300' : 'bg-secondary-500'}`}></div>
                        <p className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}>{todo.title}</p>
                      </div>
                      {todo.description && (
                        <p className="text-xs text-gray-500 mt-1 ml-5">{todo.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500">
                  <p>这一天没有待办事项</p>
                </div>
              )
            ) : (
              <div className="text-center p-4 text-gray-500">
                <p>请从日历中选择一个日期</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 