'use client';

import { useState, useEffect } from 'react';
import { LeaderboardService, LeaderboardRankEntry } from '@/lib/game/services/LeaderboardService';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardRankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const leaderboardService = new LeaderboardService();

    const fetchData = async () => {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

      // Fetch leaderboard
      const leaderboard = await leaderboardService.getLeaderboard(50);
      setEntries(leaderboard);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400 bg-yellow-400/10';
      case 2:
        return 'text-gray-300 bg-gray-300/10';
      case 3:
        return 'text-orange-400 bg-orange-400/10';
      default:
        return 'text-white bg-white/5';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '👑';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 p-4">
        {/* Header */}
        <div className="w-full flex items-center justify-between pt-4">
          <Link
            href="/game"
            className="text-pink-300 hover:text-pink-200 transition-colors pixel-font text-xs"
          >
            &larr; Play Game
          </Link>
          <h1 className="pixel-font text-xl text-yellow-400">LEADERBOARD</h1>
          <Link
            href="/"
            className="text-cyan-300 hover:text-cyan-200 transition-colors pixel-font text-xs"
          >
            Home
          </Link>
        </div>

        {/* Leaderboard Container */}
        <div
          className="w-full rounded-lg overflow-hidden"
          style={{
            border: '4px solid #ffd700',
            boxShadow: 'inset 0 0 0 4px #805ad5, 0 0 20px rgba(255, 215, 0, 0.3)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 p-4 border-b-2 border-purple-500/50 bg-purple-900/50">
            <div className="col-span-2 pixel-font text-xs text-gray-400 text-center">
              RANK
            </div>
            <div className="col-span-5 pixel-font text-xs text-gray-400">
              PLAYER
            </div>
            <div className="col-span-3 pixel-font text-xs text-gray-400 text-right">
              SCORE
            </div>
            <div className="col-span-2 pixel-font text-xs text-gray-400 text-right">
              GAMES
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-8 text-center">
              <p className="pixel-font text-sm text-gray-400 animate-pulse">
                Loading...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && entries.length === 0 && (
            <div className="p-8 text-center">
              <p className="pixel-font text-sm text-gray-400">
                No scores yet. Be the first!
              </p>
              <Link
                href="/game"
                className="inline-block mt-4 px-4 py-2 pixel-font text-xs text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400/20 transition-colors"
              >
                PLAY NOW
              </Link>
            </div>
          )}

          {/* Leaderboard Entries */}
          <div className="max-h-[60vh] overflow-y-auto">
            {entries.map((entry) => {
              const isCurrentUser = entry.user_id === currentUserId;
              return (
                <div
                  key={entry.user_id}
                  className={`grid grid-cols-12 gap-2 p-4 border-b border-purple-500/20 transition-colors hover:bg-purple-500/10 ${
                    isCurrentUser ? 'bg-purple-600/20' : ''
                  } ${getRankStyle(entry.rank)}`}
                >
                  {/* Rank */}
                  <div className="col-span-2 pixel-font text-sm text-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Player Name */}
                  <div className="col-span-5 pixel-font text-sm truncate">
                    {entry.display_name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-cyan-400">(YOU)</span>
                    )}
                  </div>

                  {/* High Score */}
                  <div className="col-span-3 pixel-font text-sm text-right font-bold">
                    {entry.high_score.toLocaleString()}
                  </div>

                  {/* Games Played */}
                  <div className="col-span-2 pixel-font text-sm text-right text-gray-400">
                    {entry.games_played}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="pixel-font text-xs text-gray-500 text-center">
          Only the highest score per player is shown
        </p>
      </div>
    </div>
  );
}
