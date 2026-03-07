import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Atom, Gamepad2, Trophy, SkipForward, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import GravityDropGame from "@/components/arcade/GravityDropGame";
import ProjectileLaunchGame from "@/components/arcade/ProjectileLaunchGame";
import PendulumGame from "@/components/arcade/PendulumGame";
import BounceGame from "@/components/arcade/BounceGame";
import CollisionGame from "@/components/arcade/CollisionGame";

const GAMES = [
  { id: "gravity", label: "Gravity Drop", emoji: "🎯", component: GravityDropGame },
  { id: "projectile", label: "Projectile Launch", emoji: "🚀", component: ProjectileLaunchGame },
  { id: "pendulum", label: "Pendulum Release", emoji: "🎪", component: PendulumGame },
  { id: "bounce", label: "Bounce Predictor", emoji: "🏀", component: BounceGame },
  { id: "collision", label: "Elastic Collision", emoji: "💥", component: CollisionGame },
];

const MIN_GAMES = 2;

export default function PhysicsArcade() {
  const navigate = useNavigate();
  const [currentGame, setCurrentGame] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const gamesPlayed = scores.length;
  const canSkip = gamesPlayed >= MIN_GAMES;
  const totalScore = scores.reduce((a, b) => a + b, 0);
  const maxPossible = scores.length * 100;

  const handleGameComplete = (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);

    if (currentGame >= GAMES.length - 1) {
      setShowResults(true);
    } else {
      setCurrentGame(currentGame + 1);
    }
  };

  const handleSkip = () => {
    setShowResults(true);
  };

  const handleContinue = (path: string) => {
    localStorage.setItem("arcade_completed", "true");
    localStorage.setItem("arcade_score", String(totalScore));
    navigate(path);
  };

  const CurrentGameComponent = GAMES[currentGame]?.component;

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center p-4">
        {/* Ambient particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              style={{ left: `${(i * 17) % 100}%`, top: `${(i * 23) % 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg w-full text-center space-y-8"
        >
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Gamepad2 className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              Physics <span className="text-primary">Arcade</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              5 quick arcade games to warm up your physics brain! 🧠
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {GAMES.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-card border border-border"
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-[10px] text-muted-foreground leading-tight text-center">{g.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="space-y-3"
          >
            <p className="text-xs text-muted-foreground">
              Play at least <span className="font-bold text-foreground">2 games</span> to unlock login & registration. Play all 5 for the full score!
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => setShowIntro(false)}
              className="px-10 text-lg"
            >
              Start Playing <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (showResults) {
    const percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;
    const grade = percentage >= 80 ? "A" : percentage >= 60 ? "B" : percentage >= 40 ? "C" : "D";
    const gradeColor = percentage >= 80 ? "text-green-500" : percentage >= 60 ? "text-primary" : percentage >= 40 ? "text-yellow-500" : "text-red-500";

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Trophy className="w-16 h-16 mx-auto text-primary" />
          </motion.div>

          <h2 className="text-3xl font-bold text-foreground">Great Job! 🎉</h2>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className={`text-7xl font-black ${gradeColor}`}
            >
              {grade}
            </motion.div>

            <div className="space-y-2">
              <p className="text-muted-foreground">
                Score: <span className="font-bold text-foreground">{totalScore}</span> / {maxPossible}
              </p>
              <p className="text-muted-foreground">
                Games played: <span className="font-bold text-foreground">{gamesPlayed}</span> / {GAMES.length}
              </p>

              {/* Score bars per game */}
              <div className="space-y-1 mt-4">
                {scores.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.7 + i * 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs w-6">{GAMES[i].emoji}</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s}%` }}
                        transition={{ delay: 0.9 + i * 0.15, duration: 0.6 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-8">{s}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleContinue("/login")}
            >
              Login
            </Button>
            <Button
              variant="hero"
              className="flex-1"
              onClick={() => handleContinue("/register")}
            >
              Register <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <button
            onClick={() => handleContinue("/")}
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col items-center justify-center p-4">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Atom className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Physics Arcade</span>
          </div>

          <div className="flex items-center gap-1.5">
            {GAMES.map((g, i) => (
              <motion.div
                key={g.id}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border transition ${
                  i < gamesPlayed
                    ? "bg-primary text-primary-foreground border-primary"
                    : i === currentGame
                    ? "bg-primary/20 text-primary border-primary/50"
                    : "bg-muted text-muted-foreground border-border"
                }`}
                animate={i === currentGame ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {i < gamesPlayed ? "✓" : g.emoji}
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Score: <span className="font-bold text-foreground">{totalScore}</span>
            </span>
            {canSkip && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-xs gap-1"
              >
                <SkipForward className="w-3.5 h-3.5" /> Skip
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/70"
            animate={{ width: `${(gamesPlayed / GAMES.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Game area */}
      <div className="mt-20 w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGame}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            {CurrentGameComponent && (
              <CurrentGameComponent onComplete={handleGameComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
