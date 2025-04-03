'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa';

// 登录表单验证架构
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('请输入有效的电子邮件地址')
    .required('电子邮件地址是必填项'),
  password: Yup.string()
    .required('密码是必填项')
    .min(6, '密码至少需要6个字符'),
});

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (values: { email: string; password: string }, { setSubmitting }: any) => {
    try {
      await login(values.email, values.password);
      // 登录成功后会自动重定向到仪表板
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        '登录失败，请检查您的电子邮件和密码'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-tofupink-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-tofupink-500 text-2xl font-bold">🧸</span>
              </div>
              <h1 className="text-3xl font-display font-bold text-gray-800">豆腐小乐事</h1>
            </div>
          </Link>
        </div>
        
        <div className="card-cute-blue bg-white p-8 rounded-2xl shadow-medium">
          <h2 className="text-2xl font-display font-bold text-center mb-6">欢迎回来</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                    电子邮件
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      className={`input-cute-blue pl-10 w-full ${
                        errors.email && touched.email ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                    密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className={`input-cute-blue pl-10 w-full ${
                        errors.password && touched.password ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      记住我
                    </label>
                  </div>
                  
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    忘记密码？
                  </Link>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      正在登录...
                    </>
                  ) : (
                    '登录'
                  )}
                </button>
              </Form>
            )}
          </Formik>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              还没有账号？{' '}
              <Link
                href="/register"
                className="text-primary-600 hover:text-primary-800 font-bold"
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 