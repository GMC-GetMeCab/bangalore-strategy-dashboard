const format = new Intl.NumberFormat('en-IN');

function delta(current, prior, suffix = '%') {
  if (prior === null || prior === undefined || prior === 0) return 'comparison unavailable';
  const value = ((current - prior) / prior) * 100;
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}${suffix} vs prior`;
}

function shortPath(url) {
  try { return new URL(url, location.origin).pathname; } catch { return url; }
}

fetch('data/report.json')
  .then(response => response.json())
  .then(data => {
    document.getElementById('asOf').textContent = data.as_of_display;
    document.getElementById('verdict').textContent = data.verdict;
    const projects = data.initiative_projects;
    const milestones = projects.flatMap(project => project.milestones.map(milestone => ({...milestone, project: project.name})));
    const evidenceCount = milestones.reduce((total, milestone) => total + milestone.evidence.length, 0);
    document.getElementById('projectTotal').textContent = projects.length;
    document.getElementById('milestoneTotal').textContent = milestones.length;
    document.getElementById('evidenceTotal').textContent = evidenceCount;

    const dialog = document.getElementById('detailDialog');
    const dialogContent = document.getElementById('dialogContent');
    const statusClass = status => status.toLowerCase().replace(/[^a-z]+/g, '-');
    const evidenceLinks = evidence => evidence.map(item => `<a href="${item.url}">${item.label} ↗</a>`).join('');
    const openDetail = (project, milestone = null) => {
      const item = milestone || project;
      dialogContent.innerHTML = `<p class="kicker">${milestone ? project.name : 'Project'}</p><h2>${item.name}</h2>
        <dl><dt>What it is</dt><dd>${item.what}</dd><dt>Why we did it</dt><dd>${item.why}</dd><dt>What it enables</dt><dd>${item.enables}</dd><dt>Status</dt><dd>${item.status}${item.progress !== undefined ? ` · ${item.progress}%` : ''}</dd></dl>
        <div class="dialog-evidence"><h3>Issues, PRs and evidence</h3>${evidenceLinks(milestone ? milestone.evidence : project.milestones.flatMap(value => value.evidence))}</div>`;
      dialog.showModal();
    };

    document.getElementById('masterProjectRows').innerHTML = projects.map((project, index) => `
      <tr class="clickable-row" tabindex="0" role="button" data-project="${index}"><td><strong>${project.name}</strong><span>${project.system}</span></td><td>${project.role}</td><td><span class="status-pill ${statusClass(project.status)}">${project.status}</span></td><td>${project.progress}%</td><td>${project.milestones.length}</td><td>${project.milestones.reduce((sum, item) => sum + item.evidence.length, 0)}</td></tr>`).join('');

    document.getElementById('projectMilestoneTables').innerHTML = projects.map((project, projectIndex) => `
      <section class="milestone-group" id="project-${project.slug}"><header><div><p class="kicker">${project.system}</p><h3>${project.name}</h3></div><span>${project.progress}% · ${project.status}</span></header>
        <div class="portfolio-table-wrap"><table class="portfolio-table milestone-table"><thead><tr><th>Feature or milestone</th><th>Status</th><th>What it enables</th><th>Issues / PRs</th></tr></thead><tbody>${project.milestones.map((milestone, milestoneIndex) => `
          <tr class="clickable-row" tabindex="0" role="button" data-project="${projectIndex}" data-milestone="${milestoneIndex}"><td><strong>${milestone.name}</strong></td><td><span class="status-pill ${statusClass(milestone.status)}">${milestone.status}</span></td><td>${milestone.enables}</td><td>${milestone.evidence.length}</td></tr>`).join('')}</tbody></table></div>
      </section>`).join('');

    document.querySelectorAll('.clickable-row').forEach(row => {
      const show = () => { const project = projects[Number(row.dataset.project)]; const milestone = row.dataset.milestone === undefined ? null : project.milestones[Number(row.dataset.milestone)]; openDetail(project, milestone); };
      row.addEventListener('click', show);
      row.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); show(); } });
    });
    document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

    document.getElementById('dailyWork').innerHTML = data.daily_work.map(day => `
      <article class="work-day">
        <div class="work-day-date"><time datetime="${day.date}">${day.label}</time><strong>${day.completion}%</strong><span>+${day.delta} pts</span></div>
        <div><h3>${day.headline}</h3><ul>${day.shipped.map(item => `<li>${item}</li>`).join('')}</ul></div>
        <div class="work-day-proof">${day.proof.map(link => `<a href="${link.url}">${link.label} ↗</a>`).join('')}</div>
      </article>`).join('');

    document.getElementById('progressRail').innerHTML = data.history.map(day => `
      <article class="station">
        <span class="station-dot"></span>
        <time datetime="${day.date}">${day.label}</time>
        <strong>${day.completion}%</strong>
        <span>+${day.delta} pts · ${day.summary}</span>
      </article>`).join('');

    const ga = data.outcomes.ga4;
    document.getElementById('gaSessions').textContent = format.format(ga.current_7d.sessions);
    document.getElementById('gaSessionsDelta').textContent = delta(ga.current_7d.sessions, ga.prior_7d.sessions);
    document.getElementById('gaWindow').textContent = `${ga.current_7d.range} vs ${ga.prior_7d.range}. Latest day: ${ga.latest_day.sessions} vs ${ga.prior_day.sessions}.`;

    const gsc = data.outcomes.gsc;
    document.getElementById('gscClicks').textContent = format.format(gsc.current_7d.clicks);
    document.getElementById('gscClicksDelta').textContent = delta(gsc.current_7d.clicks, gsc.prior_7d.clicks);
    document.getElementById('gscWindow').textContent = `${gsc.current_7d.range}; settled through ${gsc.settled_through}.`;
    document.getElementById('gscImpressions').textContent = format.format(gsc.current_7d.impressions);
    document.getElementById('gscImpressionsDelta').textContent = delta(gsc.current_7d.impressions, gsc.prior_7d.impressions);
    document.getElementById('gscPosition').textContent = `Average position ${gsc.current_7d.position}, from ${gsc.prior_7d.position}; lower is better.`;

    const beacon = data.outcomes.beacon;
    document.getElementById('beaconCoverage').textContent = beacon.status;
    document.getElementById('beaconMissing').textContent = `Missing: ${beacon.missing_metrics.join(', ')}. Unknown traffic is not inferred.`;

    document.getElementById('workstreams').innerHTML = data.workstreams.map(w => `
      <article class="workstream">
        <div class="workstream-name"><strong>${w.name}</strong><span>${w.status}</span></div>
        <div class="bar" aria-label="${w.percent}% complete"><i style="width:${w.percent}%"></i></div>
        <div class="workstream-score">${w.earned}/${w.weight} pts</div>
      </article>`).join('');

    document.getElementById('landingPages').innerHTML = ga.top_pages.map(p => `
      <tr><td><a class="page-path" href="https://www.getmecab.com${p.page}">${p.page}</a></td><td>${p.sessions}</td></tr>`).join('');

    document.getElementById('queries').innerHTML = gsc.top_queries.map(q => `
      <tr><td><span title="${shortPath(q.page)}">${q.query}</span></td><td>${q.clicks}</td><td>${q.impressions}</td><td>${q.position}</td></tr>`).join('');

    document.getElementById('actions').innerHTML = data.actions.map(a => `
      <article class="action"><small>${a.type}</small><h3>${a.title}</h3><p>${a.detail}</p></article>`).join('');

    document.getElementById('evidence').innerHTML = data.evidence.map(e => `
      <article class="evidence-item"><time datetime="${e.date}">${e.date}</time><div><a href="${e.url}">${e.title}</a><div class="repo">${e.repo}</div></div><span>${e.result}</span></article>`).join('');
  })
  .catch(error => {
    document.getElementById('verdict').textContent = `Report data could not be loaded: ${error.message}`;
  });
