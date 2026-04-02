(() => {
  const DEFAULT_REPO = "Yuan-lab-LLM/ClawManager";
  const DEFAULT_META = {
    repo: DEFAULT_REPO,
    releaseTag: "v2026.4.2",
    releaseUrl: "https://github.com/Yuan-lab-LLM/ClawManager/releases/tag/v2026.4.2",
    releaseLatestUrl: "https://github.com/Yuan-lab-LLM/ClawManager/releases/latest",
    stars: 419,
    forks: 65,
  };

  let githubMeta = DEFAULT_META;

  function detectBasePath() {
    try {
      const currentScript = document.currentScript;
      if (!currentScript?.src) {
        throw new Error("missing current script");
      }

      const scriptUrl = new URL(currentScript.src, window.location.href);
      const assetIndex = scriptUrl.pathname.lastIndexOf("/assets/");
      if (assetIndex >= 0) {
        return scriptUrl.pathname.slice(0, assetIndex);
      }
    } catch {
      // Fall through to pathname-based detection.
    }

    return window.location.pathname.startsWith("/ClawManager/") ? "/ClawManager" : "";
  }

  const BASE_PATH = detectBasePath();
  const META_PATH = `${BASE_PATH}/assets/github-meta.json`;

  function repoPage(repo, path = "") {
    return `https://github.com/${repo}${path}`;
  }

  function latestReleasePage(repo) {
    return repoPage(repo, "/releases/latest");
  }

  function parseRepoFromHref(href) {
    if (!href) return DEFAULT_REPO;

    try {
      const url = new URL(href, window.location.href);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`;
      }
    } catch {
      // Use the default repo below.
    }

    return DEFAULT_REPO;
  }

  function normalizeMeta(meta) {
    const repo =
      typeof meta?.repo === "string" && meta.repo.includes("/")
        ? meta.repo
        : DEFAULT_META.repo;

    const releaseTag =
      typeof meta?.releaseTag === "string" && meta.releaseTag.trim()
        ? meta.releaseTag.trim()
        : DEFAULT_META.releaseTag;

    const releaseUrl =
      typeof meta?.releaseUrl === "string" && meta.releaseUrl.startsWith("https://")
        ? meta.releaseUrl
        : DEFAULT_META.releaseUrl;

    const releaseLatestUrl =
      typeof meta?.releaseLatestUrl === "string" && meta.releaseLatestUrl.startsWith("https://")
        ? meta.releaseLatestUrl
        : latestReleasePage(repo);

    const stars = Number.isFinite(meta?.stars) ? meta.stars : DEFAULT_META.stars;
    const forks = Number.isFinite(meta?.forks) ? meta.forks : DEFAULT_META.forks;

    return {
      repo,
      releaseTag,
      releaseUrl,
      releaseLatestUrl,
      stars,
      forks,
    };
  }

  function formatBadgeText(currentText, tag) {
    if (!currentText) {
      return `${tag} Released - See what's new`;
    }

    if (/^[vV]?[0-9][^ ]*/.test(currentText)) {
      return currentText.replace(/^[vV]?[0-9][^ ]*/, tag);
    }

    if (/^latest release/i.test(currentText)) {
      return currentText.replace(/^latest release/i, tag);
    }

    return `${tag} Released - See what's new`;
  }

  function formatCount(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return "—";
    }

    return new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: value >= 10000 ? 0 : 1,
    }).format(value);
  }

  function findBadge() {
    return document.querySelector('a[href*="github.com/"][href*="/releases"]');
  }

  function findHeaderGitHubButton() {
    return (
      document.querySelector(`a[href="${repoPage(DEFAULT_REPO)}"]`) ||
      document.querySelector('a[href^="https://github.com/"]:not([href*="/releases"])')
    );
  }

  function getBadgeTextNode(badge) {
    return Array.from(badge.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
    );
  }

  function createStatIcon(kind) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.dataset.statIcon = kind;
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "15");
    svg.setAttribute("height", "15");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.style.flexShrink = "0";

    const shapesByKind = {
      stars: [
        ["polygon", "12 2 15.1 8.3 22 9.3 17 14.2 18.2 21 12 17.7 5.8 21 7 14.2 2 9.3 8.9 8.3"],
      ],
      forks: [
        ["circle", "6 5 3"],
        ["circle", "18 19 3"],
        ["circle", "18 5 3"],
        ["path", "M9 5h6"],
        ["path", "M12 5v9"],
        ["path", "M12 14l6 2"],
      ],
    };

    for (const [tagName, value] of shapesByKind[kind] || []) {
      const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);

      if (tagName === "path") {
        element.setAttribute("d", value);
      } else if (tagName === "polygon") {
        element.setAttribute("points", value);
      } else if (tagName === "circle") {
        const [cx, cy, r] = value.split(" ");
        element.setAttribute("cx", cx);
        element.setAttribute("cy", cy);
        element.setAttribute("r", r);
      }

      svg.appendChild(element);
    }

    return svg;
  }

  function applyLatestRelease() {
    const badge = findBadge();
    if (!badge) return;

    const repo = parseRepoFromHref(badge.href);
    const nextHref = githubMeta.releaseLatestUrl || latestReleasePage(repo);
    const nextHrefAbsolute = new URL(nextHref, window.location.href).href;

    if (badge.href !== nextHrefAbsolute) {
      badge.href = nextHrefAbsolute;
    }

    const textNode = getBadgeTextNode(badge);
    if (!textNode) return;

    const nextText = ` ${formatBadgeText(textNode.textContent.trim(), githubMeta.releaseTag)} `;
    if (textNode.textContent !== nextText) {
      textNode.textContent = nextText;
    }
  }

  function upsertRepoStatLink({ parent, before, githubButton, key, href, label, value }) {
    let link = parent.querySelector(`[data-github-stat="${key}"]`);
    if (!link) {
      link = githubButton.cloneNode(false);
      link.dataset.githubStat = key;
    }

    const ariaText = `GitHub ${label.toLowerCase()} ${value}`;

    if (link.className !== githubButton.className) {
      link.className = githubButton.className;
    }

    const hrefAbsolute = new URL(href, window.location.href).href;
    if (link.href !== hrefAbsolute) {
      link.href = hrefAbsolute;
    }

    if (link.target !== "_blank") {
      link.target = "_blank";
    }

    if (link.rel !== "noopener noreferrer") {
      link.rel = "noopener noreferrer";
    }

    if (link.getAttribute("aria-label") !== ariaText) {
      link.setAttribute("aria-label", ariaText);
    }

    if (link.title !== ariaText) {
      link.title = ariaText;
    }

    if (link.style.whiteSpace !== "nowrap") {
      link.style.whiteSpace = "nowrap";
    }

    if (link.dataset.renderedStat !== `${key}:${value}`) {
      const icon = createStatIcon(key);
      const count = document.createElement("span");
      count.dataset.statCount = "true";
      count.textContent = value;
      link.replaceChildren(icon, count);
      link.dataset.renderedStat = `${key}:${value}`;
    }

    if (link.parentElement !== parent || link.nextElementSibling !== before) {
      parent.insertBefore(link, before);
    }
  }

  function applyRepoStats() {
    const githubButton = findHeaderGitHubButton();
    if (!githubButton?.parentElement) return;

    const repo = parseRepoFromHref(githubButton.href);
    const parent = githubButton.parentElement;
    const getStartedButton = parent.querySelector('a[href="#quickstart"]');
    const forkLink = parent.querySelector('[data-github-stat="forks"]');

    upsertRepoStatLink({
      parent,
      before: forkLink || getStartedButton,
      githubButton,
      key: "stars",
      href: repoPage(repo, "/stargazers"),
      label: "Stars",
      value: formatCount(githubMeta.stars),
    });

    upsertRepoStatLink({
      parent,
      before: getStartedButton,
      githubButton,
      key: "forks",
      href: repoPage(repo, "/network/members"),
      label: "Forks",
      value: formatCount(githubMeta.forks),
    });
  }

  async function loadGitHubMeta() {
    try {
      const response = await fetch(META_PATH, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load metadata: ${response.status}`);
      }

      githubMeta = normalizeMeta(await response.json());
    } catch {
      githubMeta = DEFAULT_META;
    }

    applyLatestRelease();
    applyRepoStats();
  }

  function start() {
    applyLatestRelease();
    applyRepoStats();
    loadGitHubMeta();

    const observer = new MutationObserver(() => {
      applyLatestRelease();
      applyRepoStats();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
