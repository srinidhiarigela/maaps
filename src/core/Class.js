import * as Util from './Util';

// @class Class
// @aka L.Class

// @section
// @uninheritable

// Thanks to John Resig and Dean Edwards for inspiration!


export class Class {
	constructor(callHooks = true) {
		// call all constructor hooks
		if (callHooks) {
			this.callInitHooks();
		}
	}

	// @function mergeOptions(options: Object): this
	// [Merges `options`](#class-options) into the defaults of the class.
	static mergeOptions(options) {
		Util.extend(this.prototype.options, options);
		return this;
	}

	// @function extend(props: Object): Function
	// [Extends the current class](#class-inheritance) given the properties to be included.
	// Returns a Javascript function that is a class constructor (to be called with `new`).
	static extend(props) {
		var NewClass = function () {

			// call the constructor
			if (this.initialize) {
				this.initialize.apply(this, arguments);
			}

			// call all constructor hooks
			this.callInitHooks();
		};

		var parentProto = NewClass.__super__ = this.prototype;

		var proto = Util.create(parentProto);
		proto.constructor = NewClass;

		NewClass.prototype = proto;

		// mix static properties into the class
		if (props.statics) {
			staticHandler(NewClass, props.statics);
			delete props.statics;
		}

		staticHandler(NewClass, (this.__super__ || {}).constructor || {});
		staticHandler(NewClass, this.__proto__ || {});
		staticHandler(NewClass, this);

		// mix includes into the prototype
		if (props.includes) {
			Util.extend(proto, ...props.includes);
			delete props.includes;
		}

		// merge options
		if (proto.options) {
			props.options = Util.extend(Util.create(proto.options), props.options);
		}

		// mix given properties into the prototype
		Util.extend(proto, props);

		return NewClass;
	}

	// @function include(properties: Object): this
	// [Includes a mixin](#class-includes) into the current class.
	static include(props) {
		Util.extend(this.prototype, props);
		return this;
	}

	// @function addInitHook(fn: Function): this
	// Adds a [constructor hook](#class-constructor-hooks) to the class.
	static addInitHook(fn, ...args) { // (Function) || (String, args...)
		var init = typeof fn === 'function' ? fn : function () {
			this[fn].apply(this, args);
		};

		this.prototype._initHooks = this.prototype._initHooks || [];
		this.prototype._initHooks.push(init);
		return this;
	}

	static setDefaultOptions(options) {
		if (!this.prototype.options) {
			this.prototype.options = Util.extend({}, options);
		} else {
			this.prototype.options = Util.extend({}, this.prototype.options, options);
		}
	}

	callInitHooks() {
		if (this._initHooksCalled || !this._initHooks) { return; }

		this._initHooksCalled = true;

		console.log(this._initHooks);

		for (var i = 0, len = this._initHooks.length; i < len; i++) {
			this._initHooks[i].call(this);
		}
	}
}

const __NON_STATIC__ = ['prototype', '__proto__', '__super__', ...Object.getOwnPropertyNames(Object.prototype), ...Object.getOwnPropertyNames((() => { }).__proto__), ...Object.getOwnPropertyNames(class A { }.__proto__)];

function staticHandler(target, parent) {
	(Object.getOwnPropertyNames(parent) || []).filter(v => !__NON_STATIC__.includes(v)).forEach(k => {
		if (!target[k]) {
			target[k] = parent[k];
		}
	});
}
