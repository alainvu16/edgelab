// Edge Lab core: state, navigation, session timer, coach cards, market breaks
var App = (function () {
  var KEY = 'edgelab.v1';
  var S = null;
  function defaults() {
    return {
      v: 1, simple: 'wrong',
      session: { limit: 30, active: false, used: 0, sinceBreak: 0, extended: false },
      breakEvery: 12,
      chess: {}, xq: {}, poker: {}, mkt: {},
      streakDays: 0, lastDay: ''
    };
  }
  function load() {
    try { var raw = localStorage.getItem(KEY); S = raw ? JSON.parse(raw) : null; } catch (e) { S = null; }
    if (!S || typeof S !== 'object' || Array.isArray(S)) {
      // main save missing or damaged: fall back to the newest backup copy before starting fresh
      var b = baks(); S = null;
      for (var i = b.length - 1; i >= 0 && !S; i--) if (validState(b[i].state)) S = b[i].state;
      if (!S) S = defaults();
    }
    if (Object.isFrozen(S)) S = JSON.parse(JSON.stringify(S));
    var d = defaults();
    for (var k in d) if (S[k] === undefined) S[k] = d[k];
  }
  var saveT = null, cloudT = null, cloudDoc = null, cloudBak = null, cloudStatus = 'off', cloudHadData = false, saveFail = false;
  function writeLocal() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); saveFail = false; }
    catch (e) {
      // storage full: drop the disposable caches first, then retry once
      try { localStorage.removeItem('edgelab.simp'); localStorage.setItem(KEY, JSON.stringify(S)); saveFail = false; } catch (e2) { saveFail = true; }
    }
    snapshot(false);
  }
  function save() {
    clearTimeout(saveT);
    S.savedAt = Date.now();
    saveT = setTimeout(writeLocal, 150);
    if (cloudDoc && !cloudT) cloudT = setTimeout(function () { cloudT = null; cloudPush(); }, 8000);
  }
  // ---------- backups: never lose progress ----------
  // One snapshot per day for the last 10 days on this device, plus one in your account per weekday (7 rolling slots).
  // A snapshot is also taken before anything replaces your progress (reset, restore, adopting another device's copy).
  var BAK = 'edgelab.bak';
  function baks() { try { var b = JSON.parse(localStorage.getItem(BAK) || '[]'); return Array.isArray(b) ? b : []; } catch (e) { return []; } }
  function snapshot(force, why) {
    var sc = progressScore(S); if (!sc) return;
    var day = new Date().toISOString().slice(0, 10), b = baks();
    var last = b[b.length - 1];
    if (!force && last && last.day === day && last.score >= sc && Date.now() - last.at < 3600e3) return;
    var entry = { day: day, at: Date.now(), score: sc, why: why || 'daily', state: JSON.parse(JSON.stringify(S)) };
    if (!force && last && last.day === day && last.why === 'daily') b[b.length - 1] = entry; else b.push(entry);
    // keep: the latest per day for 10 days, plus up to 5 safety snapshots
    var safety = b.filter(function (x) { return x.why !== 'daily'; }).slice(-5), daily = b.filter(function (x) { return x.why === 'daily'; }).slice(-10);
    b = safety.concat(daily).sort(function (a, c) { return a.at - c.at; });
    for (var tries = 0; tries < 6; tries++) {
      try { localStorage.setItem(BAK, JSON.stringify(b)); break; } catch (e) { if (b.length <= 1) break; b.shift(); }
    }
    if (cloudBak && (force || !snapshot.cloudDay || snapshot.cloudDay !== day)) {
      snapshot.cloudDay = day;
      try { cloudBak(new Date().getDay()).set({ state: entry.state, at: entry.at, score: sc, why: entry.why }).catch(function () {}); } catch (e) {}
    }
  }
  function validState(s) {
    return s && typeof s === 'object' && !Array.isArray(s) && typeof s.chess === 'object' && typeof s.mkt === 'object' && typeof s.poker === 'object' && typeof s.xq === 'object';
  }
  function replaceState(ns, why) {
    snapshot(true, why || 'before restore');
    S = JSON.parse(JSON.stringify(ns)); App.S = S;
    var def = defaults(); for (var k in def) if (S[k] === undefined) S[k] = def[k];
    S.savedAt = Date.now();
    writeLocal(); if (cloudDoc) cloudPush();
  }
  function fmtAt(t) { var d = new Date(t); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
  function backupScreen() {
    screen('Backups', function (v) {
      var list = baks().slice().reverse();
      v.innerHTML = '<div><span class="eyebrow">Your progress</span><h1>Backups</h1><p class="mute small">Your progress saves on every answer. On top of that, Edge Lab keeps a copy for each of the last 10 days on this phone' + (cloudDoc ? ', 7 daily copies in your account,' : '') + ' and a safety copy before any reset or restore. You can also keep your own backup code anywhere (Notes, email).</p></div>' +
        (saveFail ? '<div class="coach wrong"><p>This phone’s storage is full, so saving here failed. Free some space or save a backup code now.</p></div>' : '') +
        '<div class="panel"><h3>Backup code</h3><p class="small mute">Copy this and paste it into Notes. Paste it back below to restore on any device, even the offline version.</p><div class="btns"><button class="btn primary" id="cp">Copy backup code</button><button class="btn" id="dl">Save as file</button></div><textarea id="code" rows="3" readonly style="width:100%;box-sizing:border-box;background:var(--panel2);color:var(--fg);border:1px solid var(--line);border-radius:10px;padding:8px;font:12px var(--mono, monospace)"></textarea></div>' +
        '<div class="panel"><h3>Restore from a code</h3><textarea id="in" rows="3" placeholder="Paste a backup code" style="width:100%;box-sizing:border-box;background:var(--panel2);color:var(--fg);border:1px solid var(--line);border-radius:10px;padding:8px;font:12px var(--mono, monospace)"></textarea><div class="btns"><button class="btn primary" id="rs">Restore this code</button><label class="btn" style="cursor:pointer">Load backup file<input type="file" id="fl" accept=".txt,text/plain" hidden></label></div><p class="small" id="rsm"></p></div>' +
        '<h3>Saved copies</h3><div class="list" id="bl">' + (list.length ? list.map(function (b, i) { return '<button class="item" data-b="' + i + '"><span class="grow"><span class="t">' + esc(fmtAt(b.at)) + '</span><br><span class="s">' + esc(b.why === 'daily' ? 'Daily copy' : 'Safety copy, ' + b.why) + ' · ' + (+b.score || 0) + ' things done</span></span><span class="end">Restore</span></button>'; }).join('') : '<p class="mute small">Copies appear after your first answers.</p>') + '</div>' +
        (cloudDoc ? '<button class="btn sm ghost" id="cl">Show account copies</button><div class="list" id="cll"></div>' : '');
      var code = makeCode(S);
      $('#code', v).value = code;
      $('#cp', v).onclick = function () {
        var ta = $('#code', v), done = function (ok) { toast(ok ? 'Copied (' + code.length + ' characters, ends with .END). Paste it into Notes.' : 'Press and hold the code, Select All, then Copy.'); };
        // iPhone: a read-only box can't be selected, so unlock it for the copy
        ta.removeAttribute('readonly'); ta.focus(); ta.setSelectionRange(0, code.length);
        var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
        ta.setAttribute('readonly', ''); ta.blur();
        if (ok) return done(true);
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(function () { done(true); }, function () { done(false); });
        else done(false);
      };
      $('#dl', v).onclick = function () {
        var name = 'edge-lab-backup-' + new Date().toISOString().slice(0, 10) + '.txt';
        // Inside Claude the page can't download directly: ask the app to save the file (it shows a confirmation).
        var dlp = (window.claude && window.claude.use) ? window.claude.use('downloads') : Promise.resolve(null);
        dlp.then(function (dl) {
          if (dl) return dl.save({ filename: name, data: code }).then(function () { toast('Backup file saved. In the other app, tap Load backup file.'); }, function (e) {
            var c = e && e.code; toast(c === 'declined' ? 'Save cancelled.' : c === 'rate_limited' ? 'One moment, then try again.' : 'Couldn’t save the file here. Use Copy backup code instead.');
          });
          plainDownload(name);
        }, function () { plainDownload(name); });
      };
      function plainDownload(name) {
        try { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
        catch (e) { toast('Use Copy backup code instead.'); }
      }
      function tryRestore(text) {
        var res = readCode(text);
        if (res.err) { $('#rsm', v).textContent = res.err; return; }
        $('#rsm', v).textContent = '';
        confirmRestore(res.state, progressScore(res.state));
      }
      $('#rs', v).onclick = function () { tryRestore($('#in', v).value || ''); };
      $('#fl', v).onchange = function () {
        var f = this.files && this.files[0]; if (!f) return;
        var rd = new FileReader(); rd.onload = function () { tryRestore(String(rd.result || '')); }; rd.onerror = function () { $('#rsm', v).textContent = 'Couldn’t open that file. Try pasting the code instead.'; }; rd.readAsText(f);
      };
      $$('[data-b]', v).forEach(function (b) { b.onclick = function () { var x = list[+b.dataset.b]; if (x && validState(x.state)) confirmRestore(x.state, x.score); }; });
      if (cloudDoc) $('#cl', v).onclick = function () {
        var out = $('#cll', v); out.innerHTML = '<p class="small mute">Loading…</p>';
        Promise.all([0, 1, 2, 3, 4, 5, 6].map(function (i) { return cloudBak(i).get().then(function (s) { return s && s.exists ? s.data() : null; }, function () { return null; }); })).then(function (r) {
          var got = r.filter(function (x) { return x && validState(x.state); }).sort(function (a, c) { return c.at - a.at; });
          out.innerHTML = got.length ? got.map(function (x, i) { return '<button class="item" data-c="' + i + '"><span class="grow"><span class="t">' + esc(fmtAt(x.at)) + '</span><br><span class="s">Account copy · ' + (+x.score || 0) + ' things done</span></span><span class="end">Restore</span></button>'; }).join('') : '<p class="small mute">No account copies yet. One is made each day you play.</p>';
          $$('[data-c]', out).forEach(function (b) { b.onclick = function () { var x = got[+b.dataset.c]; confirmRestore(x.state, x.score); }; });
        });
      };
    });
  }
  // Backup code: EDGE1:<base64 of your progress>.END  (the .END lets us spot a code that got cut off when copying)
  function makeCode(s) { return 'EDGE1:' + btoa(unescape(encodeURIComponent(JSON.stringify(s)))) + '.END'; }
  function readCode(text) {
    var t = String(text || '');
    var i = t.indexOf('EDGE1:');
    if (i < 0) {
      var j = t.indexOf('{'); // a raw backup file also works
      if (j >= 0) { try { var raw = JSON.parse(t.slice(j)); if (validState(raw)) return { state: raw }; } catch (e) {} }
      return { err: t.trim() ? 'That isn’t an Edge Lab backup code: it should start with EDGE1: . Your phone may have pasted something else. Copy the code again and paste it here.' : 'Paste your backup code in the box first.' };
    }
    t = t.slice(i + 6);
    var k = t.indexOf('.END'), complete = k >= 0;
    if (complete) t = t.slice(0, k);
    t = t.replace(/[^A-Za-z0-9+\/=]/g, ''); // drop spaces, line breaks and stray characters added by Notes or Messages
    var st = null;
    try { st = JSON.parse(decodeURIComponent(escape(atob(t)))); } catch (e) { st = null; }
    if (validState(st)) return { state: st };
    return { err: complete ? 'That code is damaged. Copy a fresh code from the other app and try again.' : 'That code is cut off: the full code ends with .END. Copy the whole code again (or use Save as file / Load backup file).' };
  }
  function confirmRestore(st, sc) {
    modal('<h2>Restore this copy?</h2><p class="mute">It has ' + (+sc || 0) + ' things done; you have ' + progressScore(S) + ' now. Your current progress is saved as a safety copy first, so you can switch back.</p><div class="btns"><button class="btn" id="no">Cancel</button><button class="btn primary" id="yes">Restore</button></div>');
    $('#no').onclick = closeModal;
    $('#yes').onclick = function () { replaceState(st, 'before restore'); closeModal(); toast('Restored.'); tab('home'); };
  }
  // how much real activity a state holds, so an empty copy never overwrites a played one
  function progressScore(s) {
    if (!s) return 0;
    var c = s.chess || {}, x = s.xq || {}, p = s.poker || {}, m = s.mkt || {}, v = s.vocab || {};
    var g = function (o) { return o ? (o.w || 0) + (o.l || 0) + (o.d || 0) : 0; };
    return Object.keys(c.solved || {}).length + g(c.games) + Object.keys(c.lessons || {}).length + g(x.games) + Object.keys(x.lessons || {}).length + (p.total || 0) + (p.hands || 0) + (m.answered || 0) + (v.n || 0) + (c.placed ? 1 : 0) + (p.placed ? 1 : 0) + (m.placed ? 1 : 0) + (x.placed ? 1 : 0);
  }
  function cloudPush() {
    if (!cloudDoc) return;
    if (progressScore(S) === 0 && !cloudHadData) return; // nothing worth writing yet
    var snap = JSON.parse(JSON.stringify(S));
    cloudDoc.set({ state: snap, savedAt: snap.savedAt || Date.now() }).then(function () { cloudStatus = 'ok'; }, function () { cloudStatus = 'err'; });
  }
  // Cloud sync: progress follows the account across phone, Safari and the Claude app.
  function cloudInit() {
    if (!window.claude || !window.claude.use) return;
    Promise.all([window.claude.use('db'), window.claude.use('user')]).then(function (r) {
      var db = r[0], user = r[1]; if (!db || !user) return;
      return user.id().then(function (uid) {
        if (!uid) return;
        cloudDoc = db.doc('data/users/' + uid + '/progress');
        cloudBak = function (i) { return db.doc('data/users/' + uid + '/backup' + i); };
        return cloudDoc.get().then(function (snap) {
          var d = snap && snap.exists ? snap.data() : null;
          var cs = d && d.state ? progressScore(d.state) : 0, ls = progressScore(S);
          if (d && d.state) cloudHadData = true;
          if (d && d.state && (cs > ls || (cs === ls && cs > 0 && (d.savedAt || 0) > (S.savedAt || 0) + 2000))) {
            // cloud copy is newer (played on another device): adopt it
            snapshot(true, 'before syncing from another device');
            S = JSON.parse(JSON.stringify(d.state)); App.S = S; /* cloud snapshots are read-only: work on a copy */ var def = defaults(); for (var k in def) if (S[k] === undefined) S[k] = def[k];
            try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
            cloudStatus = 'ok';
            tab(curTab);
          } else { cloudStatus = 'ok'; cloudPush(); }
        });
      });
    }).catch(function () { cloudStatus = 'err'; });
  }
  window.addEventListener('pagehide', function () { clearTimeout(saveT); writeLocal(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') { clearTimeout(saveT); writeLocal(); if (cloudDoc) { clearTimeout(cloudT); cloudT = null; cloudPush(); } } });
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // Missing elements return a detached stand-in, so a callback that finishes after you leave a screen can't crash the app.
  function $(sel, el) { return (el || document).querySelector(sel) || document.createElement('div'); }
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }

  // ---------- navigation ----------
  var mods = {}, curTab = 'home', stack = [];
  function reg(name, mod) { mods[name] = mod; }
  function tab(name) {
    curTab = name; stack = [];
    $$('#tabs button').forEach(function (b) { b.setAttribute('aria-current', b.dataset.tab === name ? 'true' : 'false'); });
    if (name === 'home') home(); else { mods[name].home(); offerPlacement(name); }
  }
  function offerPlacement(name) {
    var m = mods[name], s = App.S[name];
    if (!m.place || s.placed) return;
    var label = { chess: 'chess', xq: 'xiangqi', poker: 'poker', mkt: 'markets' }[name];
    modal('<div class="grab"></div><span class="eyebrow">Find your level</span><h2>How much ' + label + ' do you know?</h2><p class="mute">A quick placement (about 2 minutes) gets harder when you’re right and easier when you miss, then starts you at the right level. Skip it to start from the basics.</p><div class="btns"><button class="btn" id="pskip">Start from scratch</button><button class="btn primary" id="pgo">Place me</button></div>', false);
    $('#pskip').onclick = function () { App.S[name].placed = 'skip'; save(); closeModal(); };
    $('#pgo').onclick = function () { closeModal(); m.place(); };
  }
  // screen(title, renderFn): renderFn(viewEl) draws; pushes onto back stack
  function screen(title, fn, opts) {
    opts = opts || {};
    if (opts.replace) stack.pop();
    stack.push({ title: title, fn: fn });
    draw();
  }
  function back() {
    stack.pop();
    if (!stack.length) { tab(curTab); return; }
    draw();
  }
  function draw() {
    var top = stack[stack.length - 1];
    // fresh container each screen, so callbacks from an abandoned screen write into a detached node
    var old = $('#view'), view = document.createElement('div'); view.className = 'wrap'; view.id = 'view';
    old.parentNode.replaceChild(view, old);
    header(top.title, stack.length > 1);
    top.fn(view);
    $('#main').scrollTop = 0;
  }
  function root(title, fn) { stack = []; screen(title, fn); }
  function header(title, canBack) {
    var h = $('#top');
    h.innerHTML = (canBack ? '<button class="back" aria-label="Back" id="bk">‹</button><div class="crumb">' + esc(title) + '</div>'
      : '<div class="brand">Edge<b>Lab</b></div><div class="crumb"></div>') +
      (QP.active ? '<button class="timer" id="qpn" style="color:var(--accent);border-color:var(--accent)" aria-label="Skip to next quick play block">Quick ⟳</button>' : '') +
      '<button class="timer" id="tm" aria-label="Session timer"></button>';
    if (QP.active) $('#qpn').onclick = function () { var a = qpPick(); var sheet = modal('<div class="grab"></div><span class="eyebrow">Quick play</span><h2>Skip to: ' + QNAME[a.k] + '</h2><p><b>' + esc(a.label) + '</b></p><div class="btns"><button class="btn primary" id="qgo">Go</button><button class="btn" id="qx">Stay</button></div><button class="btn ghost" id="qstop">Stop quick play</button>'); $('#qgo', sheet).onclick = function () { qpLaunch(a); }; $('#qx', sheet).onclick = closeModal; $('#qstop', sheet).onclick = qpStop; };
    if (canBack) $('#bk').onclick = back;
    $('#tm').onclick = sessionSheet;
    tickUI();
  }

  // ---------- session timer ----------
  var lastTick = Date.now(), lastTouch = Date.now();
  document.addEventListener('pointerdown', function () { lastTouch = Date.now(); }, true);
  document.addEventListener('keydown', function () { lastTouch = Date.now(); }, true);
  var HOUR_GOAL = 25;
  function hoursOf(tab) { return ((S.hours || {})[tab] || 0) / 3600000; }
  function fmt(ms) { var s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function tick() {
    var now = Date.now(), dt = Math.min(now - lastTick, 5000); lastTick = now;
    var vis = document.visibilityState !== 'hidden';
    if (vis && S.session.active) {
      S.session.used += dt; S.session.sinceBreak += dt; save();
    }
    if (vis && curTab !== 'home' && now - lastTouch < 120000) {
      S.hours = S.hours || {}; S.hours[curTab] = (S.hours[curTab] || 0) + dt;
      var dk = new Date().toISOString().slice(0, 10); S.dayLog = S.dayLog || {}; if (!S.dayLog[dk]) { S.dayLog[dk] = 1; var dks = Object.keys(S.dayLog).sort(); if (dks.length > 400) delete S.dayLog[dks[0]]; }
      if (Math.floor((S.hours[curTab] - dt) / 60000) !== Math.floor(S.hours[curTab] / 60000)) save();
    }
    tickUI();
  }
  function tickUI() {
    var t = $('#tm'); if (!t) return;
    var ss = S.session;
    if (!ss.active) { t.textContent = 'Start session'; t.className = 'timer'; return; }
    var left = ss.limit * 60000 - ss.used;
    t.textContent = left > 0 ? fmt(left) + ' left' : 'Time’s up';
    t.className = 'timer' + (left < 5 * 60000 ? ' low' : '');
  }
  function startSession(min) {
    S.session = { limit: min, active: true, used: 0, sinceBreak: 0, extended: false };
    var today = new Date().toDateString();
    if (S.lastDay !== today) {
      var y = new Date(Date.now() - 864e5).toDateString();
      S.streakDays = S.lastDay === y ? S.streakDays + 1 : 1; S.lastDay = today;
    }
    save(); tickUI();
  }
  function sessionSheet() {
    var ss = S.session;
    var opts = [15, 30, 45, 60, 90];
    modal('<div class="grab"></div><h2>Session length</h2><p class="mute">Pick how long you want to train. You will get a heads-up when time is up, never in the middle of a game.</p>' +
      '<div class="btns">' + opts.map(function (m) { return '<button class="btn' + (ss.active && ss.limit === m ? ' primary' : '') + '" data-m="' + m + '">' + m + ' min</button>'; }).join('') + '</div>' +
      '<h3>Market breaks</h3><p class="mute small">A short trading quiz after every stretch of play.</p>' +
      '<div class="seg" id="bev">' + [8, 12, 20, 0].map(function (m) { return '<button aria-pressed="' + (S.breakEvery === m) + '" data-b="' + m + '">' + (m ? 'Every ' + m + ' min' : 'Off') + '</button>'; }).join('') + '</div>' +
      (sampleFn ? '<h3>Explain like I’m 5</h3><div class="seg" id="simps">' + [['off', 'Button only'], ['wrong', 'When I’m wrong'], ['always', 'Always']].map(function (o) { return '<button aria-pressed="' + ((S.simple || 'wrong') === o[0]) + '" data-sm="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="mute small">Rewrites coach notes in kid-simple words using Claude (needs a connection).</p>' : '') +
      '<h3>Celebrations</h3><div class="seg" id="fxs"><button aria-pressed="' + (S.fx !== false) + '" data-fx="1">On</button><button aria-pressed="' + (S.fx === false) + '" data-fx="0">Off</button></div><p class="mute small">Gold rain after wins and level-ups. Tap On to preview.</p>' +
      (ss.active ? '<button class="btn ghost" id="endS">End session now</button>' : '') +
      '<button class="btn ghost" id="cls">Close</button>');
    $$('#modal [data-m]').forEach(function (b) { b.onclick = function () { startSession(+b.dataset.m); closeModal(); }; });
    $$('#modal [data-b]').forEach(function (b) { b.onclick = function () { S.breakEvery = +b.dataset.b; save(); sessionSheet(); }; });
    $$('#modal [data-sm]').forEach(function (b) { b.onclick = function () { S.simple = b.dataset.sm; save(); sessionSheet(); }; });
    $$('#modal [data-fx]').forEach(function (b) { b.onclick = function () { S.fx = b.dataset.fx === '1'; save(); sessionSheet(); if (S.fx) celebrate('level'); }; });
    if ($('#endS')) $('#endS').onclick = function () { closeModal(); timesUp(true); };
    $('#cls').onclick = closeModal;
  }
  function timesUp(manual) {
    var ss = S.session;
    var mins = Math.round(ss.used / 60000);
    modal('<div class="grab"></div><span class="eyebrow">Session complete</span><h2>' + mins + ' focused minutes</h2>' +
      '<p>' + (manual ? 'Nice work.' : 'You hit the limit you set.') + ' Short daily sessions beat long ones: your brain locks in patterns while you rest.</p>' +
      '<div class="stats">' + levelStats() + '</div>' + WZ.card('home', true) +
      '<div class="btns">' + (!ss.extended && !manual ? '<button class="btn" id="ext">5 more minutes</button>' : '') + '<button class="btn primary" id="done">Done for now</button></div>');
    if ($('#ext')) $('#ext').onclick = function () { ss.limit += 5; ss.extended = true; save(); closeModal(); };
    $('#done').onclick = function () { ss.active = false; save(); closeModal(); tab('home'); };
  }
  // Call at natural pauses (game over, puzzle solved, hand finished).
  function checkpoint(done) {
    var ss = S.session;
    if (ss.active && ss.used >= ss.limit * 60000) { timesUp(false); return; }
    if (QP.active) {
      QP.count++;
      if (QP.count >= QP.quota || Date.now() - QP.start > 7 * 60000) { save(); qpBlockDone(done || function () {}); return; }
      ss.sinceBreak = 0; // quick play already rotates through markets
    }
    if (S.breakEvery && curTab !== 'mkt' && ss.sinceBreak >= S.breakEvery * 60000 && mods.mkt) {
      ss.sinceBreak = 0; save();
      mods.mkt.breakQuiz(done || function () {});
      return;
    }
    // every few pauses, a 10-second word recall so new vocabulary doesn't fade
    S.cp = (S.cp || 0) + 1;
    if (S.cp % 4 === 0 && typeof WZ !== 'undefined' && WZ.recallDue()) { save(); WZ.recallModal(done || function () {}); return; }
    save();
    if (done) done();
  }

  // ---------- quick play: the app picks what to train and rotates ----------
  var QP = { active: false, count: 0, quota: 1, start: 0, last: null, lastLabel: '', blocks: {}, n: 0 };
  var QNAME = { chess: 'Chess', xq: 'Xiangqi', poker: 'Poker', mkt: 'Markets', vocab: 'Vocabulary', think: 'Think outside the box' };
  function qpPick() {
    var prog = { chess: ((S.chess.rating || 800) - 600) / 1400, xq: ((S.xq.level || 1) - 1) / 7, poker: ((S.poker.level || 1) - 1) / 11, mkt: ((S.mkt.level || 1) - 1) / 7 };
    var due = (typeof WZ !== 'undefined') ? WZ.dueCount() : 0;
    if (QP.n > 0 && QP.n % 4 === 3 && due >= 2 && QP.last !== 'vocab') return { k: 'vocab', label: 'Vocabulary review', why: due + ' words are due before they fade.', go: function () { WZ.vocab(); }, quota: 1 };
    if (QP.n > 0 && QP.n % 5 === 4 && QP.last !== 'think' && typeof TH !== 'undefined') return { k: 'think', label: 'Creative questions', why: 'Six quick questions on finding the moves most players never consider.', go: TH.quiz, quota: 1 };
    var best = null;
    ['chess', 'xq', 'poker', 'mkt'].forEach(function (k) {
      if (!mods[k] || !mods[k].quick || k === QP.last) return;
      var sev = 0; try { sev = mods[k].report()[0].sev || 0; } catch (e) {}
      var score = (1 - Math.min(1, Math.max(0, prog[k]))) * 0.8 + Math.min(1, sev) * 0.8 - (QP.blocks[k] || 0) * 0.45 - hoursOf(k) / HOUR_GOAL * 0.3 + Math.random() * 0.35;
      if (!best || score > best.score) best = { k: k, score: score };
    });
    if (typeof RM !== 'undefined' && Math.random() < 0.5) { try { var ns = RM.nextStep(best.k); if (ns && ns.label !== QP.lastLabel) return { k: best.k, label: ns.label, why: 'Next step on your path to an edge.', go: ns.go, quota: 3 }; } catch (e) {} }
    var list = mods[best.k].quick().filter(function (a) { return a.label !== QP.lastLabel; });
    var tot = list.reduce(function (s, a) { return s + (a.w || 1); }, 0), r = Math.random() * tot, a = list[0];
    for (var i = 0; i < list.length; i++) { r -= (list[i].w || 1); if (r <= 0) { a = list[i]; break; } }
    a.k = best.k; return a;
  }
  function qpLaunch(a) {
    QP.last = a.k; QP.lastLabel = a.label; QP.count = 0; QP.quota = a.quota || 1; QP.start = Date.now(); QP.n++;
    QP.blocks[a.k] = (QP.blocks[a.k] || 0) + 1; QP.cur = a;
    closeModal();
    if (a.k === 'vocab' || a.k === 'think') { tab('home'); } else { curTab = a.k; stack = []; $$('#tabs button').forEach(function (b) { b.setAttribute('aria-current', b.dataset.tab === a.k ? 'true' : 'false'); }); mods[a.k].home(); }
    a.go();
    toast('Quick play · ' + a.label);
  }
  function quickPlay() {
    if (!S.session.active) startSession(30);
    QP.active = true; QP.blocks = {}; QP.n = 0; QP.last = null; QP.lastLabel = '';
    qpLaunch(qpPick());
  }
  function qpNext() { qpLaunch(qpPick()); }
  function qpStop() { QP.active = false; closeModal(); toast('Quick play stopped'); header(stack.length ? stack[stack.length - 1].title : 'Home', stack.length > 1); }
  function qpBlockDone(done) {
    var a = qpPick();
    var sheet = modal('<div class="grab"></div><span class="eyebrow">Quick play · block ' + QP.n + ' done</span><h2>Next up: ' + QNAME[a.k] + '</h2><p><b>' + esc(a.label) + '</b></p>' + (a.why ? '<p class="mute small">' + a.why + '</p>' : '') +
      '<div class="btns"><button class="btn primary" id="qgo">Go</button><button class="btn" id="qstay">Keep doing this</button></div><button class="btn ghost" id="qstop">Stop quick play</button>', false);
    $('#qgo', sheet).onclick = function () { qpLaunch(a); };
    $('#qstay', sheet).onclick = function () { QP.count = 0; QP.start = Date.now(); closeModal(); done(); };
    $('#qstop', sheet).onclick = function () { qpStop(); done(); };
  }
  var toastT = null;
  function toast(msg) {
    var t = document.getElementById('qtoast'); if (!t) { t = document.createElement('div'); t.id = 'qtoast'; t.setAttribute('role', 'status'); t.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:calc(60px + env(safe-area-inset-top,0px));z-index:70;background:var(--panel);color:var(--fg);border:1px solid var(--accent);border-radius:99px;padding:7px 14px;font:600 13px var(--body);box-shadow:0 4px 14px rgba(0,0,0,.25);max-width:calc(100% - 32px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none'; document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2600);
  }

  // ---------- celebration: "edge rain" — gold knights, spades, 炮 and green candles ----------
  var rainT = null;
  function celebrate(kind) {
    if (S.fx === false) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var old = $('#fx'); if (old) old.remove();
    var cv = document.createElement('canvas'); cv.id = 'fx'; cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:60;pointer-events:none';
    document.body.appendChild(cv);
    var dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    var glyphs = { chess: ['\u265E', '\u265B', '\u2654'], xq: ['\u70AE', '\u5E25', '\u8ECA'], poker: ['\u2660', '\u2665', '\u2666', '\u2663'], mkt: ['\u2191', '$', '\u25B2'], level: ['\u2605', '\u265E', '\u2660', '\u70AE', '\u2191'] };
    var set = glyphs[kind] || glyphs.level, N = kind === 'level' ? 90 : 60, P = [];
    for (var i = 0; i < N; i++) P.push({ x: Math.random() * innerWidth, y: -40 - Math.random() * innerHeight * 0.8, v: 2.2 + Math.random() * 3, r: Math.random() * 6.28, w: (Math.random() - .5) * .15, s: 16 + Math.random() * 18, g: set[i % set.length], c: i % 5 === 0 ? '#4cc08a' : i % 3 === 0 ? '#fbe29a' : '#f0b545', candle: kind === 'mkt' && i % 4 === 0 });
    var t0 = performance.now();
    function frame(t) {
      var el = (t - t0) / 1000; ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalAlpha = el > 2.6 ? Math.max(0, 1 - (el - 2.6) / 0.6) : 1;
      P.forEach(function (p) {
        p.y += p.v; p.r += p.w; p.x += Math.sin(el * 2 + p.r) * .4;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        if (p.candle) { ctx.fillStyle = '#4cc08a'; ctx.fillRect(-1, -14, 2, 28); ctx.fillRect(-5, -6, 10, 14); }
        else { ctx.font = '700 ' + p.s + 'px ' + (kind === 'xq' ? '"Noto Serif SC","PingFang SC",serif' : 'system-ui,sans-serif'); ctx.fillStyle = p.c; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.g, 0, 0); }
        ctx.restore();
      });
      if (el < 3.2) rainT = requestAnimationFrame(frame); else cv.remove();
    }
    cancelAnimationFrame(rainT); rainT = requestAnimationFrame(frame);
  }
  // ---------- modal ----------
  function modal(html, onBackdrop) {
    var m = $('#modal');
    m.innerHTML = '<div class="modal" id="mbg"><div class="sheet" role="dialog" aria-modal="true">' + html + '</div></div>';
    $('#mbg').onclick = function (e) { if (e.target.id === 'mbg' && onBackdrop !== false) closeModal(); };
    return $('.sheet', m);
  }
  function closeModal() { $('#modal').innerHTML = ''; }

  // ---------- coach card ----------
  var GRADES = {
    best: ['good', 'Best move'], great: ['good', 'Great'], good: ['ok', 'Good'],
    inacc: ['warn', 'Inaccuracy'], mistake: ['warn', 'Mistake'], blunder: ['bad', 'Blunder'],
    right: ['good', 'Correct'], wrong: ['bad', 'Not quite'], info: ['ok', 'Coach']
  };
  // "I don't know": an honest skip. It counts as a miss (so the question comes back later), shows the answer, and teaches it.
  var idkAt = 0;
  function idkBtn(attr) { return '<button class="btn opt idk" data-' + attr + '="-9">I don’t know</button>'; }
  document.addEventListener('click', function (e) { if (e.target && e.target.closest && e.target.closest('.idk')) idkAt = Date.now(); }, true);
  function coachHTML(grade, text, extra) {
    var g = GRADES[grade] || GRADES.info;
    if (grade === 'wrong' && Date.now() - idkAt < 1500) g = ['ok', 'Here’s how it works'];
    return '<div class="coach ' + g[0] + '" data-g="' + grade + '"><div class="h"><span class="pill ' + g[0] + '">' + g[1] + '</span>' + (extra || '') + '</div><p>' + text + '</p>' + (grade !== 'info' ? '<button class="btn sm ghost simp" type="button">Explain it simpler</button><div class="simpout small" hidden></div>' : '') + '</div>';
  }

  // ---------- "explain like I'm 5": rewrite any coach note in kid-simple words ----------
  var sampleFn = null, simpCache = {};
  try { simpCache = JSON.parse(localStorage.getItem('edgelab.simp') || '{}'); } catch (e) {}
  function simpKey(t) { var h = 0; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return 'k' + h; }
  function simplify(card) {
    var out = card.querySelector('.simpout'), btn = card.querySelector('.simp'), p = card.querySelector('p');
    if (!out || !p || !sampleFn) return;
    var txt = p.innerText.trim(), key = simpKey(txt);
    out.hidden = false; btn.hidden = true;
    if (simpCache[key]) { out.innerHTML = '<b>In simple words:</b> ' + esc(simpCache[key]); return; }
    out.textContent = 'Thinking…';
    var prompt = 'Explain this to a 5-year-old. It comes from a learning app about chess, Chinese chess (xiangqi), poker and the stock market.\n' +
      'Rules: 2 to 4 short sentences. Everyday words only. Use one comparison from everyday life (toys, snacks, a playground, sports, a lemonade stand). Keep the key point and any number that matters. If you must use a game word, explain it in a few words. No intro, no emojis, plain text only.\n\nExplanation:\n' + txt;
    sampleFn(prompt, { modelTier: 'quick', onText: function (o) { out.innerHTML = '<b>In simple words:</b> ' + esc(o.text); } }).then(function (r) {
      out.innerHTML = '<b>In simple words:</b> ' + esc(r.text);
      simpCache[key] = r.text; var ks = Object.keys(simpCache); if (ks.length > 300) delete simpCache[ks[0]];
      try { localStorage.setItem('edgelab.simp', JSON.stringify(simpCache)); } catch (e) {}
    }, function (e) {
      if (e && e.code === 'not_granted') { document.body.classList.remove('can-simp'); out.textContent = 'Simple explanations need permission to ask Claude. You can allow it from the page’s permissions menu.'; }
      else { out.textContent = 'Couldn’t simplify right now. Try again in a moment.'; btn.hidden = false; }
    });
  }
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.simp'); if (b) simplify(b.closest('.coach')); });
  // auto mode: simplify new coach notes as they appear
  var simpObs = new MutationObserver(function (muts) {
    var mode = S && S.simple; if (!sampleFn || !mode || mode === 'off') return;
    muts.forEach(function (m) { m.addedNodes.forEach(function (n) {
      if (!n.querySelectorAll) return;
      var cards = (n.classList && n.classList.contains('coach') ? [n] : []).concat(Array.prototype.slice.call(n.querySelectorAll('.coach')));
      cards.forEach(function (c) { var g = c.getAttribute('data-g'); if (!c.querySelector('.simp')) return; if (mode === 'always' || ['wrong', 'mistake', 'blunder', 'inacc'].indexOf(g) >= 0) simplify(c); });
    }); });
  });

  // ---------- adaptive helpers ----------
  function elo(r, opp, score, k) { var e = 1 / (1 + Math.pow(10, (opp - r) / 400)); return Math.round(r + (k || 32) * (score - e)); }

  // ---------- home ----------
  function levelStats() {
    var c = S.chess, x = S.xq, p = S.poker, m = S.mkt;
    return [
      ['Chess est. Elo', typeof CZ !== 'undefined' ? CZ.estElo().elo : '—'], ['Chess puzzles', c.rating || 800],
      ['Xiangqi bot', 'Lv ' + (x.level || 1)], ['Poker', 'Lv ' + (p.level || 1)], ['Markets', 'Lv ' + (m.level || 1)]
    ].map(function (a) { return '<div class="stat"><span class="v">' + a[1] + '</span><span class="k">' + a[0] + '</span></div>'; }).join('');
  }
  var planCache = null;
  function dailyPlan() {
    var items = [], sug = suggestion();
    var due = (typeof WZ !== 'undefined') ? WZ.dueCount() : 0;
    if (due) items.push({ min: 3, text: 'Review ' + due + ' vocabulary word' + (due > 1 ? 's' : '') + ' that are due', go: function () { WZ.vocab(); } });
    var weakest = { chess: 'Chess: puzzles on your weakest theme', xq: 'Xiangqi: a coached game and the move trainer', poker: 'Poker: drills on your weakest type', mkt: 'Markets: 15 adaptive questions' }[sug[0]];
    items.push({ min: 10, text: weakest, go: function () { tab(sug[0]); } });
    var second = ['chess', 'xq', 'poker', 'mkt'].filter(function (k) { return k !== sug[0]; }).sort(function (a, b) { return hoursOf(a) - hoursOf(b); })[0];
    items.push({ min: 10, text: { chess: 'Chess: one coached game', xq: 'Xiangqi: characters, then a game', poker: 'Poker: a heads-up match', mkt: 'Markets: Rotation Replay on real data' }[second], go: function () { tab(second); } });
    items.push({ min: 5, text: 'Markets: Event Replay or Macro Desk chain', go: function () { tab('mkt'); if (typeof MC !== 'undefined') MC.home(); } });
    items.push({ min: 2, text: 'Read today’s line and one new word, out loud', go: function () { WZ.wisdomScreen(); } });
    planCache = items; return items;
  }
  function suggestion() {
    var c = S.chess, x = S.xq, p = S.poker, m = S.mkt;
    var prog = [
      ['chess', 'Chess', ((c.rating || 800) - 600) / 1400],
      ['xq', 'Xiangqi', ((x.level || 1) - 1) / 5],
      ['poker', 'Poker', ((p.level || 1) - 1) / 11],
      ['mkt', 'Markets', ((m.level || 1) - 1) / 7]
    ];
    prog.sort(function (a, b) { return a[2] - b[2]; });
    return prog[0];
  }
  function home() {
    root('Home', function (v) {
      var hr = new Date().getHours();
      var greet = hr < 5 ? 'Late session' : hr < 12 ? 'Morning' : hr < 18 ? 'Afternoon' : 'Evening';
      var sug = suggestion();
      var ss = S.session;
      v.innerHTML =
        frontHTML(greet) +
        (progressScore(S) === 0 ? '<button class="item" id="rsc"><span class="grow"><span class="t">Moving from another device?</span><br><span class="s">Paste your backup code to bring your progress here.</span></span><span class="end">›</span></button>' : '') +
        (QP.active ? '<div class="row"><button class="btn sm ghost" id="qpstop">Stop quick play</button></div>' : '') +
        (typeof RM !== 'undefined' ? '<button class="item" id="path" style="flex-direction:column;align-items:stretch;gap:6px"><div class="row"><span class="t grow">Your path to an edge</span><span class="end">›</span></div>' + RM.summary().map(function (r) { return '<div class="row small"><span style="width:62px">' + r.name + '</span><div class="bar grow"><i style="width:' + Math.round(r.pct * 100) + '%"></i></div><span class="mute" style="width:118px;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (r.done ? 'Edge reached' : r.stageName) + '</span></div>'; }).join('') + '</button>' : '') +
        (ss.active ? '' : '<div class="panel"><h3>Start a session</h3><p class="mute small">Set a time box so you train sharp and stop before you burn out.</p><div class="btns">' +
          [15, 30, 45, 60].map(function (m) { return '<button class="btn' + (m === 30 ? ' primary' : '') + '" data-s="' + m + '">' + m + ' min</button>'; }).join('') + '</div></div>') +
        '<div class="panel"><span class="eyebrow">Next up</span><h2>' + sug[1] + ' is your weakest area</h2><p class="mute small">Everything levels up as you get things right, and slows down when you miss.</p><button class="btn primary" id="go">Train ' + sug[1] + '</button></div>' +
        '<div class="panel"><span class="eyebrow">Today’s 30 minutes</span><div class="list" style="gap:6px">' + dailyPlan().map(function (it, i) { return '<button class="item" data-dp="' + i + '" style="padding:9px 12px"><span class="pill" style="min-width:44px;justify-content:center">' + it.min + 'm</span><span class="grow small">' + it.text + '</span><span class="end">›</span></button>'; }).join('') + '</div></div>' +
        '<div class="panel"><span class="eyebrow">Coach’s notes</span>' + ['chess', 'xq', 'poker', 'mkt'].map(function (k) { var r = mods[k] && mods[k].report ? mods[k].report()[0] : null; if (!r) return ''; return '<div class="row" style="align-items:flex-start"><span class="pill" style="min-width:64px;justify-content:center">' + { chess: 'Chess', xq: 'Xiangqi', poker: 'Poker', mkt: 'Markets' }[k] + '</span><span class="small grow">' + r.text + '</span></div>'; }).join('') + '<p class="small mute">Each area tracks your mistakes by type and feeds you more of what you miss.</p></div>' +
        '<div class="panel"><span class="eyebrow">Hours toward ' + HOUR_GOAL + ' each</span><div class="list" style="gap:6px">' + [['chess', 'Chess'], ['xq', 'Xiangqi'], ['poker', 'Poker'], ['mkt', 'Markets']].map(function (t) { var h = hoursOf(t[0]); return '<div class="row"><span class="small" style="width:70px">' + t[1] + '</span><div class="bar grow"><i style="width:' + Math.min(100, h / HOUR_GOAL * 100) + '%"></i></div><span class="mono small mute" style="width:52px;text-align:right">' + (h < 1 ? Math.round(h * 60) + 'm' : h.toFixed(1) + 'h') + '</span></div>'; }).join('') + '</div><p class="small mute">Counts time you are actively training. Each track holds roughly 25 hours of structured material, and the bots, puzzles and replays keep going after that.</p></div>' +
        '<div class="panel"><span class="eyebrow">Your levels</span><div class="stats">' + levelStats() + '</div></div>' +
        (typeof WZ !== 'undefined' ? WZ.card('home') : '') +
        '<div class="list"><button class="item" id="vc"><span class="grow"><span class="t">Vocabulary</span><br><span class="s">' + (WZ.dueCount() ? WZ.dueCount() + ' word' + (WZ.dueCount() > 1 ? 's' : '') + ' due for review' : 'Words of the realm, a few at a time') + '</span></span><span class="end">' + (WZ.dueCount() ? '<span class="pill acc">review</span>' : '›') + '</span></button><button class="item" id="lib"><span class="grow"><span class="t">Audiobooks</span><br><span class="s">Listen while you train · Libby and hoopla</span></span><span class="end">›</span></button><button class="item" id="thk"><span class="grow"><span class="t">Think outside the box</span><br><span class="s">Creative habits for every game · questions and puzzles</span></span><span class="end">›</span></button><button class="item" id="wz"><span class="grow"><span class="t">Words of wisdom</span><br><span class="s">The metaphors, with their meanings</span></span><span class="end">›</span></button></div>' +
        '<div class="list">' +
        item('chess', '&#9822;&#xFE0E;', 'Chess', 'Curriculum, openings, puzzles, coached games') +
        item('xq', '炮', 'Xiangqi', 'Chinese chess: rules, bot ladder, coached games') +
        item('poker', '&#9824;&#xFE0E;', 'Poker', 'Hold’em drills and heads-up vs bots') +
        item('mkt', '↗', 'Markets', 'Trading concepts and chart practice') +
        '</div>' +
        '<div class="row"><button class="btn sm ghost" id="sess">Session &amp; break settings</button><button class="btn sm ghost" id="bk">Backups</button><button class="btn sm ghost" id="reset">Reset progress</button><button class="btn sm ghost" id="fxt">Celebrations: ' + (S.fx === false ? 'off' : 'on') + '</button><span class="small mute" id="cs">' + (cloudStatus === 'ok' ? 'Progress synced to your account' : cloudStatus === 'err' ? 'Saved on this device only' : 'Saved on this device') + '</span></div>' +
        '<p class="small mute">Market questions are for learning, not investment advice. Practice charts use simulated prices.</p>';
      $$('[data-s]', v).forEach(function (b) { b.onclick = function () { startSession(+b.dataset.s); home(); }; });
      $('#go', v).onclick = function () { tab(sug[0]); };
      $$('[data-go]', v).forEach(function (b) { b.onclick = function () { tab(b.dataset.go); }; });
      $$('[data-dp]', v).forEach(function (b) { b.onclick = function () { planCache[+b.dataset.dp].go(); }; });
      $('#sess', v).onclick = sessionSheet; if ($('#rsc', v)) $('#rsc', v).onclick = backupScreen; $('#bk', v).onclick = backupScreen;
      $('#qp', v).onclick = function () { if (QP.active) qpNext(); else quickPlay(); };
      if ($('#path', v)) $('#path', v).onclick = RM.home;
      if (QP.active) $('#qpstop', v).onclick = function () { qpStop(); home(); };
      $('#fxt', v).onclick = function () { S.fx = S.fx === false; save(); if (S.fx) celebrate('level'); home(); };
      $('#vc', v).onclick = WZ.vocab; $('#lib', v).onclick = WZ.library; $('#wz', v).onclick = WZ.wisdomScreen; $('#thk', v).onclick = TH.home;
      $('#reset', v).onclick = function () {
        modal('<h2>Reset all progress?</h2><p class="mute">Levels, ratings and stats go back to the start. A safety copy is kept under Backups, so you can undo this.</p><div class="btns"><button class="btn" id="no">Keep</button><button class="btn primary" id="yes">Reset</button></div>');
        $('#no').onclick = closeModal;
        $('#yes').onclick = function () { snapshot(true, 'before reset'); S = defaults(); App.S = S; save(); if (cloudDoc) cloudPush(); closeModal(); home(); };
      };
    });
  }
  // ---------- the front: hero "cockpit" ----------
  function sparkPath() {
    try {
      var px = (MKT_DATA.monthly.px.SPY || []).filter(function (x) { return x != null; }).slice(-48);
      if (px.length < 8) return '';
      var lo = Math.min.apply(null, px), hi = Math.max.apply(null, px), n = px.length;
      var pts = px.map(function (v, i) { return [(i / (n - 1) * 100).toFixed(2), (36 - (v - lo) / (hi - lo || 1) * 30).toFixed(2)]; });
      var line = 'M' + pts.map(function (p) { return p.join(','); }).join(' L');
      var chg = (px[n - 1] / px[0] - 1) * 100;
      return '<div class="hband"><div class="hcap mono"><span>S&amp;P 500 · last 4 years</span><span class="' + (chg >= 0 ? 'up' : 'dn') + '">' + (chg >= 0 ? '+' : '') + chg.toFixed(0) + '%</span></div><svg class="hspark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".28"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs><path d="' + line + ' L100,40 L0,40 Z" fill="url(#hg)"/><path d="' + line + '" fill="none" stroke="var(--accent)" stroke-width="1.2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg></div>';
    } catch (e) { return ''; }
  }
  function dial(k, glyph, label, stat, pct, han) {
    var R = 25, C = 2 * Math.PI * R, off = C * (1 - Math.max(0.02, Math.min(1, pct)));
    return '<button class="dial" data-go="' + k + '" aria-label="' + label + ', ' + stat + '"><span class="ring"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="' + R + '" class="trk"/><circle cx="30" cy="30" r="' + R + '" class="val" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg><span class="g' + (han ? ' han' : '') + '">' + glyph + '</span></span><span class="dl">' + label + '</span><span class="ds mono">' + stat + '</span></button>';
  }
  function frontHTML(greet) {
    var path = {}; try { RM.summary().forEach(function (r) { path[r.k] = r.pct; }); } catch (e) {}
    var m = S.mkt || {}, today = m.today || 0, goal = m.goal || 15, hrs = 0; try { hrs = App.totalHours(); } catch (e) {}
    var elo = '—'; try { elo = CZ.estElo().elo; } catch (e) {}
    var xel = 'Lv ' + ((S.xq && S.xq.level) || 1); try { if (XQ.estElo) xel = XQ.estElo().elo; } catch (e) {}
    var streak = S.streakDays > 1 ? '<span class="hchip">' + S.streakDays + '-day streak</span>' : '<span class="hchip">Day one</span>';
    return '<section class="hero">' +
      '<div class="hrow"><span class="eyebrow">' + greet + ', Alain</span>' + streak + '</div>' +
      '<h1 class="htitle">Train your <span>edge</span>.</h1>' +
      '<p class="hsub mono">' + (today >= goal ? Math.min(today, 999) + ' questions today · goal hit · ' : today + '/' + goal + ' questions today · ') + (hrs < 1 ? Math.round(hrs * 60) + ' min' : hrs.toFixed(1) + ' h') + ' trained</p>' + sparkPath() +
      '<div class="dials">' +
        dial('mkt', '↗', 'Markets', 'Lv ' + (m.level || 1), path.mkt || 0) +
        dial('chess', '&#9822;&#xFE0E;', 'Chess', elo, path.chess || 0) +
        dial('poker', '&#9824;&#xFE0E;', 'Poker', 'Lv ' + ((S.poker && S.poker.level) || 1), path.poker || 0) +
        dial('xq', '炮', 'Xiangqi', xel, path.xq || 0, true) +
      '</div>' +
      '<button class="btn primary hqp" id="qp">' + (QP.active ? 'Resume quick play' : 'Quick play') + '<span>The app picks what you need most and rotates every few minutes</span></button>' +
      '</section>';
  }
  function item(go, ic, t, s) {
    return '<button class="item" data-go="' + go + '"><span style="font-family:' + (ic === '炮' ? 'var(--han)' : 'var(--chess)') + ';font-size:24px;width:28px;text-align:center">' + ic + '</span><span class="grow"><span class="t">' + t + '</span><br><span class="s">' + s + '</span></span><span class="end">›</span></button>';
  }

  // ---------- engine bridge (web worker, sync fallback) ----------
  var worker = null, pend = {}, wid = 0, workerDead = false;
  function getWorker() {
    if (worker || workerDead) return worker;
    try {
      worker = new Worker('worker.js?v=14');
      worker.onmessage = function (e) { var p = pend[e.data.id]; if (!p) return; delete pend[e.data.id]; if (e.data.err) p.rej(new Error(e.data.err)); else p.res(e.data.res); };
      worker.onerror = function () { workerDead = true; try { worker.terminate(); } catch (e) {} worker = null; for (var k in pend) { pend[k].rej(new Error('worker')); } pend = {}; };
    } catch (e) { workerDead = true; worker = null; }
    return worker;
  }
  function syncEngine(m) {
    if (m.game === 'chess') { var g = new Chess(m.fen); return m.op === 'best' ? ENG.bestTimed(g, m.depth, m.noise, m.ms) : ENG.rootScoresTimed(g, m.depth, m.ms); }
    var s = { b: m.b, turn: m.turn, hist: [], ply: m.ply || 0 };
    return m.op === 'best' ? XQE.bestTimed(s, m.depth, m.noise, m.ms) : XQE.rootScoresTimed(s, m.depth, m.ms);
  }
  // engine(msg) -> Promise. msg: {game:'chess'|'xq', op:'best'|'root', depth, noise, ms, fen | b,turn,ply}
  function engine(m) {
    var w = getWorker();
    if (!w) return new Promise(function (res) { setTimeout(function () { res(syncEngine(m)); }, 20); });
    return new Promise(function (res, rej) {
      var id = ++wid; pend[id] = { res: res, rej: rej }; m.id = id;
      w.postMessage(m);
      setTimeout(function () { if (pend[id]) { delete pend[id]; try { res(syncEngine(m)); } catch (e) { rej(e); } } }, (m.ms || 1000) + 4000);
    }).catch(function () { return syncEngine(m); });
  }

  function boot() {
    getWorker();
    setTimeout(cloudInit, 0);
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {}); } catch (e) {}
    if (window.claude && window.claude.use) window.claude.use('sample').then(function (f) { if (f) { sampleFn = f; document.body.classList.add('can-simp'); } }, function () {});
    simpObs.observe(document.body, { childList: true, subtree: true });
    load();
    App.S = S;
    $$('#tabs button').forEach(function (b) { b.onclick = function () { tab(b.dataset.tab); }; });
    setInterval(tick, 1000);
    setInterval(function () { if (cloudDoc) cloudPush(); }, 60000);
    document.addEventListener('visibilitychange', function () { lastTick = Date.now(); });
    var h = (location.hash || '').slice(1);
    tab(mods[h] ? h : 'home');
  }

  return {
    backupScreen: backupScreen, idkBtn: idkBtn, readCode: readCode, makeCode: makeCode, snapshot: snapshot, validState: validState,
    S: null, save: save, esc: esc, $: $, $$: $$, reg: reg, tab: tab, screen: screen, root: root, back: back,
    modal: modal, closeModal: closeModal, coachHTML: coachHTML, checkpoint: checkpoint, elo: elo, boot: boot,
    st: function (name) { return App.S[name]; }, engine: engine, celebrate: celebrate, quickPlay: quickPlay, toast: toast, qpActive: function () { return QP.active; }, hoursOf: hoursOf, HOUR_GOAL: HOUR_GOAL, activeDays: function () { return Object.keys(S.dayLog || {}).length; }, totalHours: function () { var h = S.hours || {}; return Object.keys(h).reduce(function (a, k) { return a + h[k]; }, 0) / 3600000; }, X: function () { return (typeof EXTRA !== 'undefined') ? EXTRA : {}; }
  };
})();
