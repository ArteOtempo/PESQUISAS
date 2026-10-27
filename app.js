const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let seasonData = null;
let activeTab = "drivers";
let selectedRaceId = null;

async function loadData() {
  try {
    const response = await fetch("data/standings.json");
    if (!response.ok) throw new Error("Não foi possível carregar data/standings.json");
    seasonData = await response.json();
    renderRaces();
    renderStandings();
    renderFeature(seasonData.races[0]);
    $("#updated-at").textContent = seasonData.updatedAt || "não informado";
  } catch (error) {
    console.error(error);
    $("#race-list").innerHTML = '<p class="empty-state">Não foi possível carregar o JSON. Abra a pasta com um servidor local (por exemplo, Live Server).</p>';
    $("#standings-body").innerHTML = '<tr><td colspan="4">Erro ao carregar a classificação.</td></tr>';
  }
}

function renderRaces() {
  const filter = $("#race-filter").value;
  const races = seasonData.races.filter(race => {
    if (filter === "completed") return Boolean(race.winner);
    if (filter === "upcoming") return !race.winner;
    return true;
  });
  $("#race-count").textContent = `${races.length.toString().padStart(2,"0")} ETAPAS`;
  $("#race-list").innerHTML = races.map((race) => `
    <article class="race-row ${race.winner ? "" : "upcoming"} ${race.id === selectedRaceId ? "selected" : ""}" data-race="${race.id}" tabindex="0" role="button" aria-label="Ver ${race.grandPrix}">
      <span class="race-round">${String(race.round).padStart(2,"0")}</span>
      <div class="race-name"><strong>${escapeHtml(race.grandPrix)}</strong><small>${escapeHtml(race.location)}</small></div>
      <div class="race-winner"><strong>${race.winner ? escapeHtml(race.winner) : "A definir"}</strong><small>${race.winner ? escapeHtml(race.team || "") : "Resultado pendente"}</small></div>
      <span class="race-status">${race.winner ? "Finalizada" : "Próxima"}</span><span class="race-arrow">↗</span>
    </article>`).join("");
  $$(".race-row").forEach(row => {
    const open = () => {
      selectedRaceId = Number(row.dataset.race);
      const race = seasonData.races.find(item => item.id === selectedRaceId);
      renderRaces(); renderFeature(race);
      $("#corrida-destaque").scrollIntoView({behavior:"smooth", block:"start"});
    };
    row.addEventListener("click", open);
    row.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
  });
}
function renderFeature(race) {
  if (!race) return;
  $("#feature-round").textContent = `ROUND ${String(race.round).padStart(2,"0")}`;
  $("#feature-country").textContent = race.country.toUpperCase();
  $("#feature-race-name").innerHTML = escapeHtml(race.shortName || race.grandPrix).replace(/ /g, "<br>");
  $("#feature-date").textContent = `${race.location.toUpperCase()} · ${race.dateLabel}`;
  $("#feature-laps").textContent = race.laps ? `${race.laps} VOLTAS` : "VOLTAS —";
  $("#feature-length").textContent = race.circuitLength ? `${race.circuitLength} KM` : "EXTENSÃO —";
  $("#feature-winner").textContent = race.winner || "A definir";
  $("#feature-team").textContent = race.team || "—";
  $("#feature-result").textContent = race.result || "Resultado pendente";
  $("#feature-note").textContent = race.story || "Adicione aqui o momento decisivo da corrida e o que ele representou para o campeonato.";
  const circuitPlaceholder = $('[data-image="mapa-circuito"] code');
  if (circuitPlaceholder) circuitPlaceholder.textContent = race.circuitImage || "assets/images/circuito.svg";
  const winnerPlaceholder = $('[data-image="foto-vencedor"] code');
  if (winnerPlaceholder) winnerPlaceholder.textContent = race.winnerImage || "assets/images/vencedor.png";
}
function renderStandings() {
  const items = activeTab === "drivers" ? seasonData.drivers : seasonData.teams;
  $("#standings-head").innerHTML = activeTab === "drivers"
    ? "<tr><th>POS.</th><th>PILOTO</th><th>EQUIPE</th><th>VITÓRIAS</th><th>PONTOS</th></tr>"
    : "<tr><th>POS.</th><th>EQUIPE</th><th>PILOTOS</th><th>VITÓRIAS</th><th>PONTOS</th></tr>";
  $("#standings-body").innerHTML = items.map((item, index) => `
    <tr>
      <td class="position">${String(item.position || index + 1).padStart(2,"0")}</td>
      <td><div class="competitor"><span class="team-stripe" style="--team-color:${safeColor(item.color)}"></span><span>${escapeHtml(activeTab === "drivers" ? item.name : item.team || item.name)}${activeTab === "drivers" && item.country ? `<small class="subtext">${escapeHtml(item.country)}</small>` : ""}</span></div></td>
      <td>${escapeHtml(activeTab === "drivers" ? item.team : (item.drivers || []).join(" / "))}</td>
      <td>${Number(item.wins || 0)}</td><td class="points">${Number(item.points || 0)}</td>
    </tr>`).join("");
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function safeColor(value) { return /^#[0-9a-f]{3,8}$/i.test(value || "") ? value : "#e10600"; }

$("#race-filter").addEventListener("change", renderRaces);
$$(".tab").forEach(tab => tab.addEventListener("click", () => {
  activeTab = tab.dataset.tab;
  $$(".tab").forEach(item => { item.classList.toggle("active", item === tab); item.setAttribute("aria-selected", item === tab ? "true" : "false"); });
  renderStandings();
}));

const factCards = $$(".fact-card");


const driverSequence = document.querySelector("#driver-sequence");
const totalFrames = 6;
let currentFrame = 0;
const driverFrames = [];

for (let i = 1; i <= totalFrames; i++) {
  const img = new Image();
  img.src = `assets/images/piloto/frame-${String(i).padStart(3, "0")}.png`;
  driverFrames.push(img);
}

function updateDriverSequence() {
  if (!driverSequence) return;

  const section = document.querySelector("#piloto");
  if (!section) return;

  const rect = section.getBoundingClientRect();
  const distance = section.offsetHeight - window.innerHeight;

  if (distance <= 0) return;

  const progress = Math.max(0, Math.min(1, -rect.top / distance));
  const frame = Math.min(
    totalFrames,
    Math.floor(progress * totalFrames) + 1
  );

  if (frame !== currentFrame) {
    currentFrame = frame;

    const image = driverFrames[frame - 1];

    if (image.complete && image.naturalWidth > 0) {
      driverSequence.src = image.src;
    } else {
      image.onload = () => {
        if (currentFrame === frame) {
          driverSequence.src = image.src;
        }
      };
    }
  }
}

window.addEventListener("scroll", updateDriverSequence, {
  passive: true
});

updateDriverSequence();

if ("IntersectionObserver" in window) {
  const factObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        factCards.forEach(card => card.classList.toggle("active", card === entry.target));
        $("#fact-current").textContent = String(Number(entry.target.dataset.fact) + 1).padStart(2,"0");
        const portrait = $("#driver-portrait");
        portrait.style.transform = `translateY(${(Number(entry.target.dataset.fact) - 1) * -5}px) rotate(${(Number(entry.target.dataset.fact) - 1) * 1.5}deg)`;
      }
    });
  }, {threshold:0.55});
  factCards.forEach(card => factObserver.observe(card));
}
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  $("#reading-progress").style.width = `${max > 0 ? window.scrollY / max * 100 : 0}%`;
}, {passive:true});
loadData();

