var Menu = function(onDifficultSelected) {
    this._node = $('#menu');
    this._onDifficultSelected = onDifficultSelected;
};

Menu.prototype._addClickListener = function() {
    this._node.click($.proxy(function(event) {
        var id = $(event.target).attr('id');
        if (id == 'start-easy') {
            this._onDifficultSelected('easy');
        }
        if (id == 'start-normal') {
            this._onDifficultSelected('normal');
        }
        if (id == 'start-hard') {
            this._onDifficultSelected('hard');
        }
        if (id == 'start-insane') {
            this._onDifficultSelected('insane');
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
