'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaCog, 
  FaBell, 
  FaSearch,
  FaChevronDown
} from 'react-icons/fa';

interface HeaderProps {
  username: string;
}

export default function Header({ username }: HeaderProps) {
  const { logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm py-3 px-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center">
            <div className="w-8 h-8 bg-tofupink-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-tofupink-500 text-lg font-bold">🧸</span>
            </div>
            <h1 className="text-xl font-display font-bold text-gray-800">豆腐小乐事</h1>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center relative w-1/3 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="搜索待办事项..." 
            className="input-cute-blue pl-10 w-full"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full bg-tofupink-50 text-tofupink-500 hover:bg-tofupink-100">
            <FaBell className="text-lg" />
          </button>
          
          <div className="relative">
            <button 
              onClick={toggleDropdown}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <FaUser className="text-primary-500" />
              </div>
              <span className="hidden md:inline font-medium">{username}</span>
              <FaChevronDown className="hidden md:inline text-gray-500 text-xs" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                <Link 
                  href="/profile" 
                  className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  <FaUser className="mr-2 text-primary-500" />
                  个人资料
                </Link>
                <Link 
                  href="/settings" 
                  className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  <FaCog className="mr-2 text-gray-500" />
                  设置
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  <FaSignOutAlt className="mr-2 text-red-500" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 