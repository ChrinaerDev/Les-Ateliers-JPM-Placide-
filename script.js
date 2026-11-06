const languageButtons = document.querySelectorAll("[data-language]");
const initialLanguage = document.documentElement.lang;
let activeLanguage = initialLanguage;

function savedLanguage() {
  try {
    return localStorage.getItem("jpm-language");
  } catch {
    return null;
  }
}

function setLanguage(language, remember = false) {
  if (language !== activeLanguage) {
    const copy = globalThis.jpmLocales[language];
    document.querySelectorAll("[data-copy]").forEach(element => {
      element.textContent = copy[element.dataset.copy];
    });
    document.querySelectorAll("[data-alt]").forEach(element => {
      element.alt = copy[element.dataset.alt];
    });
    document.querySelectorAll("[data-label]").forEach(element => {
      element.setAttribute("aria-label", copy[element.dataset.label]);
    });
    document.title = copy.title;
    document.querySelector('meta[name="description"]').content = copy.description;
    document.documentElement.lang = language;
    activeLanguage = language;
  }

  languageButtons.forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.language === activeLanguage));
  });
  if (remember) {
    try {
      localStorage.setItem("jpm-language", activeLanguage);
    } catch {
      // Language switching also works when browser storage is disabled.
    }
  }
}

languageButtons.forEach(button => {
  button.addEventListener("click", () => setLanguage(button.dataset.language, true));
});

const storedLanguage = savedLanguage();
const deviceLanguage = (navigator.languages || [navigator.language])
  .map(locale => locale.toLowerCase().split("-")[0])
  .find(locale => locale === "en" || locale === "fr");
setLanguage(["en", "fr"].includes(storedLanguage) ? storedLanguage : deviceLanguage || initialLanguage);

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove("awaiting");
      observer.unobserve(entry.target);
    });
  });
  document.querySelectorAll(".reveal").forEach(element => {
    if (element.getBoundingClientRect().top >= innerHeight) {
      element.classList.add("awaiting");
      observer.observe(element);
    }
  });
}

const heroImage = document.querySelector(".hero-image");
let scrollFrame = 0;
function updateHero() {
  scrollFrame = 0;
  const drift = reducedMotion.matches ? 0 : Math.min(window.scrollY * .04, 14);
  heroImage.style.setProperty("--drift", `${drift}px`);
}
window.addEventListener("scroll", () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateHero);
}, { passive: true });
updateHero();
