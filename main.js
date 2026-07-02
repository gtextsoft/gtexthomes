// GText Homes — shared interactions
let revealObserver;

document.addEventListener("DOMContentLoaded", () => {
  initStickyHeader();
  initMobileNav();
  initInquiryForms();
  initEstateRendering();
  initLandRendering();
  initInvestmentRendering();
  initBlogRendering();
  initLeadershipRendering();
  initTestimonials();
  initSectionReveals();
});

function initStickyHeader() {
  const header = document.getElementById("main-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const headerRight = document.querySelector(".header-right");
  if (!toggle || !headerRight) return;

  toggle.addEventListener("click", () => {
    const open = headerRight.classList.toggle("is-open");
    toggle.classList.toggle("is-active", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  });

  headerRight.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      headerRight.classList.remove("is-open");
      toggle.classList.remove("is-active");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });
}

function initSectionReveals() {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
  );
  refreshRevealElements();
}

function refreshRevealElements() {
  if (!revealObserver) return;
  document.querySelectorAll(".reveal:not([data-reveal-watched])").forEach((el) => {
    el.setAttribute("data-reveal-watched", "true");
    revealObserver.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      el.classList.add("is-visible");
    }
  });
}

function initInquiryForms() {
  document.querySelectorAll(".inquiry-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get("name") || "";
      const email = data.get("email") || "";
      const phone = data.get("phone") || "";
      const property = data.get("property") || "General Inquiry";
      const message = data.get("message") || "";

      const text = [
        "Hello GText Homes,",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Property/Interest: ${property}`,
        message ? `Message: ${message}` : ""
      ]
        .filter(Boolean)
        .join("\n");

      const phoneRaw =
        (typeof GTEXT_CONFIG !== "undefined" && GTEXT_CONFIG.contact?.phoneRaw) ||
        "2348142590965";

      const status = form.querySelector(".form-status");
      if (status) {
        status.textContent = "Thank you! Opening WhatsApp to complete your inquiry...";
        status.classList.add("success");
      }

      setTimeout(() => {
        window.open(`https://wa.me/${phoneRaw}?text=${encodeURIComponent(text)}`, "_blank");
        form.reset();
      }, 600);
    });
  });
}

function renderEstateCard(estate, compact) {
  const homeTypes = estate.homeTypes
    .map((h) => `<li>${h}</li>`)
    .join("");
  const features = estate.features
    .slice(0, compact ? 4 : 6)
    .map((f) => `<span class="feature-tag">${f}</span>`)
    .join("");
  const landmarks = estate.landmarks
    .slice(0, compact ? 3 : 5)
    .map((l) => `<li>${l}</li>`)
    .join("");

  return `
    <article class="estate-card" id="${estate.id}" data-category="${estate.category}">
      <div class="estate-card-media">
        <img src="${estate.image}" alt="${estate.title} — ${estate.location}" loading="lazy">
        <span class="property-badge">${estate.badge}</span>
      </div>
      <div class="estate-card-body">
        <p class="estate-subtitle">${estate.subtitle}</p>
        <h3>${estate.title}</h3>
        <p class="estate-location">${estate.location}</p>
        ${compact ? `<p class="estate-desc-short">${estate.description.slice(0, 160)}...</p>` : `<p class="estate-desc">${estate.description}</p>`}
        <div class="estate-price">${estate.price}</div>
        ${compact ? "" : `
        <div class="estate-section">
          <h4>Available Home Types</h4>
          <ul class="estate-list">${homeTypes}</ul>
        </div>
        <div class="estate-section">
          <h4>Nearby Landmarks</h4>
          <ul class="estate-list landmarks">${landmarks}</ul>
        </div>`}
        <div class="estate-features">${features}</div>
        <div class="estate-actions">
          <a href="/contact.html?property=${encodeURIComponent(estate.title)}" class="btn btn-primary btn-sm">Inquire Now</a>
          ${compact ? `<a href="/properties.html#${estate.id}" class="btn-link">View Details →</a>` : ""}
        </div>
      </div>
    </article>`;
}

function initEstateRendering() {
  const container = document.getElementById("estate-list");
  if (!container) return;
  if (typeof GTEXT_ESTATES === "undefined") {
    container.innerHTML =
      '<p style="text-align:center;color:#78716c;padding:2rem;">Property data could not load. Open this site through a web server (e.g. Live Server) or visit the deployed site.</p>';
    return;
  }

  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const isHome =
    path === "/" || path.endsWith("/index.html") || path.endsWith("/index");
  const list = isHome ? GTEXT_ESTATES : GTEXT_ESTATES;

  container.innerHTML = list.map((e) => renderEstateCard(e, isHome)).join("");
}

