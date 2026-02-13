const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const navOverlay = document.querySelector(".nav-overlay");

function updateHeaderState() {
  if (!siteHeader) return;
  if (window.scrollY > 30) {
    siteHeader.classList.add("scrolled");
  } else {
    siteHeader.classList.remove("scrolled");
  }
}

function openMenu() {
  navToggle?.setAttribute("aria-expanded", "true");
  mainNav?.classList.add("is-open");
  navOverlay?.classList.add("is-visible");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  navToggle?.setAttribute("aria-expanded", "false");
  mainNav?.classList.remove("is-open");
  navOverlay?.classList.remove("is-visible");
  document.body.style.overflow = "";
}

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  if (isOpen) closeMenu();
  else openMenu();
});

mainNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
navOverlay?.addEventListener("click", closeMenu);

window.addEventListener("resize", () => {
  if (window.innerWidth > 940) closeMenu();
});

window.addEventListener("scroll", updateHeaderState);
window.addEventListener("load", updateHeaderState);
