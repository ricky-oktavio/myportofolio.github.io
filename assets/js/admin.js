/**
* Admin Dashboard & CRUD Management Controller for Portfolio
* Integrated with Firebase Firestore & LocalStorage Backup.
*/

import { 
  firebaseConfig, 
  isFirebaseReady, 
  getPortfolioDataFromFirebase, 
  savePortfolioDataToFirebase,
  loginAdmin,
  logoutAdmin,
  subscribeToAuthChanges
} from "./firebase-service.js";

// --- Initial Default Seed Data ---
const DEFAULT_PORTFOLIO_DATA = {
  profile: {
    fullName: "Ricky Oktavio Adi Pranata",
    headline: "Senior Mobile Engineer • Flutter & Dart Specialist",
    statusBadge: "Available for Freelance & Full-time",
    bio: "Passionate Mobile Engineer from Malang, Indonesia with 3+ years of experience building high-performance cross-platform applications using Flutter, Clean Architecture, BLoC, and GetX.",
    bioP2: "From ride-hailing services like Okejek to enterprise Sales Force Automation (zestHub SFA) and official organization platforms like AyoPramuka Kwarnas, I turn Figma designs into pixel-perfect, high-performing code.",
    location: "Malang, Indonesia",
    email: "adioktav1997@gmail.com",
    phone: "+6285171115997",
    degree: "B.S. Informatics Engineering",
    experienceYears: "3+",
    appsShipped: "7+",
    cleanCode: "100%",
    problemSolving: "24/7",
    socials: {
      github: "https://github.com/ricky-oktavio?tab=repositories",
      linkedin: "https://www.linkedin.com/in/ricky-oktavio-adi-pranata-b27aa61b8/",
      telegram: "https://t.me/rckycrk",
      whatsapp: "https://wa.me/6285171115997"
    }
  },
  projects: [
    {
      id: "proj-1",
      title: "Okejek App",
      description: "Online transportation, delivery, and digital services platform.",
      category: "filter-app",
      image: "assets/img/portfolio/my/okjek.png",
      tags: ["Flutter", "GetX", "REST API", "Maps"],
      playstore: "https://play.google.com/store/apps/details?id=id.okejack.okejackapp&hl=in&gl=US",
      github: ""
    },
    {
      id: "proj-2",
      title: "zestHub SFA",
      description: "Sales Force Automation system for Sinarmas Distribusi Nusantara (SDN).",
      category: "filter-app",
      image: "assets/img/portfolio/my/sfa.png",
      tags: ["Flutter", "Clean Arch", "BLoC", "Enterprise"],
      playstore: "https://play.google.com/store/apps/details?id=com.zesthub.sfa",
      github: ""
    },
    {
      id: "proj-3",
      title: "AyoPramuka Kwarnas",
      description: "Official communication and community app for Gerakan Pramuka Indonesia.",
      category: "filter-app",
      image: "assets/img/portfolio/my/ayopramuka.png",
      tags: ["Flutter", "Community", "Social API"],
      playstore: "https://play.google.com/store/apps/details?id=id.pramuka.ayosatu.app&hl=id",
      github: ""
    },
    {
      id: "proj-4",
      title: "J5Store Marketplace",
      description: "Complete mobile marketplace solution for e-commerce shopping.",
      category: "filter-app filter-web",
      image: "assets/img/portfolio/my/j5store.png",
      tags: ["Flutter", "E-Commerce", "GitHub"],
      playstore: "",
      github: "https://github.com/rickydevs1/j5store-fe"
    },
    {
      id: "proj-5",
      title: "Al-Quran Mobile",
      description: "Digital Islamic Quran mobile app with audio recitation & translations.",
      category: "filter-app",
      image: "assets/img/portfolio/my/alquran.png",
      tags: ["Flutter", "Audio API", "Offline DB"],
      playstore: "",
      github: "https://github.com/rickydevs1/alquran"
    },
    {
      id: "proj-6",
      title: "Chat Application",
      description: "Real-time messaging mobile application interface.",
      category: "filter-app",
      image: "assets/img/portfolio/my/chat.png",
      tags: ["Flutter", "Firebase", "Realtime"],
      playstore: "",
      github: "https://github.com/rickydevs1/chat_apps"
    }
  ],
  experiences: [
    {
      id: "exp-1",
      role: "Mobile Engineer",
      company: "PT. Rahadyan Integrasi Nusantara",
      location: "Tasikmalaya",
      period: "August 2024 - Present",
      bullets: [
        "Building and scaling Android and iOS mobile applications using Flutter framework.",
        "Integrating complex REST APIs and optimizing network data processing.",
        "Translating Figma design systems into responsive, fluid UI components."
      ]
    },
    {
      id: "exp-2",
      role: "Mobile Engineer",
      company: "PT. Asaba Computer Centre",
      location: "Jakarta",
      period: "November 2022 - Present",
      bullets: [
        "Developing enterprise-grade cross-platform apps using Flutter & Clean Architecture.",
        "Executing complex state management solutions (BLoC, Cubit, GetX).",
        "Ensuring seamless API communication and high app performance across devices."
      ]
    },
    {
      id: "exp-3",
      role: "Managing Director & IT Support",
      company: "PT. Jlima Digital Indonesia",
      location: "Batam",
      period: "August 2022 - Present",
      bullets: [
        "Overseeing technical infrastructure and digital IT support operations."
      ]
    },
    {
      id: "exp-4",
      role: "Mobile Engineer",
      company: "PT. Okejek Kreasi Indonesia",
      location: "Malang",
      period: "January 2022 - October 2022",
      bullets: [
        "Developed core features for Okejek online transportation app using Flutter & Dart.",
        "Implemented real-time data handling, location tracking, and payment flows."
      ]
    }
  ],
  skills: [
    { id: "sk-1", name: "Flutter Framework", icon: "bi bi-phone", subtext: "Cross-platform iOS & Android Apps" },
    { id: "sk-2", name: "Dart Programming", icon: "bi bi-code-slash", subtext: "Object-Oriented & Asynchronous" },
    { id: "sk-3", name: "BLoC / Cubit / GetX", icon: "bi bi-diagram-3", subtext: "Predictable State Management" },
    { id: "sk-4", name: "Clean Architecture", icon: "bi bi-layers", subtext: "Domain, Data, Presentation Layers" },
    { id: "sk-5", name: "RESTful API & JSON", icon: "bi bi-cloud-arrow-down", subtext: "Dio, Http, Dynamic Payloads" },
    { id: "sk-6", name: "Figma to Flutter UI", icon: "bi bi-figma", subtext: "Pixel-perfect responsive design" },
    { id: "sk-7", name: "Git Version Control", icon: "bi bi-git", subtext: "GitHub, GitFlow, Collaboration" },
    { id: "sk-8", name: "Firebase & Local DB", icon: "bi bi-database", subtext: "Push Notification, Hive, SQLite" }
  ],
  firebaseConfig: firebaseConfig
};

