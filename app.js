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
    document.getElementById('portfolioCompletion').textContent = `${data.completion.current}%`;
    document.getElementById('launchRate').textContent = `${data.portfolio_summary.launch_rate}%`;
    document.getElementById('foundationRate').textContent = `${data.portfolio_summary.foundation_rate}%`;
    document.getElementById('launchDefinition').textContent = data.portfolio_summary.definition;

    document.getElementById('strategyChain').innerHTML = data.strategy_chain.map((step, index) => `
      <article><span>${String(index + 1).padStart(2, '0')}</span><strong>${step.name}</strong><p>${step.purpose}</p></article>`).join('');

    document.getElementById('projects').innerHTML = data.projects.map((project, index) => `
      <article class="project-card">
        <div class="project-index">Project ${String(index + 1).padStart(2, '0')}</div>
        <header><div><h3>${project.name}</h3><p>${project.why}</p></div><div class="project-score"><strong>${project.completion}%</strong><span>${project.launch_status}</span></div></header>
        <div class="project-progress"><i style="width:${project.completion}%"></i></div>
        <div class="project-columns">
          <div><h4>Complete</h4><ul>${project.complete.map(item => `<li>${item}</li>`).join('')}</ul></div>
          <div><h4>Pending</h4><ul>${project.pending.map(item => `<li>${item}</li>`).join('')}</ul></div>
        </div>
        <footer><span>Owned through ${project.systems.join(' · ')}</span><a href="${project.evidence_url}">View evidence ↗</a></footer>
      </article>`).join('');

    document.getElementById('differences').innerHTML = data.differences.map(item => `
      <article><div><small>Before</small><p>${item.before}</p></div><span>→</span><div><small>Now</small><p>${item.now}</p><strong>Why: ${item.why}</strong></div></article>`).join('');

    document.getElementById('repoLanes').innerHTML = data.repository_lanes.map(lane => `
      <article class="repo-lane">
        <header><div><small>${lane.repo}</small><h3>${lane.title}</h3></div><strong>${lane.merged_prs}<span> merged</span></strong></header>
        <p>${lane.summary}</p>
        <ul>${lane.highlights.map(item => `<li>${item.url ? `<a href="${item.url}">${item.text}</a>` : item.text}</li>`).join('')}</ul>
        <div class="lane-status">${lane.status}</div>
      </article>`).join('');

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
