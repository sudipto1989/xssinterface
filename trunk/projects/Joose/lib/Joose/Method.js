/*
 * A class for methods
 * Originally defined in Joose.js
 */

Class("Joose.Method", {
	methods: {
		
		// creates a new method object with the same name
		_makeWrapped: function (func) {
			return this.meta.instantiate(this.getName(), func); // Should there be , this.getProps() ???
		},
		
		around: function (func) {
			var orig = this.getBody();
			return this._makeWrapped(function () {
				var me = this;
				var bound = function () { return orig.apply(me, arguments) }
				return func.apply(this, Joose.A.concat([bound], arguments))
			})			
		},
		before: function (func) {
			var orig = this.getBody();
			return this._makeWrapped(function () {
				func.apply(this, arguments)
				return orig.apply(this, arguments);
			})		
		},
		after: function (func) {
			var orig = this.getBody();
			return this._makeWrapped(function () {
				var ret = orig.apply(this, arguments);
				func.apply(this, arguments);
				return ret
			})
		},
		
		override: function (func) {
			var orig = this.getBody();
			return this._makeWrapped(function () {
				var me      = this;
				var bound   = function () { return orig.apply(me, arguments) }
				var before  = this.SUPER;
				this.SUPER  = bound;
				var ret     = func.apply(this, arguments);
				this.SUPER  = before;
				return ret
			})			
		},
		
		augment: function (func) {
			var orig = this.getBody();
			orig.source = orig.toString();
			return this._makeWrapped(function () {
				var exe       = orig;
				var me        = this;
				var inner     = func
				inner.source  = inner.toString();
				if(!this.__INNER_STACK__) {
					this.__INNER_STACK__ = [];
				};
				this.__INNER_STACK__.push(inner)
				var before    = this.INNER;
				this.INNER    = function () {return  me.__INNER_STACK__.pop().apply(me, arguments) };
				var ret       = orig.apply(this, arguments);
				this.INNER    = before;
				return ret
			})
		}
	}
})