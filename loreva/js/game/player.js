LV.Player = {
    x: 0, y: 0, w: 20, h: 20, dir: 'down', ft: 0, moving: false,
    reset(tx, ty) { this.x = tx * 32 + 6; this.y = ty * 32 + 10; this.dir = 'down'; this.ft = 0; this.moving = false; },
    cx() { return this.x + this.w / 2; },
    cy() { return this.y + this.h / 2; },
    update(dt, blocked) {
        const a = LV.Input.axis();
        let dx = a.x, dy = a.y;
        this.moving = !!(dx || dy);
        if (dx && dy) { dx *= .7071; dy *= .7071; }
        const sp = LV.CONFIG.SPEED * dt;
        if (dx) { const nx = this.x + dx * sp; if (!blocked(nx, this.y, this.w, this.h)) this.x = nx; }
        if (dy) { const ny = this.y + dy * sp; if (!blocked(this.x, ny, this.w, this.h)) this.y = ny; }
        if (a.x && Math.abs(a.x) >= Math.abs(a.y)) this.dir = a.x < 0 ? 'left' : 'right';
        else if (a.y) this.dir = a.y < 0 ? 'up' : 'down';
        this.ft = this.moving ? this.ft + dt * 9 : 0;
    },
    draw(g) {
        const frame = this.moving ? [0, 1, 0, 2][Math.floor(this.ft) % 4] : 0;
        const spr = LV.Sprites.human(LV.State.char, frame, this.dir);
        g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(this.cx(), this.y + this.h + 1, 10, 4, 0, 0, Math.PI * 2); g.fill();
        g.drawImage(spr, Math.round(this.cx() - 16), Math.round(this.y + this.h - 30));
    }
};