plan(16)

diag("Roles")

Class("Comparable", {meta: Joose.Role});
ok(Comparable, "We can make a Role");
ok(Comparable.meta.meta.isa(Joose.Role), "Our meta class isa Role")

Class("Eq", {meta: Joose.Role});
requires("isEqual");

methods({
	notEqual: function (para) {
		return !this.isEqual(para)
	}
})

Class("Currency", {
	does: Eq,
	has: {value: {is: rw}},

	methods: {
		
		isEqual: function (cur) {
			return this.getValue() == cur.getValue()
		}	
	}
})

check()

var a = new Currency({value: 1});
var b = new Currency({value: 1});
var c = new Currency({value: 2});

ok(a.getValue() == 1, "Value set correctly")
ok(b.getValue() == 1, "Value set correctly")
ok(c.getValue() == 2, "Value set correctly")

ok(a.isEqual(b), "Equality works")
ok(b.isEqual(a), "Equality works in both directions")
ok(!a.isEqual(c), "Equality works for unequal things")

ok(a.notEqual(c), "Role composition works and notEqual works")
ok(!a.notEqual(b), "Role composition works and notEqual works for equal things")

Class("RuntimeRole", {
	meta: Joose.Role,
	methods: {
		appliedAtRuntime: function () { return true }
	}
})

RuntimeRole.meta.apply(a);
ok(a.appliedAtRuntime, "object got method from runtime role")
ok(a.appliedAtRuntime(), "object can call method");
ok(!b.appliedAtRuntime, "other object does not have it");
ok(!new Currency(2).appliedAtRuntime, "New object do not have it either")
ok(a.meta.className() != "Currency", "a is no longer of exact type Currency: "+a.meta.className());
ok(a.meta.isa(Currency), "but a is still a currency")


endTests()