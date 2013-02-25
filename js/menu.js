var Menu = function(onDifficultySelected) {
    this._node = $('#menu');
    this._onDifficultySelected = onDifficultySelected;
};

Menu.prototype._addClickListener = function() {
    this._node.click($.proxy(function(event) {
        var id = $(event.target).attr('id');
        if (id == 'start-baby') {
            this._onDifficultySelected('baby');
        }
        if (id == 'start-easy') {
            this._onDifficultySelected('easy');
        }
        if (id == 'start-normal') {
            this._onDifficultySelected('normal');
        }
        if (id == 'start-hard') {
            this._onDifficultySelected('hard');
        }
        if (id == 'start-insane') {
            this._onDifficultySelected('insane');
        }
    }, this));
};

Menu.prototype._removeClickListener = function() {
    this._node.unbind('click');
};

Menu.prototype.show = function() {
    this._addClickListener();
    this._node.show();
};

Menu.prototype.hide = function() {
    this._node.hide();
    this._removeClickListener();
};
