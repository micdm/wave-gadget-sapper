var Cell = function() {
    this.node = null;
    this.isMined = false;
    this.isOpened = false;
    this.isFlagged = false;
};

var Game = function(onFieldChanged, onRestarted) {
    this.isInitialized = false;
    this._onFieldChanged = onFieldChanged;
    this._onRestarted = onRestarted;
};

Game.prototype.CHANGES = {
    MINED: 0,
    FLAGGED: 1,
    UNFLAGGED: 2,
    OPENED: 3
};

Game.prototype._getBombPositions = function(width, height, count) {
    var numbers = [];
    var total = width * height - 1;
    for (var i = 0; i < count; i += 1) {
        while (true) {
            var number = Math.round(Math.random() * total);
            if ($.inArray(number, numbers) == -1) {
                numbers.push(number);
                break;
            }
        }
    }
    return numbers;
};

Game.prototype._updateBombCounter = function(delta) {
    var counter = $('#bomb-counter');
    var count = Number(counter.text() || 0) + delta;
    counter.text(count);
};

Game.prototype.placeBombs = function(width, height, count) {
    var positions = this._getBombPositions(width, height, count);
    var changes = [];
    for (var i in positions) {
        var position = positions[i];
        var x = position % width;
        var y = Math.floor(position / width);
        changes.push([x, y, this.CHANGES.MINED]);
    }
    this._onFieldChanged(changes);
};

Game.prototype._resetDom = function() {
    $('#bomb-counter').text('0');
    $('#game-over').hide();
    $('#well-done').hide();
    $('#field').empty();
};

Game.prototype._createField = function(width, height) {
    this._width = width;
    this._height = height;
    for (var i = 0; i < height; i += 1) {
        var row = {};
        for (var j = 0; j < width; j += 1) {
            row[j] = new Cell();
        }
        this._field[i] = row;
    }
};

Game.prototype._createFieldTable = function(width, height) {
    var field = $('#field');
    field.empty();
    for (var i = 0; i < height; i += 1) {
        var row = $('<tr></tr>');
        for (var j = 0; j < width; j += 1) {
            var cell = $('<td data-x="' + j + '" data-y="' + i + '"></td>');
            this._field[i][j].node = cell;
            row.append(cell);
        }
        field.append(row);
    }
};

Game.prototype._flagAllBombs = function() {
    for (var i in this._mined) {
        var mined = this._mined[i];
        if (!mined.cell.isFlagged) {
            this.changeCell(mined.x, mined.y, this.CHANGES.FLAGGED);
        }
    }
};

Game.prototype._blowAllBombsUp = function() {
    for (var i in this._mined) {
        var mined = this._mined[i];
        mined.cell.node.addClass('mined');
    }
};

Game.prototype._areAllEmptyCellsOpened = function() {
    for (var i = 0; i < this._height; i += 1) {
        for (var j = 0; j < this._width; j += 1) {
            var cell = this._field[i][j];
            if (!cell.isMined && !cell.isOpened) {
                return false;
            }
        }
    }
    return true;
};

Game.prototype._checkForWin = function() {
    if (!this._areAllEmptyCellsOpened()) {
        return;
    }
    this._flagAllBombs();
    this._isFinished = true;
    $('#well-done').show();
};

Game.prototype._overGame = function() {
    this._blowAllBombsUp();
    this._isFinished = true;
    $('#game-over').show();
};

Game.prototype._getCellCount = function(x, y, test) {
    var count = 0;
    for (var i = y - 1; i <= y + 1; i += 1) {
        for (var j = x - 1; j <= x + 1; j += 1) {
            if (this._field[i] && this._field[i][j] && test(this._field[i][j])) {
                count += 1;
            }
        }
    }
    return count;
};

Game.prototype._getBombCount = function(x, y) {
    return this._getCellCount(x, y, function(cell) {
        return cell.isMined;
    });
};

Game.prototype._getFlagCount = function(x, y) {
    return this._getCellCount(x, y, function(cell) {
        return cell.isFlagged;
    });
};