// --- Storage Controller ---
class DataStore {
  constructor() {
    this.key = "ricky_portfolio_cms_data";
    this.data = this.load();
  }

  load() {
    const saved = localStorage.getItem(this.key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing local storage", e);
      }
    }
    this.save(DEFAULT_PORTFOLIO_DATA);
    return DEFAULT_PORTFOLIO_DATA;
  }

  save(data) {
    this.data = data || this.data;
    localStorage.setItem(this.key, JSON.stringify(this.data));
    if (isFirebaseReady) {
      savePortfolioDataToFirebase(this.data);
    }
  }

  reset() {
    localStorage.removeItem(this.key);
    this.data = DEFAULT_PORTFOLIO_DATA;
    this.save(DEFAULT_PORTFOLIO_DATA);
  }
}

const store = new DataStore();

// Attach globally for inline event handlers
window.store = store;

// --- Initialize App & Auth Listener ---
document.addEventListener("DOMContentLoaded", async () => {
  initTabs();

  // Listen to Firebase Authentication State Changes
  subscribeToAuthChanges((user) => {
    const loginScreen = document.getElementById("admin-login-screen");
    const dashboardLayout = document.getElementById("admin-dashboard-container");
    const userInfoHeader = document.getElementById("admin-user-info");
    const emailBadge = document.getElementById("user-email-badge");

    if (user) {
      if (loginScreen) loginScreen.style.display = "none";
      if (dashboardLayout) dashboardLayout.style.display = "block";
      if (userInfoHeader) userInfoHeader.style.display = "flex";
      if (emailBadge) emailBadge.textContent = user.email;
    } else {
      if (loginScreen) loginScreen.style.display = "block";
      if (dashboardLayout) dashboardLayout.style.display = "none";
      if (userInfoHeader) userInfoHeader.style.display = "none";
    }
  });

  // Try fetching from Firebase Firestore on load
  if (isFirebaseReady) {
    const remoteData = await getPortfolioDataFromFirebase();
    if (remoteData && remoteData.projects) {
      store.data = remoteData;
      store.save(remoteData);
      console.log("⚡ Updated local store with Firebase Firestore remote data!");
    }
  }

  renderProjects();
  renderExperiences();
  renderSkills();
  renderProfileForm();
  renderFirebaseConfig();
  renderMetricsHeader();
});

