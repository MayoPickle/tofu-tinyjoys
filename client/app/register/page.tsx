'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa';

// 注册表单验证架构
const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, '用户名至少需要3个字符')
    .max(50, '用户名不能超过50个字符')
    .matches(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
    .required('用户名是必填项'),
  email: Yup.string()
    .email('请输入有效的电子邮件地址')
    .required('电子邮件地址是必填项'),
  password: Yup.string()
    .min(6, '密码至少需要6个字符')
    .required('密码是必填项'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], '密码不匹配')
    .required('请确认密码'),
});

export default function Register() {
  const { register } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await register(values.username, values.email, values.password);
      // 注册成功后会自动重定向到仪表板
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        '注册失败，请稍后再试'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-tofupink-50 to-white px-4 py-8">
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
        
        <div className="card-cute-pink bg-white p-8 rounded-2xl shadow-medium">
          <h2 className="text-2xl font-display font-bold text-center mb-6">创建新账号</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <Formik
            initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                    用户名
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <Field
                      id="username"
                      name="username"
                      type="text"
                      placeholder="yourname"
                      className={`input-cute-pink pl-10 w-full ${
                        errors.username && touched.username ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  <ErrorMessage name="username" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                
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
                      className={`input-cute-pink pl-10 w-full ${
                        errors.email && touched.email ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                
                <div className="mb-4">
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
                      className={`input-cute-pink pl-10 w-full ${
                        errors.password && touched.password ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                    确认密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className={`input-cute-pink pl-10 w-full ${
                        errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-pink w-full flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      正在注册...
                    </>
                  ) : (
                    '注册'
                  )}
                </button>
              </Form>
            )}
          </Formik>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              已有账号？{' '}
              <Link
                href="/login"
                className="text-tofupink-600 hover:text-tofupink-800 font-bold"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-center text-gray-500 text-sm">
          <p>
            注册即表示您同意我们的{' '}
            <Link href="/terms" className="text-gray-700 hover:underline">
              使用条款
            </Link>{' '}
            和{' '}
            <Link href="/privacy" className="text-gray-700 hover:underline">
              隐私政策
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 