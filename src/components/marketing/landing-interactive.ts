type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

const initLandingInteractions = () => {
  const navToggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const navLinks = document.querySelector<HTMLElement>("[data-nav-links]");

  navToggle?.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navLinks?.setAttribute("data-open", String(!isOpen));
  });

  navLinks?.addEventListener("click", () => {
    navToggle?.setAttribute("aria-expanded", "false");
    navLinks.setAttribute("data-open", "false");
  });

  const screenTabs = [...document.querySelectorAll<HTMLElement>("[data-screen-tab]")];
  const screenPanels = [...document.querySelectorAll<HTMLElement>("[data-screen-panel]")];

  screenTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const selected = tab.getAttribute("data-screen-tab");
      screenTabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute("aria-selected", String(active));
        item.setAttribute("tabindex", active ? "0" : "-1");
      });
      screenPanels.forEach((panel) => {
        panel.toggleAttribute("hidden", panel.getAttribute("data-screen-panel") !== selected);
      });
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-faq-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      const answer = document.getElementById(button.getAttribute("aria-controls") || "");
      button.setAttribute("aria-expanded", String(!expanded));
      answer?.toggleAttribute("hidden", expanded);
    });
  });

  const accessModal = document.querySelector<HTMLElement>("[data-access-modal]");
  let previousFocus: HTMLElement | null = null;

  const closeAccess = () => {
    accessModal?.setAttribute("hidden", "");
    previousFocus?.focus();
  };

  document.querySelectorAll<HTMLElement>("[data-access-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      previousFocus =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      accessModal?.removeAttribute("hidden");
      accessModal?.querySelector<HTMLElement>("[data-access-close]")?.focus();
    });
  });

  document.querySelectorAll<HTMLElement>("[data-access-close]").forEach((button) => {
    button.addEventListener("click", closeAccess);
  });

  accessModal?.addEventListener("click", (event) => {
    if (event.target === accessModal) {
      closeAccess();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && accessModal && !accessModal.hasAttribute("hidden")) {
      closeAccess();
    }
  });

  let installPrompt: BeforeInstallPromptEvent | null = null;
  const installButton = document.querySelector<HTMLButtonElement>("[data-install-button]");
  const installMessage = document.querySelector("[data-install-message]");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event as BeforeInstallPromptEvent;
    if (installButton) {
      installButton.hidden = false;
    }
    if (installMessage) {
      installMessage.textContent = "Vendara is ready to install on this device.";
    }
  });

  installButton?.addEventListener("click", async () => {
    if (!installPrompt) {
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      installButton.hidden = true;
      if (installMessage) {
        installMessage.textContent = "Vendara is being added to this device.";
      }
    }
    installPrompt = null;
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLandingInteractions, { once: true });
} else {
  initLandingInteractions();
}
