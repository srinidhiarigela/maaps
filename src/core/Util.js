/*
 * L.Util is a namespace for various utility functions.
 */

L.Util = {
	extend: function (/*Object*/ dest) /*-> Object*/ {	// merge src properties into dest
		var sources = Array.prototype.slice.call(arguments, 1);
		for (var j = 0, len = sources.length, src; j < len; j++) {
			src = sources[j] || {};
			for (var i in src) {
				if (src.hasOwnProperty(i)) {
					dest[i] = src[i];
				}
			}
		}
		return dest;
	},

	// Create an object based on an existing object (effectively make methods and props accessible. Properties can not be modified on the original object) copied from Spine.js
	clone: Object.create || function (o) { // (object) -> object
		var Func;
		Func = function () {};
		Func.prototype = o;
		return new Func();
	},

	bind: function (fn, obj) { // (Function, Object) -> Function
		var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
		return function () {
			return fn.apply(obj, args || arguments);
		};
	},

	stamp: (function () {
		var lastId = 0, key = '_leaflet_id';
		return function (/*Object*/ obj, forceId) {
			/*jshint eqeqeq: false, eqnull: true */
			obj[key] = forceId != null ? forceId : // assign an id when forceId not null or undefined
				obj[key] != null ? obj[key] : ++lastId; // allow 0 as a key as well (but not null or undefined)
			return obj[key];
		};
	}()),

	limitExecByInterval: function (fn, time, context) {
		var lock, execOnUnlock;

		return function wrapperFn() {
			var args = arguments;

			if (lock) {
				execOnUnlock = true;
				return;
			}

			lock = true;

			setTimeout(function () {
				lock = false;

				if (execOnUnlock) {
					wrapperFn.apply(context, args);
					execOnUnlock = false;
				}
			}, time);

			fn.apply(context, args);
		};
	},

	falseFn: function () {
		return false;
	},

	formatNum: function (num, digits) {
		var pow = Math.pow(10, digits || 5);
		return Math.round(num * pow) / pow;
	},

	splitWords: function (str) {
		return str.replace(/^\s+|\s+$/g, '').split(/\s+/);
	},

	setOptions: function (obj, options) {
		obj.options = L.Util.extend({}, obj.options, options);
		return obj.options;
	},

	getParamString: function (obj) {
		var params = [];
		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				params.push(i + '=' + obj[i]);
			}
		}
		return '?' + params.join('&');
	},

	template: function (str, data) {
		return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
			var value = data[key];
			if (!data.hasOwnProperty(key)) {
				throw new Error('No value provided for variable ' + str);
			}
			return value;
		});
	},

	emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
};

(function () {

	function getPrefixed(name) {
		var i, fn,
			prefixes = ['webkit', 'moz', 'o', 'ms'];

		for (i = 0; i < prefixes.length && !fn; i++) {
			fn = window[prefixes[i] + name];
		}

		return fn;
	}

	function timeoutDefer(fn) {
		return window.setTimeout(fn, 1000 / 60);
	}

	var requestFn = window.requestAnimationFrame ||
			getPrefixed('RequestAnimationFrame') || timeoutDefer;

	var cancelFn = window.cancelAnimationFrame ||
			getPrefixed('CancelAnimationFrame') ||
			getPrefixed('CancelRequestAnimationFrame') ||
			function (id) {
				window.clearTimeout(id);
			};


	L.Util.requestAnimFrame = function (fn, context, immediate, element) {
		fn = L.Util.bind(fn, context);

		if (immediate && requestFn === timeoutDefer) {
			fn();
		} else {
			return requestFn.call(window, fn, element);
		}
	};

	L.Util.cancelAnimFrame = function (id) {
		if (id) {
			cancelFn.call(window, id);
		}
	};

}());
