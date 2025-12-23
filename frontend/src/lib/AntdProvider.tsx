import { ConfigProvider } from 'antd'
import type { Locale } from 'antd/es/locale'
import enUS from 'antd/locale/en_US'
import ptBR from 'antd/locale/pt_BR'
import { useTranslation } from 'react-i18next'

const localeMap: Record<string, Locale> = {
  en: enUS,
  'pt-BR': ptBR,
}

interface AntdProviderProps {
  children: React.ReactNode
}

export function AntdProvider({ children }: AntdProviderProps) {
  const { i18n } = useTranslation()
  const locale = localeMap[i18n.language] || enUS

  return <ConfigProvider locale={locale}>{children}</ConfigProvider>
}
