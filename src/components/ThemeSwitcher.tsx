import { useTheme, type Theme } from '../hooks/useTheme'

const THEMES: { key: Theme; label: string }[] = [
  { key: 'light', label: 'Light theme' },
  { key: 'dark', label: 'Dark theme' },
  { key: 'pink', label: 'Pink theme' },
]

export default function ThemeSwitcher() {
  const { setTheme } = useTheme()

  return (
    <div className="theme-switcher">
      {THEMES.map(({ key, label }) => (
        <button key={key} className={`theme-btn ${key}`} onClick={() => setTheme(key)} aria-label={label} />
      ))}
    </div>
  )
}