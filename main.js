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
    <article class="estate-card reveal" id="${estate.id}" data-category="${estate.category}">
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
  if (!container || typeof GTEXT_ESTATES === "undefined") return;

  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const isHome =
    path === "/" || path.endsWith("/index.html") || path.endsWith("/index");
  const list = isHome ? GTEXT_ESTATES : GTEXT_ESTATES;

  container.innerHTML = list.map((e) => renderEstateCard(e, isHome)).join("");
  refreshRevealElements();
}

function initLandRendering() {
  const container = document.getElementById("land-list");
  if (!container || typeof GTEXT_PROPERTIES === "undefined") return;

  const land = GTEXT_PROPERTIES.filter((p) => p.category === "land");
  if (!land.length) return;

  container.innerHTML = land
    .map(
      (p) => `
    <article class="property-card reveal" id="${p.id}" data-category="${p.category}">
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
  refreshRevealElements();
}

function initInvestmentRendering() {
  const container = document.getElementById("investment-list");
  if (!container || typeof GTEXT_INVESTMENTS === "undefined") return;

  container.innerHTML = GTEXT_INVESTMENTS.map(
    (inv) => `
    <article class="fractional-card reveal" id="${inv.id}">
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
  refreshRevealElements();
}

function initBlogRendering() {
  const container = document.getElementById("blog-list");
  if (!container || typeof GTEXT_BLOG === "undefined") return;

  container.innerHTML = GTEXT_BLOG.map(
    (b) => `
    <article class="blog-card reveal" id="${b.slug}">
      <span class="blog-date">${b.date} · ${b.author}</span>
      <h3>${b.title}</h3>
      <p>${b.excerpt}</p>
      <a href="/contact.html" class="btn-link">Read More →</a>
    </article>`
  ).join("");
  refreshRevealElements();
}

function initLeadershipRendering() {
  const container = document.getElementById("leadership-list");
  if (!container || typeof GTEXT_LEADERSHIP === "undefined") return;

  container.innerHTML = GTEXT_LEADERSHIP.map(
    (l) => `
    <article class="leadership-card reveal">
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

  container.innerHTML = testimonials
    .map(
      (t) => `
    <blockquote class="testimonial-card reveal">
      <p>"${t.quote}"</p>
      <footer>
        <strong>${t.name}</strong>
        <span>${t.role}</span>
      </footer>
    </blockquote>`
    )
    .join("");
  refreshRevealElements();
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