export async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const btnSubmit = document.getElementById("btn-login-submit");
  const errAlert = document.getElementById("login-error-alert");

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Signing in...`;
  errAlert.style.display = "none";

  try {
    await loginAdmin(email, password);
  } catch (err) {
    errAlert.style.display = "block";
    if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
      errAlert.textContent = "Invalid Firebase Auth Email or Password. Please check your account in Firebase Console.";
    } else {
      errAlert.textContent = err.message || "Failed to log in via Firebase Auth.";
    }
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `<i class="bi bi-box-arrow-in-right me-1"></i> Sign In to Dashboard`;
  }
}

export async function handleAdminLogout() {
  if (confirm("Are you sure you want to log out from Admin CMS?")) {
    await logoutAdmin();
  }
}

window.handleAdminLogin = handleAdminLogin;
window.handleAdminLogout = handleAdminLogout;

function initTabs() {
  const tabs = document.querySelectorAll(".admin-nav-btn");
  const sections = document.querySelectorAll(".admin-tab-section");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      sections.forEach(s => s.style.display = "none");

      tab.classList.add("active");
      const target = document.getElementById(tab.getAttribute("data-tab"));
      if (target) target.style.display = "block";
    });
  });
}

function renderMetricsHeader() {
  document.getElementById("count-projects").textContent = store.data.projects.length;
  document.getElementById("count-experience").textContent = store.data.experiences.length;
  document.getElementById("count-skills").textContent = store.data.skills.length;
}

// --- 1. Projects CRUD ---
export function renderProjects() {
  const tbody = document.getElementById("projects-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  store.data.projects.forEach(proj => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <img src="${proj.image}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 6px;" alt="">
      </td>
      <td><strong>${proj.title}</strong></td>
      <td><span class="badge-mode local">${proj.category}</span></td>
      <td>${proj.tags.map(t => `<span class="tag-badge me-1">${t}</span>`).join('')}</td>
      <td>
        <button class="btn-icon-action edit me-1" onclick="openProjectModal('${proj.id}')"><i class="bi bi-pencil"></i></button>
        <button class="btn-icon-action delete" onclick="deleteProject('${proj.id}')"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

export function openProjectModal(id = null) {
  const modal = document.getElementById("modal-project");
  const form = document.getElementById("form-project");

  if (id) {
    const item = store.data.projects.find(p => p.id === id);
    document.getElementById("proj-id").value = item.id;
    document.getElementById("proj-title").value = item.title;
    document.getElementById("proj-category").value = item.category;
    document.getElementById("proj-description").value = item.description;
    document.getElementById("proj-image").value = item.image;
    document.getElementById("proj-tags").value = item.tags.join(", ");
    document.getElementById("proj-playstore").value = item.playstore || "";
    document.getElementById("proj-github").value = item.github || "";
  } else {
    form.reset();
    document.getElementById("proj-id").value = "";
  }

  modal.classList.add("active");
}

export function saveProject(e) {
  e.preventDefault();
  const id = document.getElementById("proj-id").value;
  const newProj = {
    id: id || "proj-" + Date.now(),
    title: document.getElementById("proj-title").value,
    category: document.getElementById("proj-category").value,
    description: document.getElementById("proj-description").value,
    image: document.getElementById("proj-image").value || "assets/img/portfolio/my/okjek.png",
    tags: document.getElementById("proj-tags").value.split(",").map(t => t.trim()).filter(t => t),
    playstore: document.getElementById("proj-playstore").value,
    github: document.getElementById("proj-github").value
  };

  if (id) {
    const idx = store.data.projects.findIndex(p => p.id === id);
    if (idx !== -1) store.data.projects[idx] = newProj;
  } else {
    store.data.projects.push(newProj);
  }

  store.save();
  closeModal('modal-project');
  renderProjects();
  renderMetricsHeader();
}

export function deleteProject(id) {
  if (confirm("Are you sure you want to delete this project?")) {
    store.data.projects = store.data.projects.filter(p => p.id !== id);
    store.save();
    renderProjects();
    renderMetricsHeader();
  }
}

// --- 2. Experience CRUD ---
export function renderExperiences() {
  const tbody = document.getElementById("experience-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  store.data.experiences.forEach(exp => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${exp.role}</strong></td>
      <td>${exp.company}</td>
      <td><span class="badge-mode local">${exp.period}</span></td>
      <td>
        <button class="btn-icon-action edit me-1" onclick="openExpModal('${exp.id}')"><i class="bi bi-pencil"></i></button>
        <button class="btn-icon-action delete" onclick="deleteExperience('${exp.id}')"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

export function openExpModal(id = null) {
  const modal = document.getElementById("modal-exp");
  const form = document.getElementById("form-exp");

  if (id) {
    const item = store.data.experiences.find(e => e.id === id);
    document.getElementById("exp-id").value = item.id;
    document.getElementById("exp-role").value = item.role;
    document.getElementById("exp-company").value = item.company;
    document.getElementById("exp-location").value = item.location;
    document.getElementById("exp-period").value = item.period;
    document.getElementById("exp-bullets").value = item.bullets.join("\n");
  } else {
    form.reset();
    document.getElementById("exp-id").value = "";
  }

  modal.classList.add("active");
}

export function saveExperience(e) {
  e.preventDefault();
  const id = document.getElementById("exp-id").value;
  const newExp = {
    id: id || "exp-" + Date.now(),
    role: document.getElementById("exp-role").value,
    company: document.getElementById("exp-company").value,
    location: document.getElementById("exp-location").value,
    period: document.getElementById("exp-period").value,
    bullets: document.getElementById("exp-bullets").value.split("\n").map(b => b.trim()).filter(b => b)
  };

  if (id) {
    const idx = store.data.experiences.findIndex(e => e.id === id);
    if (idx !== -1) store.data.experiences[idx] = newExp;
  } else {
    store.data.experiences.push(newExp);
  }

  store.save();
  closeModal('modal-exp');
  renderExperiences();
  renderMetricsHeader();
}

export function deleteExperience(id) {
  if (confirm("Are you sure you want to delete this experience entry?")) {
    store.data.experiences = store.data.experiences.filter(e => e.id !== id);
    store.save();
    renderExperiences();
    renderMetricsHeader();
  }
}

// --- 3. Tech Stack CRUD ---
export function renderSkills() {
  const tbody = document.getElementById("skills-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  store.data.skills.forEach(sk => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><i class="${sk.icon} fs-4 text-info"></i></td>
      <td><strong>${sk.name}</strong></td>
      <td>${sk.subtext}</td>
      <td>
        <button class="btn-icon-action edit me-1" onclick="openSkillModal('${sk.id}')"><i class="bi bi-pencil"></i></button>
        <button class="btn-icon-action delete" onclick="deleteSkill('${sk.id}')"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

export function openSkillModal(id = null) {
  const modal = document.getElementById("modal-skill");
  const form = document.getElementById("form-skill");

  if (id) {
    const item = store.data.skills.find(s => s.id === id);
    document.getElementById("sk-id").value = item.id;
    document.getElementById("sk-name").value = item.name;
    document.getElementById("sk-icon").value = item.icon;
    document.getElementById("sk-subtext").value = item.subtext;
  } else {
    form.reset();
    document.getElementById("sk-id").value = "";
  }

  modal.classList.add("active");
}

export function saveSkill(e) {
  e.preventDefault();
  const id = document.getElementById("sk-id").value;
  const newSkill = {
    id: id || "sk-" + Date.now(),
    name: document.getElementById("sk-name").value,
    icon: document.getElementById("sk-icon").value,
    subtext: document.getElementById("sk-subtext").value
  };

  if (id) {
    const idx = store.data.skills.findIndex(s => s.id === id);
    if (idx !== -1) store.data.skills[idx] = newSkill;
  } else {
    store.data.skills.push(newSkill);
  }

  store.save();
  closeModal('modal-skill');
  renderSkills();
  renderMetricsHeader();
}

export function deleteSkill(id) {
  if (confirm("Are you sure you want to delete this skill?")) {
    store.data.skills = store.data.skills.filter(s => s.id !== id);
    store.save();
    renderSkills();
    renderMetricsHeader();
  }
}

// --- 4. Profile Settings ---
export function renderProfileForm() {
  const p = store.data.profile;
  if (!document.getElementById("prof-name")) return;
  document.getElementById("prof-name").value = p.fullName || "";
  document.getElementById("prof-headline").value = p.headline || "";
  document.getElementById("prof-badge").value = p.statusBadge || "";
  document.getElementById("prof-bio").value = p.bio || "";
  if (document.getElementById("prof-bio-p2")) document.getElementById("prof-bio-p2").value = p.bioP2 || "";
  if (document.getElementById("prof-location")) document.getElementById("prof-location").value = p.location || "";
  if (document.getElementById("prof-email")) document.getElementById("prof-email").value = p.email || "";
  if (document.getElementById("prof-phone")) document.getElementById("prof-phone").value = p.phone || "";
  if (document.getElementById("prof-degree")) document.getElementById("prof-degree").value = p.degree || "";
  document.getElementById("prof-exp-years").value = p.experienceYears || "";
  document.getElementById("prof-apps").value = p.appsShipped || "";
  if (document.getElementById("prof-clean-code")) document.getElementById("prof-clean-code").value = p.cleanCode || "";
  if (document.getElementById("prof-problem-solving")) document.getElementById("prof-problem-solving").value = p.problemSolving || "";
  document.getElementById("prof-github").value = p.socials?.github || "";
  document.getElementById("prof-linkedin").value = p.socials?.linkedin || "";
  document.getElementById("prof-telegram").value = p.socials?.telegram || "";
  document.getElementById("prof-whatsapp").value = p.socials?.whatsapp || "";
}

export function saveProfile(e) {
  e.preventDefault();
  store.data.profile.fullName = document.getElementById("prof-name").value;
  store.data.profile.headline = document.getElementById("prof-headline").value;
  store.data.profile.statusBadge = document.getElementById("prof-badge").value;
  store.data.profile.bio = document.getElementById("prof-bio").value;
  if (document.getElementById("prof-bio-p2")) store.data.profile.bioP2 = document.getElementById("prof-bio-p2").value;
  if (document.getElementById("prof-location")) store.data.profile.location = document.getElementById("prof-location").value;
  if (document.getElementById("prof-email")) store.data.profile.email = document.getElementById("prof-email").value;
  if (document.getElementById("prof-phone")) store.data.profile.phone = document.getElementById("prof-phone").value;
  if (document.getElementById("prof-degree")) store.data.profile.degree = document.getElementById("prof-degree").value;
  store.data.profile.experienceYears = document.getElementById("prof-exp-years").value;
  store.data.profile.appsShipped = document.getElementById("prof-apps").value;
  if (document.getElementById("prof-clean-code")) store.data.profile.cleanCode = document.getElementById("prof-clean-code").value;
  if (document.getElementById("prof-problem-solving")) store.data.profile.problemSolving = document.getElementById("prof-problem-solving").value;

  if (!store.data.profile.socials) store.data.profile.socials = {};
  store.data.profile.socials.github = document.getElementById("prof-github").value;
  store.data.profile.socials.linkedin = document.getElementById("prof-linkedin").value;
  store.data.profile.socials.telegram = document.getElementById("prof-telegram").value;
  store.data.profile.socials.whatsapp = document.getElementById("prof-whatsapp").value;

  store.save();
  alert("Profile settings saved successfully and synced to Firebase!");
}

// --- 5. Firebase Settings & Sync ---
export function renderFirebaseConfig() {
  const fb = firebaseConfig;
  if (!document.getElementById("fb-apikey")) return;
  document.getElementById("fb-apikey").value = fb.apiKey || "";
  document.getElementById("fb-authdomain").value = fb.authDomain || "";
  document.getElementById("fb-projectid").value = fb.projectId || "";
  document.getElementById("fb-appid").value = fb.appId || "";
}

export async function syncToFirebase() {
  if (!isFirebaseReady) {
    alert("Firebase is not initialized. Please check network connectivity.");
    return;
  }

  const result = await savePortfolioDataToFirebase(store.data);
  if (result && result.success) {
    alert("🔥 Data successfully synced to Firebase Firestore (Project: " + firebaseConfig.projectId + ")!");
  } else if (result && result.reason === "PERMISSION_DENIED") {
    alert("⚠️ Firebase Firestore Security Rule Alert:\n\n" + result.message);
  } else {
    alert("❌ Error syncing to Firebase: " + (result ? result.message : "Unknown error"));
  }
}

export function exportJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "ricky_portfolio_data.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function resetAllData() {
  if (confirm("Reset all data back to original defaults?")) {
    store.reset();
    location.reload();
  }
}

export function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// Global functions for inline HTML handlers
window.openProjectModal = openProjectModal;
window.saveProject = saveProject;
window.deleteProject = deleteProject;

window.openExpModal = openExpModal;
window.saveExperience = saveExperience;
window.deleteExperience = deleteExperience;

window.openSkillModal = openSkillModal;
window.saveSkill = saveSkill;
window.deleteSkill = deleteSkill;

window.saveProfile = saveProfile;
window.syncToFirebase = syncToFirebase;
window.exportJSON = exportJSON;
window.resetAllData = resetAllData;
window.closeModal = closeModal;
