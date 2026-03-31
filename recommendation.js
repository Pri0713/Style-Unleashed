const heroImage = document.getElementById("heroImage");
const resultGrid = document.getElementById("resultGrid");
const newSessionBtn = document.getElementById("newSessionBtn");
const historyBtn = document.getElementById("historyBtn");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");

function makeListCard(title, items) {
  const card = document.createElement("article");
  card.className = "result-card";
  const safeItems = items && items.length ? items : ["No suggestions available."];
  card.innerHTML = `<h3>${title}</h3><ul>${safeItems
    .map((i) => `<li>${i}</li>`)
    .join("")}</ul>`;
  return card;
}

function renderRecommendation(rec) {
  heroImage.src = rec.heroImage;
  resultGrid.innerHTML = "";
  resultGrid.appendChild(makeListCard("Outfit Recommendation", rec.outfitRecommendation));
  resultGrid.appendChild(makeListCard("Accessories Suggestions", rec.accessorySuggestions));
  resultGrid.appendChild(
    makeListCard("Recommended Color Palette", rec.recommendedColorPalette)
  );
  resultGrid.appendChild(makeListCard("Suitable Fabric Types", rec.suitableFabrics));
  resultGrid.appendChild(makeListCard("Styling Tips", rec.stylingTips));
}

async function loadHistory() {
  const res = await fetch("/api/recommendations/history");
  const data = await res.json();
  if (!res.ok) {
    alert(data.error || "Unable to load history.");
    return;
  }
  historyList.innerHTML = "";
  data.history.forEach((h) => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `<strong>${h.occasion} / ${h.season}</strong> - ${new Date(
      h.createdAt
    ).toLocaleString()}`;
    historyList.appendChild(item);
  });
  historySection.classList.remove("hidden");
}

newSessionBtn.addEventListener("click", () => {
  window.location.href = "questionnaire.html";
});

historyBtn.addEventListener("click", loadHistory);

(async function init() {
  const me = await fetch("/api/auth/me").then((r) => r.json());
  if (!me.authenticated) {
    window.location.href = "auth.html";
    return;
  }

  const rec = sessionStorage.getItem("latestRecommendation");
  if (!rec) {
    window.location.href = "questionnaire.html";
    return;
  }

  renderRecommendation(JSON.parse(rec));
})();

