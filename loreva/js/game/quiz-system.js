LV.Quiz = (() => {
    const $ = id => document.getElementById(id);
    let deck = [], pack = null, open = false, lastId = null;

    function init(p) { pack = p; deck = []; lastId = null; }
    // Soal dibagikan satu per satu dari tumpukan acak: tidak ada soal berulang sebelum SEMUA soal paket habis terpakai.
    function next() {
        if (!deck.length) {
            deck = LV.U.shuffle(pack.questions);
            if (deck.length > 1 && lastId !== null && deck[deck.length - 1].id === lastId) deck.unshift(deck.pop());
        }
        const q = deck.pop(); lastId = q.id; return q;
    }
    function limit() {
        const mult = { mudah: 1.4, sedang: 1, sulit: .75 }[pack.difficulty] || 1;
        const c = LV.CONFIG.CHARACTERS[LV.State.char];
        return Math.round((pack.timeLimit || 25) * mult) + (c ? c.timeBonus : 0);
    }

    // ---- pencocokan jawaban isian singkat ----
    const norm = s => String(s == null ? '' : s).toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.!]+$/, '');
    const num = s => { const t = norm(s).replace(',', '.'); return /^-?\d+(\.\d+)?$/.test(t) ? parseFloat(t) : null; };
    function matches(input, accepted) {
        const a = norm(input); if (!a) return false;
        const an = num(input);
        return (accepted || []).some(x => norm(x) === a || (an !== null && num(x) === an));
    }

    function setDuel(d) {
        const p = $('duel-p'), m = $('duel-m');
        if (p.getAttribute('src') !== d.player) p.src = d.player;
        if (m.getAttribute('src') !== d.monster) m.src = d.monster;
        m.style.width = m.style.height = d.msize + 'px';
        m.classList.toggle('dead', d.mHp <= 0);
        $('duel-mn').textContent = d.mName;
        $('duel-mb').style.width = Math.max(0, d.mHp / d.mMax * 100) + '%';
        $('duel-ph').innerHTML = LV.HUD.heartsHTML(LV.State.hp, LV.State.maxHp);
    }
    function animate(who) {
        const p = $('duel-p'), m = $('duel-m');
        const a = who === 'p' ? p : m, b = who === 'p' ? m : p, ca = who === 'p' ? 'lunge-r' : 'lunge-l';
        a.classList.remove('lunge-r', 'lunge-l', 'hurt'); b.classList.remove('lunge-r', 'lunge-l', 'hurt');
        void a.offsetWidth;
        a.classList.add(ca); b.classList.add('hurt');
        setTimeout(() => { a.classList.remove(ca); b.classList.remove('hurt'); }, 520);
    }

    function ask(opts = {}) {
        return new Promise(resolve => {
            const q = next(), type = q.type || 'mcq', isShort = type === 'short';
            const accepted = Array.isArray(q.accepted) ? q.accepted : [];
            const order = isShort ? [] : (type === 'tf' ? [0, 1] : LV.U.shuffle(q.options.map((_, i) => i)));
            const total = limit();
            const ov = $('quiz'), box = $('q-options'), fb = $('q-feedback');
            const hintBtn = $('q-hint'), hintTxt = $('q-hint-text');
            let answered = false, closed = false, res = null, btns = [], inp = null, sub = null;
            const t0 = performance.now();

            open = true; LV.Input.reset();
            ov.classList.remove('hidden');
            $('q-title').textContent = opts.title || 'Tantangan';
            $('q-sub').textContent = opts.sub || '';
            $('q-text').textContent = q.q;
            fb.className = 'hidden'; box.innerHTML = ''; hintTxt.textContent = '';
            box.className = isShort ? 'short' : (type === 'tf' ? 'tf' : '');
            hintBtn.disabled = false; hintBtn.classList.toggle('hidden', !q.hint);
            $('duel').classList.toggle('hidden', !opts.duel);
            if (opts.duel) setDuel(opts.duel);

            if (isShort) {
                inp = document.createElement('input');
                inp.id = 'q-input'; inp.type = 'text'; inp.maxLength = 80; inp.placeholder = 'Ketik jawabanmu...';
                inp.autocomplete = 'off'; inp.spellcheck = false; inp.setAttribute('autocapitalize', 'off');
                sub = document.createElement('button');
                sub.type = 'button'; sub.className = 'btn'; sub.textContent = 'JAWAB ▶';
                inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); submitShort(); } });
                sub.onclick = submitShort;
                box.appendChild(inp); box.appendChild(sub);
                setTimeout(() => inp.focus(), 80);
            } else {
                btns = order.map((orig, i) => {
                    const b = document.createElement('button');
                    b.className = 'opt'; b.dataset.orig = orig;
                    b.innerHTML = `<i>${'ABCD'[i]}</i><span>${LV.U.esc(q.options[orig])}</span>`;
                    b.onclick = () => finish(orig);
                    box.appendChild(b); return b;
                });
            }

            hintBtn.onclick = () => {
                if (answered) return;
                if (LV.State.coins < 1) { hintTxt.textContent = 'Koin tidak cukup!'; return; }
                LV.State.addCoins(-1); LV.HUD.update(); LV.Audio.play('click');
                hintTxt.textContent = '💡 ' + q.hint; hintBtn.disabled = true;
                if (inp) inp.focus();
            };

            const onKey = e => {
                const k = e.key.toLowerCase();
                if (!answered) {
                    if (isShort) return; // mengetik di kotak isian
                    const idx = k.length === 1 ? ('abcd'.indexOf(k) >= 0 ? 'abcd'.indexOf(k) : '1234'.indexOf(k)) : -1;
                    if (idx >= 0 && idx < order.length) { e.preventDefault(); e.stopPropagation(); finish(order[idx]); }
                } else if (k === 'enter' || k === ' ') { e.preventDefault(); e.stopPropagation(); close(); }
            };
            document.addEventListener('keydown', onKey);

            const bar = $('q-bar'), clock = $('q-clock');
            const tick = () => {
                const left = Math.max(0, total - (performance.now() - t0) / 1000);
                bar.style.width = (left / total * 100) + '%';
                bar.classList.toggle('low', left < 6);
                clock.textContent = Math.ceil(left) + 's';
                if (left <= 0) finish(-1);
            };
            const timer = setInterval(tick, 100); tick();

            function submitShort() {
                const v = inp.value.trim();
                if (!v) { inp.focus(); return; }
                finish(v);
            }

            // choice: angka (pilihan ganda / benar-salah), teks (isian), atau -1 (waktu habis)
            function finish(choice) {
                if (answered) return; answered = true; clearInterval(timer);
                const timedOut = choice === -1;
                let ok, chosenText, rightText;
                if (isShort) {
                    const typed = timedOut ? '' : String(choice);
                    ok = !timedOut && matches(typed, accepted);
                    chosenText = timedOut ? '(waktu habis)' : typed;
                    rightText = accepted.join(' / ');
                    inp.disabled = true; sub.disabled = true; inp.classList.add(ok ? 'right' : 'wrong');
                } else {
                    ok = choice === q.answer;
                    chosenText = timedOut ? '(waktu habis)' : q.options[choice];
                    rightText = q.options[q.answer];
                    btns.forEach(b => {
                        const o = +b.dataset.orig; b.disabled = true;
                        if (o === q.answer) b.classList.add('right'); else if (o === choice) b.classList.add('wrong');
                    });
                }
                hintBtn.disabled = true;

                const used = Math.min(total, (performance.now() - t0) / 1000);
                const S = LV.State; let coins = 0;
                if (ok) { S.correct++; coins = S.addCoins(2); } else S.wrong++;
                S.log.push({ q: q.q, chosen: chosenText, right: rightText, ok, time: +used.toFixed(1) });
                res = { ok, timedOut, used, coins, question: q };
                LV.Audio.play(ok ? 'correct' : 'wrong');
                if (opts.onAnswer) opts.onAnswer(res);
                LV.HUD.update();

                let rightLine = '';
                if (!ok) {
                    if (isShort) rightLine = `Jawaban benar: <b>${LV.U.esc(rightText)}</b><br>`;
                    else if (type === 'tf') rightLine = `Jawaban benar: <b>${LV.U.esc(rightText)}</b><br>`;
                    else rightLine = `Jawaban benar: <b>${'ABCD'[order.indexOf(q.answer)]}. ${LV.U.esc(rightText)}</b><br>`;
                }
                fb.className = 'feedback ' + (ok ? 'good' : 'bad'); fb.id = 'q-feedback';
                $('q-verdict').textContent = ok ? `BENAR! +${coins} koin` : (timedOut ? 'WAKTU HABIS!' : 'BELUM TEPAT');
                $('q-explain').innerHTML = rightLine + LV.U.esc(q.explain || 'Terus semangat belajar!');
                const nb = $('q-next'); nb.onclick = close; setTimeout(() => nb.focus(), 60);
            }
            function close() {
                if (closed || !answered) return; closed = true;
                document.removeEventListener('keydown', onKey);
                ov.classList.add('hidden'); open = false; resolve(res);
            }
        });
    }

    // efek visual di dunia game setelah jawaban (dipanggil challenge)
    function fx(res, x, y) {
        if (res.ok) { LV.FX.stars(x, y); LV.FX.text(x, y - 10, '+' + res.coins, '#ffd84a'); }
        else {
            LV.FX.shake(.4); LV.FX.flash('#ff2a4a', .35); LV.FX.burst(x, y, '#ff5a6a', 12, 90, 160, 3);
            LV.FX.text(x, y - 10, res.timedOut ? 'WAKTU HABIS' : 'SALAH!', '#ff7a8a');
        }
    }
    return { init, ask, setDuel, animate, fx, isOpen: () => open };
})();