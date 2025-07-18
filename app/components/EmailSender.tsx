'use client';

import { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Progress, 
  message, 
  Space,
  Divider 
} from 'antd';
import { 
  SendOutlined, 
  UserOutlined, 
  FileTextOutlined 
} from '@ant-design/icons';

const { TextArea } = Input;

interface ReplyData {
  to: string;
  subject: string;
  content: string;
}

interface EmailSenderProps {
  replyData?: ReplyData | null;
  onSendComplete?: () => void;
}

export default function EmailSender({ replyData, onSendComplete }: EmailSenderProps) {
  const [form] = Form.useForm();
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalEmails, setTotalEmails] = useState(0);
  const [sentEmails, setSentEmails] = useState(0);

  // 当收到回信数据时，自动填充表单
  useEffect(() => {
    if (replyData) {
      form.setFieldsValue({
        to: replyData.to,
        subject: replyData.subject,
        content: replyData.content,
      });
    }
  }, [replyData, form]);

  const handleSubmit = async (values: {
    to: string;
    subject: string;
    content: string;
  }) => {
    if (!values.to.trim() || !values.subject.trim() || !values.content.trim()) {
      message.error('请填写所有必填字段');
      return;
    }

    setIsSending(true);
    setProgress(0);
    setSentEmails(0);

    // 解析收件人列表
    const recipients = values.to
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    setTotalEmails(recipients.length);

    if (recipients.length === 0) {
      message.error('请输入有效的邮箱地址');
      setIsSending(false);
      return;
    }

    // 逐个发送邮件
    for (let i = 0; i < recipients.length; i++) {
      try {
        const response = await fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: recipients[i],
            subject: values.subject,
            html: values.content,
            isBulk: true
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          setSentEmails(prev => prev + 1);
        }
        
        // 更新进度
        setProgress(((i + 1) / recipients.length) * 100);
        
        // 等待3秒再发送下一封
        if (i < recipients.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error('发送邮件失败:', error);
      }
    }

    setIsSending(false);
    setProgress(0);
    setSentEmails(0);
    setTotalEmails(0);
    
    // 清空表单
    form.resetFields();
    
    // 通知父组件发送完成
    onSendComplete?.();
    message.success('邮件发送完成');
  };

  return (
    <Card title="群发邮件" className="h-full">
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        className="h-full flex flex-col"
      >
        <div className="flex-1 space-y-4">
          <Form.Item
            name="to"
            label="收件人列表"
            rules={[{ required: true, message: '请输入收件人!' }]}
          >
            <TextArea
              rows={3}
              placeholder="email1@example.com, email2@example.com, email3@example.com"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item
            name="subject"
            label="邮件主题"
            rules={[{ required: true, message: '请输入邮件主题!' }]}
          >
            <Input placeholder="邮件主题 (支持中文、日文等)" />
          </Form.Item>

          <Form.Item
            name="content"
            label="邮件内容"
            rules={[{ required: true, message: '请输入邮件内容!' }]}
            className="flex-1"
          >
            <TextArea
              rows={12}
              placeholder="请输入邮件内容... (支持中文、日文等)"
              showCount
              maxLength={5000}
            />
          </Form.Item>
        </div>

        <Divider />

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSending}
            icon={<SendOutlined />}
            size="large"
            block
          >
            {isSending ? '发送中...' : '发送邮件'}
          </Button>
        </Form.Item>
      </Form>

      {/* 发送进度 */}
      {isSending && (
        <Card size="small" className="mt-4">
          <Space direction="vertical" className="w-full">
            <div className="flex justify-between text-sm">
              <span>发送进度</span>
              <span>{sentEmails}/{totalEmails}</span>
            </div>
            <Progress percent={progress} status="active" />
          </Space>
        </Card>
      )}
    </Card>
  );
} 