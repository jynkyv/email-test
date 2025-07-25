'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Typography, Alert, Statistic, Row, Col } from 'antd';
import { ReloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface WebhookEntry {
  id: string;
  timestamp: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  parsedData?: any;
  analysis?: {
    type: 'email' | 'alert' | 'lead' | 'error' | 'unknown';
    confidence: number;
    summary: string;
  };
}

interface WebhookStats {
  total: number;
  typeDistribution: Record<string, number>;
}

export default function TestWebhookPage() {
  const [history, setHistory] = useState<WebhookEntry[]>([]);
  const [stats, setStats] = useState<WebhookStats>({ total: 0, typeDistribution: {} });
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WebhookEntry | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/webhook/test-inbound?action=history');
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('获取历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      const response = await fetch('/api/webhook/test-inbound?action=clear');
      const data = await response.json();
      if (data.success) {
        setHistory([]);
        setStats({ total: 0, typeDistribution: {} });
      }
    } catch (error) {
      console.error('清空历史记录失败:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
    // 每30秒自动刷新
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      email: 'blue',
      alert: 'orange',
      lead: 'green',
      error: 'red',
      unknown: 'default'
    };
    return colors[type] || 'default';
  };

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString('zh-CN')
    },
    {
      title: '类型',
      dataIndex: ['analysis', 'type'],
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{type?.toUpperCase()}</Tag>
      )
    },
    {
      title: '置信度',
      dataIndex: ['analysis', 'confidence'],
      key: 'confidence',
      render: (confidence: number) => `${(confidence * 100).toFixed(0)}%`
    },
    {
      title: '摘要',
      dataIndex: ['analysis', 'summary'],
      key: 'summary',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: WebhookEntry) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => setSelectedEntry(record)}
          >
            查看详情
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Webhook测试接口</Title>
      
      <Alert
        message="测试接口信息"
        description={
          <div>
            <p><strong>POST URL:</strong> <code>/api/webhook/test-inbound</code></p>
            <p><strong>功能:</strong> 接收webhook请求，智能分析类型，记录历史</p>
            <p><strong>支持格式:</strong> JSON, Form-Data, URL-Encoded</p>
          </div>
        }
        type="info"
        style={{ marginBottom: '24px' }}
      />

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="总请求数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="邮件类型" value={stats.typeDistribution.email || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="告警类型" value={stats.typeDistribution.alert || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="其他类型" value={stats.typeDistribution.unknown || 0} />
          </Card>
        </Col>
      </Row>

      <Card
        title="Webhook历史记录"
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchHistory}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              icon={<DeleteOutlined />} 
              onClick={clearHistory}
              danger
            >
              清空
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={history}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>

      {/* 详情弹窗 */}
      {selectedEntry && (
        <Card
          title="Webhook详情"
          style={{ marginTop: '24px' }}
          extra={
            <Button type="link" onClick={() => setSelectedEntry(null)}>
              关闭
            </Button>
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <Title level={4}>基本信息</Title>
              <p><strong>ID:</strong> {selectedEntry.id}</p>
              <p><strong>时间:</strong> {new Date(selectedEntry.timestamp).toLocaleString('zh-CN')}</p>
              <p><strong>方法:</strong> {selectedEntry.method}</p>
              {selectedEntry.analysis && (
                <>
                  <p><strong>类型:</strong> <Tag color={getTypeColor(selectedEntry.analysis.type)}>{selectedEntry.analysis.type}</Tag></p>
                  <p><strong>置信度:</strong> {(selectedEntry.analysis.confidence * 100).toFixed(0)}%</p>
                  <p><strong>摘要:</strong> {selectedEntry.analysis.summary}</p>
                </>
              )}
            </Col>
            <Col span={12}>
              <Title level={4}>请求头</Title>
              <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify(selectedEntry.headers, null, 2)}
              </pre>
            </Col>
          </Row>
          
          <Title level={4}>请求体</Title>
          <pre style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '12px' }}>
            {JSON.stringify(selectedEntry.parsedData || selectedEntry.body, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
} 