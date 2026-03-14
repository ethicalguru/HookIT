import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useStats(session) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refetch = useCallback(async () => {
    if (!session?.access_token) {
      setData(null)
      setLoading(false)
      setError('')
      return
    }

    try {
      setError('')

      const response = await fetch('/api/stats', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Stats request failed with status ${response.status}`)
      }

      const result = await response.json()
      setData(result ?? null)
    } catch (err) {
      console.error('Stats fetch error:', err)
      setData(null)
      setError('Could not load stats. Retry?')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    let active = true

    const firstLoad = async () => {
      setLoading(true)
      await refetch()
      if (!active) return
    }

    firstLoad()

    return () => {
      active = false
    }
  }, [refetch])

  useEffect(() => {
    if (!session?.user?.id) return undefined

    const channel = supabase
      .channel(`stats-feed-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emails',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id, refetch])

  return {
    data,
    loading,
    error,
    refetch,
  }
}