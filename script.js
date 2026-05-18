const GITHUB_USERNAME = "monaghanhc";
const REPO_PAGE_SIZE = 100;
const REPO_SITE_OVERRIDES = {
  FixLocal_Website: "https://monaghanhc.github.io/FixLocal_Website/",
  "react.js": "https://monaghanhc.github.io/react.js/",
  spaceshipGame: "https://monaghanhc.github.io/spaceshipGame/",
  "Skyhook-Runner": "https://monaghanhc.github.io/Skyhook-Runner/",
  "Websocket-Game": "https://amendment-stress-forms-both.trycloudflare.com",
  "Video-Chat": "https://monaghanhc.github.io/Video-Chat/"
};
const REPO_DOWNLOAD_OVERRIDES = {
  "Video-Chat": "https://github.com/monaghanhc/Video-Chat/releases/latest"
};
const REPO_DESCRIPTION_OVERRIDES = {
  "Video-Chat": "Realtime video chat app with an installable web experience and Windows desktop release."
};

const repoGrid = document.getElementById("repo-grid");
const repoStatus = document.getElementById("repo-status");
const repoSearch = document.getElementById("repo-search");
const repoLanguage = document.getElementById("repo-language");
const repoSort = document.getElementById("repo-sort");
const repoCountStat = document.getElementById("repo-count-stat");
const starCountStat = document.getElementById("star-count-stat");
const latestUpdateStat = document.getElementById("latest-update-stat");

const state = {
  repos: []
};

const hasRequiredElements = repoGrid && repoStatus && repoSearch && repoLanguage && repoSort;

function formatDate(dateInput) {
  if (!dateInput) {
    return "Unknown";
  }

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function createMetaItem(iconClass, labelText) {
  const item = document.createElement("li");
  const icon = document.createElement("i");
  const label = document.createElement("span");

  icon.className = iconClass;
  icon.setAttribute("aria-hidden", "true");
  label.textContent = labelText;

  item.append(icon, label);
  return item;
}

function getRepoWebsiteUrl(repo) {
  return REPO_SITE_OVERRIDES[repo.name] || repo.homepage || "";
}

function getRepoDownloadUrl(repo) {
  return REPO_DOWNLOAD_OVERRIDES[repo.name] || "";
}

function getRepoDescription(repo) {
  return REPO_DESCRIPTION_OVERRIDES[repo.name] || repo.description || "No description provided.";
}

function setStatus(message, isError = false) {
  if (!hasRequiredElements) {
    return;
  }

  repoStatus.textContent = message;
  repoStatus.classList.toggle("error", isError);
}

function updateSnapshotStats(repos) {
  if (repoCountStat) {
    repoCountStat.textContent = `${repos.length}`;
  }

  if (starCountStat) {
    const totalStars = repos.reduce((total, repo) => total + (repo.stargazers_count || 0), 0);
    starCountStat.textContent = `${totalStars}`;
  }

  if (latestUpdateStat) {
    const newestRepo = [...repos].sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
    latestUpdateStat.textContent = newestRepo ? formatDate(newestRepo.updated_at) : "--";
  }
}

function populateLanguageFilter(repos) {
  if (!hasRequiredElements) {
    return;
  }

  const languages = new Set();
  repos.forEach((repo) => {
    languages.add(repo.language || "Unknown");
  });

  const languageList = Array.from(languages).sort((a, b) => a.localeCompare(b));
  repoLanguage.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All languages";
  repoLanguage.append(allOption);

  languageList.forEach((language) => {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = language;
    repoLanguage.append(option);
  });
}

function getFilteredRepos() {
  if (!hasRequiredElements) {
    return [];
  }

  const selectedLanguage = repoLanguage.value;
  const sortBy = repoSort.value;
  const query = repoSearch.value.trim().toLowerCase();

  const filtered = state.repos.filter((repo) => {
    const language = repo.language || "Unknown";
    const matchesLanguage = selectedLanguage === "all" || language === selectedLanguage;

    if (!matchesLanguage) {
      return false;
    }

    if (!query) {
      return true;
    }

    const searchSource = `${repo.name} ${repo.description || ""}`.toLowerCase();
    return searchSource.includes(query);
  });

  return filtered.sort((a, b) => {
    if (sortBy === "stars") {
      return b.stargazers_count - a.stargazers_count || b.updated_at.localeCompare(a.updated_at);
    }

    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }

    return b.updated_at.localeCompare(a.updated_at);
  });
}

