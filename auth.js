const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");

function showMessage(text, isError = false) {
  authMessage.textContent = text;
  authMessage.style.color = isError ? "#ffd7d7" : "#ffdb0a";
}

function toggleAuth(mode) {
  const loginMode = mode === "login";
  loginForm.classList.toggle("hidden", !loginMode);
  registerForm.classList.toggle("hidden", loginMode);
  tabLogin.classList.toggle("active", loginMode);
  tabRegister.classList.toggle("active", !loginMode);
  showMessage("");
}

tabLogin.addEventListener("click", () => toggleAuth("login"));
tabRegister.addEventListener("click", () => toggleAuth("register"));

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (!res.ok) return showMessage(data.error || "Login failed", true);
  showMessage("Login successful. Redirecting...");
  window.location.href = "questionnaire.html";
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();

  if (!res.ok) return showMessage(data.error || "Registration failed", true);
  showMessage("Account created. Redirecting...");
  window.location.href = "questionnaire.html";
});