Game.prototype._openAround = function(x, y) {
    for (var i = y - 1; i <= y + 1; i += 1) {
        for (var j = x - 1; j <= x + 1; j += 1) {
            if (this._field[i] && this._field[i][j]) {
                this._openCell(j, i);
            }
        }
    }
};

Game.prototype._openAroundIfFlagged = function(x, y) {
    var bombs = this._getBombCount(x, y);
    var flags = this._getFlagCount(x, y);
    if (!bombs || flags < bombs) {
        return;
    }
    var changes = [];
    for (var i = y - 1; i <= y + 1; i += 1) {
        for (var j = x - 1; j <= x + 1; j += 1) {
            if (!this._field[i]) {
                continue;
            }
            var cell = this._field[i][j];
            if (!cell || cell.isOpened || cell.isFlagged) {
                continue;
            }
            changes.push([j, i, this.CHANGES.OPENED]);
        }
    }
    if (changes.length) {
        this._onFieldChanged(changes);
    }
};

Game.prototype._openCell = function(x, y) {
    var cell = this._field[y][x];
    if (cell.isOpened || cell.isFlagged) {
        return;
    }
    cell.isOpened = true;
    cell.node.addClass('opened');
    var bombs = this._getBombCount(x, y);
    if (bombs) {
        cell.node.text(bombs);
        cell.node.addClass('around-' + bombs);
    } else {
        this._openAround(x, y);
    }
};

Game.prototype.changeCell = function(x, y, change) {
    var cell = this._field[y][x];
    if (change == this.CHANGES.MINED && !cell.isMined) {
        cell.isMined = true;
        this._mined.push({
            x: x,
            y: y,
            cell: cell
        });
        this._updateBombCounter(1);
    }
    if (change == this.CHANGES.FLAGGED && !cell.isFlagged) {
        cell.isFlagged = true;
        cell.node.addClass('flagged');
        this._updateBombCounter(cell.isFlagged ? -1 : 1);
    }
    if (change == this.CHANGES.UNFLAGGED && cell.isFlagged) {
        cell.isFlagged = false;
        cell.node.removeClass('flagged');
        this._updateBombCounter(cell.isFlagged ? -1 : 1);
    }
    if (change == this.CHANGES.OPENED && !cell.isOpened) {
        if (cell.isMined) {
            cell.node.addClass('mined');
            this._overGame();
            return;
        }
        this._openCell(x, y);
    }
    this._checkForWin();
};

Game.prototype._onCellClick = function(x, y, setFlag) {
    var cell = this._field[y][x];
    if (setFlag) {
        if (cell.isOpened) {
            return;
        }
        var change = [x, y, cell.isFlagged ? this.CHANGES.UNFLAGGED : this.CHANGES.FLAGGED];
        this._onFieldChanged([change]);
    } else {
        if (cell.isFlagged) {
            return;
        }
        if (cell.isOpened) {
            this._openAroundIfFlagged(x, y);
        } else {
            var change = [x, y, this.CHANGES.OPENED];
            this._onFieldChanged([change]);
        }
    }
};

Game.prototype._addClickListener = function() {
    $('#game')
        .contextmenu($.proxy(function() {
            return this._isFinished;
        }, this))
        .mouseup($.proxy(function(event) {
            var node = $(event.target);
            if (node.attr('id') == 'restart') {
                this._onRestarted();
                return false;
            }
            if (this._isFinished) {
                return false;
            }
            var x = node.data('x');
            var y = node.data('y');
            if (x != null && y != null) {
                this._onCellClick(x, y, event.which == 3);
            }
            return false;
        }, this));
};

Game.prototype._removeClickListener = function() {
    $('#game').unbind();
};

Game.prototype.init = function(width, height) {
    this._width = null;
    this._height = null;
    this._field = {};
    this._mined = [];
    this._isFinished = false;
    this._createField(width, height);
    this._createFieldTable(width, height);
    this._addClickListener();
    this.isInitialized = true;
};

Game.prototype.deinit = function() {
    this._resetDom();
    this._removeClickListener();
    this.isInitialized = false;
};

Game.prototype.show = function() {
    $('#game').show();
};

Game.prototype.hide = function() {
    $('#game').hide();
};