function renderRepos() {
  if (!hasRequiredElements) {
    return;
  }

  const repos = getFilteredRepos();
  repoGrid.innerHTML = "";

  if (repos.length === 0) {
    repoGrid.hidden = true;
    setStatus("No repositories match the current filters.");
    return;
  }

  setStatus(`Showing ${repos.length} ${repos.length === 1 ? "repository" : "repositories"}.`);
  repoGrid.hidden = false;

  repos.forEach((repo) => {
    const card = document.createElement("article");
    card.className = "repo-card";

    const header = document.createElement("div");
    header.className = "repo-header";

    const title = document.createElement("h3");
    title.className = "repo-title";

    const titleLink = document.createElement("a");
    titleLink.href = repo.html_url;
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    titleLink.textContent = repo.name;

    title.append(titleLink);
    header.append(title);

    if (repo.fork) {
      const forkBadge = document.createElement("span");
      forkBadge.className = "repo-badge";
      forkBadge.textContent = "Fork";
      header.append(forkBadge);
    }

    const description = document.createElement("p");
    description.className = "repo-description";
    description.textContent = getRepoDescription(repo);

    const meta = document.createElement("ul");
    meta.className = "repo-meta";
    meta.append(
      createMetaItem("fas fa-code", repo.language || "Unknown"),
      createMetaItem("fas fa-star", `${repo.stargazers_count}`),
      createMetaItem("fas fa-code-branch", `${repo.forks_count}`),
      createMetaItem("fas fa-clock", formatDate(repo.updated_at))
    );

    const links = document.createElement("div");
    links.className = "repo-links";

    const codeLink = document.createElement("a");
    codeLink.href = repo.html_url;
    codeLink.target = "_blank";
    codeLink.rel = "noopener noreferrer";
    const codeIcon = document.createElement("i");
    codeIcon.className = "fab fa-github";
    codeIcon.setAttribute("aria-hidden", "true");
    codeLink.append(codeIcon, " Code");
    links.append(codeLink);

    const websiteUrl = getRepoWebsiteUrl(repo);
    if (websiteUrl) {
      const websiteLink = document.createElement("a");
      websiteLink.href = websiteUrl;
      websiteLink.target = "_blank";
      websiteLink.rel = "noopener noreferrer";
      const websiteIcon = document.createElement("i");
      websiteIcon.className = "fas fa-arrow-up-right-from-square";
      websiteIcon.setAttribute("aria-hidden", "true");
      websiteLink.append(websiteIcon, " Website");
      links.append(websiteLink);
    }

    const downloadUrl = getRepoDownloadUrl(repo);
    if (downloadUrl) {
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.target = "_blank";
      downloadLink.rel = "noopener noreferrer";
      const downloadIcon = document.createElement("i");
      downloadIcon.className = "fas fa-download";
      downloadIcon.setAttribute("aria-hidden", "true");
      downloadLink.append(downloadIcon, " Download");
      links.append(downloadLink);
    }

    card.append(header, description, meta, links);
    repoGrid.append(card);
  });
}

async function fetchAllRepos(username) {
  const allRepos = [];
  let page = 1;

  while (true) {
    const endpoint = `https://api.github.com/users/${username}/repos?per_page=${REPO_PAGE_SIZE}&page=${page}&sort=updated`;
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/vnd.github+json"
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("GitHub API rate limit reached. Please refresh in a few minutes.");
      }

      throw new Error(`Unable to load repositories (HTTP ${response.status}).`);
    }

    const repos = await response.json();
    allRepos.push(...repos);

    if (repos.length < REPO_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return allRepos;
}

async function initializeRepositorySection() {
  if (!hasRequiredElements) {
    return;
  }

  setStatus("Loading repositories from GitHub...");

  try {
    const repos = await fetchAllRepos(GITHUB_USERNAME);
    state.repos = repos;
    updateSnapshotStats(repos);

    if (repos.length === 0) {
      repoGrid.hidden = true;
      setStatus("No public repositories were found.");
      return;
    }

    populateLanguageFilter(repos);
    renderRepos();
  } catch (error) {
    repoGrid.hidden = true;
    setStatus(error.message || "Unable to load repositories right now.", true);
  }
}

if (hasRequiredElements) {
  [repoSearch, repoLanguage, repoSort].forEach((control) => {
    control.addEventListener("input", renderRepos);
    control.addEventListener("change", renderRepos);
  });

  initializeRepositorySection();
}
