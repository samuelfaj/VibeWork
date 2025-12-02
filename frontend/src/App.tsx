import { useState } from 'react'
import { LoginForm, SignupForm } from './features/auth'

function App() {
  const [showLogin, setShowLogin] = useState(true)

  return (
    <div>
      <h1>Vibe Code</h1>
      {showLogin ? (
        <LoginForm onSwitchToSignup={() => setShowLogin(false)} />
      ) : (
        <SignupForm onSwitchToLogin={() => setShowLogin(true)} />
      )}
    </div>
  )
}

export default App
