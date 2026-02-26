/* ─────────────────────────────────────────
   HEADER SCROLL EFFECT
───────────────────────────────────────── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ─────────────────────────────────────────
   MOBILE NAV
───────────────────────────────────────── */
const burger  = document.getElementById('burger');
const nav     = document.getElementById('nav');

// Create overlay
const overlay = document.createElement('div');
overlay.className = 'nav-overlay';
document.body.appendChild(overlay);

function toggleNav() {
  const open = nav.classList.toggle('open');
  burger.classList.toggle('open', open);
  overlay.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

burger.addEventListener('click', toggleNav);
overlay.addEventListener('click', toggleNav);

// Close nav on link click
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    if (nav.classList.contains('open')) toggleNav();
  });
});

/* ─────────────────────────────────────────
   LOAD AND RENDER VIDEOS FROM JSON
───────────────────────────────────────── */
let videosData = {};

async function loadVideos() {
  try {
    const response = await fetch('videos.json');
    videosData = await response.json();
    renderAllVideoSections();
  } catch (error) {
    console.error('Error loading videos:', error);
  }
}

function renderAllVideoSections() {
  // Render Short Form Videos
  renderVideoSection('shortForm', 'shortFormVideos', false);
  // Render Long Form Videos
  renderVideoSection('longForm', 'longFormVideos', false);
  // Render AI Videos
  renderVideoSection('aiVideos', 'aiVideos', false);
  
  // Apply reveal animations
  setTimeout(() => {
    applyReveal();
    onScroll();
  }, 50);
}

function renderVideoSection(category, containerId, isAutoScroll) {
  const container = document.getElementById(containerId);
  const videos = videosData[category] || [];
  const isAi = category === 'aiVideos';
  
  const videoHTML = videos.map(video => `
    <div class="video-card">
      <div class="video-thumb ${category !== 'shortForm' ? 'video-thumb--wide' : ''}">
        <iframe width="100%" height="100%"
          src="${video.url}"
          title="${video.title}" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
          allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
          ${isAi ? '<span class="ai-badge">AI</span>' : ''}
      </div>
      <div class="video-meta">
        <p class="video-title">${video.title}</p>
        <div class="video-stats">
          <span class="stat-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="stat-icon">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            ${video.likes}
          </span>
          <span class="stat-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon">
              <path d="M22 2L11 13M22 2l-7 20-5-9-9-5 20-7z"/>
            </svg>
            ${video.shares}
          </span>
        </div>
      </div>
    </div>
  `).join('');
  
  // Render videos (no duplication since auto-scroll is disabled)
  container.innerHTML = videoHTML;
  
  // Add auto-scroll functionality if needed (disabled for now)
  if (isAutoScroll) {
    const scrollContainer = document.getElementById(containerId.replace('Videos', 'Container'));
    if (scrollContainer && videos.length > 0) {
      initAutoScroll(scrollContainer, container, category === 'shortForm');
    }
  }
}


/* ─────────────────────────────────────────
   AUTO-SCROLL FUNCTIONALITY FOR VIDEO SECTIONS
───────────────────────────────────────── */
function initAutoScroll(scrollContainer, contentContainer, isInfinite = false) {
  let scrollInterval;
  let isManualScrolling = false;
  let manualScrollTimeout;
  const scrollSpeed = 2; // pixels per frame
  let singleVideoSetWidth = 0;
  let hasJumpedBack = false;
  
  // Calculate the width of single video set (half of total for infinite scroll)
  if (isInfinite) {
    // Get the first video card width
    const firstCard = contentContainer.querySelector('.video-card');
    if (firstCard) {
      const cardStyle = window.getComputedStyle(firstCard);
      const cardWidth = firstCard.offsetWidth;
      const gap = parseInt(cardStyle.marginRight) || 16; // Default gap
      singleVideoSetWidth = (cardWidth + gap) * contentContainer.children.length / 2;
    }
  }
  
  function startScroll() {
    if (contentContainer.children.length === 0) return;
    
    scrollInterval = setInterval(() => {
      scrollContainer.scrollLeft += scrollSpeed;
      
      if (isInfinite && singleVideoSetWidth > 0) {
        // For infinite scroll, jump back to start when reaching the single video set width
        if (scrollContainer.scrollLeft >= singleVideoSetWidth - 10) {
          scrollContainer.scrollLeft = 0;
          hasJumpedBack = true;
        }
      } else {
        // For AI videos, reset to beginning
        if (scrollContainer.scrollLeft >= contentContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0;
        }
      }
    }, 30); // Adjust timing for smooth animation
  }
  
  function stopScroll() {
    clearInterval(scrollInterval);
  }
  
  // Start auto-scroll
  startScroll();
  
  // Handle wheel scrolling - allow manual scroll and prevent page scroll
  scrollContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    // Stop auto-scroll during manual scrolling
    stopScroll();
    isManualScrolling = true;
    hasJumpedBack = false;
    
    // Scroll the container horizontally
    const scrollAmount = e.deltaY > 0 ? 50 : -50;
    scrollContainer.scrollLeft += scrollAmount;
    
    // Resume auto-scroll after user stops scrolling (with timeout)
    clearTimeout(manualScrollTimeout);
    manualScrollTimeout = setTimeout(() => {
      isManualScrolling = false;
      startScroll();
    }, 2000); // Resume auto-scroll 2 seconds after user stops scrolling
  }, { passive: false });
  
  // Pause on hover
  scrollContainer.addEventListener('mouseenter', () => {
    if (!isManualScrolling) stopScroll();
  });
  
  scrollContainer.addEventListener('mouseleave', () => {
    if (!isManualScrolling) startScroll();
  });
}
async function loadBrands() {
  try {
    const response = await fetch('brands.json');
    const data = await response.json();
    renderBrands(data.brands);
  } catch (error) {
    console.error('Error loading brands:', error);
  }
}

