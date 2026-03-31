const questionGrid = document.getElementById("questionGrid");
const questionnaireForm = document.getElementById("questionnaireForm");
const sectionTitle = document.getElementById("sectionTitle");
const sectionHint = document.getElementById("sectionHint");
const submitBtn = document.getElementById("submitBtn");
const logoutBtn = document.getElementById("logoutBtn");

const baseQuestions = [
  {
    key: "gender",
    label: "Gender",
    options: [
      { value: "male", label: "Male", emoji: "🧑" },
      { value: "female", label: "Female", emoji: "👩" },
    ],
  },
  {
    key: "bodyType",
    label: "Body Type",
    options: [
      ["rectangle", "Rectangle", "⬛"],
      ["pear", "Pear", "🍐"],
      ["apple", "Apple", "🍎"],
      ["hourglass", "Hourglass", "⏳"],
      ["oval", "Oval", "⭕"],
      ["trapezoid", "Trapezoid", "🔻"],
    ].map(([value, label, emoji]) => ({ value, label, emoji })),
  },
  {
    key: "skinTone",
    label: "Skin Tone",
    options: [
      ["fair", "Fair", "🤍"],
      ["medium", "Medium", "🟤"],
      ["dusky", "Dusky", "🤎"],
      ["dark", "Dark", "🖤"],
    ].map(([value, label, emoji]) => ({ value, label, emoji })),
  },
  {
    key: "height",
    label: "Height",
    options: [
      ["short", "Short", "📏"],
      ["average", "Average", "📐"],
      ["tall", "Tall", "📍"],
    ].map(([value, label, emoji]) => ({ value, label, emoji })),
  },
  {
    key: "stylePreference",
    label: "Style Preference",
    options: [
      ["minimal", "Minimal", "🤍"],
      ["bold", "Bold", "🔥"],
      ["trendy", "Trendy", "✨"],
      ["traditional", "Traditional", "🪔"],
    ].map(([value, label, emoji]) => ({ value, label, emoji })),
  },
];

const sessionQuestions = [
  {
    key: "occasion",
    label: "Occasion",
    options: [
      ["casual", "Casual", "👕"],
      ["formal", "Formal", "👔"],
      ["ethnic", "Ethnic", "🧵"],
      ["party", "Party", "🎉"],
    ].map(([value, label, emoji]) => ({ value, label, emoji })),
  },
  {
    key: "season",
    label: "Season",
    options: [
      ["summer", "Summer", "☀️"],
      ["winter", "Winter", "❄️"],
      ["monsoon", "Monsoon", "🌧️"],
      ["festive", "Festive", "🎊"],
    ].map(([value, label, emoji]) => ({ value, label, emoji })),
  },
];

let currentMode = "base";
const state = {};

function renderQuestionCard(question) {
  const card = document.createElement("section");
  card.className = "question-card";
  card.dataset.key = question.key;
  card.innerHTML = `<h3>${question.label}</h3><div class="options"></div>`;
  const optionsWrap = card.querySelector(".options");

  question.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.dataset.key = question.key;
    btn.dataset.value = opt.value;
    btn.textContent = `${opt.emoji} ${opt.label}`;
    btn.addEventListener("click", () => {
      state[question.key] = opt.value;
      [...optionsWrap.querySelectorAll(".choice-btn")].forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");
    });
    optionsWrap.appendChild(btn);
  });

  return card;
}

function setMode(mode) {
  currentMode = mode;
  questionGrid.innerHTML = "";
  const questions = mode === "base" ? baseQuestions : sessionQuestions;
  questions.forEach((q) => questionGrid.appendChild(renderQuestionCard(q)));

  if (mode === "base") {
    sectionTitle.textContent = "Build your style profile";
    sectionHint.textContent =
      "Save your base attributes once. Next logins only ask Occasion + Season.";
    submitBtn.textContent = "Save profile";
  } else {
    sectionTitle.textContent = "Today's styling session";
    sectionHint.textContent = "Pick occasion and season to get recommendations.";
    submitBtn.textContent = "Get my outfit";
  }
}

function ensureAuthenticated(data) {
  if (!data.authenticated) {
    window.location.href = "auth.html";
    return false;
  }
  return true;
}

async function initPage() {
  const me = await fetch("/api/auth/me").then((r) => r.json());
  if (!ensureAuthenticated(me)) return;

  const prefRes = await fetch("/api/preferences");
  const prefData = await prefRes.json();

  if (!prefData.preferences) {
    setMode("base");
  } else {
    setMode("session");
  }
}

questionnaireForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const required = currentMode === "base" ? baseQuestions : sessionQuestions;
  const missing = required.find((q) => !state[q.key]);
  if (missing) {
    alert(`Please choose: ${missing.label}`);
    return;
  }

  if (currentMode === "base") {
    const payload = {
      gender: state.gender,
      bodyType: state.bodyType,
      skinTone: state.skinTone,
      height: state.height,
      stylePreference: state.stylePreference,
    };
    const res = await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Unable to save profile.");
      return;
    }
    alert("Profile saved. Now select today's occasion and season.");
    Object.keys(state).forEach((k) => delete state[k]);
    setMode("session");
    return;
  }

  const resultRes = await fetch("/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ occasion: state.occasion, season: state.season }),
  });
  const resultData = await resultRes.json();
  if (!resultRes.ok) {
    alert(resultData.error || "Unable to generate recommendation.");
    return;
  }

  sessionStorage.setItem("latestRecommendation", JSON.stringify(resultData.recommendation));
  window.location.href = "recommendation.html";
});

logoutBtn.addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "auth.html";
});

initPage();

