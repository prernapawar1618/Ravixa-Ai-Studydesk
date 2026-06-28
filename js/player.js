/**
 * Lo-Fi Music Player Controller
 * Manages track switching, play/pause states, timeline progression, and visualizer animations.
 */

class LofiPlayer {
  constructor() {
    this.tracks = [
      {
        title: "Midnight Coffee",
        artist: "Lofi Dreams",
        duration: "2:45",
        durationSec: 165,
        art: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60"
      },
      {
        title: "Retro Chill",
        artist: "Synth Wave",
        duration: "3:12",
        durationSec: 192,
        art: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=60"
      },
      {
        title: "Deep Focus",
        artist: "Binaural Beats",
        duration: "4:00",
        durationSec: 240,
        art: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=60"
      }
    ];

    this.currentTrackIdx = 0;
    this.isPlaying = false;
    this.currentTimeSec = 0;
    this.timelineInterval = null;
    this.isMuted = false;
    this.previousVolume = 70;

    // DOM Elements
    this.vinyl = document.getElementById('music-vinyl');
    this.albumArt = document.getElementById('album-art');
    this.trackTitle = document.getElementById('track-title');
    this.trackArtist = document.getElementById('track-artist');
    
    this.playBtn = document.getElementById('btn-play');
    this.playIcon = document.getElementById('music-play-icon');
    this.prevBtn = document.getElementById('btn-prev');
    this.nextBtn = document.getElementById('btn-next');
    
    this.timeCurrent = document.getElementById('time-current');
    this.timeDuration = document.getElementById('time-duration');
    this.timelineSlider = document.getElementById('timeline-slider');
    
    this.muteBtn = document.getElementById('btn-mute');
    this.volumeIcon = document.getElementById('volume-icon');
    this.volumeSlider = document.getElementById('volume-slider');
    
    this.visualizer = document.getElementById('music-visualizer');
    this.waveBars = document.querySelectorAll('.wave-bar');

    this.init();
  }

  init() {
    this.setupWaveform();
    this.loadTrack(this.currentTrackIdx);
    this.registerEvents();
  }

  setupWaveform() {
    // Set random animation delays on waveform bars to create a natural wave effect
    this.waveBars.forEach((bar, index) => {
      const delay = (index * 0.06).toFixed(2);
      bar.style.animationDelay = `${delay}s`;
      // Set initial heights
      bar.style.height = `${Math.floor(Math.random() * 60) + 25}%`;
    });
  }

  registerEvents() {
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.prevBtn.addEventListener('click', () => this.prevTrack());
    this.nextBtn.addEventListener('click', () => this.nextTrack());
    
    // Timeline slider input
    this.timelineSlider.addEventListener('input', () => {
      this.seek();
    });

    // Volume controls
    this.volumeSlider.addEventListener('input', () => {
      this.updateVolume();
    });
    this.muteBtn.addEventListener('click', () => this.toggleMute());
  }

  loadTrack(idx) {
    const track = this.tracks[idx];
    this.albumArt.src = track.art;
    this.trackTitle.textContent = track.title;
    this.trackArtist.textContent = track.artist;
    this.timeDuration.textContent = track.duration;
    
    this.currentTimeSec = 0;
    this.timelineSlider.value = 0;
    this.updateTimeDisplay();
    
    if (this.isPlaying) {
      this.startTimeline();
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    this.playIcon.setAttribute('data-lucide', 'pause');
    if (window.lucide) window.lucide.createIcons();

    // Start vinyl spin
    this.vinyl.classList.remove('rotate-album-paused');
    
    // Start waveform animation
    this.waveBars.forEach(bar => {
      bar.classList.add('wave-bar-anim');
    });

    this.startTimeline();
  }

  pause() {
    this.isPlaying = false;
    this.playIcon.setAttribute('data-lucide', 'play');
    if (window.lucide) window.lucide.createIcons();

    // Pause vinyl spin
    this.vinyl.classList.add('rotate-album-paused');
    
    // Pause waveform animation
    this.waveBars.forEach(bar => {
      bar.classList.remove('wave-bar-anim');
    });

    this.stopTimeline();
  }

  prevTrack() {
    this.currentTrackIdx = (this.currentTrackIdx - 1 + this.tracks.length) % this.tracks.length;
    this.loadTrack(this.currentTrackIdx);
  }

  nextTrack() {
    this.currentTrackIdx = (this.currentTrackIdx + 1) % this.tracks.length;
    this.loadTrack(this.currentTrackIdx);
  }

  startTimeline() {
    this.stopTimeline();
    const track = this.tracks[this.currentTrackIdx];
    
    this.timelineInterval = setInterval(() => {
      this.currentTimeSec++;
      
      if (this.currentTimeSec >= track.durationSec) {
        this.nextTrack();
      } else {
        const pct = (this.currentTimeSec / track.durationSec) * 100;
        this.timelineSlider.value = pct;
        this.updateTimeDisplay();
      }
    }, 1000);
  }

  stopTimeline() {
    if (this.timelineInterval) {
      clearInterval(this.timelineInterval);
      this.timelineInterval = null;
    }
  }

  seek() {
    const track = this.tracks[this.currentTrackIdx];
    const pct = this.timelineSlider.value;
    this.currentTimeSec = Math.floor((pct / 100) * track.durationSec);
    this.updateTimeDisplay();
  }

  updateTimeDisplay() {
    const minutes = Math.floor(this.currentTimeSec / 60);
    const seconds = this.currentTimeSec % 60;
    this.timeCurrent.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  updateVolume() {
    const vol = this.volumeSlider.value;
    
    if (vol == 0) {
      this.isMuted = true;
      this.volumeIcon.setAttribute('data-lucide', 'volume-x');
    } else if (vol < 40) {
      this.isMuted = false;
      this.volumeIcon.setAttribute('data-lucide', 'volume');
    } else if (vol < 75) {
      this.isMuted = false;
      this.volumeIcon.setAttribute('data-lucide', 'volume-1');
    } else {
      this.isMuted = false;
      this.volumeIcon.setAttribute('data-lucide', 'volume-2');
    }

    if (window.lucide) window.lucide.createIcons();
  }

  toggleMute() {
    if (this.isMuted) {
      // Unmute
      this.isMuted = false;
      this.volumeSlider.value = this.previousVolume;
    } else {
      // Mute
      this.isMuted = true;
      this.previousVolume = this.volumeSlider.value;
      this.volumeSlider.value = 0;
    }
    this.updateVolume();
  }
}

// Instantiate and expose globally
document.addEventListener('DOMContentLoaded', () => {
  window.Player = new LofiPlayer();
});
