import { CheckOutlined, PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Empty, List, Space, Spin, Tag, Typography, Input, Form } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '../auth'
import { useCreateNotification, useMarkNotificationRead, useNotifications } from './hooks'

const { Title, Text } = Typography

export function NotificationsPage() {
  const { t } = useTranslation()
  const { data: user } = useCurrentUser()
  const { data, isLoading, isError, refetch } = useNotifications()
  const markRead = useMarkNotificationRead()
  const createNotification = useCreateNotification()
  const [message, setMessage] = useState('')

  const handleCreate = () => {
    if (!user || !message.trim()) return
    createNotification.mutate(
      { userId: user.id, message: message.trim(), type: 'in-app' },
      {
        onSuccess: () => setMessage(''),
      }
    )
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">{t('common.loading')}</Text>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        message={t('notifications.loadError')}
        action={
          <Button size="small" onClick={() => void refetch()}>
            {t('common.retry')}
          </Button>
        }
      />
    )
  }

  const items = data?.data ?? []

  return (
    <div data-testid="notifications-page">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            <span data-testid="notifications-title">{t('notifications.title')}</span>
          </Title>
          <Text type="secondary">{t('notifications.subtitle')}</Text>
        </div>

        <Form layout="inline" onFinish={handleCreate} style={{ width: '100%' }}>
          <Form.Item style={{ flex: 1, marginInlineEnd: 8 }}>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('notifications.messagePlaceholder')}
              maxLength={500}
              data-testid="notification-message-input"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={createNotification.isPending}
              disabled={!message.trim()}
              data-testid="notification-create-submit"
            >
              {t('notifications.create')}
            </Button>
          </Form.Item>
        </Form>

        {createNotification.isError && (
          <Alert type="error" showIcon message={t('notifications.createError')} />
        )}

        {items.length === 0 ? (
          <Empty description={t('notifications.empty')} />
        ) : (
          <List
            bordered
            dataSource={items}
            data-testid="notifications-list"
            renderItem={(item) => (
              <List.Item
                data-testid={`notification-item-${item.id}`}
                actions={[
                  !item.read ? (
                    <Button
                      key="read"
                      size="small"
                      icon={<CheckOutlined />}
                      loading={markRead.isPending}
                      onClick={() => markRead.mutate(item.id)}
                      data-testid={`notification-mark-read-${item.id}`}
                    >
                      {t('notifications.markRead')}
                    </Button>
                  ) : (
                    <Tag key="read" color="green" data-testid={`notification-read-${item.id}`}>
                      {t('notifications.read')}
                    </Tag>
                  ),
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong={!item.read} data-testid={`notification-message-${item.id}`}>
                        {item.message}
                      </Text>
                      <Tag>{item.type}</Tag>
                    </Space>
                  }
                  description={new Date(item.createdAt).toLocaleString()}
                />
              </List.Item>
            )}
          />
        )}
      </Space>
    </div>
  )
}
