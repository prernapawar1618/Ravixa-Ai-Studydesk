/**
 * Main Application Coordinator
 * Handles sticky navigation, sliding link indicator, mini calendar engine, scroll spy, and initialization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Core Managers
  initStickyHeader();
  initNavIndicator();
  initCalendar();
  initScrollSpy();
});

/* ==========================================================================
   1. STICKY HEADER
   ========================================================================== */
function initStickyHeader() {
  const header = document.getElementById('header-nav');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   2. NAV INDICATOR SLIDE EFFECT
   ========================================================================== */
function initNavIndicator() {
  const navMenu = document.getElementById('nav-menu');
  const indicator = document.getElementById('nav-indicator');
  const links = document.querySelectorAll('.nav-item a');
  
  if (!navMenu || !indicator || links.length === 0) return;

  function positionIndicator(link) {
    const linkRect = link.getBoundingClientRect();
    const menuRect = navMenu.getBoundingClientRect();
    
    indicator.style.width = `${linkRect.width}px`;
    indicator.style.left = `${linkRect.left - menuRect.left}px`;
    indicator.style.opacity = '1';
  }

  // Position on active link initially
  setTimeout(() => {
    const activeLink = document.querySelector('.nav-item a.active');
    if (activeLink) {
      positionIndicator(activeLink);
    }
  }, 300);

  // Position on hover
  links.forEach(link => {
    link.addEventListener('mouseenter', () => positionIndicator(link));
    
    link.addEventListener('click', (e) => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      positionIndicator(link);
    });
  });

  // Return to active link on mouse leave
  navMenu.addEventListener('mouseleave', () => {
    const activeLink = document.querySelector('.nav-item a.active');
    if (activeLink) {
      positionIndicator(activeLink);
    } else {
      indicator.style.opacity = '0';
    }
  });
}

/* ==========================================================================
   3. MINI CALENDAR ENGINE
   ========================================================================== */
function initCalendar() {
  const monthYearEl = document.getElementById('cal-month-year');
  const daysContainer = document.getElementById('calendar-days');
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');

  if (!monthYearEl || !daysContainer || !prevBtn || !nextBtn) return;

  let currentDate = new Date();
  
  // Curated mock active study days (representing calendar heat map)
  const studyDaysMap = {
    // Month is 0-indexed: June (5)
    5: [2, 5, 8, 9, 12, 14, 15, 18, 19, 22, 25, 26, 27, 28],
    // May (4)
    4: [1, 3, 4, 7, 10, 11, 14, 15, 17, 20, 22, 23, 27, 29, 30],
    // July (6)
    6: [1, 2, 5, 6, 9, 12, 13, 16, 20, 21, 25, 29, 30]
  };

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  function renderCalendar(date) {
    daysContainer.innerHTML = '';
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Set Header
    monthYearEl.textContent = `${months[month]} ${year}`;
    
    // Get first day of month and total days
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();
    
    // 1. Previous Month's Padding Days
    for (let i = firstDayIndex; i > 0; i--) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day other-month';
      dayEl.textContent = prevTotalDays - i + 1;
      daysContainer.appendChild(dayEl);
    }
    
    // 2. Current Month's Days
    const today = new Date();
    const activeStudyDays = studyDaysMap[month] || [];
    
    for (let i = 1; i <= totalDays; i++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      dayEl.textContent = i;
      
      // Highlight Today
      if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayEl.classList.add('today');
      }
      
      // Highlight Study Streak Days
      if (activeStudyDays.includes(i)) {
        dayEl.classList.add('active-study');
      }
      
      daysContainer.appendChild(dayEl);
    }
    
    // 3. Next Month's Padding Days (fill the 42 grid boxes)
    const totalBoxes = daysContainer.children.length;
    const nextPadding = 42 - totalBoxes;
    
    for (let i = 1; i <= nextPadding; i++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day other-month';
      dayEl.textContent = i;
      daysContainer.appendChild(dayEl);
    }
  }

  // Nav buttons
  prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  renderCalendar(currentDate);
}

/* ==========================================================================
   4. SCROLL SPY (Nav Link Active States)
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section, header');
  const navLinks = document.querySelectorAll('.nav-item a');
  const navMenu = document.getElementById('nav-menu');
  const indicator = document.getElementById('nav-indicator');

  function positionIndicator(link) {
    if (!indicator || !navMenu) return;
    const linkRect = link.getBoundingClientRect();
    const menuRect = navMenu.getBoundingClientRect();
    indicator.style.width = `${linkRect.width}px`;
    indicator.style.left = `${linkRect.left - menuRect.left}px`;
    indicator.style.opacity = '1';
  }

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.scrollY + 200; // Offset for triggers

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    if (current) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === current) {
          link.classList.add('active');
          positionIndicator(link);
        }
      });
    }
  });
}
