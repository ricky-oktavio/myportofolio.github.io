/**
* Dynamic Portfolio Renderer for Ricky Oktavio Portfolio (index.html)
* Binds live data from Firebase Firestore & LocalStorage to index.html UI
*/

import { 
  getPortfolioDataFromFirebase, 
  subscribeToFirebaseChanges 
} from "./firebase-service.js";

const LOCAL_STORAGE_KEY = "ricky_portfolio_cms_data";

// CMS data goes into innerHTML on the public page; escape it.
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Escaping does not stop a javascript: URL, so links and images only accept these schemes or a site-relative path.
const safeUrl = (v) => /^(https?:\/\/|mailto:|tel:|data:image\/|assets\/)/i.test(String(v ?? "").trim()) ? String(v).trim() : "";

// Fallback Default Data
const DEFAULT_DATA = {
  profile: {
    fullName: "Ricky Oktavio Adi Pranata",
    headline: "Senior Mobile Engineer • Flutter & Dart Specialist",
    statusBadge: "Available for Freelance & Full-time",
    bio: "Mobile engineer in Malang, Indonesia. I've built Flutter apps for iOS and Android since 2020, using Clean Architecture with BLoC and GetX.",
    location: "Malang City, East Java, Indonesia",
    email: "adioktav1997@gmail.com",
    phone: "+6285171115997",
    experienceYears: "6+",
    appsShipped: "9",
    socials: {
      github: "https://github.com/ricky-oktavio?tab=repositories",
      linkedin: "https://www.linkedin.com/in/ricky-oktavio-adi-pranata-b27aa61b8/",
      telegram: "https://t.me/rckycrk",
      whatsapp: "https://wa.me/6285171115997"
    }
  },
  projects: [],
  experiences: [],
  skills: []
};

function getLocalData() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_DATA;
}