function initLandRendering() {
  const container = document.getElementById("land-list");
  if (!container || typeof GTEXT_PROPERTIES === "undefined") return;

  const land = GTEXT_PROPERTIES.filter((p) => p.category === "land");
  if (!land.length) return;

  container.innerHTML = land
    .map(
      (p) => `
    <article class="property-card" id="${p.id}" data-category="${p.category}">
      <div class="property-badge">${p.badge}</div>
      <img src="${p.image}" alt="${p.title} at ${p.estate}, ${p.location}" loading="lazy">
      <div class="property-info">
        <p class="estate-label">${p.estate}</p>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="property-meta">
          <span>${p.price}</span>
          <a href="/contact.html?property=${encodeURIComponent(p.title + " — " + p.estate)}" class="btn-link">Inquire →</a>
        </div>
      </div>
    </article>`
    )
    .join("");
}

function initInvestmentRendering() {
  const container = document.getElementById("investment-list");
  if (!container || typeof GTEXT_INVESTMENTS === "undefined") return;

  container.innerHTML = GTEXT_INVESTMENTS.map(
    (inv) => `
    <article class="fractional-card" id="${inv.id}">
      <div class="fractional-card-media">
        <img src="${inv.image}" alt="${inv.title}" loading="lazy">
        <span class="property-badge">${inv.badge}</span>
      </div>
      <div class="fractional-card-body">
        <h3>${inv.title}</h3>
        <p class="fractional-location">${inv.location}</p>
        <p class="fractional-desc">${inv.description}</p>
        <div class="fractional-stats">
          <div><span>Min. Investment</span><strong>${inv.minInvestment}</strong></div>
          <div><span>Projected ROI</span><strong>${inv.projectedRoi}</strong></div>
          <div><span>Tenure</span><strong>${inv.tenure}</strong></div>
        </div>
        <ul class="fractional-highlights">
          ${inv.highlights.map((h) => `<li>${h}</li>`).join("")}
        </ul>
        <a href="/contact.html?property=${encodeURIComponent(inv.title)}" class="btn btn-primary btn-sm">Invest Now</a>
      </div>
    </article>`
  ).join("");
}

function initBlogRendering() {
  const container = document.getElementById("blog-list");
  if (!container || typeof GTEXT_BLOG === "undefined") return;

  container.innerHTML = GTEXT_BLOG.map(
    (b) => `
    <article class="blog-card" id="${b.slug}">
      <span class="blog-date">${b.date} · ${b.author}</span>
      <h3>${b.title}</h3>
      <p>${b.excerpt}</p>
      <a href="/contact.html" class="btn-link">Read More →</a>
    </article>`
  ).join("");
}

function initLeadershipRendering() {
  const container = document.getElementById("leadership-list");
  if (!container || typeof GTEXT_LEADERSHIP === "undefined") return;

  container.innerHTML = GTEXT_LEADERSHIP.map(
    (l) => `
    <article class="leadership-card">
      <div class="leadership-avatar">${l.name.replace(/^Dr\s/, "").charAt(0)}</div>
      <h3>${l.name}</h3>
      <p class="leadership-title">${l.title}</p>
      <p class="leadership-bio">${l.bio}</p>
    </article>`
  ).join("");
}

function initTestimonials() {
  const container = document.getElementById("testimonials-list");
  if (!container) return;

  const testimonials =
    typeof GTEXT_TESTIMONIALS !== "undefined" ? GTEXT_TESTIMONIALS : [];

  if (!testimonials.length) {
    container.innerHTML =
      '<p style="text-align:center;color:#78716c;grid-column:1/-1;">Testimonials could not load. Check that testimonials.js is included.</p>';
    return;
  }

  container.innerHTML = testimonials
    .map(
      (t) => `
    <blockquote class="testimonial-card">
      <p>"${t.quote}"</p>
      <footer>
        <strong>${t.name}</strong>
        <span>${t.role}</span>
      </footer>
    </blockquote>`
    )
    .join("");

  renderGoogleReviewsLink(container);
}

function renderGoogleReviewsLink(container) {
  const reviewsUrl =
    (typeof GTEXT_CONFIG !== "undefined" && GTEXT_CONFIG.googleReviewsUrl) || "";
  if (!reviewsUrl) return;

  const parent = container.parentElement;
  if (!parent || parent.querySelector(".google-reviews-cta")) return;

  const wrap = document.createElement("div");
  wrap.className = "google-reviews-cta";
  wrap.innerHTML = `
    <a href="${reviewsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-dark">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
      See more reviews on Google
    </a>`;
  parent.appendChild(wrap);
}

(function prefillContactForm() {
  const params = new URLSearchParams(window.location.search);
  const property = params.get("property");
  if (!property) return;
  const select = document.querySelector('select[name="property"]');
  if (select) {
    let found = false;
    Array.from(select.options).forEach((opt) => {
      if (opt.value === property) found = true;
    });
    if (!found) {
      const option = document.createElement("option");
      option.value = property;
      option.textContent = property;
      select.appendChild(option);
    }
    select.value = property;
  }
})();
