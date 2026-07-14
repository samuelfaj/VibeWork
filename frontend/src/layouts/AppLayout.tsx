import { LogoutOutlined, BellOutlined } from '@ant-design/icons'
import { Button, Layout, Space, Typography } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCurrentUser, useLogout } from '../features/auth'

const { Header, Content } = Layout
const { Text } = Typography

export function AppLayout() {
  const { t } = useTranslation()
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        void navigate('/login')
      },
    })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
          paddingInline: 24,
        }}
      >
        <Space>
          <BellOutlined style={{ color: '#fff', fontSize: 18 }} />
          <Text style={{ color: '#fff', fontWeight: 600 }}>VibeWork</Text>
        </Space>
        <Space>
          {user && (
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
              {user.name} · {user.role}
            </Text>
          )}
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            loading={logout.isPending}
            style={{ color: '#fff' }}
            data-testid="logout-button"
          >
            {t('auth.logout')}
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: 24, maxWidth: 880, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>
    </Layout>
  )
}