export function updatePortfolioUI(data) {
  if (!data) return;

  const profile = data.profile || DEFAULT_DATA.profile;

  // Hero & Profile Texts
  const statusBadge = document.getElementById("hero-status-badge");
  if (statusBadge && profile.statusBadge) statusBadge.textContent = profile.statusBadge;

  const heroName = document.getElementById("hero-name");
  if (heroName && profile.fullName) heroName.textContent = profile.fullName;

  const heroHeadline = document.getElementById("hero-headline");
  if (heroHeadline && profile.headline) heroHeadline.textContent = profile.headline;

  const heroBio = document.getElementById("hero-bio");
  if (heroBio && profile.bio) heroBio.textContent = profile.bio;

  const heroStatYears = document.getElementById("hero-stat-years");
  if (heroStatYears && profile.experienceYears) heroStatYears.textContent = profile.experienceYears + " Years";

  // About Me Section & Info Items

  const aboutBioP2 = document.getElementById("about-bio-p2");
  if (aboutBioP2 && profile.bioP2) aboutBioP2.textContent = profile.bioP2;

  const aboutCity = document.getElementById("about-city");
  if (aboutCity && profile.location) aboutCity.textContent = profile.location;

  const aboutEmail = document.getElementById("about-email");
  if (aboutEmail && profile.email) {
    aboutEmail.textContent = profile.email;
    aboutEmail.href = "mailto:" + profile.email;
  }

  const aboutPhone = document.getElementById("about-phone");
  if (aboutPhone && profile.phone) {
    aboutPhone.textContent = profile.phone;
    aboutPhone.href = "tel:" + profile.phone;
  }

  const aboutDegree = document.getElementById("about-degree");
  if (aboutDegree && profile.degree) aboutDegree.textContent = profile.degree;

  // Metrics
  const metricExpYears = document.getElementById("metric-exp-years");
  if (metricExpYears && profile.experienceYears) metricExpYears.textContent = profile.experienceYears;

  const metricApps = document.getElementById("metric-apps-shipped");
  if (metricApps && profile.appsShipped) metricApps.textContent = profile.appsShipped;

  // Contact & Socials
  const socialGithub = document.querySelectorAll(".link-github");
  socialGithub.forEach(el => { if (safeUrl(profile.socials?.github)) el.href = safeUrl(profile.socials.github); });

  const socialLinkedin = document.querySelectorAll(".link-linkedin");
  socialLinkedin.forEach(el => { if (safeUrl(profile.socials?.linkedin)) el.href = safeUrl(profile.socials.linkedin); });

  const socialTelegram = document.querySelectorAll(".link-telegram");
  socialTelegram.forEach(el => { if (safeUrl(profile.socials?.telegram)) el.href = safeUrl(profile.socials.telegram); });

  const socialWhatsapp = document.querySelectorAll(".link-whatsapp");
  socialWhatsapp.forEach(el => { if (safeUrl(profile.socials?.whatsapp)) el.href = safeUrl(profile.socials.whatsapp); });

  document.querySelectorAll(".link-email").forEach(el => { if (profile.email) el.href = "mailto:" + profile.email; });

  // Render Stack list
  if (data.skills && data.skills.length > 0) {
    const skillsContainer = document.getElementById("skills-container");
    if (skillsContainer) {
      skillsContainer.innerHTML = data.skills.map(sk => `
        <li class="stack-item"><i class="${esc(sk.icon)}" aria-hidden="true"></i><span class="stack-name">${esc(sk.name)}</span><span class="stack-sub">${esc(sk.subtext)}</span></li>
      `).join("");
    }
  }

  // Render Experience rows
  if (data.experiences && data.experiences.length > 0) {
    const expContainer = document.getElementById("experience-timeline-container");
    if (expContainer) {
      expContainer.innerHTML = data.experiences.map(exp => `
        <li class="xp-row">
          <span class="xp-period">${esc(exp.period)}</span>
          <div class="xp-main">
            <h3>${esc(exp.role)}</h3>
            <p class="xp-co">${esc(exp.company)}</p>
            <ul class="xp-notes">${(exp.bullets || []).map(b => `<li>${esc(b)}</li>`).join("")}</ul>
          </div>
          <span class="xp-loc">${esc(exp.location)}</span>
        </li>
      `).join("");
    }
  }

  // Render Work cards
  if (data.projects && data.projects.length > 0) {
    const projectsContainer = document.getElementById("portfolio-grid-container");
    if (projectsContainer) {
      projectsContainer.innerHTML = data.projects.map(proj => `
        <article class="work-card ${esc(proj.category)}">
          <a class="work-media portfolio-lightbox" href="${esc(safeUrl(proj.image))}" data-title="${esc(proj.title)}"><img src="${esc(safeUrl(proj.image))}" alt="${esc(proj.title)}" loading="lazy"></a>
          <div class="work-meta">
            <h3>${esc(proj.title)}</h3>
            <p>${esc(proj.description)}</p>
            <ul class="work-tags">${(proj.tags || []).map(t => `<li>${esc(t)}</li>`).join("")}</ul>
            <div class="work-links">
              ${safeUrl(proj.website) ? `<a href="${esc(safeUrl(proj.website))}" target="_blank" rel="noopener">Website ↗</a>` : ""}
              ${safeUrl(proj.playstore) ? `<a href="${esc(safeUrl(proj.playstore))}" target="_blank" rel="noopener">Play Store ↗</a>` : ""}
              ${safeUrl(proj.appstore) ? `<a href="${esc(safeUrl(proj.appstore))}" target="_blank" rel="noopener">App Store ↗</a>` : ""}
              ${safeUrl(proj.github) ? `<a href="${esc(safeUrl(proj.github))}" target="_blank" rel="noopener">GitHub ↗</a>` : ""}
            </div>
          </div>
        </article>
      `).join("");
    }
  }

  // Re-split the statement, rescale the stack, re-apply the filter, reload the lightbox
  window.site?.refresh();
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", async () => {
  // First load from LocalStorage for instant rendering
  const localData = getLocalData();
  updatePortfolioUI(localData);

  // Then try fetching & listening from Firebase
  try {
    const remoteData = await getPortfolioDataFromFirebase();
    if (remoteData) {
      updatePortfolioUI(remoteData);
    }
    subscribeToFirebaseChanges((data) => {
      if (data) updatePortfolioUI(data);
    });
  } catch (err) {
    console.warn("Using LocalStorage portfolio data");
  }
});
