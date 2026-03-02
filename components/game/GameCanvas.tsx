'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '@/lib/game/engine/GameEngine';
import { GameConfig } from '@/lib/game/engine/GameConfig';
import { getLocalLivesService } from '@/lib/game/services';
import { LivesState } from '@/types/game';
import { UserIdentity } from '@/lib/game/services/UserIdentityService';

interface GameCanvasProps {
  onGameOver?: (score: number) => void;
  onScoreChange?: (score: number) => void;
  initialHighScore?: number;
  user: UserIdentity | null;
  onUsernameSubmit?: (username: string) => void;
  onLivesChange?: (lives: LivesState) => void;
  autoStart?: boolean;
}

export function GameCanvas({
  onGameOver,
  onScoreChange,
  initialHighScore = 0,
  user,
  onUsernameSubmit,
  onLivesChange,
  autoStart = false,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [livesState, setLivesState] = useState<LivesState | null>(null);
  const hasShownUsernameModal = useRef(false);

  // Handle canvas click as fallback for starting game
  const handleCanvasClick = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.start();
    }
  }, []);

  // Calculate optimal scale based on container size
  const updateScale = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const scaleX = containerWidth / GameConfig.GAME_WIDTH;
    const scaleY = containerHeight / GameConfig.GAME_HEIGHT;

    // Use the smaller scale to fit within container
    // Also cap at 3x to prevent too large rendering
    const newScale = Math.min(scaleX, scaleY, 3);
    setScale(Math.floor(newScale * 10) / 10); // Round to 1 decimal
  }, []);

  // Store callbacks in refs to avoid recreating engine on every render
  const onGameOverRef = useRef(onGameOver);
  const onScoreChangeRef = useRef(onScoreChange);
  const onLivesChangeRef = useRef(onLivesChange);
  const onUsernameSubmitRef = useRef(onUsernameSubmit);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
    onScoreChangeRef.current = onScoreChange;
    onLivesChangeRef.current = onLivesChange;
    onUsernameSubmitRef.current = onUsernameSubmit;
  }, [onGameOver, onScoreChange, onLivesChange, onUsernameSubmit]);

  // Handle using a life (now local)
  const handleLifeUsed = useCallback(() => {
    try {
      const livesService = getLocalLivesService();
      const newLives = livesService.useLife();
      setLivesState(newLives);
      engineRef.current?.setLivesState(newLives);
      onLivesChangeRef.current?.(newLives);
    } catch (error) {
      console.error('Failed to use life:', error);
    }
  }, []);

  // Initialize local lives service
  useEffect(() => {
    const livesService = getLocalLivesService();
    const lives = livesService.getLives();
    setLivesState(lives);
    engineRef.current?.setLivesState(lives);
    onLivesChangeRef.current?.(lives);
  }, []);

  // Update countdown timer every second when no lives
  useEffect(() => {
    if (!livesState || livesState.count > 0) return;

    const intervalId = setInterval(() => {
      setLivesState((prev) => {
        if (!prev) return null;
        const newSecondsUntilReset = Math.max(0, prev.secondsUntilReset - 1);

        // If timer reached 0, refetch lives
        if (newSecondsUntilReset === 0) {
          const livesService = getLocalLivesService();
          const newLives = livesService.getLives();
          setLivesState(newLives);
          engineRef.current?.setLivesState(newLives);
          onLivesChangeRef.current?.(newLives);
          return newLives;
        }

        const updated = { ...prev, secondsUntilReset: newSecondsUntilReset };
        engineRef.current?.setLivesState(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [livesState?.count]);

  // Initialize game engine (only once)
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onGameOver: (score) => {
        onGameOverRef.current?.(score);
      },
      onScoreChange: (score) => {
        onScoreChangeRef.current?.(score);
      },
      onLifeUsed: () => {
        handleLifeUsed();
      },
    });

    engine.init({ autoStart });

    if (initialHighScore > 0) {
      engine.setHighScore(initialHighScore);
    }

    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Show username modal if no user (after engine is initialized)
  useEffect(() => {
    if (!user && engineRef.current && !hasShownUsernameModal.current) {
      hasShownUsernameModal.current = true;
      engineRef.current.showUsernameModal((username) => {
        onUsernameSubmitRef.current?.(username);
      });
    }
  }, [user]);

  // Update engine with lives state when it changes
  useEffect(() => {
    if (engineRef.current && livesState) {
      engineRef.current.setLivesState(livesState);
    }
  }, [livesState]);

  // Update high score if it changes
  useEffect(() => {
    if (engineRef.current && initialHighScore > 0) {
      engineRef.current.setHighScore(initialHighScore);
    }
  }, [initialHighScore]);

  // Handle resize
  useEffect(() => {
    updateScale();

    const handleResize = () => {
      updateScale();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScale]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center p-4"
      style={{ minHeight: '300px' }}
    >
      <div
        className="relative"
        style={{
          width: GameConfig.GAME_WIDTH * scale,
          height: GameConfig.GAME_HEIGHT * scale,
        }}
      >
        {/* Pixel border frame */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: '4px solid #ffd700',
            boxShadow:
              'inset 0 0 0 4px #805ad5, 0 0 20px rgba(255, 215, 0, 0.3)',
          }}
        />

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="block"
          tabIndex={0}
          onClick={handleCanvasClick}
          onKeyDown={(e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
              e.preventDefault();
              handleCanvasClick();
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            cursor: 'pointer',
            outline: 'none',
          }}
        />

        {/* Scanlines overlay for retro effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.2),
              rgba(0, 0, 0, 0.2) 1px,
              transparent 1px,
              transparent 2px
            )`,
          }}
        />
      </div>
    </div>
  );
}
