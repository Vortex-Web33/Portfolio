// Header: scrolled state + mobile burger menu
const header = document.querySelector(".site-header");
const burgerBtn = document.getElementById("burger-btn");
const mobileMenu = document.getElementById("mobile-menu");
const overlay = document.getElementById("mobile-menu-overlay");
const closeBtn = document.getElementById("mobile-menu-close");
const burgerOpen = document.getElementById("burger-open");
const burgerClose = document.getElementById("burger-close");

const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

function openMenu() {
  mobileMenu?.classList.remove("translate-y-[-100%]");
  mobileMenu?.classList.add("translate-y-0");
  overlay?.classList.remove("opacity-0", "invisible");
  overlay?.classList.add("opacity-100", "visible");
  burgerBtn?.setAttribute("aria-expanded", "true");
  burgerOpen?.classList.add("hidden");
  burgerClose?.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  mobileMenu?.classList.add("translate-y-[-100%]");
  mobileMenu?.classList.remove("translate-y-0");
  overlay?.classList.add("opacity-0", "invisible");
  overlay?.classList.remove("opacity-100", "visible");
  burgerBtn?.setAttribute("aria-expanded", "false");
  burgerOpen?.classList.remove("hidden");
  burgerClose?.classList.add("hidden");
  document.body.style.overflow = "";
}

burgerBtn?.addEventListener("click", () => {
  const isOpen = burgerBtn.getAttribute("aria-expanded") === "true";
  isOpen ? closeMenu() : openMenu();
});

closeBtn?.addEventListener("click", closeMenu);
overlay?.addEventListener("click", closeMenu);

// Close on nav link click
mobileMenu?.querySelectorAll(".mobile-nav-link").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});