function renderBrands(brands) {
  const container = document.getElementById('brandsContainer');
  
  container.innerHTML = brands.map(brand => `
    <div class="brand-card glass">
      <div class="brand-header">
        <div class="brand-logo-wrap">
          <img
            src="${brand.logo}"
            alt="${brand.name}" class="brand-logo" ${brand.logoFilter !== 'none' ? `style="filter:${brand.logoFilter}"` : ''} />
        </div>
        <div>
          <h4 class="brand-name">${brand.name}</h4>
          <p class="brand-desc">${brand.description}</p>
        </div>
      </div>
      <div class="brand-metrics">
        <div class="brand-metric"><span class="bm-val">${brand.views}</span><span class="bm-key">Views</span></div>
        <div class="brand-metric"><span class="bm-val">${brand.metric}</span><span class="bm-key">${brand.metricType}</span></div>
      </div>
    </div>
  `).join('');

  // Trigger reveal animation for new cards
  setTimeout(() => {
    applyReveal();
    onScroll();
  }, 50);
}

// Load reviews from JSON
async function loadReviews() {
  try {
    const response = await fetch('reviews.json');
    const data = await response.json();
    renderReviews(data.reviews);
  } catch (error) {
    console.error('Error loading reviews:', error);
  }
}

function renderReviews(reviews) {
  const container = document.getElementById('reviewsContainer');
  
  container.innerHTML = reviews.map(review => `
    <a href="${review.url}" target="_blank" rel="noopener" class="testi-card glass">
      <div class="testi-quote">❝</div>
      <p class="testi-text">${review.text}</p>
      <div class="testi-author">
        <img src="${review.image}" alt="${review.author}" class="testi-dp" />
        <div>
          <p class="testi-name">${review.author}</p>
          <p class="testi-role">${review.role}</p>
        </div>
      </div>
    </a>
  `).join('');

  // Trigger reveal animation for new cards
  setTimeout(() => {
    applyReveal();
    onScroll();
  }, 50);
}

// Load videos, brands, and reviews when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadVideos();
  loadBrands();
  loadReviews();
});

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
const revealTargets = [
  '.section-tag',
  '.section-title',
  '.hero-text',
  '.hero-image-wrap',
  '.highlight-card',
  '.brand-card',
  '.testi-card',
  '.video-card',
  '.hire-box',
  '.about-body',
  '.marquee-wrap',
  '.videos-section',
];

function applyReveal() {
  document.querySelectorAll(revealTargets.join(',')).forEach((el, i) => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      // Stagger siblings in grid
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c === el || c.classList.contains(el.classList[0]));
        const idx = siblings.indexOf(el);
        if (idx > 0) el.style.transitionDelay = (idx * 0.08) + 's';
      }
    }
  });
}

function onScroll() {
  document.querySelectorAll('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      el.classList.add('visible');
    }
  });
}

applyReveal();
window.addEventListener('scroll', onScroll, { passive: true });
// Also observe tab changes
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setTimeout(() => { applyReveal(); onScroll(); }, 50);
  });
});
onScroll(); // run once on load

/* ─────────────────────────────────────────
   SMOOTH ANCHOR SCROLL (offset for fixed header)
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerH = header.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─────────────────────────────────────────
   COUNTER ANIMATION (highlights)
───────────────────────────────────────── */
function animateCounter(el, target, suffix) {
  let start = 0;
  const duration = 1800;
  const step = 16;
  const increment = target / (duration / step);

  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      el.textContent = target + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start) + suffix;
    }
  }, step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = 'true';
      const text = entry.target.textContent;

      if (text.includes('120')) animateCounter(entry.target, 120, 'M+');
      else if (text.includes('300')) animateCounter(entry.target, 300, 'K+');
      else if (text.includes('500')) animateCounter(entry.target, 500, '+');
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.hl-number').forEach(el => {
  counterObserver.observe(el);
});
