let timeoutId = null;
let absoluteTimeoutId = null;
let visibilityListener = null;
let warningTimeoutId = null;
let countdownInterval = null;
let eventsBound = false;

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const ABSOLUTE_SESSION_TIMEOUT = 12 * 60 * 60 * 1000;
const WARNING_BEFORE_LOGOUT = 60 * 1000;

const logoutAndRedirect = async (reason = "Session expired due to inactivity") => {
  if (typeof window === "undefined") return;
  clearAllTimers();
  localStorage.removeItem("lastActivity");
  const { createClient } = await import("./supabase/client");
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = `/login?message=${encodeURIComponent(reason)}`;
};

const clearAllTimers = () => {
  if (timeoutId) clearTimeout(timeoutId);
  if (absoluteTimeoutId) clearTimeout(absoluteTimeoutId);
  if (warningTimeoutId) clearTimeout(warningTimeoutId);
  if (countdownInterval) clearInterval(countdownInterval);
  if (visibilityListener) {
    document.removeEventListener("visibilitychange", visibilityListener);
    visibilityListener = null;
  }
};

const resetInactivityTimer = () => {
  if (timeoutId) clearTimeout(timeoutId);
  if (warningTimeoutId) clearTimeout(warningTimeoutId);
  if (countdownInterval) clearInterval(countdownInterval);

  document.body.classList.remove("show-inactivity-modal");
  document.getElementById("countdown")?.removeAttribute("data-seconds");

  timeoutId = setTimeout(() => {
    showWarningModal();
  }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);

  warningTimeoutId = setTimeout(() => {
    logoutAndRedirect("Session expired due to inactivity");
  }, INACTIVITY_TIMEOUT);
};

const showWarningModal = () => {
  document.body.classList.add("show-inactivity-modal");
  let seconds = 60;
  const el = document.getElementById("countdown");
  if (el) el.setAttribute("data-seconds", seconds.toString());

  countdownInterval = setInterval(() => {
    seconds--;
    if (el) el.setAttribute("data-seconds", seconds.toString());
    if (seconds <= 0) {
      clearInterval(countdownInterval);
      logoutAndRedirect("Session expired due to inactivity");
    }
  }, 1000);
};

const startAbsoluteTimer = () => {
  if (absoluteTimeoutId) clearTimeout(absoluteTimeoutId);
  absoluteTimeoutId = setTimeout(() => logoutAndRedirect("Session expired (12-hour limit reached)"), ABSOLUTE_SESSION_TIMEOUT);
};

const activityEvents = ["mousemove", "keydown", "scroll", "touchstart", "click"];

export const startAuthTimeout = () => {
  if (typeof window === "undefined" || eventsBound) return;

  localStorage.setItem("lastActivity", Date.now().toString());

  const handler = () => {
    localStorage.setItem("lastActivity", Date.now().toString());
    resetInactivityTimer();
  };

  activityEvents.forEach(event => window.addEventListener(event, handler, { passive: true }));

  visibilityListener = () => {
    if (document.visibilityState === "visible") {
      const last = localStorage.getItem("lastActivity");
      if (last) {
        const elapsed = Date.now() - parseInt(last);
        if (elapsed > INACTIVITY_TIMEOUT) {
          logoutAndRedirect("Session expired while tab was inactive");
        } else {
          resetInactivityTimer();
        }
      }
    }
  };

  document.addEventListener("visibilitychange", visibilityListener);
  eventsBound = true;

  resetInactivityTimer();
  startAbsoluteTimer();

  document.getElementById("stay-logged-in-btn")?.addEventListener("click", () => {
    document.body.classList.remove("show-inactivity-modal");
    resetInactivityTimer();
  });
};

export const checkExistingTimeout = () => {
  if (typeof window === "undefined") return;
  const last = localStorage.getItem("lastActivity");
  if (!last) return;
  const elapsed = Date.now() - parseInt(last);
  if (elapsed > INACTIVITY_TIMEOUT) {
    logoutAndRedirect("Session expired (inactive for too long)");
  } else {
    resetInactivityTimer();
    startAbsoluteTimer();
  }
};