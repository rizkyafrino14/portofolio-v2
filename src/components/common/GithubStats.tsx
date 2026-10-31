'use client'
import { useTheme } from 'next-themes'
import GitHubCalendar from 'react-github-calendar'

export function GithubStats() {
  const { resolvedTheme } = useTheme()
  return (
    <div className="panel max-w-full overflow-x-auto p-4">
      <GitHubCalendar
        username="rizkyafrino14"
        blockSize={13}
        blockMargin={4}
        colorScheme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  )
}
