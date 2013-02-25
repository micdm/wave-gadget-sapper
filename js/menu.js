var Menu = function(onDifficultySelected) {
    this._node = $('#menu');
    this._onDifficultySelected = onDifficultySelected;
};

Menu.prototype.LEVELS = ['baby', 'easy', 'normal', 'hard', 'insane'];

Menu.prototype._addClickListener = function() {
    for (var i in this.LEVELS) {
        var level = this.LEVELS[i];
        this._node.find('#start-' + level).click($.proxy(function(level) {
            return function() {
                this._onDifficultySelected(level);
                return false;
            };
        }(level), this));
    }
};

Menu.prototype._removeClickListener = function() {
    for (var i in this.LEVELS) {
        var level = this.LEVELS[i];
        this._node.find('#start-' + level).unbind('click');
    }
};

Menu.prototype.show = function() {
    this._addClickListener();
    this._node.show();
};

Menu.prototype.hide = function() {
    this._node.hide();
    this._removeClickListener();
};
