const siteHeader = document.querySelector(".site-header");

function updateHeaderState() {
  if (!siteHeader) return;
  if (window.scrollY > 30) {
    siteHeader.classList.add("scrolled");
  } else {
    siteHeader.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", updateHeaderState);
window.addEventListener("load", updateHeaderState);
