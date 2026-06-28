/**
 * Todo List Controller
 * Handles task management, local storage synchronization, and dashboard integration.
 */

class TodoList {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('aura_desk_tasks')) || [];
    
    // DOM Elements
    this.todoForm = document.getElementById('todo-form');
    this.todoInput = document.getElementById('todo-input');
    this.todoList = document.getElementById('todo-list');
    this.progressBar = document.getElementById('todo-progress-bar');
    
    // Integration Elements
    this.completedCountEl = document.getElementById('tasks-completed-count');
    this.totalCountEl = document.getElementById('tasks-total-count');
    this.fluidFill = document.getElementById('goal-fluid-fill');
    this.goalMsg = document.getElementById('goal-message');
    this.taskStackContainer = document.getElementById('task-stack-container');

    this.init();
  }

  init() {
    // Inject default tasks if first time
    if (this.tasks.length === 0) {
      this.tasks = [
        { id: 1, text: 'UI/UX Interface Refinement', completed: true },
        { id: 2, text: 'Core Timer Logic Integration', completed: true },
        { id: 3, text: 'Motivational Quotes API', completed: true },
        { id: 4, text: 'Design Lofi Music Player UI', completed: false },
        { id: 5, text: 'Review weekly study statistics', completed: false }
      ];
      this.saveTasks();
    }

    this.registerEvents();
    this.render();
  }

  registerEvents() {
    this.todoForm.addEventListener('submit', e => {
      e.preventDefault();
      this.addTask();
    });
  }

  saveTasks() {
    localStorage.setItem('aura_desk_tasks', JSON.stringify(this.tasks));
  }

  render() {
    this.todoList.innerHTML = '';
    
    if (this.tasks.length === 0) {
      this.todoList.innerHTML = `<li class="todo-empty-state" style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.85rem;">
        <i data-lucide="inbox" style="width: 24px; height: 24px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
        <p>No tasks for today. Add one below!</p>
      </li>`;
      if (window.lucide) window.lucide.createIcons();
      this.updateDashboard();
      return;
    }

    this.tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `todo-item ${task.completed ? 'completed' : ''}`;
      li.setAttribute('data-id', task.id);

      li.innerHTML = `
        <div class="todo-item-left">
          <div class="todo-checkbox ${task.completed ? 'checked' : ''}">
            <i data-lucide="check"></i>
          </div>
          <span class="todo-text">${this.escapeHTML(task.text)}</span>
        </div>
        <button class="btn-delete-task" title="Delete Task">
          <i data-lucide="trash-2"></i>
        </button>
      `;

      // Checkbox Click
      const checkbox = li.querySelector('.todo-checkbox');
      checkbox.addEventListener('click', () => this.toggleTask(task.id));

      // Delete Button Click
      const deleteBtn = li.querySelector('.btn-delete-task');
      deleteBtn.addEventListener('click', () => this.deleteTask(task.id, li));

      this.todoList.appendChild(li);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }

    this.updateDashboard();
  }

  addTask() {
    const text = this.todoInput.value.trim();
    if (!text) return;

    const newTask = {
      id: Date.now(),
      text: text,
      completed: false
    };

    this.tasks.push(newTask);
    this.saveTasks();
    this.todoInput.value = '';
    this.render();

    // Trigger a slight focus score increase on adding task (momentum!)
    this.adjustFocusScore(2);
  }

  toggleTask(id) {
    this.tasks = this.tasks.map(task => {
      if (task.id === id) {
        const nextState = !task.completed;
        // Synthesize a tiny click/pop tone on check
        if (nextState) this.playCheckSound();
        return { ...task, completed: nextState };
      }
      return task;
    });

    this.saveTasks();
    this.render();
  }

  deleteTask(id, element) {
    // Apply exit animation
    element.style.opacity = '0';
    element.style.transform = 'translateX(-20px)';
    element.style.transition = 'all 0.3s ease';

    setTimeout(() => {
      this.tasks = this.tasks.filter(task => task.id !== id);
      this.saveTasks();
      this.render();
    }, 300);
  }

  updateDashboard() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    // 1. Update Todo Progress Bar
    if (this.progressBar) {
      this.progressBar.style.width = `${pct}%`;
    }

    // 2. Update Completed Tasks Counter Card
    if (this.completedCountEl) {
      this.completedCountEl.textContent = completed;
      this.completedCountEl.setAttribute('data-target', completed);
    }
    if (this.totalCountEl) {
      this.totalCountEl.textContent = total;
    }

    // 3. Update Today's Goal Fluid Gauge (Thermometer)
    if (this.fluidFill) {
      this.fluidFill.style.height = `${pct}%`;
      
      // Update fluid bubble animation density based on percentage
      const bubbles = this.fluidFill.querySelector('.fluid-bubbles');
      if (bubbles) {
        bubbles.style.opacity = pct > 0 ? '0.3' : '0';
      }
    }

    if (this.goalMsg) {
      if (total === 0) {
        this.goalMsg.textContent = "Add some goals to start your day!";
      } else if (pct === 100) {
        this.goalMsg.innerHTML = "<strong>100% Completed!</strong><br>Outstanding work today!";
        this.adjustFocusScore(5); // Reward focus score
      } else if (pct >= 75) {
        this.goalMsg.textContent = "Almost there! Finish strong.";
      } else if (pct >= 50) {
        this.goalMsg.textContent = "Halfway done! Keep the momentum.";
      } else if (pct >= 25) {
        this.goalMsg.textContent = "Nice progress, stay focused.";
      } else {
        this.goalMsg.textContent = "Getting warmed up!";
      }
    }

    // 4. Update the 3D Completed Tasks Stack
    this.updateTaskStack();
  }

  updateTaskStack() {
    if (!this.taskStackContainer) return;
    
    // Get last 3 completed tasks
    const completedTasks = this.tasks.filter(t => t.completed).slice(-3);
    
    this.taskStackContainer.innerHTML = '';
    
    if (completedTasks.length === 0) {
      this.taskStackContainer.innerHTML = `
        <div class="task-stack-card card-depth-1" style="justify-content: center; color: var(--text-muted);">
          <span>No completed tasks yet</span>
        </div>
      `;
      return;
    }

    completedTasks.forEach((task, index) => {
      const depthClass = `card-depth-${index + 1}`;
      const card = document.createElement('div');
      card.className = `task-stack-card ${depthClass}`;
      card.innerHTML = `
        <span>${this.escapeHTML(task.text)}</span>
        <i data-lucide="check" class="task-done-icon"></i>
      `;
      this.taskStackContainer.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  incrementCompletedCount() {
    // Create an ad-hoc task marked as completed
    const extraTask = {
      id: Date.now(),
      text: `Focus Session Completed`,
      completed: true
    };
    this.tasks.push(extraTask);
    this.saveTasks();
    this.render();
  }

  adjustFocusScore(amount) {
    const focusValEl = document.querySelector('.gauge-val');
    const focusFill = document.getElementById('focus-gauge-fill');
    if (focusValEl && focusFill) {
      let score = parseInt(focusValEl.textContent) || 92;
      score = Math.min(100, score + amount);
      focusValEl.textContent = score;
      focusValEl.setAttribute('data-target', score);
      
      // Update radial stroke
      // Circumference = 2 * PI * 40 = 251.2
      const offset = 251.2 * (1 - score / 100);
      focusFill.style.strokeDashoffset = offset;
    }
  }

  playCheckSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio context blocked/not supported
    }
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
}

// Instantiate and expose globally
document.addEventListener('DOMContentLoaded', () => {
  window.TodoController = new TodoList();
});
