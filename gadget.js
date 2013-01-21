var Gadget = function() {
    this._menu = null;
    this._game = null;
    this._applied = [];
};

Gadget.prototype.KEYS = {
    DIFFICULTY: 'difficulty',
    MOVE: 'move',
    RESTART: 'restart'
};

Gadget.prototype._updateState = function(delta) {
    var state = wave.getState();
    state.submitDelta(delta);
};

Gadget.prototype._getGameParamsByDifficulty = function(difficulty) {
    if (difficulty == 'easy') {
        return {
            width: 9,
            height: 9,
            bombs: 10
        };
    }
    if (difficulty == 'normal') {
        return {
            width: 16,
            height: 16,
            bombs: 40
        };
    }
    if (difficulty == 'hard') {
        return {
            width: 30,
            height: 16,
            bombs: 99
        };
    }
};

Gadget.prototype._placeBombs = function(difficulty) {
    var params = this._getGameParamsByDifficulty(difficulty);
    this._game.placeBombs(params.width, params.height, params.bombs);
};

Gadget.prototype._onDifficultySelected = function(difficulty) {
    this._updateState({difficulty: difficulty});
    this._placeBombs(difficulty);
};

Gadget.prototype._onGameFieldChanged = function(cells) {
    var chunks = [];
    for (var i in cells) {
        chunks.push(cells[i].join(','));
    }
    var delta = {};
    var key = this.KEYS.MOVE + (new Date()).getTime();
    delta[key] = chunks.join(' ');
    this._updateState(delta);
};

Gadget.prototype._onGameRestarted = function() {
    var delta = {};
    var moves = this._getMoves();
    for (var i in moves) {
        delta[i] = null;
    }
    delta[this.KEYS.RESTART] = true;
    this._updateState(delta);
    var state = wave.getState();
    this._placeBombs(state.get(this.KEYS.DIFFICULTY));
};

Gadget.prototype._getMoves = function() {
    var state = wave.getState();
    var moves = {};
    var keys = state.getKeys();
    for (var i in keys) {
        var key = keys[i];
        if (key.slice(0, 4) == this.KEYS.MOVE) {
            moves[key] = state.get(key);
        }
    }
    return moves;
};

Gadget.prototype._getMoveCount = function(moves) {
    var count = 0;
    for (var i in moves) {
        count += 1;
    }
    return count;
};

Gadget.prototype._applyMoves = function(moves) {
    for (var i in moves) {
        if (i in this._applied) {
            continue;
        }
        var cells = moves[i].split(' ');
        for (var j in cells) {
            var cell = cells[j].split(',');
            this._game.changeCell(Number(cell[0]), Number(cell[1]), cell[2]);
        }
        this._applied[i] = true;
    }
};

Gadget.prototype._onStateUpdated = function() {
    var state = wave.getState();
    var difficulty = state.get(this.KEYS.DIFFICULTY);
    if (!difficulty) {
        this._menu.show();
        return;
    }
    this._menu.hide();
    var moves = this._getMoves();
    var moveCount = this._getMoveCount(moves);
    if (!moveCount) {
        return;
    }
    if (moveCount == 1 && state.get(this.KEYS.RESTART)) {
        this._game.deinit();
        this._game.hide();
        this._applied = [];
    }
    if (!this._game.isInitialized) {
        var params = this._getGameParamsByDifficulty(difficulty);
        this._game.init(params.width, params.height);
        this._game.show();
        gadgets.window.adjustHeight();
    }
    this._applyMoves(moves);
};

Gadget.prototype.init = function() {
    gadgets.util.registerOnLoadHandler($.proxy(function() {
        if (!wave || !wave.isInWaveContainer()) {
            return;
        }
        this._menu = new Menu($.proxy(this._onDifficultySelected, this));
        this._game = new Game($.proxy(this._onGameFieldChanged, this), $.proxy(this._onGameRestarted, this));
        wave.setStateCallback($.proxy(this._onStateUpdated, this));
    }, this));
};
