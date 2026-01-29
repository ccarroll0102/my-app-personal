'use client';

import { useState, useEffect, useRef } from 'react';
import { GameCanvas } from '@/components/game/GameCanvas';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { LivesState } from '@/types/game';
import { LeaderboardService } from '@/lib/game/services/LeaderboardService';
import Link from 'next/link';

export default function GamePage() {
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [livesState, setLivesState] = useState<LivesState | null>(null);
  const leaderboardServiceRef = useRef<LeaderboardService | null>(null);

  // Load high score from localStorage and init leaderboard service on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('wizardRunHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    leaderboardServiceRef.current = new LeaderboardService();
  }, []);

  // Get authenticated user
  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLivesChange = (lives: LivesState) => {
    setLivesState(lives);
  };

  const handleScoreChange = (score: number) => {
    setCurrentScore(score);
  };

  const handleGameOver = async (finalScore: number) => {
    setGamesPlayed((prev) => prev + 1);

    // Update local high score if needed
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('wizardRunHighScore', String(finalScore));
    }

    // Save to leaderboard if user is logged in
    if (user && leaderboardServiceRef.current) {
      try {
        const displayName = user.email?.split('@')[0] || 'Anonymous';
        await leaderboardServiceRef.current.updateHighScore(
          user.id,
          displayName,
          finalScore
        );
      } catch (error) {
        console.error('Failed to save to leaderboard:', error);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 p-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/"
          className="text-pink-300 hover:text-pink-200 transition-colors pixel-font text-xs"
        >
          &larr; Back
        </Link>
        <h1 className="pixel-font text-xl text-yellow-400">WIZARD RUN</h1>
        <Link
          href="/leaderboard"
          className="text-cyan-300 hover:text-cyan-200 transition-colors pixel-font text-xs"
        >
          Leaderboard
        </Link>
      </div>

      {/* Game Container */}
      <div className="w-full aspect-[3/1] max-h-[400px] bg-black/30 rounded-lg overflow-hidden">
        <GameCanvas
          onGameOver={handleGameOver}
          onScoreChange={handleScoreChange}
          initialHighScore={highScore}
          userId={user?.id}
          onLivesChange={handleLivesChange}
        />
      </div>

      {/* Stats */}
      <div className="flex gap-8 text-center">
        <div>
          <div className="pixel-font text-xs text-gray-400">SCORE</div>
          <div className="pixel-font text-lg text-white">
            {String(currentScore).padStart(5, '0')}
          </div>
        </div>
        <div>
          <div className="pixel-font text-xs text-gray-400">HIGH SCORE</div>
          <div className="pixel-font text-lg text-yellow-400">
            {String(highScore).padStart(5, '0')}
          </div>
        </div>
        <div>
          <div className="pixel-font text-xs text-gray-400">GAMES</div>
          <div className="pixel-font text-lg text-cyan-400">{gamesPlayed}</div>
        </div>
        {user && livesState && (
          <div>
            <div className="pixel-font text-xs text-gray-400">LIVES</div>
            <div className="pixel-font text-lg">
              <span className="text-red-400">
                {'❤️'.repeat(livesState.count)}
              </span>
              <span className="text-gray-600">
                {'🖤'.repeat(3 - livesState.count)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="pixel-font text-xs text-gray-400">
          Press SPACE or UP to jump | DOWN to duck
        </p>
        <p className="pixel-font text-xs text-gray-500">
          Tap to jump on mobile
        </p>
      </div>
    </div>
  );
}
