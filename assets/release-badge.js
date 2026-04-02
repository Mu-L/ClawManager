(() => {
  const DEFAULT_REPO = "Yuan-lab-LLM/ClawManager";
  const CACHE_PREFIX = "clawmanager-release-badge";
  const CACHE_TTL_MS = 30 * 60 * 1000;
  let latestRelease = null;
  let repoStats = null;
  let repoStatsRequest = null;

  function parseRepoFromHref(href) {
    if (!href) return DEFAULT_REPO;

    try {
      const url = new URL(href);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`;
      }

      return DEFAULT_REPO;
    } catch {
      return DEFAULT_REPO;
    }
  }

  function repoPage(repo, path = "") {
    return `https://github.com/${repo}${path}`;
  }

  function latestReleasePage(repo) {
    return repoPage(repo, "/releases/latest");
  }

  function latestReleaseApi(repo) {
    return `https://api.github.com/repos/${repo}/releases/latest`;
  }

  function repoApi(repo) {
    return `https://api.github.com/repos/${repo}`;
  }

  function cacheKey(repo, kind) {
    return `${CACHE_PREFIX}:${kind}:${repo}`;
  }

  function readCache(repo, kind) {
    try {
      const raw = localStorage.getItem(cacheKey(repo, kind));
      if (!raw) return null;

      const cached = JSON.parse(raw);
      if (!cached?.fetchedAt) return null;
      if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null;

      return cached;
    } catch {
      return null;
    }
  }

  function writeCache(repo, kind, value) {
    try {
      localStorage.setItem(
        cacheKey(repo, kind),
        JSON.stringify({ ...value, fetchedAt: Date.now() }),
      );
    } catch {
      // Ignore storage failures.
    }
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

  function formatCount(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return null;
    }

    return new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: value >= 10000 ? 0 : 1,
    }).format(value);
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

    const pathsByKind = {
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

    for (const [tagName, value] of pathsByKind[kind] || []) {
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
    const fallbackHref = latestReleasePage(repo);
    const textNode = getBadgeTextNode(badge);

    badge.href = latestRelease?.href || fallbackHref;

    if (!textNode) return;

    const currentText = textNode.textContent.trim();
    if (!latestRelease?.tag) return;

    textNode.textContent = ` ${formatBadgeText(currentText, latestRelease.tag)} `;
  }

  async function loadLatestRelease() {
    const badge = findBadge();
    const repo = parseRepoFromHref(badge?.href);
    const cached = readCache(repo, "release");

    if (cached) {
      latestRelease = cached;
      applyLatestRelease();
    }

    try {
      const response = await fetch(latestReleaseApi(repo), {
        headers: {
          Accept: "application/vnd.github+json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load release: ${response.status}`);
      }

      const release = await response.json();
      if (!release?.tag_name) return;

      latestRelease = {
        tag: release.tag_name,
        href: release.html_url || latestReleasePage(repo),
      };

      writeCache(repo, "release", latestRelease);
      applyLatestRelease();
    } catch {
      applyLatestRelease();
    }
  }

  function upsertRepoStatLink({ parent, before, githubButton, key, href, label, value }) {
    let link = parent.querySelector(`[data-github-stat="${key}"]`);
    if (!link) {
      link = githubButton.cloneNode(false);
      link.dataset.githubStat = key;
    }

    const valueText = value || "—";
    const ariaText = value ? `GitHub ${label.toLowerCase()} ${value}` : `GitHub ${label.toLowerCase()}`;

    if (link.className !== githubButton.className) {
      link.className = githubButton.className;
    }

    if (link.href !== href) {
      link.href = href;
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

    if (link.dataset.renderedStat !== `${key}:${valueText}`) {
      const icon = createStatIcon(key);
      const count = document.createElement("span");
      count.dataset.statCount = "true";
      count.textContent = valueText;
      link.replaceChildren(icon, count);
      link.dataset.renderedStat = `${key}:${valueText}`;
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
      value: formatCount(repoStats?.stars),
    });

    upsertRepoStatLink({
      parent,
      before: getStartedButton,
      githubButton,
      key: "forks",
      href: repoPage(repo, "/network/members"),
      label: "Forks",
      value: formatCount(repoStats?.forks),
    });
  }

  async function loadRepoStats() {
    const githubButton = findHeaderGitHubButton();
    const repo = parseRepoFromHref(githubButton?.href);
    const cached = readCache(repo, "repo");

    if (cached?.stars != null && cached?.forks != null) {
      repoStats = cached;
      applyRepoStats();
    }

    if (repoStatsRequest) {
      return repoStatsRequest;
    }

    repoStatsRequest = (async () => {
      try {
        const response = await fetch(repoApi(repo), {
          headers: {
            Accept: "application/vnd.github+json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load repo stats: ${response.status}`);
        }

        const data = await response.json();
        repoStats = {
          stars: data.stargazers_count,
          forks: data.forks_count,
        };

        writeCache(repo, "repo", repoStats);
        applyRepoStats();
      } catch {
        applyRepoStats();
      } finally {
        repoStatsRequest = null;
      }
    })();

    return repoStatsRequest;
  }

  function start() {
    applyLatestRelease();
    applyRepoStats();
    loadLatestRelease();
    loadRepoStats();

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
