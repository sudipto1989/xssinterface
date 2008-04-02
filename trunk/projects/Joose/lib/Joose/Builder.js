// Could be refactored to a Joose.Class (by manually building the class)

/**
 * Assorted tools to build a class
 * 
 * The functions Class(), Module() and joosify() are global. All other methods
 * may be used inside Class definitons like this:
 * 
 * <pre>
 * Module("com.test.me", function () {
 *   Class("MyClass", {
 *     isa: SuperClass,
 *     methods: {
 *       hello: function () { alert('world') }
 *     }
 *   })
 * })
 * </pre>
 * @constructor
 */
Joose.Builder = function () {
	/** @ignore */
	this.globalize = function () {
		Joose.O.each(Joose.Builder.Builders, function (func, name) {
			joose.top[name] = func
		});
	}
}

/** @ignore */
Joose.Builder.Builders = {
	/**
	 * Global function that creates or extends a module
	 * @function
	 * @param name {string} Name of the module
	 * @param functionThatCreatesClassesAndRoles {function} Pass a function reference that calls Class(...) as often as you want. The created classes will be put into the module
	 * @name Module
	 */	
	/** @ignore */
	Module: function (name, functionThatCreatesClassesAndRoles) {
		Joose.Module.setup(name, functionThatCreatesClassesAndRoles)
	},
	/**
	 * Global function that creates a class (If the class already exists it will be extended)
	 * @function
	 * @param name {string} Name of the the class
	 * @param props {object} Declaration if the class. The object keys are used as builder methods. The values are passed as arguments to the builder methods.
	 * @name Class
	 */	
	/** @ignore */
	Class:	function (name, props) {
		
		var c = null;
		
		if(name) {
			var className  = name;
			if(joose.currentModule) {
				className  = joose.currentModule.getName() + "." + name
			}
			var root       = joose.top;
			var parts      = className.split(".")
		
			for(var i = 0; i < parts.length; i++) {
				root = root[parts[i]]
			}
			c = root;
		}

		if(c == null) {
			
			var metaClass   = Joose.Class;
			
			if(props && props.meta) {
				metaClass = props.meta
				delete props.meta
			}
			
			
			var aClass      = new metaClass();

			var c           = aClass.createClass(name, null, joose.currentModule)
			
			var className   = c.meta.className()
			
			if(name && className) {
				var root = joose.top;
				var n = new String(className);
				var parts = n.split(".");
				for(var i = 0; i < parts.length - 1; i++) {
					if(root[parts[i]] == null) {
						root[parts[i]] = {};
					}
					root = root[parts[i]];
				}
				root[parts[parts.length - 1]] = c
			}
			
		}
		joose.cc = c;
		if(props) {
			Joose.O.each(props, function (value, name) { 
				var builder = Joose.Builder.Builders[name];
				if(!builder) {
					throw "Called invalid builder "+name+" while creating class "+c.meta.name
				}
				var paras   = value;
				if(! (paras instanceof Array )) {
					paras = [value]
				}
				builder.apply(Joose.Builder, paras)
			})
		}
	},
	/**
	 * Global function to turn a regular JavaScript constructor into a Joose.Class
	 * @function
	 * @param name {string} Name of the class
	 * @param props {function} The constructor
	 * @name joosify
	 */	
	/** @ignore */
	joosify: function (standardClassName, standardClassObject) {
		var c         = standardClassObject;
		var metaClass = new Joose.Class();
		
		c.toString = function () { return joose.cc.meta.className() }
		c             = metaClass.createClass(standardClassName, c)
	
		var meta = c.meta;
	
		for(var name in standardClassObject.prototype) {
			if(name == "meta") {
				continue
			}
			var value = standardClassObject.prototype[name]
			if(typeof(value) == "function") {
				meta.addMethod(name, value)
			} else {
				var props = {};
				if(typeof(value) != "undefined") {
					props.init = value
				}
				meta.addAttribute(name, props)
			}
		}
	},
	
	/**
	 * Tells a role that the method name must be implemented by all classes that implement joose.cc role
	 * @function
	 * @param methodName {string} Name of the required method name
	 * @name requires
	 * @memberof Joose.Builder
	 */	
	/** @ignore */
	requires:	function (methodName) {
		if(!joose.cc.meta.meta.isa(Joose.Role)) { // XXX should joose.cc be does?
			throw("Keyword 'requires' only available classes with a meta class of type Joose.Role")
		}
		if(methodName instanceof Array) {
			Joose.A.each(methodName, function (name) {
				joose.cc.meta.addRequirement(name)
			})
		} else {
			joose.cc.meta.addRequirement(methodName)
		}
	},
	
	/**
	 * @ignore
	 */	
	check:	function () {
		joose.cc.meta.validateClass()
	},
	
	/**
	 * Class builder method
	 * Defines the super class of the class
	 * @function
	 * @param classObject {Joose.Class} The super class
	 * @name isa
	 * @memberof Joose.Builder
	 */	
	/** @ignore */
	isa:	function (classObject) {
		joose.cc.meta.addSuperClass(classObject)
	},
	/**
	 * Class builder method
	 * Defines a role for the class
	 * @function
	 * @param classObject {Joose.Role} The role
	 * @name does
	 * @memberof Joose.Builder
	 */	
	/** @ignore */
	does:	function (role) {
		if(role instanceof Array) {
			Joose.A.each(role, function (aRole) {
				joose.cc.meta.addRole(aRole)
			})
		} else {
			joose.cc.meta.addRole(role)
		}
		
	},
	
	/**
	 * Class builder method
	 * Defines attributes for the class
	 * @function
	 * @param classObject {object} Maps attribute names to properties (See Joose.Attribute)
	 * @name has
	 * @memberof Joose.Builder
	 */	
	/** @ignore */
	has:	function (map) {
		if(typeof map == "string") {
			var name  = arguments[0];
			var props = arguments[1];
			joose.cc.meta.addAttribute(name, props)
		} else { // name is a map
			var me = joose.cc;
			Joose.O.each(map, function (props, name) {
				me.meta.addAttribute(name, props)
			})
		}
	},
	
	/**
	 * @ignore
	 */	
	method: function (name, func, props) {
		joose.cc.meta.addMethod(name, func, props)
	},
	
	/**
	 * Class builder method
	 * Defines methods for the class
	 * @function
	 * @param classObject {object} Maps method names to function bodies
	 * @name methods
	 * @memberof Joose.Builder
	 */	
	/** @ignore */
	methods: function (map) {
		var me = joose.cc
		Joose.O.each(map, function (func, name) {
			me.meta.addMethod(name, func)
		})
	},
	
	/**
	 * Class builder method
	 * Defines class methods for the class
	 * @function
	 * @param classObject {object} Maps class method names to function bodies
	 * @name classMethods
	 * @memberof Joose.Builder
	 */	
	/** @ignore */
	classMethods: function (map) {
		var me = joose.cc
		Joose.O.each(map, function (func, name2) {
			me.meta.addMethodObject(new Joose.ClassMethod(name2, func))
		})
	},
	
	/**
	 * Class builder method
	 * Defines workers for the class (The class must have the meta class Joose.Gears)
	 * @function
	 * @param classObject {object} Maps method names to function bodies
	 * @name workers
	 * @memberof Joose.Builder
	 */	
	/** @ignore */
	workers: function (map) {
		var me = joose.cc
		Joose.O.each(map, function (func, name) {
			me.meta.addWorker(name, func)
		})
	},
	
	/**
	 * Class builder method
	 * Defines before method modifieres for the class.
	 * The defined method modifiers will be called before the method of the super class.
	 * The return value of the method modifier will be ignored
	 * @function
	 * @param classObject {object} Maps method names to function bodies
	 * @name before
	 * @memberof Joose.Builder
	 */	
	/** @ignore */
	before: function(map) {
		var me = joose.cc
		Joose.O.each(map, function (func, name) {
			me.meta.wrapMethod(name, "before", func);
		}) 
	},
	
	/**
	 * Class builder method
	 * Defines after method modifieres for the class.
	 * The defined method modifiers will be called after the method of the super class.
	 * The return value of the method modifier will be ignored
	 * @function
	 * @param classObject {object} Maps method names to function bodies
	 * @name after
	 * @memberof Joose.Builder
	 */	
	/** @ignore */
	after: function(map) {
		var me = joose.cc
		Joose.O.each(map, function (func, name) {
			me.meta.wrapMethod(name, "after", func);
		}) 
	},
	
	/**
	 * Class builder method
	 * Defines around method modifieres for the class.
	 * The defined method modifiers will be called instead of the method of the super class.
	 * The orginial function is passed as an initial parameter to the new function
	 * @function
	 * @param classObject {object} Maps method names to function bodies
	 * @name around
	 * @memberof Joose.Builder
	 */	
	/** @ignore */
	around: function(map) {
		var me = joose.cc
		Joose.O.each(map, function (func, name) {
			me.meta.wrapMethod(name, "around", func);
		}) 
	},
	
	/**
	 * Class builder method
	 * Defines override method modifieres for the class.
	 * The defined method modifiers will be called instead the method of the super class.
	 * You can call the method of the super class by calling joose.cc.SUPER(para1, para2)
	 * @function
	 * @param classObject {object} Maps method names to function bodies
	 * @name override
	 * @memberof Joose.Builder
	 */	
	/** @ignore */
	override: function(map) {
		var me = joose.cc
		Joose.O.each(map, function (func, name) {
			me.meta.wrapMethod(name, "override", func);
		}) 
	},
	
	/**
	 * Class builder method
	 * Defines augment method modifieres for the class.
	 * These method modifiers will be called in "most super first" order
	 * The methods may call joose.cc.INNER() to call the augement method in it's sup class.
	 * @function
	 * @param classObject {object} Maps method names to function bodies
	 * @name augment
	 * @memberof Joose.Builder
	 */	
	/** @ignore */
	augment: function(map) {
		var me = joose.cc
		Joose.O.each(map, function (func, name) {
			me.meta.wrapMethod(name, "augment", func, function () {
				me.meta.addMethod(name, func)
			});
		}) 
	},
	
	/**
	 * @ignore
	 */	
	decorates: function(map) {
		var me = joose.cc
		Joose.O.each(map, function (classObject, attributeName) {
			me.meta.decorate(classObject, attributeName)
		}) 
	},
	
	/** @ignore */
	rw: "rw",
	/** @ignore */
	ro: "ro"
	 
};

joose.init();