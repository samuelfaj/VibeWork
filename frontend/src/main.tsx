import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query'
import { AntdProvider } from './lib/AntdProvider'
import App from './App'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AntdProvider>
        <App />
      </AntdProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
