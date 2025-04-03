'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { format } from 'date-fns';
import { FaCalendarAlt, FaTimes, FaTag } from 'react-icons/fa';
import { useQueryClient } from 'react-query';

// 表单验证架构
const TodoSchema = Yup.object().shape({
  title: Yup.string()
    .required('标题不能为空')
    .max(255, '标题不能超过255个字符'),
  description: Yup.string(),
  due_date: Yup.date().nullable(),
  priority: Yup.number().oneOf([0, 1, 2], '优先级必须是0、1或2'),
  color: Yup.string().matches(/^#[0-9A-Fa-f]{6}$/, '颜色格式必须是#RRGGBB'),
});

// 标签类型
interface Tag {
  id: number;
  name: string;
  color: string;
}

interface TodoFormModalProps {
  onClose: () => void;
  existingTodo?: {
    id: number;
    title: string;
    description?: string;
    due_date?: string;
    priority: number;
    color: string;
    tags: Tag[];
  };
}

export default function TodoFormModal({ onClose, existingTodo }: TodoFormModalProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  
  // 初始化表单值
  const initialValues = existingTodo
    ? {
        ...existingTodo,
        due_date: existingTodo.due_date 
          ? format(new Date(existingTodo.due_date), 'yyyy-MM-dd')
          : '',
        tags: existingTodo.tags.map(tag => tag.id),
      }
    : {
        title: '',
        description: '',
        due_date: '',
        priority: 0, // 默认优先级低
        color: '#FFFFFF',
        tags: [],
      };

  // 加载标签
  useEffect(() => {
    if (token) {
      setLoadingTags(true);
      axios.get(`${process.env.API_URL}/todos/tags`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          setTags(response.data.tags);
        })
        .catch(err => {
          console.error('加载标签失败:', err);
        })
        .finally(() => {
          setLoadingTags(false);
        });
    }
  }, [token]);

  // 点击外部关闭模态框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // 处理表单提交
  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      setLoading(true);
      setError('');
      
      // 格式化日期
      const formattedValues = {
        ...values,
        due_date: values.due_date 
          ? `${values.due_date}T00:00:00.000Z` 
          : null,
      };
      
      if (existingTodo) {
        // 更新现有待办事项
        await axios.put(
          `${process.env.API_URL}/todos/${existingTodo.id}`,
          formattedValues,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // 创建新待办事项
        await axios.post(
          `${process.env.API_URL}/todos`,
          formattedValues,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // 刷新缓存中的待办事项数据
      queryClient.invalidateQueries('todos');
      
      // 关闭模态框
      onClose();
    } catch (err: any) {
      console.error('保存待办事项失败:', err);
      setError(
        err.response?.data?.message || 
        '保存待办事项失败，请稍后再试'
      );
      setSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-display font-bold text-gray-800">
            {existingTodo ? '编辑待办事项' : '新建待办事项'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <FaTimes />
          </button>
        </div>
        
        <Formik
          initialValues={initialValues}
          validationSchema={TodoSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="p-4">
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-1">
                  标题 *
                </label>
                <Field
                  id="title"
                  name="title"
                  type="text"
                  className="input-cute-pink w-full"
                  placeholder="输入待办事项标题"
                />
                <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-1">
                  描述
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  className="input-cute-pink w-full h-24 resize-none"
                  placeholder="输入描述（可选）"
                />
                <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div className="mb-4">
                <label htmlFor="due_date" className="block text-gray-700 font-medium mb-1">
                  截止日期
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <Field
                    id="due_date"
                    name="due_date"
                    type="date"
                    className="input-cute-pink pl-10 w-full"
                  />
                </div>
                <ErrorMessage name="due_date" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">
                  优先级
                </label>
                <div className="flex space-x-2">
                  <label className="flex-1">
                    <Field
                      type="radio"
                      name="priority"
                      value={0}
                      className="sr-only"
                    />
                    <div className={`p-2 border-2 rounded-lg text-center cursor-pointer transition-colors ${values.priority === 0 ? 'border-gray-500 bg-gray-100' : 'border-gray-200'}`}>
                      <span className="text-gray-500 font-medium">低</span>
                    </div>
                  </label>
                  
                  <label className="flex-1">
                    <Field
                      type="radio"
                      name="priority"
                      value={1}
                      className="sr-only"
                    />
                    <div className={`p-2 border-2 rounded-lg text-center cursor-pointer transition-colors ${values.priority === 1 ? 'border-orange-500 bg-orange-100' : 'border-gray-200'}`}>
                      <span className="text-orange-500 font-medium">中</span>
                    </div>
                  </label>
                  
                  <label className="flex-1">
                    <Field
                      type="radio"
                      name="priority"
                      value={2}
                      className="sr-only"
                    />
                    <div className={`p-2 border-2 rounded-lg text-center cursor-pointer transition-colors ${values.priority === 2 ? 'border-red-500 bg-red-100' : 'border-gray-200'}`}>
                      <span className="text-red-500 font-medium">高</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="color" className="block text-gray-700 font-medium mb-1">
                  颜色
                </label>
                <div className="flex items-center space-x-2">
                  <Field
                    id="color"
                    name="color"
                    type="color"
                    className="w-10 h-10 border-none rounded cursor-pointer"
                  />
                  <Field
                    name="color"
                    type="text"
                    className="input-cute-pink flex-1"
                    placeholder="#RRGGBB"
                  />
                </div>
                <ErrorMessage name="color" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-1">
                  标签
                </label>
                
                {loadingTags ? (
                  <div className="text-center p-2">
                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : tags.length === 0 ? (
                  <p className="text-gray-500 text-center py-2">
                    暂无标签，请先创建标签
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <label
                        key={tag.id}
                        className={`flex items-center px-3 py-1 rounded-full cursor-pointer transition-colors ${
                          values.tags.includes(tag.id)
                            ? 'bg-opacity-100'
                            : 'bg-opacity-30'
                        }`}
                        style={{ 
                          backgroundColor: `${tag.color}${values.tags.includes(tag.id) ? '40' : '20'}`,
                          color: tag.color
                        }}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={values.tags.includes(tag.id)}
                          onChange={() => {
                            const newTags = values.tags.includes(tag.id)
                              ? values.tags.filter((id: number) => id !== tag.id)
                              : [...values.tags, tag.id];
                            setFieldValue('tags', newTags);
                          }}
                        />
                        <FaTag className="mr-1" />
                        <span>{tag.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 border-t pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="btn-primary"
                >
                  {isSubmitting || loading 
                    ? '保存中...' 
                    : existingTodo ? '更新' : '创建'
                  }
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
} 