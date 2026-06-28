/**
 * Quotes Controller
 * Manages random motivational quotes and fade-in/out refresh transitions.
 */

class QuotesController {
  constructor() {
    this.quotes = [
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { text: "Focus is a muscle, and you build it through practice.", author: "Deep Work" },
      { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
      { text: "Design is not just what it looks like and feels like. Design is how it works.", author: "Steve Jobs" },
      { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
      { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
      { text: "Make each day your masterpiece.", author: "John Wooden" },
      { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
      { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
      { text: "Work hard in silence, let your success be your noise.", author: "Frank Ocean" },
      { text: "Flow is the state of being completely involved in an activity for its own sake.", author: "Mihaly Csikszentmihalyi" }
    ];

    // DOM Elements
    this.textEl = document.getElementById('quote-text');
    this.authorEl = document.getElementById('quote-author');
    this.refreshBtn = document.getElementById('btn-quote-refresh');
    this.refreshIcon = document.getElementById('quote-refresh-icon');

    this.init();
  }

  init() {
    if (this.refreshBtn) {
      this.refreshBtn.addEventListener('click', () => this.displayNewQuote());
    }
    
    // Display initial quote
    this.displayNewQuote(true);
  }

  getRandomQuote() {
    const idx = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[idx];
  }

  displayNewQuote(isInitial = false) {
    const quote = this.getRandomQuote();
    
    if (isInitial) {
      this.textEl.textContent = `“${quote.text}”`;
      this.authorEl.textContent = `— ${quote.author}`;
      return;
    }

    // Refresh Icon Spin Animation
    if (this.refreshIcon) {
      this.refreshIcon.classList.add('spin-once');
      this.refreshIcon.addEventListener('animationend', () => {
        this.refreshIcon.classList.remove('spin-once');
      }, { once: true });
    }

    // Fade Out
    this.textEl.style.opacity = '0';
    this.authorEl.style.opacity = '0';

    setTimeout(() => {
      // Change Content
      this.textEl.textContent = `“${quote.text}”`;
      this.authorEl.textContent = `— ${quote.author}`;

      // Fade In
      this.textEl.style.opacity = '1';
      this.authorEl.style.opacity = '1';
    }, 300);
  }
}

// Instantiate and expose globally
document.addEventListener('DOMContentLoaded', () => {
  window.Quotes = new QuotesController();
});
