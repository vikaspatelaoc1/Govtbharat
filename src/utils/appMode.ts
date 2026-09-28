/**
 * Determines whether the user is opening the dedicated Mobile Application (PWA / Standalone App)
 * or opening the website in a standard public browser (Desktop or Mobile browser like Chrome, Safari, etc.).
 *
 * Rules:
 * 1. If explicit query parameter `?mode=app` is provided -> Mobile App View (e.g. from PWA start_url).
 * 2. If explicit query parameter `?mode=web` is provided -> Website Portal View.
 * 3. If running inside an installed standalone mobile application (display-mode: standalone or navigator.standalone) -> Mobile App View.
 * 4. For ANY normal browser session (mobile browser, desktop browser, external links, social referrals) -> FALSE (Website Portal View).
 */
export const checkIsApplicationMode = (): boolean => {
  if (typeof window === "undefined") return false;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");

    // 1. Explicit query parameter has highest priority
    if (mode === "app") return true;
    if (mode === "web") return false;

    // 2. Check if running inside installed standalone PWA / Mobile Application
    const isStandalone =
      (window.matchMedia("(display-mode: standalone)").matches && !window.matchMedia("(display-mode: browser)").matches) ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return true;
    }

    // 3. Clear any legacy forced localStorage key that accidentally trapped browser users
    try {
      if (localStorage.getItem("GovtBharat_app_view") === "app") {
        localStorage.removeItem("GovtBharat_app_view");
      }
    } catch {
      // Ignore storage errors
    }

    // 4. Default for all normal public browser visits is Website View (Hero banner, instant updates, filters, category columns)
    return false;
  } catch {
    return false;
  }
};
