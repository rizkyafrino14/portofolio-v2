'use client'

import { fetcher } from '@/utils/service/Fetcher'
import { FaCodeFork, FaGithub } from 'react-icons/fa6'
import { GoStarFill } from 'react-icons/go'
import useSWR from 'swr'
import AnimatedCounter from './AnimatedCounter'

const REPO = 'rizkyafrino14/portofolio-v2'

export default function GithubStar() {
  const { data } = useSWR(`https://api.github.com/repos/${REPO}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  // Kalau API gagal / rate-limit, kartu tidak ditampilkan (tidak crash).
  if (!data || typeof data.stargazers_count !== 'number') return null

  return (
    <a
      href={`https://github.com/${REPO}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-10 hidden items-center gap-3 rounded-2xl border-2 border-ink bg-card px-4 py-2 shadow-pop transition-transform hover:-translate-y-0.5 md:flex"
    >
      <FaGithub className="text-2xl text-ink" />
      <div className="leading-tight">
        <p className="text-sm font-bold text-ink">portofolio-v2</p>
        <div className="flex items-center gap-3 text-xs font-bold text-muted">
          <span className="flex items-center gap-1">
            <GoStarFill className="text-sun" />
            <AnimatedCounter from={0} to={data.stargazers_count} />
          </span>
          <span className="flex items-center gap-1">
            <FaCodeFork />
            <AnimatedCounter from={0} to={data.forks} />
          </span>
        </div>
      </div>
    </a>
  )
}
