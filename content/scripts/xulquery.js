(function(window) {
var XULQuery = function(selector) {
    return new XULQuery.fn.init(selector);
};

// Queue onload events and run them in sequence
XULQuery._onload = [];
window.addEventListener('load', function(e) {
	XULQuery._onload.forEach(function(f) {
		f.call(window, e);
	});
}, false);

XULQuery.fn = XULQuery.prototype = {
	// Constructs a XULQuery object
	init: function(selector) {
		// Functions go to the onload queue
		if (typeof selector === "function") {
			XULQuery._onload.push(selector);
			return XULQuery;
		}

        // Handle DOMNodes
		if (selector.nodeType) {
			this[0] = selector;
			this.length++;
		}

        // Handle an array of DOMNodes
        if (Array.isArray(selector)) {
            XULQuery.merge(this, selector);
        }

		// Handle CSS selectors
		if (typeof selector === 'string') {
			XULQuery.merge(this, document.querySelectorAll(selector));
		}

        return this;
	},
};

// Extend an object with values from another object
// If a single argument is given, extend xulquery itself
XULQuery.fn.extend = XULQuery.extend = function() {
    var options, name,
    target = arguments[0] || {},
    k = 1;

    // Target is xulquery
    if (arguments.length === 1) {
        target = this;
        k--;
    }

    // TODO: Handle deep copy
    for (; k < arguments.length; k++) {
        if ((options = arguments[k]) != null) {
            for (name in options) {
                if (options.hasOwnProperty(name)) {
                    target[name] = options[name];
                }
            }
        }
    }

    return target;
};

XULQuery.fn.extend({
    // Find child elements matching selector
    find: function(selector) {
        var matches = [];
        this.each(function(elem) {
            XULQuery.merge(matches, elem.querySelectorAll(selector));
        });

        return XULQuery(matches);
    },

    toArray: function() {
        return Array.prototype.slice.call(this, 0);
    },

    filter: function(func, thisObj) {
        var elems = this.toArray().filter(func, thisObj);
        return XULQuery(elems);
    },

	// Binds an event
	bind: function(event, fn) {
		this.each(function(elem) {
			elem.addEventListener(event, fn, false);
		});
	},

    attr: function(name, value) {
        if (value) {
            this[0].setAttribute(name, value);
            return this;
        } else {
            return this[0].getAttribute(name);
        }
    },

	// Gets the value of the first matched element, or sets
	// it to the given value
	val: function(value) {
		var elem = this[0];
		if (elem) {
			if (value !== undefined) {
				elem.value = value;
			} else {
				return elem.value;
			}
		}

		return undefined;
	},

    // Retrieves the text content of all matched nodes, or sets the text
    // to the specified value.
    text: function(value) {
        if (value) {
            this.each(function(e) {
                e.textContent = value;
            });

            return this;
        } else {
            var ret = '';
            this.each(function(e) {
                ret += e.textContent;
            });

            return ret;
        }
    },

    // Retrieves the html content of all matched nodes, or sets the html
    // to the specified value.
    html: function(value) {
        if (value) {
            this.each(function(e) {
                e.innerHTML = value;
            });

            return this;
        } else {
            var ret = '';
            this.each(function(e) {
                ret += e.innerHTML;
            });

            return ret;
        }
    },

	// Number of matched elements
	length: 0,
	each: function(func, thisObj) {
		for (var k = 0; k < this.length; k++) {
			if (this[k] !== undefined) {
				func.call(thisObj, this[k], k, this);
			}
		}
	},

    addClass: function(nClass) {
        this.each(function(elem) {
            elem.classList.add(nClass);
        });

        return this;
    },

    removeClass: function(nClass) {
        this.each(function(elem) {
            if (nClass) {
                elem.classList.remove(nClass);
            } else {
                elem.className = '';
            }
        });

        return this;
    },

    toggleClass: function(nClass) {
        this.each(function(elem) {
            elem.classList.toggle(nClass);
        });

        return this;
    },
});

XULQuery.extend({
    // Merges two arrays together
	merge: function(first, second) {
		var fst = first.length, snd = 0;
		for (var sndLen = second.length; snd < sndLen; snd++) {
			first[fst++] = second[snd];
		}
		first.length = fst;

		return first;
	},

    // Returns true if parent contains child
    contains: function(parent, child) {
        return !!(parent.compareDocumentPosition(child) & 16);
    },
});

// Give the init function the XULQuery prototype for instances
XULQuery.fn.init.prototype = XULQuery.fn;

window.XULQuery = window.$ = XULQuery;
})(this);