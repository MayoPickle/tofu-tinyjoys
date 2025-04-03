'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FaCalendarDay, 
  FaCalendarWeek, 
  FaCalendarAlt,
  FaTags,
  FaChartPie,
  FaStar,
  FaArchive,
  FaTrash,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

type ViewType = 'day' | 'week' | 'month';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`bg-white shadow-sm transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="h-full flex flex-col">
        <div className="flex justify-end p-2">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="mb-6">
            <h2 className={`font-display font-bold text-gray-400 uppercase text-xs mb-2 ${isCollapsed ? 'px-0 text-center' : 'px-4'}`}>
              {isCollapsed ? '' : '视图'}
            </h2>
            <nav>
              <button
                onClick={() => onViewChange('day')}
                className={`flex items-center w-full py-2 px-4 ${
                  activeView === 'day' 
                    ? 'text-primary-600 bg-primary-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <FaCalendarDay className={isCollapsed ? 'text-xl' : 'mr-3'} />
                {!isCollapsed && <span>日视图</span>}
              </button>
              
              <button
                onClick={() => onViewChange('week')}
                className={`flex items-center w-full py-2 px-4 ${
                  activeView === 'week' 
                    ? 'text-tofupink-600 bg-tofupink-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <FaCalendarWeek className={isCollapsed ? 'text-xl' : 'mr-3'} />
                {!isCollapsed && <span>周视图</span>}
              </button>
              
              <button
                onClick={() => onViewChange('month')}
                className={`flex items-center w-full py-2 px-4 ${
                  activeView === 'month' 
                    ? 'text-secondary-600 bg-secondary-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <FaCalendarAlt className={isCollapsed ? 'text-xl' : 'mr-3'} />
                {!isCollapsed && <span>月视图</span>}
              </button>
            </nav>
          </div>
          
          <div className="mb-6">
            <h2 className={`font-display font-bold text-gray-400 uppercase text-xs mb-2 ${isCollapsed ? 'px-0 text-center' : 'px-4'}`}>
              {isCollapsed ? '' : '分类'}
            </h2>
            <nav>
              <Link
                href="/dashboard/tags"
                className={`flex items-center py-2 px-4 text-gray-700 hover:bg-gray-50 ${isCollapsed ? 'justify-center' : ''}`}
              >
                <FaTags className={isCollapsed ? 'text-xl' : 'mr-3'} />
                {!isCollapsed && <span>标签</span>}
              </Link>
              
              <Link
                href="/dashboard/starred"
                className={`flex items-center py-2 px-4 text-gray-700 hover:bg-gray-50 ${isCollapsed ? 'justify-center' : ''}`}
              >
                <FaStar className={isCollapsed ? 'text-xl' : 'mr-3 text-yellow-500'} />
                {!isCollapsed && <span>重要</span>}
              </Link>
              
              <Link
                href="/dashboard/completed"
                className={`flex items-center py-2 px-4 text-gray-700 hover:bg-gray-50 ${isCollapsed ? 'justify-center' : ''}`}
              >
                <FaArchive className={isCollapsed ? 'text-xl' : 'mr-3'} />
                {!isCollapsed && <span>已完成</span>}
              </Link>
            </nav>
          </div>
          
          <div className="mb-6">
            <h2 className={`font-display font-bold text-gray-400 uppercase text-xs mb-2 ${isCollapsed ? 'px-0 text-center' : 'px-4'}`}>
              {isCollapsed ? '' : '其他'}
            </h2>
            <nav>
              <Link
                href="/dashboard/analytics"
                className={`flex items-center py-2 px-4 text-gray-700 hover:bg-gray-50 ${isCollapsed ? 'justify-center' : ''}`}
              >
                <FaChartPie className={isCollapsed ? 'text-xl' : 'mr-3'} />
                {!isCollapsed && <span>统计分析</span>}
              </Link>
              
              <Link
                href="/dashboard/trash"
                className={`flex items-center py-2 px-4 text-gray-700 hover:bg-gray-50 ${isCollapsed ? 'justify-center' : ''}`}
              >
                <FaTrash className={isCollapsed ? 'text-xl' : 'mr-3'} />
                {!isCollapsed && <span>回收站</span>}
              </Link>
            </nav>
          </div>
        </div>
        
        {!isCollapsed && (
          <div className="p-4">
            <div className="card-cute-pink p-4 rounded-xl text-center">
              <h3 className="font-display font-bold text-gray-800 mb-2">升级到专业版</h3>
              <p className="text-sm text-gray-600 mb-3">获得更多功能和存储空间</p>
              <button className="btn-pink text-sm py-1 px-4">立即升级</button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
} 