'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameCanvas } from '@/components/game/GameCanvas';
import { LivesState } from '@/types/game';
import { getLeaderboardService, getUserIdentityService, UserIdentity } from '@/lib/game/services';
import Link from 'next/link';

function GamePageContent() {
  const searchParams = useSearchParams();
  const autoStart = searchParams.get('start') === 'true';
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [livesState, setLivesState] = useState<LivesState | null>(null);

  // Initialize and check for existing user
  useEffect(() => {
    const userService = getUserIdentityService();
    const existingUser = userService.getUser();
    if (existingUser) {
      setUser(existingUser);
    }

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('wizardRunHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Handle username submission from modal
  const handleUsernameSubmit = (username: string) => {
    const userService = getUserIdentityService();
    const newUser = userService.createUser(username);
    setUser(newUser);
  };

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

    // Save to leaderboard if user exists
    if (user) {
      try {
        const leaderboardService = getLeaderboardService();
        await leaderboardService.updateHighScore(
          user.userId,
          user.username,
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
        <div className="flex items-center gap-4">
          {user && (
            <span className="pixel-font text-xs text-cyan-300">
              {user.username}
            </span>
          )}
          <Link
            href="/leaderboard"
            className="text-cyan-300 hover:text-cyan-200 transition-colors pixel-font text-xs"
          >
            Leaderboard
          </Link>
        </div>
      </div>

      {/* Game Container */}
      <div className="w-full aspect-[3/1] max-h-[400px] bg-black/30 rounded-lg overflow-hidden">
        <GameCanvas
          onGameOver={handleGameOver}
          onScoreChange={handleScoreChange}
          initialHighScore={highScore}
          user={user}
          onUsernameSubmit={handleUsernameSubmit}
          onLivesChange={handleLivesChange}
          autoStart={autoStart}
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
        {livesState && (
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

export default function GamePage() {
  return (
    <Suspense fallback={<div className="w-full max-w-4xl mx-auto flex items-center justify-center p-4 min-h-[400px]"><span className="pixel-font text-yellow-400">Loading...</span></div>}>
      <GamePageContent />
    </Suspense>
  );
}
