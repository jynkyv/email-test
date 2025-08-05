'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { htmlToText, textToHtml } from '@/lib/utils';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  message, 
  Modal, 
  Form, 
  Input, 
  Progress,
  Spin,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  EditOutlined, 
  EyeOutlined,
  ClockCircleOutlined,
  CodeOutlined
} from '@ant-design/icons';

const { TextArea } = Input;

interface Approval {
  id: string;
  applicant_id: string;
  approver_id?: string;
  subject: string;
  content: string;
  recipients: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
  applicant: {
    username: string;
    role: string;
  };
  approver?: {
    username: string;
  };
}

export default function ApprovalsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  
  // 详情弹窗相关状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm] = Form.useForm();
  const [updating, setUpdating] = useState(false);
  
  // 发送进度相关状态
  const [sendingProgress, setSendingProgress] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sendingResults, setSendingResults] = useState<any[]>([]);
  
  // 筛选相关状态
  const [applicantName, setApplicantName] = useState('');

  // 获取审核列表
  const fetchApprovals = async (page = 1, size = 50) => {
    setLoading(true);
    try {
      let url = `/api/email-approvals?page=${page}&pageSize=${size}`;
      
      // 添加申请人名称筛选参数
      if (applicantName.trim()) {
        url += `&applicantName=${encodeURIComponent(applicantName.trim())}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setApprovals(data.approvals || []);
        setTotal(data.total || 0);
        setCurrentPage(page);
        setPageSize(size);
      }
    } catch (error) {
              console.error('Failed to fetch approvals:', error);
      message.error(t('approval.fetchApprovalsFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 获取审核详情
  const fetchApprovalDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/email-approvals/${id}`, {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSelectedApproval(data.approval);
        setDetailModalVisible(true);
        // 设置编辑表单的初始值
        editForm.setFieldsValue({
          subject: data.approval.subject,
          content: data.approval.content
        });
      }
    } catch (error) {
              console.error('Failed to fetch approval detail:', error);
      message.error(t('approval.fetchDetailFailed'));
    }
  };

  // 审核操作
  const handleApprovalAction = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      // 审核通过，显示发送进度
      await handleApproveWithProgress(id);
    } else {
      // 审核拒绝
      try {
        const response = await fetch(`/api/email-approvals/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.id}`,
          },
          body: JSON.stringify({ action }),
        });

        const data = await response.json();
        if (data.success) {
          message.success(data.message);
          fetchApprovals(currentPage, pageSize);
          if (detailModalVisible) {
            setDetailModalVisible(false);
          }
        } else {
          message.error(data.error || t('approval.actionFailed'));
        }
      } catch (error) {
        console.error('Approval action failed:', error);
        message.error(t('approval.actionFailed'));
      }
    }
  };

  // 带进度显示的审核通过
  const handleApproveWithProgress = async (id: string) => {
    try {
      // 获取审核申请详情以获取收件人数量
      const detailResponse = await fetch(`/api/email-approvals/${id}`, {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      const detailData = await detailResponse.json();
      
      if (detailData.success) {
        const recipients = detailData.approval.recipients;
        setTotalCount(recipients.length);
        setSentCount(0);
        setProgressPercent(0);
        
        // 设置初始状态为待发送
        const initialResults = recipients.map((recipient: string) => ({
          email: recipient,
          success: false,
          status: 'pending',
          error: null
        }));
        setSendingResults(initialResults);
        setSendingProgress(true);
        
        // 添加邮件到队列
        const queueResponse = await fetch('/api/email-queue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.id}`,
          },
          body: JSON.stringify({ approvalId: id }),
        });

        const queueData = await queueResponse.json();
        if (!queueData.success) {
          message.error(queueData.error || t('email.queueAddFailed'));
          setSendingProgress(false);
          return;
        }

        // 开始轮询队列状态
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/email-queue?approvalId=${id}`, {
              headers: {
                'Authorization': `Bearer ${user?.id}`,
              },
            });
            
            const statusData = await statusResponse.json();
            if (statusData.success) {
              const { stats, queue } = statusData;
              setProgressPercent(stats.progress);
              setSentCount(stats.sent);
              
              // 更新发送结果
              const results = queue.map((item: any) => {
                let status = 'pending';
                let error = null;
                
                if (item.status === 'sent') {
                  status = 'success';
                } else if (item.status === 'failed') {
                  status = 'failed';
                  error = item.error_message;
                } else if (item.status === 'processing') {
                  status = 'processing';
                }
                
                return {
                  email: item.recipient,
                  success: item.status === 'sent',
                  status: status,
                  error: error
                };
              });
              setSendingResults(results);

              console.log('Queue status updated:', { stats, results });

              // 如果所有邮件都处理完成，停止轮询
              if (stats.completed === stats.total && stats.total > 0) {
                clearInterval(pollInterval);
                setTimeout(() => {
                  const successMessage = t('email.sendComplete', { sent: stats.sent, failed: stats.failed });
                  console.log('Send completed:', successMessage);
                  message.success(successMessage);
                  setSendingProgress(false);
                  fetchApprovals(currentPage, pageSize);
                  if (detailModalVisible) {
                    setDetailModalVisible(false);
                  }
                }, 1000);
              }
            }
          } catch (error) {
            console.error('Failed to poll queue status:', error);
          }
        }, 3000); // 每3秒轮询一次

        // 开始持续处理队列直到完成
        const processQueue = async () => {
          try {
            const processResponse = await fetch('/api/email-queue/process', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${user?.id}`,
              },
            });
            
            const processData = await processResponse.json();
            if (processData.success && processData.hasRemaining) {
              // 如果还有待处理的邮件，继续处理
              console.log(`Still ${processData.remainingCount} emails to process, continuing...`);
              setTimeout(processQueue, 1000); // 1秒后继续处理
            } else {
              console.log('Queue processing completed');
            }
          } catch (error) {
            console.error('Queue processing failed:', error);
          }
        };
        
        // 启动队列处理
        processQueue();

      } else {
        message.error(t('email.fetchApprovalDetailFailed'));
      }
    } catch (error) {
              console.error('Approval action failed:', error);
      message.error(t('approval.actionFailed'));
      setSendingProgress(false);
    }
  };

  // 保存编辑内容
  const handleSaveEdit = async () => {
    if (!selectedApproval) return;

    try {
      const values = await editForm.validateFields();
      setUpdating(true);

      // 直接使用用户输入的内容，保持HTML标签
      const htmlContent = values.content;

      const response = await fetch(`/api/email-approvals/${selectedApproval.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          action: 'update',
          subject: values.subject,
          content: htmlContent
        }),
      });

      const data = await response.json();
      if (data.success) {
        message.success(data.message);
        setIsEditing(false);
        fetchApprovals(currentPage, pageSize);
        // 更新当前选中的审核记录
        if (selectedApproval) {
          setSelectedApproval({
            ...selectedApproval,
            subject: values.subject,
            content: htmlContent
          });
        }
      } else {
        message.error(data.error || t('approval.updateFailed'));
      }
    } catch (error) {
      console.error('Failed to save edit:', error);
      message.error(t('approval.updateFailed'));
    } finally {
      setUpdating(false);
    }
  };

  // 显示详情
  const handleShowDetail = (approval: Approval) => {
    setSelectedApproval(approval);
    setIsEditing(false);
    setDetailModalVisible(true);
    
    // 直接使用原始内容，保持HTML标签
    editForm.setFieldsValue({
      subject: approval.subject,
      content: approval.content
    });
  };

  // 开始编辑
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedApproval) {
      // 重新设置表单值为原始内容
      editForm.setFieldsValue({
        subject: selectedApproval.subject,
        content: selectedApproval.content
      });
    }
  };

  // 处理申请人名称筛选
  const handleApplicantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApplicantName(e.target.value);
  };

  // 处理筛选搜索
  const handleSearch = () => {
    setCurrentPage(1); // 重置到第一页
    fetchApprovals(1, pageSize);
  };

  // 清空筛选
  const handleClearFilter = () => {
    setApplicantName('');
    setCurrentPage(1);
    fetchApprovals(1, pageSize);
  };

  useEffect(() => {
    if (user) {
      fetchApprovals();
    }
  }, [user]);

  // 表格列定义
  const columns = [
    {
      title: t('approval.applicant'),
      dataIndex: ['applicant', 'username'],
      key: 'applicant',
      width: 120,
    },
    {
      title: t('approval.applicationTime'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: t('approval.content'),
      dataIndex: 'subject',
      key: 'content',
      render: (text: string, record: Approval) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{text}</div>
          <div className="text-sm text-gray-600 truncate">{record.content}</div>
        </div>
      ),
    },
    {
      title: t('approval.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'orange', text: t('approval.pending'), icon: <ClockCircleOutlined /> },
          approved: { color: 'green', text: t('approval.approved'), icon: <CheckOutlined /> },
          rejected: { color: 'red', text: t('approval.rejected'), icon: <CloseOutlined /> },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 200,
      render: (text: string, record: Approval) => (
        <Space size="small">
          <Tooltip title={t('approval.viewDetail')}>
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleShowDetail(record)}
            />
          </Tooltip>
          
          {user?.role === 'admin' && record.status === 'pending' && (
            <>
              <Tooltip title={t('approval.edit')}>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleShowDetail(record)}
                />
              </Tooltip>
              <Popconfirm
                title={t('approval.confirmApprove')}
                onConfirm={() => handleApprovalAction(record.id, 'approve')}
                okText={t('common.confirm')}
                cancelText={t('common.cancel')}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  className="text-green-600 hover:text-green-800"
                />
              </Popconfirm>
              <Popconfirm
                title={t('approval.confirmReject')}
                onConfirm={() => handleApprovalAction(record.id, 'reject')}
                okText={t('common.confirm')}
                cancelText={t('common.cancel')}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  className="text-red-600 hover:text-red-800"
                />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card title={t('approval.approvalManagement')} className="h-full">
        {/* 筛选区域 */}
        <div className="mb-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{t('approval.applicant')}:</span>
            <Input
              placeholder={t('approval.searchByApplicant')}
              value={applicantName}
              onChange={handleApplicantNameChange}
              style={{ width: 200 }}
              onPressEnter={handleSearch}
              allowClear
            />
            <Button type="primary" onClick={handleSearch}>
              {t('common.search')}
            </Button>
            <Button onClick={handleClearFilter}>
              {t('common.clear')}
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={approvals}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: {
              goButton: true
            },
            showTotal: (total, range) => 
              t('common.totalRecords', { total }) + 
              ` (${range[0]}-${range[1]})`,
            onChange: (page, size) => fetchApprovals(page, size || 50),
            itemRender: (page, type, originalElement) => {
              if (type === 'page') {
                return (
                  <Button
                    type={page === currentPage ? 'primary' : 'default'}
                    size="small"
                    onClick={() => fetchApprovals(page, pageSize)}
                  >
                    {page}
                  </Button>
                );
              }
              return originalElement;
            },
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title={t('approval.approvalDetails')}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
        closable={true}
        maskClosable={true}
        keyboard={true}
      >
        <div className="space-y-6">
          {/* 审核状态信息 */}
          <div className="space-y-2">
            <div>
              <span className="font-medium">{t('approval.applicant')}:</span>
              <span className="ml-2">{selectedApproval?.applicant.username}</span>
            </div>
            <div>
              <span className="font-medium">{t('approval.status')}:</span>
              <span className="ml-2">
                {selectedApproval?.status === 'pending' && t('approval.pending')}
                {selectedApproval?.status === 'approved' && t('approval.approved')}
                {selectedApproval?.status === 'rejected' && t('approval.rejected')}
              </span>
            </div>
            {selectedApproval?.approver && (
              <div>
                <span className="font-medium">{t('approval.approver')}:</span>
                <span className="ml-2">{selectedApproval.approver.username}</span>
              </div>
            )}
          </div>

          {/* 收件人列表 */}
          <div>
            <div className="font-medium mb-2">{t('approval.recipients')}:</div>
            <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {selectedApproval?.recipients.map((recipient, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                  >
                    {recipient}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 邮件内容 */}
          <div>
            <div className="font-medium mb-2">{t('approval.emailContent')}:</div>
            {isEditing ? (
              <Form form={editForm} layout="vertical">
                <Form.Item
                  name="subject"
                  label={t('email.emailSubject')}
                  rules={[{ required: true, message: t('email.subjectRequired') }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="content"
                  label={
                    <div className="flex items-center justify-between">
                      <span>{t('email.emailContent')}</span>
                      <div className="flex items-center gap-2">
                        <Tooltip title={t('email.htmlSupported')}>
                          <CodeOutlined className="text-blue-500" />
                        </Tooltip>
                        <span className="text-xs text-gray-500">
                          {t('email.htmlSupportText')}
                        </span>
                      </div>
                    </div>
                  }
                  rules={[{ required: true, message: t('email.contentRequired') }]}
                >
                  <TextArea 
                    rows={8} 
                    placeholder="支持HTML标签，可以直接编辑HTML内容..."
                    maxLength={10000}
                  />
                </Form.Item>
              </Form>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-700">{t('email.emailSubject')}:</div>
                  <div className="bg-gray-50 p-3 rounded-lg">{selectedApproval?.subject}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">{t('email.emailContent')}:</div>
                  <div className="bg-gray-50 p-3 rounded-lg max-h-64 overflow-y-auto">
                    {(() => {
                      // 检查是否是HTML内容（包含HTML标签）
                      if (selectedApproval?.content.includes('<') && selectedApproval?.content.includes('>')) {
                        // 复杂HTML内容使用dangerouslySetInnerHTML
                        return (
                          <div 
                            className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-gray-800 prose-img:my-0 prose-img:mx-0"
                            dangerouslySetInnerHTML={{ __html: selectedApproval.content }}
                          />
                        );
                      } else {
                        // 纯文本内容
                        return (
                          <div className="whitespace-pre-wrap">
                            {selectedApproval?.content}
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            {user?.role === 'admin' && selectedApproval?.status === 'pending' && (
              <>
                {isEditing ? (
                  <>
                    <Button onClick={handleCancelEdit}>
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="primary"
                      loading={updating}
                      onClick={handleSaveEdit}
                    >
                      {t('common.save')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button icon={<EditOutlined />} onClick={handleStartEdit}>
                      {t('common.edit')}
                    </Button>
                  </>
                )}
              </>
            )}
            <Button onClick={() => setDetailModalVisible(false)}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 发送进度显示 */}
      {sendingProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">{t('email.sending')}</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{t('email.progress')}</span>
                  <span>{sentCount} / {totalCount}</span>
                </div>
                <Progress 
                  percent={progressPercent} 
                  status={progressPercent === 100 ? 'success' : 'active'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
              
              {sendingResults.length > 0 && (
                <div className="max-h-32 overflow-y-auto">
                  <div className="text-sm font-medium mb-2">{t('email.sentResults')}:</div>
                  <div className="space-y-1">
                    {sendingResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="truncate">{result.email}</span>
                        {result.status === 'pending' && (
                          <Tag color="default">
                            {t('email.pending')}
                          </Tag>
                        )}
                        {result.status === 'processing' && (
                          <Tag color="processing">
                            {t('email.processing')}
                          </Tag>
                        )}
                        {result.status === 'success' && (
                          <Tag color="success">
                            {t('email.sent')}
                          </Tag>
                        )}
                        {result.status === 'failed' && (
                          <Tag color="error">
                            {t('email.failed')}
                          </Tag>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 