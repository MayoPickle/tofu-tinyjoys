'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DailyView from '../../components/DailyView';
import WeeklyView from '../../components/WeeklyView';
import MonthlyView from '../../components/MonthlyView';
import AddTodoButton from '../../components/AddTodoButton';
import TodoFormModal from '../../components/TodoFormModal';

// 视图类型枚举
type ViewType = 'day' | 'week' | 'month';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>('day');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // 视图切换处理函数
  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
  };

  // 打开新待办事项表单模态框
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 如果正在加载或用户未认证，显示加载状态
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header username={user?.username || '用户'} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeView={activeView} 
          onViewChange={handleViewChange}
        />
        
        <main className="flex-1 overflow-y-auto p-4">
          {activeView === 'day' && <DailyView />}
          {activeView === 'week' && <WeeklyView />}
          {activeView === 'month' && <MonthlyView />}
          
          <AddTodoButton onClick={handleOpenModal} />
        </main>
      </div>
      
      {/* 新待办事项表单模态框 */}
      {isModalOpen && (
        <TodoFormModal onClose={handleCloseModal} />
      )}
    </div>
  );
} 