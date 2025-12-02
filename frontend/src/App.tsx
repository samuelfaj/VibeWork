import { useState } from 'react'
import { Card, Typography, Layout } from 'antd'
import { LoginForm, SignupForm } from './features/auth'

const { Title } = Typography
const { Content } = Layout

function App() {
  const [showLogin, setShowLogin] = useState(true)

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
            Vibe Code
          </Title>
          {showLogin ? (
            <LoginForm onSwitchToSignup={() => setShowLogin(false)} />
          ) : (
            <SignupForm onSwitchToLogin={() => setShowLogin(true)} />
          )}
        </Card>
      </Content>
    </Layout>
  )
}

export default App
