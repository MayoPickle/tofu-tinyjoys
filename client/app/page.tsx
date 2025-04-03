'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaCheck, FaCalendarAlt, FaMobileAlt, FaSync, FaHeart } from 'react-icons/fa';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // 如果用户已登录，重定向到仪表板
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <nav className="bg-white shadow-soft py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-tofupink-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-tofupink-500 text-xl font-bold">🧸</span>
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-gray-800">豆腐小乐事</h1>
          </div>
          <div className="flex space-x-4">
            <Link href="/login" className="btn-primary text-sm">
              登录
            </Link>
            <Link href="/register" className="btn-pink text-sm">
              注册
            </Link>
          </div>
        </div>
      </nav>

      {/* 英雄区 */}
      <section className="bg-gradient-to-b from-white to-primary-50 py-12 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-800 mb-4">
              管理待办事项<br />
              <span className="text-tofupink-500">从未如此可爱</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              豆腐小乐事是一个精美的待办事项应用，帮助你轻松管理日常任务，让每一天都充满乐趣。
            </p>
            <div className="flex space-x-4">
              <Link href="/register" className="btn-primary">
                免费注册
              </Link>
              <Link href="/about" className="btn-secondary">
                了解更多
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 bounce-hover">
              <Image 
                src="/todolist-hero.png" 
                alt="豆腐小乐事应用展示" 
                width={400} 
                height={400}
                className="rounded-3xl shadow-hard"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 特性区 */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-center mb-12">
            为什么选择<span className="text-primary-500">豆腐小乐事</span>？
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-cute-pink text-center">
              <div className="w-16 h-16 bg-tofupink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-tofupink-500 text-2xl" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">简单易用</h3>
              <p className="text-gray-600">
                直观的界面设计，让任务管理变得轻松愉快，不再有繁琐的操作。
              </p>
            </div>
            
            <div className="card-cute-blue text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="text-primary-500 text-2xl" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">多视图模式</h3>
              <p className="text-gray-600">
                支持日视图、周视图和月视图，灵活满足不同的计划管理需求。
              </p>
            </div>
            
            <div className="card-cute-orange text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMobileAlt className="text-secondary-500 text-2xl" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">全平台支持</h3>
              <p className="text-gray-600">
                网页、iOS和Android应用，随时随地管理你的待办事项。
              </p>
            </div>
            
            <div className="card-cute-purple text-center">
              <div className="w-16 h-16 bg-tofupurple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSync className="text-tofupurple-500 text-2xl" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">多设备同步</h3>
              <p className="text-gray-600">
                自动在所有设备间同步数据，让你的待办事项始终保持一致。
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 号召行动 */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-tofupink-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-display font-bold mb-4">
            准备好开始使用了吗？
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            加入豆腐小乐事，让待办事项管理变得更加愉快！免费注册，立即开始。
          </p>
          <Link href="/register" className="btn-primary text-lg px-8 py-3">
            现在开始
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-display font-bold">豆腐小乐事</h3>
              <p className="text-gray-400">让每一天都充满乐趣</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-gray-300 hover:text-white">
                关于我们
              </Link>
              <Link href="/privacy" className="text-gray-300 hover:text-white">
                隐私政策
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-white">
                使用条款
              </Link>
              <Link href="/help" className="text-gray-300 hover:text-white">
                帮助中心
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400 flex items-center justify-center">
            <span>用</span>
            <FaHeart className="text-tofupink-500 mx-1" />
            <span>制作 © {new Date().getFullYear()} 豆腐小乐事团队</span>
          </div>
        </div>
      </footer>
    </main>
  );
} 