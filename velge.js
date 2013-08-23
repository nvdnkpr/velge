(function() {
  window.Velge = (function() {
    function Velge($container, options) {
      if (options == null) {
        options = {};
      }
      this.store = new Velge.Store();
      this.ui = new Velge.UI($container, this, this.store);
      this._preloadChoices(options.chosen || [], true);
      this._preloadChoices(options.choices || [], false);
    }

    Velge.prototype.setup = function() {
      this.ui.setup();
      return this;
    };

    Velge.prototype.addChosen = function(choice) {
      choice.chosen = true;
      this.store.push(choice);
      this.ui.renderChosen();
      return this;
    };

    Velge.prototype.addChoice = function(choice) {
      this.store.push(choice);
      this.ui.renderChoices();
      return this;
    };

    Velge.prototype.remChoice = function(choice) {
      this.store["delete"](choice);
      this.ui.renderChoices();
      return this;
    };

    Velge.prototype.remChosen = function(choice) {
      this.store.update(choice, {
        chosen: false
      });
      this.ui.renderChosen();
      this.ui.renderChoices();
      return this;
    };

    Velge.prototype._preloadChoices = function(choices, isChosen) {
      var choice, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = choices.length; _i < _len; _i++) {
        choice = choices[_i];
        choice.chosen = isChosen;
        _results.push(this.store.push(choice));
      }
      return _results;
    };

    return Velge;

  })();

  Velge.Util = (function() {
    function Util() {}

    Util.autoScroll = function($element, $container, padding) {
      var baseTop, cHeight, eHeight, offset, scroll;
      if (padding == null) {
        padding = 10;
      }
      eHeight = $element.height();
      cHeight = $container.height();
      offset = $element.offset().top - $container.offset().top;
      scroll = $container.scrollTop();
      baseTop = scroll + offset + padding;
      if (offset < 0) {
        return $container.scrollTop(baseTop);
      } else if (offset + (eHeight > cHeight)) {
        return $container.scrollTop(baseTop - cHeight + eHeight);
      }
    };

    return Util;

  })();

  Velge.UI = (function() {
    UI.prototype.KEYCODES = {
      TAB: 9,
      ENTER: 13,
      ESCAPE: 27,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      COMMA: 188
    };

    UI.prototype.wrapTemplate = "<div class='velge'>\n  <ul class='velge-list'></ul>\n  <input type='text' autocomplete='off' placeholder='Add Tags' class='velge-input placeholder' />\n  <span class='velge-trigger'></span>\n  <ol class='velge-dropdown'></ol>\n</div>";

    UI.prototype.chosenTemplate = "<li>\n  <span class='name'>{{name}}</span>\n  <span class='remove'>&times;</span>\n</li>";

    UI.prototype.choiceTemplate = "<li>{{name}}</li>";

    function UI($container, velge, store) {
      this.$container = $container;
      this.velge = velge;
      this.store = store;
      this.index = -1;
    }

    UI.prototype.setup = function() {
      this.render();
      this.bindDomEvents();
      this.renderChoices();
      this.renderChosen();
      return this;
    };

    UI.prototype.bindDomEvents = function() {
      var keycodes, self;
      keycodes = this.KEYCODES;
      self = this;
      this.$wrapper.on('keydown.velge', '.velge-input', function(event) {
        var callback;
        switch (event.which) {
          case keycodes.ESCAPE:
            self.closeDropdown();
            return self.$input.val('');
          case keycodes.DOWN:
            self.openDropdown();
            self.cycle('down');
            return self.renderHighlighted();
          case keycodes.UP:
            self.openDropdown();
            self.cycle('up');
            return self.renderHighlighted();
          default:
            callback = function() {
              self.index = -1;
              return self.filterChoices(self.$input.val());
            };
            setTimeout(callback, 10);
            return self.openDropdown();
        }
      });
      this.$wrapper.on('click.velge', '.velge-list .remove', function(event) {
        var $target;
        $target = $(event.currentTarget).parent().find('.name');
        self.unchoose($target.text());
        self.renderChoices();
        return self.renderChosen();
      });
      this.$wrapper.on('blur.velge', '.velge-input', function(event) {
        var callback;
        clearTimeout(self.closeTimeout);
        callback = function() {
          self.closeDropdown();
          return self.blurInput();
        };
        return self.closeTimeout = setTimeout(callback, 75);
      });
      this.$wrapper.on('click.velge', '.velge-trigger', function(event) {
        clearTimeout(self.closeTimeout);
        return self.toggleDropdown();
      });
      return this.$wrapper.on('click.velge', '.velge-dropdown li', function(event) {
        var $target;
        $target = $(event.currentTarget);
        self.choose($target.text());
        self.renderChoices();
        self.renderChosen();
        return self.closeDropdown();
      });
    };

    UI.prototype.choose = function(name) {
      return this.store.update({
        name: name
      }, {
        chosen: true
      });
    };

    UI.prototype.unchoose = function(name) {
      return this.store.update({
        name: name
      }, {
        chosen: false
      });
    };

    UI.prototype.render = function() {
      this.$wrapper = $(this.wrapTemplate);
      this.$list = $('.velge-list', this.$wrapper);
      this.$input = $('.velge-input', this.$wrapper);
      this.$dropdown = $('.velge-dropdown', this.$wrapper);
      return this.$container.append(this.$wrapper);
    };

    UI.prototype.renderChosen = function() {
      var choice, choices;
      choices = (function() {
        var _i, _len, _ref, _results;
        _ref = this.store.filter({
          chosen: true
        });
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          choice = _ref[_i];
          _results.push(this.chosenTemplate.replace('{{name}}', choice.name));
        }
        return _results;
      }).call(this);
      return this.$list.empty().html(choices);
    };

    UI.prototype.renderChoices = function(filtered) {
      var choice, choices;
      filtered || (filtered = this.store.filter({
        chosen: false
      }));
      choices = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = filtered.length; _i < _len; _i++) {
          choice = filtered[_i];
          _results.push(this.choiceTemplate.replace('{{name}}', choice.name));
        }
        return _results;
      }).call(this);
      return this.$dropdown.empty().html(choices);
    };

    UI.prototype.renderHighlighted = function() {
      var $choice, index, li, selected, _i, _len, _ref, _results;
      selected = this.index;
      _ref = this.$dropdown.find('li');
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        li = _ref[index];
        $choice = $(li);
        $choice.toggleClass('highlighted', index === selected);
        if (index === selected) {
          _results.push(Velge.Util.autoScroll($choice, this.$dropdown));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    UI.prototype.openDropdown = function() {
      if (!this.store.isEmpty()) {
        return this.$dropdown.addClass('open');
      }
    };

    UI.prototype.closeDropdown = function() {
      return this.$dropdown.removeClass('open');
    };

    UI.prototype.toggleDropdown = function() {
      if (this.$dropdown.hasClass('open')) {
        return this.closeDropdown();
      } else {
        return this.openDropdown();
      }
    };

    UI.prototype.blurInput = function() {
      return this.$input.val('');
    };

    UI.prototype.filterChoices = function(value) {
      var matching;
      matching = this.store.fuzzy(value);
      this.renderChoices(matching);
      return this.$dropdown.toggleClass('open', matching.length !== 0);
    };

    UI.prototype.cycle = function(direction) {
      var length;
      if (direction == null) {
        direction = 'down';
      }
      length = this.$dropdown.find('li').length;
      if (length > 0) {
        return this.index = direction === 'down' ? (this.index + 1) % length : (this.index + (length - 1)) % length;
      } else {
        return this.index = -1;
      }
    };

    return UI;

  })();

  Velge.Store = (function() {
    function Store() {
      this.arr = [];
      this.map = {};
    }

    Store.prototype.objects = function() {
      return this.arr;
    };

    Store.prototype.isEmpty = function() {
      return this.arr.length === 0;
    };

    Store.prototype.normalize = function(value) {
      return String(value).toLowerCase().replace(/(^\s*|\s*$)/g, '');
    };

    Store.prototype.sanitize = function(value) {
      return value.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
    };

    Store.prototype.push = function(choice) {
      choice.name = this.normalize(choice.name);
      choice.chosen || (choice.chosen = false);
      if (this.find(choice) == null) {
        this.arr.push(choice);
        this.map[choice.name] = choice;
      }
      this.sort();
      return this;
    };

    Store.prototype["delete"] = function(toRemove) {
      var choice, index, _i, _len, _ref;
      _ref = this.arr;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        choice = _ref[index];
        if (choice.name === toRemove.name) {
          this.arr.splice(index, 1);
          break;
        }
      }
      delete this.map[toRemove.name];
      return this;
    };

    Store.prototype.update = function(toUpdate, values) {
      var choice, key, value, _results;
      choice = this.find(toUpdate);
      _results = [];
      for (key in values) {
        value = values[key];
        _results.push(choice[key] = value);
      }
      return _results;
    };

    Store.prototype.find = function(toFind) {
      return this.map[toFind.name];
    };

    Store.prototype.fuzzy = function(value) {
      var choice, query, regex, _i, _len, _ref, _results;
      value = this.sanitize(value);
      query = /^\s*$/.test(value) ? '.*' : value;
      regex = RegExp(query, 'i');
      _ref = this.arr;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        choice = _ref[_i];
        if (regex.test(choice.name)) {
          _results.push(choice);
        }
      }
      return _results;
    };

    Store.prototype.filter = function(options) {
      var choice, _i, _len, _ref, _results;
      if (options == null) {
        options = {};
      }
      options.chosen || (options.chosen = false);
      _ref = this.arr;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        choice = _ref[_i];
        if (choice.chosen === options.chosen) {
          _results.push(choice);
        }
      }
      return _results;
    };

    Store.prototype.sort = function() {
      this.arr = this.arr.sort(function(a, b) {
        if (a.name > b.name) {
          return 1;
        } else {
          return -1;
        }
      });
      return this.arr;
    };

    return Store;

  })();

}).call(this);
