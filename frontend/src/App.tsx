import { Card, Typography, Layout } from 'antd'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginForm, SignupForm, RequireAuth } from './features/auth'
import { NotificationsPage } from './features/notifications'
import { AppLayout } from './layouts/AppLayout'

const { Title } = Typography
const { Content } = Layout

function AuthShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Card style={{ width: 400, maxWidth: '100%' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
            {title}
          </Title>
          {children}
        </Card>
      </Content>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthShell title="VibeWork">
              <LoginForm />
            </AuthShell>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthShell title="VibeWork">
              <SignupForm />
            </AuthShell>
          }
        />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/" element={<Navigate to="/notifications" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
