const propertyDataMap = {};
if (typeof GTEXT_PROPERTIES !== 'undefined') {
  GTEXT_PROPERTIES.forEach(p => propertyDataMap[p.id] = p);
} else {
  console.error('GTEXT_PROPERTIES not found! Check if properties.js is loaded.');
}

if (typeof GTEXT_LEADERSHIP === 'undefined') console.error('GTEXT_LEADERSHIP not found! Check if leadership.js is loaded.');
if (typeof GTEXT_BLOG === 'undefined') console.error('GTEXT_BLOG not found! Check if blog.js is loaded.');
if (typeof GTEXT_CONFIG === 'undefined') console.error('GTEXT_CONFIG not found! Check if config.js is loaded.');

// Rendering Functions
function renderProjects() {
  const container = document.getElementById('project-list');
  if (!container || typeof GTEXT_PROPERTIES === 'undefined') return;

  container.innerHTML = GTEXT_PROPERTIES.map(p => `
    <article class="card project-card reveal">
      <div class="invest-badge">${p.badge}</div>
      <div class="card-image-wrapper">
        <img src="${p.image}" alt="${p.title}" class="project-image" />
      </div>
      <div class="card-content">
        <h3>${p.title}</h3>
        <p>${p.location}</p>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
          <p style="color: var(--primary-green); font-weight: 700; font-size: 1.4rem; margin: 0;">${p.price}</p>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline btn-view-details" data-id="${p.id}" style="flex: 1; padding: 8px; font-size: 0.75rem;">View Details</button>
            <button class="btn btn-accent btn-buy-now" data-title="${p.title}" style="flex: 1; padding: 8px; font-size: 0.75rem;">Buy Now</button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

function renderLeadership() {
  const container = document.getElementById('leadership-list');
  if (!container || typeof GTEXT_LEADERSHIP === 'undefined') return;

  container.innerHTML = GTEXT_LEADERSHIP.map(l => `
    <article class="card leadership-card reveal">
      <div class="card-image-wrapper">
        <img src="${l.image}" alt="${l.name}" class="member-image" />
      </div>
      <div class="card-details">
        <h3>${l.name}</h3>
        <p class="card-title">${l.title}</p>
        <p class="card-bio">${l.bio}</p>
      </div>
    </article>
  `).join('');
}

function renderSocials() {
  const container = document.getElementById('footer-socials');
  if (!container || typeof GTEXT_CONFIG === 'undefined') return;

  container.innerHTML = GTEXT_CONFIG.socials.map(s => `
    <a href="${s.url}" class="social-link" title="${s.name}" style="color: white; opacity: 0.7; transition: opacity 0.3s;">
      ${s.name}
    </a>
  `).join('');
}

function renderBlog() {
  const container = document.getElementById('blog-list');
  if (!container || typeof GTEXT_BLOG === 'undefined') return;

  container.innerHTML = GTEXT_BLOG.map(b => `
    <article class="card blog-card reveal">
      <h3>${b.title}</h3>
      <p style="font-size: 0.8rem; opacity: 0.7; margin-top: 10px;">${b.date} · ${b.author}</p>
      <a href="${b.url}" class="btn-link" style="margin-top: 15px; display: inline-block; color: var(--accent); font-weight: 700; text-decoration: none;">Read More →</a>
    </article>
  `).join('');
}

// Modal Logic
const detailModal = document.getElementById('detail-modal');
const inquiryModal = document.getElementById('inquiry-modal');
const detailContent = document.getElementById('modal-detail-content');

function openModal(modal) {
  modal.classList.add('is-active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.remove('is-active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Close on overlay click or close button
document.querySelectorAll('[data-close]').forEach(el => {
  el.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    if (modal) closeModal(modal);
  });
});

// Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('is-active');
    mainNav.classList.toggle('is-active');
  });

  // Close menu when clicking links
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('is-active');
      mainNav.classList.remove('is-active');
    });
  });
}

// View Details Trigger
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-view-details')) {
    const id = e.target.getAttribute('data-id');
    const data = propertyDataMap[id];
    if (data) {
      detailContent.innerHTML = `
        <div class="property-detail-hero" style="background-image: url('${data.image}')">
          <div class="hero-overlay-dark">
            <p class="eyebrow" style="color: #fff; margin-bottom: 5px;">${data.location}</p>
            <h2 style="color: #fff; margin: 0;">${data.title}</h2>
          </div>
        </div>
        
        <div class="property-detail-body">
          <div class="detail-stats">
            <div class="stat-box">
              <span class="stat-label">Investment Price</span>
              <span class="stat-value">${data.price}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Ownership Type</span>
              <span class="stat-value">Freehold</span>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title"><span>📍</span> Strategic Landmarks</h3>
            <p class="section-desc">Located in a high-growth corridor with proximity to major industrial and leisure hubs.</p>
            <ul class="landmark-list">
              ${data.landmarks.map(l => `<li>${l}</li>`).join('')}
            </ul>
          </div>

          <div class="detail-section">
            <h3 class="section-title"><span>🏠</span> Premium Features</h3>
            <p class="section-desc">Each home is equipped with smart-ready infrastructure and eco-friendly systems.</p>
            <div class="detail-features">
              ${data.features.map(f => `<div class="feature-item"><span>✅</span> ${f}</div>`).join('')}
            </div>
          </div>
          
          <div class="detail-actions">
            <button class="btn btn-accent btn-full btn-buy-now" data-title="${data.title}">Secure This Property</button>
            <a href="https://wa.me/2348142590965?text=Hello%20Gtext%20Homes%2C%20I%20am%20interested%20in%20the%20${encodeURIComponent(data.title)}%20in%20${encodeURIComponent(data.location)}.%20Please%20provide%20more%20details." target="_blank" class="btn btn-outline btn-full" style="display: flex; align-items: center; justify-content: center; gap: 10px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      `;
      openModal(detailModal);
    }
  }

  // Buy Now / Inquiry Trigger
  if (e.target.classList.contains('btn-buy-now') || e.target.classList.contains('btn-inquiry')) {
    const title = e.target.getAttribute('data-title') || "General Inquiry";
    const modalScroll = inquiryModal.querySelector('.modal-scroll-content');

    if (title) {
      if (e.target.classList.contains('btn-inquiry')) {
        // Professional "Consult an Expert" style - TEXT ONLY, SYNCED
        modalScroll.innerHTML = `
          <div class="modal-expert-header">
            <span class="expert-badge">Senior Advisor Available</span>
            <h2 style="color: white; margin: 0; font-size: 1.8rem;">Expert Consultation</h2>
            <p style="color: white; opacity: 0.9; margin: 10px 0 0 0; font-weight: 500;">Personalized Strategy Session</p>
          </div>
          <div style="padding: 0 40px 40px;">
            <p style="font-size: 0.95rem; color: var(--muted); line-height: 1.6; margin-bottom: 25px; margin-top: 25px; text-align: center;">Our senior advisors provide tailored insights on high-yield green estates and global property portfolios. Fill in your details to secure a 1-on-1 strategy call.</p>
            <form id="lead-gen-form" class="lead-form" style="padding: 0;">
              <div class="form-group">
                <label for="full-name">Full Name</label>
                <input type="text" id="full-name" name="name" placeholder="John Doe" required>
              </div>
              <div class="form-group">
                <label for="email-addr">Email Address</label>
                <input type="email" id="email-addr" name="email" placeholder="john@example.com" required>
              </div>
              <div class="form-group">
                <label for="phone-num">Phone Number</label>
                <input type="tel" id="phone-num" name="phone" placeholder="+234..." required>
              </div>
              <div class="form-group">
                <label for="property-select">Primary Interest</label>
                <select id="property-select" name="property" required>
                  <option value="Real Estate Investment" ${title === 'Expert Consultation' ? 'selected' : ''}>Investment ROI Analysis</option>
                  <option value="Green Technology">Green & Smart Tech</option>
                  <option value="Global Property Portfolio">International Portfolios</option>
                  <option value="Site Visit" ${title === 'Site Visit Request' ? 'selected' : ''}>Physical Site Tour</option>
                </select>
              </div>
              <button type="submit" class="btn btn-accent btn-full" style="margin-top: 10px;">Request Strategy Call</button>
            </form>
          </div>
        `;
      } else {
        // Standard "Secure Investment" style
        modalScroll.innerHTML = `
          <div class="modal-header" style="padding: 40px 40px 20px;">
            <h2>Secure Your Investment</h2>
            <p>Fill in your details and our team will contact you shortly.</p>
          </div>
          <div style="padding: 0 40px 40px;">
            <form id="lead-gen-form" class="lead-form" style="padding: 0;">
              <div class="form-group">
                <label for="full-name">Full Name</label>
                <input type="text" id="full-name" name="name" placeholder="John Doe" required>
              </div>
              <div class="form-group">
                <label for="email-addr">Email Address</label>
                <input type="email" id="email-addr" name="email" placeholder="john@example.com" required>
              </div>
              <div class="form-group">
                <label for="phone-num">Phone Number</label>
                <input type="tel" id="phone-num" name="phone" placeholder="+234..." required>
              </div>
              <div class="form-group">
                <label for="property-select">Interested Property</label>
                <select id="property-select" name="property" required>
                  ${(typeof GTEXT_PROPERTIES !== 'undefined' ? GTEXT_PROPERTIES : []).map(p => `<option value="${p.title}" ${p.title === title ? 'selected' : ''}>${p.title} - ${p.location.split(',')[0]}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label for="units">Number of Units</label>
                <input type="number" id="units" name="units" min="1" value="1" required>
              </div>
              <button type="submit" class="btn btn-accent btn-full">Submit Inquiry</button>
            </form>
          </div>
        `;
      }

      if (detailModal.classList.contains('is-active')) closeModal(detailModal);
      openModal(inquiryModal);
    }
  }
});

// Form Submission handling (using delegation for dynamic forms)
document.addEventListener('submit', (e) => {
  if (e.target.id === 'lead-gen-form') {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    console.log("New Lead Generated:", data);

    // Show success state
    e.target.parentElement.innerHTML = `
      <div style="text-align: center; padding: 40px 0;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🎉</div>
        <h2>Success!</h2>
        <p>Thank you <strong>${data.name}</strong>. Your request for ${data.property || 'consultation'} has been received. Our expert team will contact you at ${data.phone} shortly.</p>
        <button class="btn btn-accent" style="margin-top: 20px;" onclick="location.reload()">Done</button>
      </div>
    `;
  }
});

// GSAP ScrollTrigger Reveal Animations
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.utils.toArray('.reveal').forEach((elem) => {
    gsap.fromTo(elem,
      {
        opacity: 0,
        y: 50,
        visibility: 'hidden'
      },
      {
        opacity: 1,
        y: 0,
        visibility: 'visible',
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: elem,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
}

// Initialize dynamic content
document.addEventListener('DOMContentLoaded', () => {
  renderProjects();
  renderLeadership();
  renderSocials();
  renderBlog();
  initScrollAnimations();

  // Re-run GSAP refresh if needed
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
});
