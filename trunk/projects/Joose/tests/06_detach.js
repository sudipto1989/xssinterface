plan(7)


Class("TestClass", {
	methods: {
		one: function () { return 1 }
	}
})

Class("SubClass", {
	isa: TestClass,
	methods: {
		two: function () { return 2 }
	}
})

var o1 = new SubClass();
var o2 = new SubClass();
ok(o1.one() == 1 && o1.two() == 2, "Methods return correct results");
ok(o2.one() == 1 && o2.two() == 2, "Methods return correct results");

o2.detach()

o2.meta.addMethod("one", function () { return 3 });

ok(o1.one() == 1 && o1.two() == 2, "Methods return correct results for non detached object after detach of object of same class");
ok(o2.one() == 3 && o2.two() == 2, "Methods return correct results in detached object");

var o3 = o1.meta.instantiate()
var o4 = o2.meta.instantiate()

var o5 = new SubClass();

ok(o5.one() == 1 && o5.two() == 2, "Methods of new object return correct results for non detached object after detach of object of same class");
ok(o3.one() == 1 && o3.two() == 2, "Methods of new object return correct results for non detached object after detach of object of same class");
ok(o4.one() == 3 && o4.two() == 2, "Methods of new object return correct results in detached object");



endTests()