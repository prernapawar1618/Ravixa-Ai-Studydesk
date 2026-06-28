/**
 * Pomodoro Timer Controller
 * Handles timer countdown, SVG progress ring animation, and mode switching.
 */

class PomodoroTimer {
  constructor() {
    // Timer Configurations (in seconds)
    this.durations = {
      work: 25 * 60,
      short: 5 * 60,
      long: 15 * 60
    };
    
    this.currentMode = 'work';
    this.timeLeft = this.durations[this.currentMode];
    this.totalDuration = this.durations[this.currentMode];
    this.timerId = null;
    this.isRunning = false;
    
    // SVG Progress Circle Circumference
    // r = 95 -> 2 * PI * 95 = 596.9026
    this.circumference = 596.9;

    // DOM Elements
    this.timeDisplay = document.getElementById('timer-time');
    this.stateDisplay = document.getElementById('timer-state');
    this.progressCircle = document.getElementById('timer-progress');
    this.startBtn = document.getElementById('btn-pomo-start');
    this.playIcon = document.getElementById('pomo-play-icon');
    this.resetBtn = document.getElementById('btn-pomo-reset');
    this.skipBtn = document.getElementById('btn-pomo-skip');
    this.modeBtns = document.querySelectorAll('.pomo-mode-btn');

    this.init();
  }

  init() {
    this.registerEvents();
    this.updateDisplay();
  }

  registerEvents() {
    // Mode Buttons
    this.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        this.switchMode(mode);
      });
    });

    // Controls
    this.startBtn.addEventListener('click', () => this.toggleTimer());
    this.resetBtn.addEventListener('click', () => this.resetTimer());
    this.skipBtn.addEventListener('click', () => this.skipSession());
  }

  updateDisplay() {
    // Digital Time Format: MM:SS
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    this.timeDisplay.textContent = timeStr;
    
    // Document Title Update (Premium UX)
    document.title = this.isRunning 
      ? `(${timeStr}) AI Study Desk` 
      : 'AI Study Desk // Premium Productivity Dashboard';

    // SVG Progress Circle Update
    const progress = this.timeLeft / this.totalDuration;
    const offset = this.circumference * (1 - progress);
    this.progressCircle.style.strokeDashoffset = offset;
    
    // Theme color adjustments based on mode
    if (this.currentMode === 'work') {
      this.progressCircle.style.stroke = 'var(--primary)';
      this.stateDisplay.textContent = this.isRunning ? 'STAY FOCUSED' : 'READY TO FOCUS';
    } else if (this.currentMode === 'short') {
      this.progressCircle.style.stroke = 'var(--accent-cyan)';
      this.stateDisplay.textContent = 'SHORT BREAK';
    } else if (this.currentMode === 'long') {
      this.progressCircle.style.stroke = 'var(--accent-emerald)';
      this.stateDisplay.textContent = 'LONG BREAK';
    }
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.updatePlayPauseIcon(true);
    
    this.timerId = setInterval(() => {
      this.timeLeft--;
      
      if (this.timeLeft <= 0) {
        clearInterval(this.timerId);
        this.timerId = null;
        this.isRunning = false;
        this.handleTimerComplete();
      }
      
      this.updateDisplay();
    }, 1000);
    
    this.updateDisplay();
  }

  pause() {
    if (!this.isRunning) return;
    
    clearInterval(this.timerId);
    this.timerId = null;
    this.isRunning = false;
    this.updatePlayPauseIcon(false);
    this.updateDisplay();
  }

  resetTimer() {
    this.pause();
    this.timeLeft = this.durations[this.currentMode];
    this.totalDuration = this.durations[this.currentMode];
    this.updateDisplay();
  }

  switchMode(mode) {
    if (this.currentMode === mode) return;
    
    // Update active button classes
    this.modeBtns.forEach(btn => {
      if (btn.getAttribute('data-mode') === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.currentMode = mode;
    this.pause();
    this.timeLeft = this.durations[mode];
    this.totalDuration = this.durations[mode];
    this.updateDisplay();
  }

  skipSession() {
    let nextMode = 'work';
    if (this.currentMode === 'work') {
      nextMode = 'short';
    } else if (this.currentMode === 'short') {
      nextMode = 'work';
    } else {
      nextMode = 'work';
    }
    this.switchMode(nextMode);
  }

  updatePlayPauseIcon(isPlaying) {
    if (isPlaying) {
      this.playIcon.setAttribute('data-lucide', 'pause');
    } else {
      this.playIcon.setAttribute('data-lucide', 'play');
    }
    // Re-render icons via Lucide
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  handleTimerComplete() {
    this.updatePlayPauseIcon(false);
    
    // Play a gentle notification beep (synthesized via Web Audio API - premium!)
    this.playCompletionSound();

    if (this.currentMode === 'work') {
      // Trigger dashboard rewards: Increment completed tasks and focus score
      this.triggerDashboardRewards();
      alert("Great job! You finished your study session. Take a well-deserved break!");
      this.switchMode('short');
    } else {
      alert("Break is over! Ready to get back to work?");
      this.switchMode('work');
    }
  }

  playCompletionSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Melody: C5 -> E5 -> G5
      const playTone = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      playTone(523.25, now, 0.4); // C5
      playTone(659.25, now + 0.15, 0.4); // E5
      playTone(783.99, now + 0.3, 0.6); // G5
    } catch (e) {
      console.warn("Audio Context not supported or allowed yet.", e);
    }
  }

  triggerDashboardRewards() {
    // 1. Increment completed tasks counter in todo.js if available
    if (window.TodoController && typeof window.TodoController.incrementCompletedCount === 'function') {
      window.TodoController.incrementCompletedCount();
    } else {
      // Fallback local update
      const completedCountEl = document.getElementById('tasks-completed-count');
      if (completedCountEl) {
        const val = parseInt(completedCountEl.getAttribute('data-target')) + 1;
        completedCountEl.setAttribute('data-target', val);
        completedCountEl.textContent = val;
      }
    }
    
    // 2. Increment study hours counter
    const studyHoursEl = document.querySelector('.study-val-num');
    if (studyHoursEl) {
      let currentHours = parseFloat(studyHoursEl.textContent) || 28.4;
      currentHours = parseFloat((currentHours + 0.4).toFixed(1)); // Add 25 mins (approx 0.4 hours)
      studyHoursEl.textContent = currentHours;
      const studyCard = document.querySelector('.card-study-hours');
      if (studyCard) {
        studyCard.setAttribute('data-target', currentHours);
      }
    }
  }
}

// Instantiate and expose to global window
document.addEventListener('DOMContentLoaded', () => {
  window.Pomodoro = new PomodoroTimer();
});
