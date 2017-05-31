# Functional-Light JavaScript
# Chapter 7: Closure vs Object

多年以前，Anton van Straaten 编写了一个名声显赫而且广为流传的 [禅家公案](https://www.merriam-webster.com/dictionary/koan)，描绘并挑起了闭包与对象之间一种重要的紧张状态。

> 庄严的 Qc Na 大师在与他的学生 Anton 一起散步。Anto 希望促成一次与师傅的讨论，他说：“师傅，我听说对象是个非常好的东西 —— 真的吗？” Qc Na 同情地看着他的学生回答道，“笨学生 —— 对象只不过是一种简单的闭包。”
>
> 被训斥的 Anton 告别他的师父返回自己的房间，开始有意地学习闭包。他仔细地阅读了整部 “Lamda：终极……” 系列书籍以及其姊妹篇，并且使用一个基于闭包的对象系统实现了一个小的 Scheme 解释器。他学到了很多，希望向他的师父报告自己的进步。
>
> 当他再次与 Qc Na 散步时，Anton 试图给师傅一个好印象，说：“师父，经过勤奋的学习，现在我我理解了对象确实是简化的闭包。” Qc Na 用他的拐杖打了 Anton 作为回应，他说：“你到底什么时候才能明白？闭包只是简化的对象。” 此时此刻，Anton 茅塞顿开。
>
> Anton van Straaten 6/4/2003
>
> http://people.csail.mit.edu/gregs/ll1-discuss-archive-html/msg03277.html

原版的文章，虽然简短，但是拥有更多关于其起源与动机的背景内容，我强烈建议你阅读这篇文章，来为本章的学习正确地设置你的思维模式。

我见过许多读过这段公案的人都对它的聪明机智表现出一丝假笑，然后并没有改变太多他们的想法就离开了。然而，一个公案的目的（从佛教禅的角度而言）就是刺激读者对其中矛盾的真理上下求索。所以，回头再读一遍。然后再读一遍。

它到底是什么？闭包是简化的对象，或者对象是简化的闭包？或都不是？或都是？难道唯一重点是闭包和对象在某种意义上是等价的？

而且这与函数式编程有什么关系？拉一把椅子深思片刻。如果你乐意的话，这一章将是一次有趣的绕路远足。

## The Same Page

首先，让我们确保当我们谈到闭包和对象时我们都在统一轨道上。显然我们的语境是 JavaScript 如何应对这两种机制，而且具体来说谈到的是简单的函数闭包（参见第二章的“保持作用域”）与简单对象（键值对的集合）。

一个简单的函数闭包：

```js
function outer() {
	var one = 1;
	var two = 2;

	return function inner(){
		return one + two;
	};
}

var three = outer();

three();			// 3
```

一个简单的对象：

```js
var obj = {
	one: 1,
	two: 2
};

function three(outer) {
	return outer.one + outer.two;
}

three( obj );		// 3
```

当你提到“闭包”时，很多人都会都会在脑中唤起许多额外的东西，比如异步回调，甚至是带有封装的模块模式和信息隐藏。相似地，“对象”会把类带到思维中，`this`、原型、以及一大堆其他的工具和模式。

随着我们向前迈进，我们将小心地解说这种重要外部语境的一部分，但就目前来说，只要抓住“闭包”与“对象”的最简单的解释就好 —— 这将使我们的探索少一些困惑。

## Look Alike

闭包与对象是如何联系在一起的，这可能不太明显。所以让我们首先来探索一下它们的相似性。

为了框定这次讨论，让我简要地断言两件事：

1. 一个没有闭包的编程语言可以使用对象来模拟闭包。
2. 一个没有对象的编程语言可以使用闭包来模拟对象。

换句话说，我们可以认为闭包和对象是同一种东西的两种不同表现形式。

### State

考虑这段从上面引用的代码：

```js
function outer() {
	var one = 1;
	var two = 2;

	return function inner(){
		return one + two;
	};
}

var obj = {
	one: 1,
	two: 2
};
```

被 `inner()` 和对象 `obj` 封闭的两个作用域都包含两个状态元素：带有值 `1` 的 `one`，和带有值 `2` 的 `two`。在语法上和机制上，这些状态的表现形式是不同的。而在概念上，它们其实十分相似。

事实上，将一个对象表示为一个闭包，或者将一个闭包表示为一个对象是相当直接了当的。去吧，自己试一下：

```js
var point = {
	x: 10,
	y: 12,
	z: 14
};
```

你有没有想到过这样的东西？

```js
function outer() {
	var x = 10;
	var y = 12;
	var z = 14;

	return function inner(){
		return [x,y,z];
	}
};

var point = outer();
```

**注意：** `inner()` 函数在每次被调用时创建并返回一个新数组（也就是一个对象！）。这是因为 JS 没有给我们任何 `return` 多个值的能力，除非将它们封装在一个对象中。从技术上讲，这并不违背我们的闭包做对象的任务，因为这只是一个暴露/传送值的实现细节；状态追踪本身依然是无对象的。使用 ES6+ 的数组解构，我们可以在另一侧声明式地忽略这个临时中间数组：`var [x,y,z] = point()`。从一个开发者的人体工程学角度来说，这些值被分离地存储而且是通过闭包而非对象追踪的。

要是我们有一些嵌套的对象呢？

```js
var person = {
	name: "Kyle Simpson",
	address: {
		street: "123 Easy St",
		city: "JS'ville",
		state: "ES"
	}
};
```

我们可以使用嵌套的闭包来表示同种状态：

```js
function outer() {
	var name = "Kyle Simpson";
	return middle();

	// ********************

	function middle() {
		var street = "123 Easy St";
		var city = "JS'ville";
		var state = "ES";

		return function inner(){
			return [name,street,city,state];
		};
	}
}

var person = outer();
```

让我们实践一下从另一个方向走，闭包到对象：

```js
function point(x1,y1) {
	return function distFromPoint(x2,y2){
		return Math.sqrt(
			Math.pow( x2 - x1, 2 ) +
			Math.pow( y2 - y1, 2 )
		);
	};
}

var pointDistance = point( 1, 1 );

pointDistance( 4, 5 );		// 5
```

`distFromPoint(..)` 闭合着 `x1` 和 `y1`，但我们可以将这些值作为一个对象明确地传递：

```js
function pointDistance(point,x2,y2) {
	return Math.sqrt(
		Math.pow( x2 - point.x1, 2 ) +
		Math.pow( y2 - point.y1, 2 )
	);
};

pointDistance(
	{ x1: 1, y1: 1 },
	4,	// x2
	5	// y2
);
// 5
```

`point` 状态对象被明确地传入，取代了隐含地持有这个状态的闭包。

#### Behavior, Too!

对象和闭包不仅代表表达状态的集合的方式，它们还可以通过函数/方法包含行为。将数据与它的行为打包有一个炫酷的名字：封装。

考虑如下代码：

```js
function person(name,age) {
	return happyBirthday(){
		age++;
		console.log(
			"Happy " + age + "th Birthday, " + name + "!"
		);
	}
}

var birthdayBoy = person( "Kyle", 36 );

birthdayBoy();			// Happy 37th Birthday, Kyle!
```

内部函数 `happyBirthday()` 闭合着 `name` 与 `age`，所以其中的功能和状态一起保留了下来。

我们可以使用 `this` 与一个对象的绑定取得相同的能力：

```js
var birthdayBoy = {
	name: "Kyle",
	age: 36,
	happyBirthday() {
		this.age++;
		console.log(
			"Happy " + this.age + "th Birthday, " + this.name + "!"
		);
	}
};

birthdayBoy.happyBirthday();
// Happy 37th Birthday, Kyle!
```

我们仍然使用 `happyBirthday()` 函数来表达状态数据的封装，但使用一个对象而不是闭包。而且我们不必向一个函数明确地传入一个对象（比如前一个例子）；JavaScript 的 `this` 绑定很容易地创建了一个隐含绑定。

另一种分析这种关系的方式：一个闭包将一个函数与一组状态联系起来，而一个持有相同状态的对象可以有任意多个操作这些状态的函数。

事实上，你甚至可以使用一个闭包作为接口暴露多个方法。考虑一个带有两个方法的传统对象：

```js
var person = {
	firstName: "Kyle",
	lastName: "Simpson",
	first() {
		return this.firstName;
	},
	last()
		return this.lastName;
	}
}

person.first() + " " + person.last();
// Kyle Simpson
```

仅使用闭包而非对象，我们可以将这个程序表示为：

```js
function createPerson(firstName,lastName) {
	return API;

	// ********************

	function API(methodName) {
		switch (methodName) {
			case "first":
				return first();
				break;
			case "last":
				return last();
				break;
		};
	}

	function first() {
		return firstName;
	}

	function last() {
		return lastName;
	}
}

var person = createPerson( "Kyle", "Simpson" );

person( "first" ) + " " + person( "last" );
// Kyle Simpson
```

虽然这些程序在人体工程学上的观感不同，但它们实际上只是相同程序行为的不同种类实现。

### (Im)mutability

许多人一开始认为闭包和对象在可变性方面表现不同；闭包可以防止外部改变而对象不能。但是，事实表明，两种形式具有完全相同的可变性行为。

这是因为我们关心的，正如第六章中讨论的，是 **值** 的可变性，而它是值本身的性质，与它在哪里以及如何被赋值无关。

```js
function outer() {
	var x = 1;
	var y = [2,3];

	return function inner(){
		return [ x, y[0], y[1] ];
	};
}

var xyPublic = {
	x: 1,
	y: [2,3]
};
```

存储在 `outer()` 内部的词法变量 `x` 中的值是不可变的 —— 记住，`2` 这样的基本类型根据定义就是不可变的。但是被 `y` 引用的值，一个数组，绝对是可变的。这对 `xyPublic` 上的属性 `x` 和 `y` 来说是完全一样的。

我们可以佐证对象与闭包和不可变性无关：指出 `y` 本身就是一个数组，如此我们需要将这个例子进一步分解：

```js
function outer() {
	var x = 1;
	return middle();

	// ********************

	function middle() {
		var y0 = 2;
		var y1 = 3;

		return function inner(){
			return [ x, y0, y1 ];
		};
	}
}

var xyPublic = {
	x: 1,
	y: {
		0: 2,
		1: 3
	}
};
```

如果你将它考虑为 “乌龟（也就是对象）背地球”，那么在最底下一层，所有的状态数据都是基本类型，而所有的基本类型都是不可变的。

不管你是用嵌套的对象表示状态，还是用嵌套的闭包表示状态，被持有的值都是不可变的。

### Isomorphic

The term "isomorphic" gets thrown around a lot in JavaScript these days, and it's usually used to refer to code that can be used/shared in both the server and the browser. I wrote a blog post awhile back that calls bogus on that usage of this word "isomorphic", which actually has an explicit and important meaning that's being clouded.

如今 “同构” 这个词经常被扔到 JavaScript 旁边，它通常用来指代可以在服务器与浏览器中使用/共享的代码。一段时间以前我写过一篇博客，称对 “同构” 这一词的这种用法是一种捏造，它实际上有一种明确和重要的含义被掩盖了。

Here's some selections from a part of that post:

这是那篇博客的一些节选：

> What does isomorphic mean? Well, we could talk about it in mathematic terms, or sociology, or biology. The general notion of isomorphism is that you have two things which are similar in structure but not the same.
> 同构意味着什么？好吧，我们可以从数学上，或社会学上，或生物学上讨论它。同构的一般概念是，你有两个东西，它们虽然不同但在结构上有相似之处。
>
> In all those usages, isomorphism is differentiated from equality in this way: two values are equal if they’re exactly identical in all ways, but they are isomorphic if they are represented differently but still have a 1-to-1, bi-directional mapping relationship.
> 在所有这些用法中，同构与等价以这样的方式被区分开：如果两个值在所有的方面都完全相，那么它们就是等价的。但如果它们表现不同，却仍然拥有 1 对 1 的、双向的映射关系，那么它们就是同构的。
>
> In other words, two things A and B would be isomorphic if you could map (convert) from A to B and then go back to A with the inverse mapping
> 换言之，如果你能够从 A 映射（转换）到 B 而后又可以从用反向的映射从 B 走回到 A，那么 A 和 B 就是同构的。

Recall in "Brief Math Review" in Chapter 2, we discussed the mathematical definition of a function as being a mapping between inputs and outputs. We pointed out this is technically called a morphism. An isomorphism is a special case of bijective (aka, 2-way) morphism that requires not only that the mapping must be able to go in either direction, but also that the behavior is identical in either form.

回忆一下第二章的 “数学简忆”，我们讨论了函数的数学定义 —— 输入与输出之间的映射。我们指出这在技术上被称为一种态射。同构是双射（也就是两个方向的）的一种特殊情况，它不仅要求映射必须能够在两个方向上进行，而且要求这两种形式在行为上也完全一样。

But instead of thinking about numbers, let's relate isomorphism to code. Again quoting my blog post:

把对数字的思考放在一边，让我们将同构联系到代码上。再次引用我的博客：

> [W]hat would isomorphic JS be if there were such a thing? Well, it could be that you have one set of JS code that is converted to another set of JS code, and that (importantly) you could convert from the latter back to the former if you wanted.

> 如果 JS 中存在同构这样的东西，它将会是什么样子？好吧，它可能是这样：你拥有这样一套 JS 代码，它可以被转换为另一套 JS 代码，而且（重要的是）如果你想这么做的话，你可将后者转换回前者。

As we asserted earlier with our examples of closures-as-objects and objects-as-closures, these representative alternations go either way. In this respect, they are isomorphisms of each other.



Put simply, closures and objects are isomorphic representations of state (and its associated functionality).

The next time you hear someone say "X is isomorphic with Y", what they mean is, "X and Y can be converted from either one to the other in either direction, and maintain the same behavior regardless."

### Under The Hood

So, we can think of objects as an isomorphic representation of closures from the perspective of code we could write. But we can also observe that a closure system could actually be implemented -- and likely is -- with objects!

Think about it this way: in the following code, how is JS keeping track of the `x` variable for `inner()` to keep referencing, well after `outer()` has already run?

```js
function outer() {
	var x = 1;

	return function inner(){
		return x;
	};
}
```

We could imagine that the scope -- the set of all variables defined -- of `outer()` is implemented as an object with properties. So, conceptually, somewhere in memory, there's something like:

```js
scopeOfOuter = {
	x: 1
};
```

And then for the `inner()` function, when created, it gets an (empty) scope object called `scopeOfInner`, which is linked via its `[[Prototype]]` to the `scopeOfOuter` object, sorta like this:

```js
scopeOfInner = {};
Object.setPrototypeOf( scopeOfInner, scopeOfOuter );
```

Then, inside `inner()`, when it makes reference to the lexical variable `x`, it's actually more like:

```js
return scopeOfInner.x;
```

`scopeOfInner` doesn't have an `x` property, but it's `[[Prototype]]`-linked to `scopeOfOuter`, which does have an `x` property. Accessing `scopeOfOuter.x` via prototype delegation results in the `1` value being returned.

In this way, we can sorta see why the scope of `outer()` is preserved (via closure) even after it finishes: because the `scopeOfInner` object is linked to the `scopeOfOuter` object, thereby keeping that object and its properties alive and well.

Now, this is all conceptual. I'm not literally saying the JS engine uses objects and prototypes. But it's entirely plausible that it *could* work similarly.

Many languages do in fact implement closures via objects. And other languages implement objects in terms of closures. But we'll let the reader use their imagination on how that would work.

## Two Roads Diverged In A Wood...

So closures and objects are equivalent, right? Not quite. I bet they're more similar than you thought before you started this chapter, but they still have important differences.

These differences should not be viewed as weaknesses or arguments against usage; that's the wrong perspective. They should be viewed as features and advantages that make one or the other more suitable (and readable!) for a given task.

### Structural Mutability

Conceptually, the structure of a closure is not mutable.

In other words, you can never add to or remove state from a closure. Closure is a characteristic of where variables are declared (fixed at author/compile time), and is not sensitive to any runtime conditions -- assuming you use strict mode and/or avoid using cheats like `eval(..)`, of course!

**Note:** The JS engine could technically cull a closure to weed out any variables in its scope that are no longer going to be used, but this is an advanced optimization that's transparent to the developer. Whether the engine actually does these kinds of optimizations, I think it's safest for the developer to assume that closure is per-scope rather than per-variable. If you don't want it to stay around, don't close over it!

However, objects by default are quite mutable. You can freely add or remove (`delete`) properties/indices from an object, as long as that object hasn't been frozen (`Object.freeze(..)`).

It may be an advantage of the code to be able to track more (or less!) state depending on the runtime conditions in the program.

For example, let's imagine tracking the keypress events in a game. Almost certainly, you'll think about using an array to do this:

```js
function trackEvent(evt,keypresses = []) {
	return keypresses.concat( evt );
}

var keypresses = trackEvent( newEvent1 );

keypresses = trackEvent( newEvent2, keypresses );
```

**Note:** Did you spot why I used `concat(..)` instead of `push(..)`ing directly to `keypresses`? Because in FP, we typically want to treat arrays as immutable data structures that can be recreated and added to, but not directly changed. We trade out the evil of side-effects for an explicit reassignment (more on that later).

Though we're not changing the structure of the array, we could if we wanted to. More on this in a moment.

But an array is not the only way to track this growing "list" of `evt` objects. We could use closure:

```js
function trackEvent(evt,keypresses = () => []) {
	return function newKeypresses() {
		return [ ...keypresses(), evt ];
	};
}

var keypresses = trackEvent( newEvent1 );

keypresses = trackEvent( newEvent2, keypresses );
```

Do you spot what's happening here?

Each time we add a new event to the "list", we create a new closure wrapped around the existing `keypresses()` function (closure), which captures the current `evt`. When we call the `keypresses()` function, it will successively call all the nested functions, building up an intermediate array of all the individually closed-over `evt` objects. Again, closure is the mechanism that's tracking all the state; the array you see is only an implementation detail of needing a way to return multiple values from a function.

So which one is better suited for our task? No surprise here, the array approach is probably a lot more appropriate. The structural immutability of a closure means our only option is to wrap more closure around it. Objects are by default extensible, so we can just grow the array as needed.

By the way, even though I'm presenting this structural (im)mutability as a clear difference between closure and object, the way we're using the object as an immutable value is actually more similar than dislike.

Creating a new array (via `concat(..)`) for each addition to the array is treating the array as structurally immutable, which is conceptually symmetrical to closure being structurally immutable by its very design.

### Privacy

Probably one of the first differences you think of when analyzing closure vs object is that closure offers "privacy" of state through nested lexical scoping, whereas objects expose everything as public properties. Such privacy has a fancy name: information hiding.

Consider lexical closure hiding:

```js
function outer() {
	var x = 1;

	return function inner(){
		return x;
	};
}

var xHidden = outer();

xHidden();			// 1
```

Now the same state in public:

```js
var xPublic = {
	x: 1
};

xPublic.x;			// 1
```

There's some obvious differences around general software engineering principles -- consider abstraction, the module pattern with public and private APIs, etc -- but let's try to constrain our discussion to the perspective of FP; this is, after all, a book about functional programming!

#### Visibility

It may seem that the ability to hide information is a desired characteristic of state tracking, but I believe the FPer might argue the opposite.

One of the advantages of managing state as public properties on an object is that it's easier to enumerate (and iterate!) all the data in your state. Imagine you wanted to process each keypress event (from the earlier example) to save it to a database, using a utility like:

```js
function recordKeypress(keypressEvt) {
	// database utility
	DB.store( "keypress-events", keypressEvt );
}
```

If you already have an array -- just an object with public numerically-named properties -- this is very straightforward using a built-in JS array utility `forEach(..)`:

```js
keypresses.forEach( recordKeypress );
```

But, if the list of keypresses is hidden inside closure, you'll have to expose a utility on the public API of the closure with privileged access to the hidden data.

For example, we can give our closure-`keypresses` example its own `forEach`,  like built-in arrays have:

```js
function trackEvent(
	evt,
	keypresses = {
		list() { return []; },
		forEach() {}
	}
) {
	return {
		list() {
			return [ ...keypresses.list(), evt ];
		},
		forEach(fn) {
			keypresses.forEach( fn );
			fn( evt );
		}
	};
}

// ..

keypresses.list();		// [ evt, evt, .. ]

keypresses.forEach( recordKeypress );
```

The visibility of an object's state data makes using it more straightforward, whereas closure obscures the state making us work harder to process it.

#### Change Control

If the lexical variable `x` is hidden inside a closure, the only code that has the freedom to reassign it is also inside that closure; it's impossible to modify `x` from the outside.

As we saw in Chapter 6, that fact alone improves the readability of code by reducing the surface area that the reader must consider to predict the behavior of any given variable.

The local proximity of lexical reassignment is a big reason why I don't find `const` as a feature that helpful. Scopes (and thus closures) should in general be pretty small, and that means there will only be a few lines of code that can affect reassignment. In `outer()` above, we can quickly inspect to see that no line of code reassigns `x`, so for all intents and purposes it's acting as a constant.

This kind of guarantee is a powerful contributor to our confidence in the purity of a function, for example.

On the other hand, `xPublic.x` is a public property, and any part of the program that gets a reference to `xPublic` has the ability, by default, to reassign `xPublic.x` to some other value. That's a lot more lines of code to consider!

That's why in Chapter 6, we looked at `Object.freeze(..)` as a quick-n-dirty means of making all of an object's properties read-only (`writable: false`), so that they can't be reassigned unpredictably.

Unfortunately, `Object.freeze(..)` is both all-or-nothing and irreversible.

With closure, you have some code with the privilege to change, and the rest of the program is restricted. When you freeze an object, no part of the code will be able to reassign. Moreover, once an object is frozen, it can't be thawed out, so the properties will remain read-only for the duration of the program.

In places where I want to allow reassignment but restrict its surface area, closures are a more convenient and flexible form than objects. In places where I want no reassignment, a frozen object is a lot more convenient than repeating `const` declarations all over my function.

Many FPers take a hard-line stance on reassignment: it shouldn't be used. They will tend to use `const` to make all closure variables read-only, and they'll use `Object.freeze(..)` or full immutable data structures to prevent property reassignment. Moreover, they'll try to reduce the amount of explicitly declared/tracked variables and properties wherever possible, perferring value transfer -- function chains, `return` value passed as argument, etc -- instead of intermediate value storage.

This book is about "functional light" programming in JavaScript, and this is one of those cases where I diverge from the core FP crowd.

I think variable reassignment can be quite useful and, when used approriately, quite readable in its explicitness. It's certainly been by experience that debugging is a lot easier when you can insert a `debugger` or breakpoint, or track a watch expression.

### Cloning State

As we learned in Chapter 6, one of the best ways we prevent side effects from eroding the predictability of our code is to make sure we treat all state values as immutable, regardless of whether they are actually immutable (frozen) or not.

If you're not using a purpose-built library to provide sophisticated immutable data structures, the simplest approach will suffice: duplicate your objects/arrays each time before making a change.

Arrays are easy to clone shallowly: just use the `slice()` method:

```js
var a = [ 1, 2, 3 ];

var b = a.slice();
b.push( 4 );

a;			// [1,2,3]
b;			// [1,2,3,4]
```

Objects can be shallow-cloned relatively easily too:

```js
var o = {
	x: 1,
	y: 2
};

// in ES2017+, using object spread:
var p = { ...o };
p.y = 3;

// in ES2015+:
var p = Object.assign( {}, o );
p.y = 3;
```

If the values in an object/array are themselves non-primitives (objects/arrays), to get deep cloning you'll have to walk each layer manually to clone each nested object. Otherwise, you'll have copies of shared references to those sub-objects, and that's likely to create havoc in your program logic.

Did you notice that this cloning is possible only because all these state values are visible and can thus be easily copied? What about a set of state wrapped up in a closure; how would you clone that state?

That's much more tedious. Essentially, you'd have to do something similar to our custom `forEach` API method earlier: provide a function inside each layer of the closure with the privilege to extract/copy the hidden values, creating new equivalent closures along the way.

Even though that's theoretically possible -- another exercise for the reader! -- it's far less practical to implement than you're likely to justify for any real program.

Objects have a clear advantage when it comes to representing state that we need to be able to clone.

### Performance

One reason objects may be favored over closures, from an implementation perspective, is that in JavaScript objects are often lighter-weight in terms of memory and even computation.

But be careful with that as a general assertion: there are plenty of things you can do with objects that will erase any performance gains you may get from ignoring closure and moving to object-based state tracking.

Let's consider a scenario with both implementations. First, the closure-style implementation:

```js
function StudentRecord(name,major,gpa) {
	return function printStudent(){
		return `${name}, Major: ${major}, GPA: ${gpa.toFixed(1)}`;
	};
}

var student = StudentRecord( "Kyle Simpson", "kyle@some.tld", "CS", 4 );

// later

student();
// Kyle Simpson, Major: CS, GPA: 4.0
```

The inner function `printStudent()` closes over three variables: `name`, `major`, and `gpa`. It maintains this state wherever we transfer a reference to that function -- we call it `student()` in this example.

Now for the object (and `this`) approach:

```js
function StudentRecord(){
	return `${this.name}, Major: ${this.major}, GPA: ${this.gpa.toFixed(1)}`;
}

var student = StudentRecord.bind( {
	name: "Kyle Simpson",
	major: "CS",
	gpa: 4
} );

// later

student();
// Kyle Simpson, Major: CS, GPA: 4.0
```

The `student()` function -- technically referred to as a "bound function" -- has a hard-bound `this` reference to the object literal we passed in, such that any later call to `student()` will use that object for it `this`, and thus be able to access its encapsulated state.

Both implemenations have the same outcome: a function with preserved state. But what about the performance; what differences will there be?

**Note:** Accurately and actionably judging performance of a snippet of JS code is a very dodgy affair. We won't get into all the details here, but I urge you to read the "You Don't Know JS: Async & Performance" book, specifically Chapter 6 "Benchmarking & Tuning", for more details.

If you were writing a library that created a pairing of state with its function -- either the call to `StudentRecord(..)` in the first snippet or the call to `StudentRecord.bind(..)` in the second snippet -- you're likely to care most about how those two perform. Inspecting the code, we can see that the former has to create a new function expression each time. The second one uses `bind(..)`, which is not as obvious in its implications.

One way to think about what `bind(..)` does under the covers is that it creates a closure over a function, like this:

```js
function bind(orinFn,thisObj) {
	return function boundFn(...args) {
		return origFn.apply( thisObj, args );
	};
}

var student = bind( StudentRecord, { name: "Kyle.." } );
```

In this way, it looks like both implementations of our scenario create a closure, so the performance is likely to be about the same.

However, the built-in `bind(..)` utility doesn't really have to create a closure to accomplish the task. It simply creates a function and manually sets its internal `this` to the specified object. That's potentially a more efficient operation than if we did the closure ourselves.

The kind of performance savings we're talking about here is miniscule on an individual operation. But if your library's critical path is doing this hundreds or thousands of times or more, that savings can add up quickly. Many libraries -- Bluebird being one such example -- have ended up optimizing by removing closures and going with objects, in exactly this means.

Outside of the library use-case, the pairing of the state with its function usually only happens relatively few times in the critical path of an application. By contrast, typically the usage of the function+state -- calling `student()` in either snippet -- is more common.

If that's the case for some given situation in your code, you should probably care more about the performance of the latter versus the former.

Bound functions have historically had pretty lousy performance in general, but have recently been much more highly optimized by JS engines. If you benchmarked these variations a couple of years ago, it's entirely possible you'd get different results repeating the same test with the latest engines.

A bound function is now likely to perform at least as good if not better as the equivalent closed-over function. So that's another tick in favor of objects over closures.

I just want to reiterate: these performance observations are not absolutes, and the determination of what's best for a given scenario is very complex. Do not just casually apply what you've heard from others or even what you've seen on some other earlier project. Carefully examine whether objects or closures are appropriately efficient for the task.

## Summary

The truth of this chapter cannot be written out. One must read this chapter to find its truth.
