# Functional-Light JavaScript
# Chapter 3: Managing Function Inputs

在第二章的“函数输入”中，我们谈到了函数形式参数与实际参数的基础。我们还看了一些语法技巧来方便它们的使用，比如 `...` 操作符和解构。

我在讨论中建议你应当尽可将函数设计为只含一个形式参数。事实上，这不总是可能的，而且你也不总是能够控制你是用的函数的签名。

现在我们将要把注意力转向在这些场景下搬弄函数输入的更精巧、更强大的模式。

## Some Now, Some Later

如果一个函数接收多个实际参数，你可能想要提前指定其中的一些，而在稍后指定其余的。

考虑这个函数：

```js
function ajax(url,data,callback) {
	// ..
}
```

让我们想象你要建立几个 API 调用，它们的 URL 是事先知道的，但是数据与处理响应的回调以后才会知道。

当然，你可以仅仅将 `ajax(..)` 调用推迟到所有信息都已知之后发起，并在那时引用一些 URL 的全局常量。但另一种方式是创建一个已经拥有 `url` 实际参数的函数引用。

我们将要做的是制造一个在底层依然调用 `ajax(..)` 的新函数，它手动地设置你关心的第一个实际参数 API URL，同时等待接收稍后的其他两个实际参数。

```js
function getPerson(data,cb) {
	ajax( "http://some.api/person", data, cb );
}

function getOrder(data,cb) {
	ajax( "http://some.api/order", data, cb );
}
```

手动指定这些函数调用包装期当然是可能的，但这可能会变得十分麻烦，特别是在预设实际参数不同时还会产生变种，就像：

```js
function getCurrentUser(cb) {
	getPerson( { user: CURRENT_USER_ID }, cb );
}
```

一个 FP 程序员十分习惯的实践是寻找那些我们频繁重复的同种类的模式，并试着将这些动作转换为可重用的泛化工具。事实上，我确信这对许多读者来说已经是一种知觉了，所以这并不是 FP 中独有的东西。但对 FP 来说无疑是重要的。

为了构思一个这样的实际参数预设工具，让我们从概念上审视一下发生了什么，而不只是观察上面的手动实现。

一个清晰的对所发生事情的表述是，函数 `getOrder(data,cb)` 是函数 `ajax(url,data,cb)` 的一个 *局部应用*。这个术语源于实际参数在函数调用点上 *被应用* 于形式参数的概念。而且如你所见，我们只预先应用了实际参数中的一部分 —— 具体地讲是形式参数 `url` 的实际参数 —— 而将其余的留着稍后再应用。

对这种模式再稍微形式化一些，局部应用严格地说是一个函数元的约减；记住，元是被期待的形式参数输入的数量。我们为了函数 `getOrder(..)` 而将原函数 `ajax(..)` 的元从 3 减至 2。

让我们定义一个工具 `partial(..)`：

```js
function partial(fn,...presetArgs) {
	return function partiallyApplied(...laterArgs){
		return fn( ...presetArgs, ...laterArgs );
	};
}
```

**提示：** 不要只是理解这段代码的皮毛。花点时间消化吸收这个工具中发生的事情。确保你自己真的 *理解它*。这里的这个模式将在本书的剩余部分一次又一次地出现，所以现在就熟悉它是一个不错的主意。

函数 `partial(..)` 接收一个 `fn`，也就是我们要局部应用的函数。然后，所有后续被传入的实际参数都被聚集到 `presetArgs` 数组中为稍后的使用保存起来。

一个新的内部函数（为了清晰我们称之为 `partiallyApplied(..)`）被创建并 `return`，它自己的实际参数被聚集到一个称为 `laterArgs` 的数组中。

注意到这个内部函数里面的 `fn` 和 `presetArgs` 引用了吗？这是怎么工作的？在 `partial(..)` 完成运行之后，这个内部函数是如何能够继续访问 `fn` 和 `presetArgs`？如果你回答 **闭包**，完全正确！内部函数 `partiallyApplied(..)` 闭包着变量 `fn` 和 `presetArgs`，所以它可以在稍后继续访问它们，不论函数在何处运行。看到理解闭包有多重要了吗？

稍后当函数 `partiallyApplied(..)` 在你程序的其他某些地方执行时，它会使用闭包的 `fn` 来执行原始的函数，首先提供所有的（闭包的）部分应用实际参数 `presetArgs`，继而是所有的 `laterArgs` 实际参数。

如果这些内容有一点儿令你感到困惑，那就停下再读一遍。相信我，随着我们这本书渐行渐远你会很高兴自己这么做了。

一个旁注，FP 程序员经常喜欢为这样的代码使用更短的 `=>` 箭头函数语法（见第一章“语法”），例如：

```js
var partial =
	(fn, ...presetArgs) =>
		(...laterArgs) =>
			fn( ...presetArgs, ...laterArgs );
```

这无疑更简洁，甚至代码量更少。但我个人感觉无论从数学符号上能到什么样的好处，它都对等地因为函数称为匿名而失去了全部的可读性，而且由于作用域边界变得模糊使得解读闭包变得更加困难了一些。

不管哪一种语法方式使你感兴趣，现在让我们使用 `partial(..)` 工具来制造先前的那些局部应用函数：

```js
var getPerson = partial( ajax, "http://some.api/person" );

var getOrder = partial( ajax, "http://some.api/order" );
```

停下来想一想 `getPerson(..)` 的外形/内部。它看起来有些像这样：

```js
var getPerson = function partiallyApplied(...laterArgs) {
	return ajax( "http://some.api/person", ...laterArgs );
};
```

这对 `getOrder(..)` 也同样成立。但是 `getCurrentUser(..)` 呢？

```js
// version 1
var getCurrentUser = partial(
	ajax,
	"http://some.api/person",
	{ user: CURRENT_USER_ID }
);

// version 2
var getCurrentUser = partial( getPerson, { user: CURRENT_USER_ID } );
```

我们既可以同时直接指定 `url` 和 `data` 两个实际参数来定义 `getCurrentUser(..)`（版本1），也可以将 `getCurrentUser(..)` 定义为局部应用 `getPerson(..)` 的局部应用（版本2），仅提供额外的 `data` 实际参数。

版本2表达得更清晰一些，因为它复用了已经定义好的东西。因此，我认为它更符合 FP 的精神。

为了确保我们理解了这两个版本背后是如何工作的，让我们分别看一下它们：

```js
// version 1
var getCurrentUser = function partiallyApplied(...laterArgs) {
	return ajax(
		"http://some.api/person",
		{ user: CURRENT_USER_ID },
		...laterArgs
	);
};

// version 2
var getCurrentUser = function outerPartiallyApplied(...outerLaterArgs) {
	var getPerson = function innerPartiallyApplied(...innerLaterArgs){
		return ajax( "http://some.api/person", ...innerLaterArgs );
	};

	return getPerson( { user: CURRENT_USER_ID }, ...outerLaterArgs );
}
```

同样，停下来重读这些代码段，确保你理解它们发生了什么。

**注意：** 第二个版本引入了额外的一层函数包装。这可能感觉很奇怪而且没必要，但它是在 FP 中你将想要十分熟悉的东西之一。随着这本书的推进我们将会让函数相互包装许多层。记住，这是 *函数* 式编程！

让我们再看另一个展示局部应用有用之处的例子。考虑一个函数 `add(..)`，它接收两个实际参数并将它们加在一起：

```js
function add(x,y) {
	return x + y;
}
```

现在，想象我们要拿一个数字的列表并在它们每一个上加上一个特定的数字。我们将使用 JS 数组中内建的 `map(..)` 工具。

```js
[1,2,3,4,5].map( function adder(val){
	return add( 3, val );
} );
// [4,5,6,7,8]
```

**注意：** 如果你以前没见过 `map(..)`，不要担心；我们会在本书稍后非常详细地讲解它。就目前来说，只要知道它循环一个数组并调用一个函数来为一个新数组产生值。

我们不能直接向 `map(..)` 传递 `add(..)` 的原因是因为 `add(..)` 的签名与 `map(..)` 所期待的映射函数不符。这就是局部应用能帮到我们的地方：我们可以将 `add(..)` 的签名适配为符合的某种东西。

```js
[1,2,3,4,5].map( partial( add, 3 ) );
// [4,5,6,7,8]
```

### `bind(..)`

JavaScript 有一个称为 `bind(..)` 的内建工具，它在所有函数上都可用。它具备两种能力：预设 `this` 上下文环境与局部应用实际参数。

我认为在一个工具中将这两种能力混为一谈真是不幸到家了。有的时候你想硬绑定 `this` 上下文环境但不想局部应用实际参数。其他一些时候你想局部应用实际参数但根本不关心 `this` 绑定。我个人几乎从来没有同时需要过这两者。

后一种场景更尴尬，因为你不得不为 `this` 绑定（第一个）参数传递一个可忽略的占位符，通常是 `null`。

考虑如下代码：

```js
var getPerson = ajax.bind( null, "http://some.api/person" );
```

那个 `null` 让我不胜其烦。

### Reversing Arguments

回想一下我们 Ajax 函数的签名：`ajax( url, data, cb )`。要是我们想要局部应用 `cb` 而等待稍后指定 `data` 和 `url` 呢？我们可以创建一个工具，它包装一个函数来翻转这个函数的实际参数顺序：

```js
function reverseArgs(fn) {
	return function argsReversed(...args){
		return fn( ...args.reverse() );
	};
}

// or the ES6 => arrow form
var reverseArgs =
	fn =>
		(...args) =>
			fn( ...args.reverse() );
```

现在我们可以翻转 `ajax(..)` 的实际参数顺序了，如此我们可以继而从右侧而非左侧开始进行局部应用。为了恢复实际的顺序，我们之后翻转这个局部应用函数：

```js
var cache = {};

var cacheResult = reverseArgs(
	partial( reverseArgs( ajax ), function onResult(obj){
		cache[obj.id] = obj;
	} )
);

// later:
cacheResult( "http://some.api/person", { user: CURRENT_USER_ID } );
```

现在，使用同样的翻转-局部应用-翻转技巧，我们可以定义一个从右侧开始进行局部应用的 `partialRight(..)`：

```js
function partialRight( fn, ...presetArgs ) {
	return reverseArgs(
		partial( reverseArgs( fn ), ...presetArgs.reverse() )
	);
}

var cacheResult = partialRight( ajax, function onResult(obj){
	cache[obj.id] = obj;
});

// later:
cacheResult( "http://some.api/person", { user: CURRENT_USER_ID } );
```

这个 `partialRight(..)` 的实现不能保证一个明确的形式参数将会收到一个明确的局部应用值；它只能保证右侧局部应用的值作为最右边的实际参数传递给原始函数。

例如：

```js
function foo(x,y,z) {
	var rest = [].slice.call( arguments, 3 );
	console.log( x, y, z, rest );
}

var f = partialRight( foo, "z:last" );

f( 1, 2 );			// 1 2 "z:last" []

f( 1 );				// 1 "z:last" undefined []

f( 1, 2, 3 );		// 1 2 3 ["z:last"]

f( 1, 2, 3, 4 );	// 1 2 3 [4,"z:last"]
```

值 `"z:last"` 仅会在只使用两个实际参数（匹配 `x` 和 `y` 形式参数）调用 `f(..)` 的情况下应用到形式参数 `z` 上。在所有其他情况下，`"z:last"` 只是最右边的实际参数，它前面会有很多实际参数。

## One At A Time

Let's examine a technique similar to partial application, where a function that expects multiple arguments is broken down into successive chained functions that each take a single argument (arity: 1) and return another function to accept the next argument.

让我们来检视一种与局部应用相似的技术，它把一个期待多个实际参数的函数分解为相继链接的函数，这些函数的每一个只接收一个参数（元为1）并返回另一个接收下个参数的函数。

This technique is called currying.

这种技术称为柯里化（currying）。

To first illustrate, let's imagine we had a curried version of `ajax(..)` already created. This is how we'd use it:

为了首先展示一下，让我们想象我们已经创建了一个柯里化版本的 `ajax(..)`。这是我们如何使用它：

```js
curriedAjax( "http://some.api/person" )
	( { user: CURRENT_USER_ID } )
		( function foundUser(user){ /* .. */ } );
```

Perhaps splitting out each of the three calls helps understand what's going on better:

也许将这三个调用分割开有助于我们理解发生了什么：

```js
var personFetcher = curriedAjax( "http://some.api/person" );

var getCurrentUser = personFetcher( { user: CURRENT_USER_ID } );

getCurrentUser( function foundUser(user){ /* .. */ } );
```

Instead of taking all the arguments at once (like `ajax(..)`), or some of the arguments up-front and the rest later (via `partial(..)`), this `curriedAjax(..)` function receives one argument at a time, each in a separate function call.

与一次性接收所有参数（比如 `ajax(..)`），或者（通过 `partial(..)`）一些参数提前接收剩下的稍后接收不同，这个 `curriedAjax(..)` 函数一次接收一个参数，每个参数都在一个分离的函数调用中。

Currying is similar to partial application in that each successive curried call kind of partially applies another argument to the original function, until all arguments have been passed.

柯里化与局部应用的相似之处在于，每个

The main difference is that `curriedAjax(..)` will explicitly return a function (we call `curriedGetPerson(..)`) that expects **only the next argument** `data`, not one that (like the earlier `getPerson(..)`) can receive all the rest of the arguments.

If an original function expected 5 arguments, the curried form of that function would take just the first argument, and return a function to accept the second. That one would take just the second argument, and return a function to accept the third. And so on.

So currying unwinds a higher-arity function into a series of chained unary functions.

How might we define a utility to do this currying? We're going to use some tricks from Chapter 2.

```js
function curry(fn,arity = fn.length) {
	return (function nextCurried(prevArgs){
		return function curried(nextArg){
			var args = prevArgs.concat( [nextArg] );

			if (args.length >= arity) {
				return fn( ...args );
			}
			else {
				return nextCurried( args );
			}
		};
	})( [] );
}
```

And for the ES6 `=>` fans:

```js
var curry =
	(fn, arity = fn.length, nextCurried) =>
		(nextCurried = prevArgs =>
			nextArg => {
				var args = prevArgs.concat( [nextArg] );

				if (args.length >= arity) {
					return fn( ...args );
				}
				else {
					return nextCurried( args );
				}
			}
		)( [] );
```

The approach here is to start a collection of arguments in `prevArgs` as an empty `[]` array, and add each received `nextArg` to that, calling the concatenation `args`. While `args.length` is less than `arity` (the number of declared/expected parameters of the original `fn(..)` function), make and return another `curried(..)` function to collect the next `nextArg` argument, passing the running `args` collection along as `prevArgs`. Once we have enough `args`, execute the original `fn(..)` function with them.

By default, this implementation relies on being able to inspect the `length` property of the to-be-curried function to know how many iterations of currying we'll need before we've collected all its expected arguments.

If you use this implementation of `curry(..)` with a function that doesn't have an accurate `length` property -- if the function's parameter signature includes default parameter values, parameter destructuring, or it's variadic with `...args`; see Chapter 2 -- you'll need to pass the `arity` (the second parameter of `curry(..)`) to ensure `curry(..)` works correctly.

Here's how we would use `curry(..)` for our earlier `ajax(..)` example:

```js
var curriedAjax = curry( ajax );

var personFetcher = curriedAjax( "http://some.api/person" );

var getCurrentUser = personFetcher( { user: CURRENT_USER_ID } );

getCurrentUser( function foundUser(user){ /* .. */ } );
```

Each call adds one more argument to the original `ajax(..)` call, until all three have been provided and `ajax(..)` is executed.

Remember our example from earlier about adding `3` to a each value in a list of numbers? Recall that currying is similar to partial application, so we could do that task with currying in almost the same way:

```js
[1,2,3,4,5].map( curry( add )( 3 ) );
// [4,5,6,7,8]
```

The difference between the two? `partial(add,3)` vs `curry(add)(3)`. Why might you choose `curry(..)` over partial? It might be helpful in the case where you know ahead of time that `add(..)` is the function to be adapted, but the value `3` isn't known yet:

```js
var adder = curry( add );

// later
[1,2,3,4,5].map( adder( 3 ) );
// [4,5,6,7,8]
```

How about another numbers example, this time adding a list of them together:

```js
function sum(...args) {
	var sum = 0;
	for (let i = 0; i < args.length; i++) {
		sum += args[i];
	}
	return sum;
}

sum( 1, 2, 3, 4, 5 );						// 15

// now with currying:
// (5 to indicate how many we should wait for)
var curriedSum = curry( sum, 5 );

curriedSum( 1 )( 2 )( 3 )( 4 )( 5 );		// 15
```

The advantage of currying here is that each call to pass in an argument produces another function that's more specialized, and we can capture and use *that* new function later in the program. Partial application specifies all the partially applied arguments up front, producing a function that's waiting for all the rest of the arguments.

If you wanted to use partial application to specify one parameter at a time, you'd have to keep calling `partialApply(..)` on each successive function. Curried functions do this automatically, making working with individual arguments one-at-a-time more ergonomic.

In JavaScript, both currying and partial application use closure to remember the arguments over time until all have been received, and then the original operation can be performed.

### Why Currying And Partial Application?

With either currying style (`sum(1)(2)(3)`) or partial application style (`partial(sum,1,2)(3)`), the call-site unquestionably looks stranger than a more common one like `sum(1,2,3)`. So **why would we go this direction** when adopting FP? There are multiple layers to answering that question.

The first and most obvious reason is that both currying and partial application allow you to separate in time/space (throughout your code base) when and where separate arguments are specified, whereas traditional function calls require all the arguments to be present up front. If you have a place in your code where you'll know some of the arguments and another place where the other arguments are determined, currying or partial application are very useful.

Another layer to this answer, which applies most specifically to currying, is that composition of functions is much easier when there's only one argument. So a function that ultimately needs 3 arguments, if curried, becomes a function that needs just one, three times over. That kind of unary function will be a lot easier to work with when we start composing them. We'll tackle this topic later in the text.

### Currying More Than One Argument?

The definition and implementation I've given of currying thus far is, I believe, as true to the spirit as we can likely get in JavaScript.

Specifically, if we look briefly at how currying works in Haskell, we can observe that multiple arguments always go in to a function one at a time, one per curried call -- other than tuples (analogus to arrays for our purposes) that transport multiple values in a single argument.

For example, in Haskell:

```
foo 1 2 3
```

This calls the `foo` function, and has the result of passing in three values `1`, `2`, and `3`. But functions are automatically curried in Haskell, which means each value goes in as a separate curried-call. The JS equivalent of that would look like `foo(1)(2)(3)`, which is the same style as the `curry(..)` I presented above.

**Note:** In Haskell, `foo (1,2,3)` is not passing in those 3 values at once as three separate arguments, but a tuple (kinda like a JS array) as a single argument. To work, `foo` would need to be altered to handle a tuple in that argument position. As far as I can tell, there's no way in Haskell to pass all three arguments separately with just one function call; each argument gets its own curried-call. Of course, the presence of multiple calls is transparent to the Haskell developer, but it's a lot more syntactically obvious to the JS developer.

For these reasons, I think the earlier `curry(..)` that I demonstrated is a faithful adaptation, or what I might call "strict currying".

However, it's important to note that there's a looser definition used in most popular JavaScript FP libraries.

Specifically, JS currying utilities typically allow you to specify multiple arguments for each curried-call. Revisiting our `sum(..)` example from before, this would look like:

```js
var curriedSum = looseCurry( sum, 5 );

curriedSum( 1 )( 2, 3 )( 4, 5 );			// 15
```

We see a slight syntax savings of fewer `( )`, and an implied performance benefit of now having three function calls instead of five. But other than that, using `looseCurry(..)` is identical in end result to the narrower `curry(..)` definition from earlier. I would guess the convenience/performance factor is probably why frameworks allow multiple arguments. This seems mostly like a matter of taste.

**Note:** The loose currying *does* give you the ability to send in more arguments than the arity (detected or specified). If you designed your function with optional/variadic arguments, that could be a benefit. For example, if you curry five arguments, looser currying still allows more than five arguments (`curriedSum(1)(2,3,4)(5,6)`), but strict currying wouldn't support `curriedSum(1)(2)(3)(4)(5)(6)`.

We can adapt our previous currying implementation to this common looser definition:

```js
function looseCurry(fn,arity = fn.length) {
	return (function nextCurried(prevArgs){
		return function curried(...nextArgs){
			var args = prevArgs.concat( nextArgs );

			if (args.length >= arity) {
				return fn( ...args );
			}
			else {
				return nextCurried( args );
			}
		};
	})( [] );
}
```

Now each curried-call accepts one or more arguments (as `nextArgs`). We'll leave it as an exercise for the interested reader to define the ES6 `=>` version of `looseCurry(..)` similar to how we did it for `curry(..)` earlier.

### No Curry For Me, Please

It may also be the case that you have a curried function that you'd like to sort of un-curry -- basically, to turn a function like `f(1)(2)(3)` back into a function like `g(1,2,3)`.

The standard utility for this is (un)shockingly typically called `uncurry(..)`. Here's a simple naive implementation:

```js
function uncurry(fn) {
	return function uncurried(...args){
		var ret = fn;

		for (let i = 0; i < args.length; i++) {
			ret = ret( args[i] );
		}

		return ret;
	};
}

// or the ES6 => arrow form
var uncurry =
	fn =>
		(...args) => {
			var ret = fn;

			for (let i = 0; i < args.length; i++) {
				ret = ret( args[i] );
			}

			return ret;
		};
```

**Warning:** Don't just assume that `uncurry(curry(f))` has the same behavior as `f`. In some libs the uncurrying would result in a function like the original, but not all of them; certainly our example here does not. The uncurried function acts (mostly) the same as the original function if you pass as many arguments to it as the original function expected. However, if you pass fewer arguments, you still get back a partially curried function waiting for more arguments; this quirk is illustrated in the next snippet.

```js
function sum(...args) {
	var sum = 0;
	for (let i = 0; i < args.length; i++) {
		sum += args[i];
	}
	return sum;
}

var curriedSum = curry( sum, 5 );
var uncurriedSum = uncurry( curriedSum );

curriedSum( 1 )( 2 )( 3 )( 4 )( 5 );		// 15

uncurriedSum( 1, 2, 3, 4, 5 );				// 15
uncurriedSum( 1, 2, 3 )( 4 )( 5 );			// 15
```

Probably the more common case of using `uncurry(..)` is not with a manually curried function as just shown, but with a function that comes out curried as a result of some other set of operations. We'll illustrate that scenario later in this chapter in the "No Points" discussion.

## All For One

Imagine you're passing a function to a utility where it will send multiple arguments to your function. But you may only want to receive a single argument. This is especially true if you have a loosely curried function like we discussed previously that *can* accept more arguments that you wouldn't want.

We can design a simple utility that wraps a function call to ensure only one argument will pass through. Since this is effectively enforcing that a function is treated as unary, let's name it as such:

```js
function unary(fn) {
	return function onlyOneArg(arg){
		return fn( arg );
	};
}

// or the ES6 => arrow form
var unary =
	fn =>
		arg =>
			fn( arg );
```

We saw the `map(..)` utility eariler. It calls the provided mapping function with three arguments: `value`, `index`, and `list`. If you want your mapping function to only receive one of these, like `value`, use the `unary(..)` operation:

```js
function unary(fn) {
	return function onlyOneArg(arg){
		return fn( arg );
	};
}

var adder = looseCurry( sum, 2 );

// oops:
[1,2,3,4,5].map( adder( 3 ) );
// ["41,2,3,4,5", "61,2,3,4,5", "81,2,3,4,5", "101, ...

// fixed with `unary(..)`:
[1,2,3,4,5].map( unary( adder( 3 ) ) );
// [4,5,6,7,8]
```

Another commonly cited example using `unary(..)` is:

```js
["1","2","3"].map( parseFloat );
// [1,2,3]

["1","2","3"].map( parseInt );
// [1,NaN,NaN]

["1","2","3"].map( unary( parseInt ) );
// [1,2,3]
```

For the signature `parseInt(str,radix)`, it's clear that if `map(..)` passes an `index` in the second argument position, it will be interpreted by `parseInt(..)` as the `radix`, which we don't want. `unary(..)` creates a function that will ignore all but the first argument passed to it, meaning the passed in `index` is not mistaken as the `radix`.

### One On One

Speaking of functions with only one argument, another common base operation in the FP toolbelt is a function that takes one argument and does nothing but return the value untouched:

```js
function identity(v) {
	return v;
}

// or the ES6 => arrow form
var identity =
	v =>
		v;
```

This utility looks so simple as to hardly be useful. But even simple functions can be helpful in the world of FP. Like they say in acting: there are no small parts, only small actors.

For example, imagine you'd like split up a string using a regular expression, but the resulting array may have some empty values in it. To discard those, we can use JS's `filter(..)` array operation (covered in detail later in the text) with `identity(..)` as the predicate:

```js
var words = "   Now is the time for all...  ".split( /\s|\b/ );
words;
// ["","Now","is","the","time","for","all","...",""]

words.filter( identity );
// ["Now","is","the","time","for","all","..."]
```

Since `identity(..)` simply returns the value passed to it, JS coerces each value into either `true` or `false`, and that decides to keep or exclude each value in the final array.

**Tip:** Another unary function that can be used as the predicate in the previous example is JS's own `Boolean(..)` function, which explicitly coerces the values to `true` or `false`.

Another example of using `identity(..)` is as a default function in place of a transformation:

```js
function output(msg,formatFn = identity) {
	msg = formatFn( msg );
	console.log( msg );
}

function upper(txt) {
	return txt.toUpperCase();
}

output( "Hello World", upper );		// HELLO WORLD
output( "Hello World" );			// Hello World
```

If `output(..)` didn't have a default for `formatFn`, we could bring our earlier friend `partialRight(..)`:

```js
var specialOutput = partialRight( output, upper );
var simpleOutput = partialRight( output, identity );

specialOutput( "Hello World" );		// HELLO WORLD
simpleOutput( "Hello World" );		// Hello World
```

You also may see `identity(..)` used as a default transformation function for `map(..)` calls or as the initial value in a `reduce(..)` of a list of functions; both of these utilities will be covered in Chapter 8.

### Unchanging One

Certain APIs don't let you pass a value directly into a method, but require you to pass in a function, even if that function just returns the value. One such API is the `then(..)` method on JS Promises. Many claim that ES6 `=>` arrow functions are the "solution". But there's an FP utility that's perfectly suited for the task:

```js
function constant(v) {
	return function value(){
		return v;
	};
}

// or the ES6 => form
var constant =
	v =>
		() =>
			v;
```

With this tidy little utility, we can solve our `then(..)` annoyance:

```js
p1.then( foo ).then( () => p2 ).then( bar );

// vs

p1.then( foo ).then( constant( p2 ) ).then( bar );
```

**Warning:** Although the `() => p2` arrow function version is shorter than `constant(p2)`, I would encourage you to resist the temptation to use it. The arrow function is returning a value from outside of itself, which is a bit worse from the FP perspective. We'll cover the pitfalls of such actions later in the text, Chapter 5 "Reducing Side Effects".

## Spread 'Em Out

In Chapter 2, we briefly looked at parameter array destructuring. Recall this example:

```js
function foo( [x,y,...args] ) {
	// ..
}

foo( [1,2,3] );
```

In the parameter list of `foo(..)`, we declare that we're expecting a single array argument that we want to break down -- or in effect, spread out -- into individually named parameters `x` and `y`. Any other values in the array beyond those first two positions are gathered into an `args` array with the `...` operator.

This trick is handy if an array must be passed in but you want to treat its contents as individual parameters.

However, sometimes you won't have the ability to change the declaration of the function to use parameter array destructuring. For example, imagine these functions:

```js
function foo(x,y) {
	console.log( x + y );
}

function bar(fn) {
	fn( [ 3, 9 ] );
}

bar( foo );			// fails
```

Do you spot why `bar(foo)` fails?

The array `[3,9]` is sent in as a single value to `fn(..)`, but `foo(..)` expects `x` and `y` separately. If we could change the declaration of `foo(..)` to be `function foo([x,y]) { ..`, we'd be fine. Or, if we could change the behavior of `bar(..)` to make the call as `fn(...[3,9])`, the values `3` and `9` would be passed in individually.

There will be occasions when you have two functions that are imcompatible in this way, and you won't be able to change their declarations/definitions for various external reasons. So, how do you use them together?

We can define a helper to adapt a function so that it spreads out a single received array as its individual arguments:

```js
function spreadArgs(fn) {
	return function spreadFn(argsArr) {
		return fn( ...argsArr );
	};
}

// or the ES6 => arrow form
var spreadArgs =
	fn =>
		argsArr =>
			fn( ...argsArr );
```

**Note:** I called this helper `spreadArgs(..)`, but in libraries like Ramda it's often called `apply(..)`.

Now we can use `spreadArgs(..)` to adapt `foo(..)` to work as the proper input to `bar(..)`:

```js
bar( spreadArgs( foo ) );			// 12
```

It won't seem clear yet why these occassions will arise, but trust me, they do. Essentially, `spreadArgs(..)` will allow us to define functions that `return` multiple values via an array, but still have those multiple values treated independently as inputs to another function.

When function output becomes input to another function, this is called composition; we'll cover this topic in detail in Chapter 4.

While we're talking about a `spreadArgs(..)` utility, let's also define a utility to handle the opposite action:

```js
function gatherArgs(fn) {
	return function gatheredFn(...argsArr) {
		return fn( argsArr );
	};
}

// or the ES6 => arrow form
var gatherArgs =
	fn =>
		(...argsArr) =>
			fn( argsArr );
```

**Note:** In Ramda, this utility is referred to as `unapply(..)`, being that it's the opposite of `apply(..)`. I think the "spread" / "gather" terminology is a little more descriptive for what's going on.

We can use this utility to gather individual arguments into a single array, perhaps because we want to adapt a function with array parameter destructuring to another utility that passes arguments separately. We will cover `reduce(..)` in Chapter 8, but briefly: it repeatedly calls its reducer function with two individual parameters, which we can now *gather* together:

```js
function combineFirstTwo([ v1, v2 ]) {
	return v1 + v2;
}

[1,2,3,4,5].reduce( gatherArgs( combineFirstTwo ) );
// 15
```

## Order Matters

One of the frustrating things about currying and partial application of functions with multiple parameters is all the juggling we have to do with our arguments to get them into the right order. Sometimes we define a function with parameters in the order that we would want to curry them, but other times that order is incompatible and we have to jump through hoops to reorder.

The frustration is not merely that we need to use some utility to juggle the properties, but the fact that the usage of it clutters up our code a little bit with some extra noise. These kinds of things are like little paper cuts; one here or there isn't a showstopper, but the pain can certainly add up.

Is there anything we can do to free ourselves from this argument ordering tyranny!?

In Chapter 2, we looked at the named-argument destructuring pattern. Recall:

```js
function foo( {x,y} = {} ) {
	console.log( x, y );
}

foo( {
	y: 3
} );					// undefined 3
```

We destructure the first parameter of the `foo(..)` function -- it's expected to be an object -- into individual parameters `x` and `y`. Then, at the call-site, we pass in that single object argument, and provide properties as desired, "named arguments" to map to parameters.

The primary advantage of named arguments is not needing to juggle argument ordering, thereby improving readability. We can exploit this to improve currying/partial application if we invent alternate utilities that work with object properties:

```js
function partialProps(fn,presetArgsObj) {
	return function partiallyApplied(laterArgsObj){
		return fn( Object.assign( {}, presetArgsObj, laterArgsObj ) );
	};
}

function curryProps(fn,arity = 1) {
	return (function nextCurried(prevArgsObj){
		return function curried(nextArgObj = {}){
			var [key] = Object.keys( nextArgObj );
			var allArgsObj = Object.assign( {}, prevArgsObj, { [key]: nextArgObj[key] } );

			if (Object.keys( allArgsObj ).length >= arity) {
				return fn( allArgsObj );
			}
			else {
				return nextCurried( allArgsObj );
			}
		};
	})( {} );
}
```

We don't even need a `partialPropsRight(..)` because we don't need care about what order properties are being mapped; the name mappings make that ordering concern moot!

Here's how we use those utilities:

```js
function foo({ x, y, z } = {}) {
	console.log( `x:${x} y:${y} z:${z}` );
}

var f1 = curryProps( foo, 3 );
var f2 = partialProps( foo, { y: 2 } );

f1( {y: 2} )( {x: 1} )( {z: 3} );
// x:1 y:2 z:3

f2( { z: 3, x: 1 } );
// x:1 y:2 z:3
```

Order doesn't matter anymore! We can now specify which arguments we want in whatever sequence makes sense. No more `reverseArgs(..)` or other nuisances. Cool!

### Spreading Properties

Unfortunately, this only works because we have control over the signature of `foo(..)` and defined it to destructure its first parameter. What if we wanted to use this technique with a function that had its parameters indivdually listed (no parameter destructuring!), and we couldn't change that function signature?

```js
function bar(x,y,z) {
	console.log( `x:${x} y:${y} z:${z}` );
}
```

Just like the `spreadArgs(..)` utility earlier, we could define a `spreadArgProps(..)` helper that takes the `key: value` pairs out of an object argument and "spreads" the values out as individual arguments.

There are some quirks to be aware of, though. With `spreadArgs(..)`, we were dealing with arrays, where ordering is well defined and obvious. However, with objects, property order is less clear and not necessarily reliable. Depending on how an object is created and properties set, we cannot be absolutely certain what enumeration order properties would come out.

Such a utility needs a way to let you define what order the function in question expects its arguments (e.g., property enumeration order). We can pass an array like `["x","y","z"]` to tell the utility to pull the properties off the object argument in exactly that order.

That's decent, but it's also unfortunate that we kinda *have* to do add that property-name array even for the simplest of functions. Is there any kind of trick we could use to detect what order the parameters are listed for a function, in at least the common simple cases? Fortunately, yes!

JavaScript functions have a `.toString()` method that gives a string representation of the function's code, including the function declaration signature. Dusting off our regular expression parsing skills, we can parse the string representation of the function, and pull out the individually named parameters. The code looks a bit gnarly, but it's good enough to get the job done:

```js
function spreadArgProps(
	fn,
	propOrder =
		fn.toString()
		.replace( /^(?:(?:function.*\(([^]*?)\))|(?:([^\(\)]+?)\s*=>)|(?:\(([^]*?)\)\s*=>))[^]+$/, "$1$2$3" )
		.split( /\s*,\s*/ )
		.map( v => v.replace( /[=\s].*$/, "" ) )
) {
	return function spreadFn(argsObj) {
		return fn( ...propOrder.map( k => argsObj[k] ) );
	};
}
```

**Note:** This utility's parameter parsing logic is far from bullet-proof; we're using regular expressions to parse code, which is already a faulty premise! But our only goal here is to handle the common cases, which this does reasonably well. We only need a sensible default detection of parameter order for functions with simple parameters (as well as those with default parameter values). We don't, for example, need to be able to parse out a complex destructured parameter, because we wouldn't likely be using this utility with such a function, anyway. So, this logic gets the 80% job done; it lets us override the `propOrder` array for any other more complex function signature that wouldn't otherwise be correctly parsed. That's the kind of pragmatic balance this book seeks to find wherever possible.

Let's illustrate using our `spreadArgProps(..)` utility:

```js
function bar(x,y,z) {
	console.log( `x:${x} y:${y} z:${z}` );
}

var f3 = curryProps( spreadArgProps( bar ), 3 );
var f4 = partialProps( spreadArgProps( bar ), { y: 2 } );

f3( {y: 2} )( {x: 1} )( {z: 3} );
// x:1 y:2 z:3

f4( { z: 3, x: 1 } );
// x:1 y:2 z:3
```

A word of caution: the object parameters/named arguments pattern I'm showing here clearly improves readability by reducing the clutter of argument order juggling, but to my knowledge, no mainstream FP libraries are using this approach. It comes at the expense of being far less familiar than how most JavaScript FP is done.

Also, usage of functions defined in this style requires you to know what each argument's name is. You can't just remember, "oh, the function goes in as the first argument" anymore. Instead you have to remember, "the function parameter is called 'fn'."

Weigh these tradeoffs carefully.

## No Points

A popular style of coding in the FP world aims to reduce some of the visual clutter by removing unnecessary parameter-argument mapping. This style is formally called tacit programming, or more commonly: point-free style. The term "point" here is referring to a function's parameter.

**Warning:** Stop for a moment. Let's make sure we're careful not to take this discussion as an unbounded suggestion that you go overboard trying to be point-free in your FP code at all costs. This should be a technique for improving readability, when used in moderation. But as with most things in software development, you can definitely abuse it. If your code gets harder to understand because of the hoops you have to jump through to be point-free, stop. You won't win a blue ribbon just because you found some clever but esoteric way to remove another "point" from your code.

Let's start with a simple example:

```js
function double(x) {
	return x * 2;
}

[1,2,3,4,5].map( function mapper(v){
	return double( v );
} );
// [2,4,6,8,10]
```

Can you see that `mapper(..)` and `double(..)` have the same (or compatible, anyway) signatures? The parameter ("point") `v` can directly map to the corresponding argument in the `double(..)` call. As such, the `mapper(..)` function wrapper is unnecessary. Let's simplify with point-free style:

```js
function double(x) {
	return x * 2;
}

[1,2,3,4,5].map( double );
// [2,4,6,8,10]
```

Let's revisit an example from earlier:

```js
["1","2","3"].map( function mapper(v){
	return parseInt( v );
} );
// [1,2,3]
```

In this example, `mapper(..)` is actually serving an important purpose, which is to discard the `index` argument that `map(..)` would pass in, because `parseInt(..)` would incorrectly interpret that value as a `radix` for the parsing. This was an example where `unary(..)` helps us out:

```js
["1","2","3"].map( unary( parseInt ) );
// [1,2,3]
```

The key thing to look for is if you have a function with parameter(s) that is/are directly passed to an inner function call. In both the above examples, `mapper(..)` had the `v` parameter that was passed along to another function call. We were able to replace that layer of abstraction with a point-free expression using `unary(..)`.

**Warning:** You might have been tempted, as I was, to try `map(partialRight(parseInt,10))` to right-partially apply the `10` value as the `radix`. However, as we saw earlier, `partialRight(..)` only guarantees that `10` will be the last argument passed in, not that it will be specifically the second argument. Since `map(..)` itself passes three arguments (`value`, `index`, `arr`) to its mapping function, the `10` value would just be the fourth argument to `parseInt(..)`; it only pays attention to the first two.

Here's another example:

```js
// convenience to avoid any potential binding issue
// with trying to use `console.log` as a function
function output(txt) {
	console.log( txt );
}

function printIf( predicate, msg ) {
	if (predicate( msg )) {
		output( msg );
	}
}

function isShortEnough(str) {
	return str.length <= 5;
}

var msg1 = "Hello";
var msg2 = msg1 + " World";

printIf( isShortEnough, msg1 );			// Hello
printIf( isShortEnough, msg2 );
```

Now let's say you want to print a message only if it's long enough; in other words, if it's `!isShortEnough(..)`. Your first thought is probably this:

```js
function isLongEnough(str) {
	return !isShortEnough( str );
}

printIf( isLongEnough, msg1 );
printIf( isLongEnough, msg2 );			// Hello World
```

Easy enough... but "points" now! See how `str` is passed through? Without re-implementing the `str.length` check, can we refactor this code to point-free style?

Let's define a `not(..)` negation helper (often referred to as `complement(..)` in FP libraries):

```js
function not(predicate) {
	return function negated(...args){
		return !predicate( ...args );
	};
}

// or the ES6 => arrow form
var not =
	predicate =>
		(...args) =>
			!predicate( ...args );
```

Next, let's use `not(..)` to alternately define `isLongEnough(..)` without "points":

```js
var isLongEnough = not( isShortEnough );

printIf( isLongEnough, msg2 );			// Hello World
```

That's pretty good, isn't it? But we *could* keep going. The definition of the `printIf(..)` function can actually be refactored to be point-free itself.

We can express the `if` conditional part with a `when(..)` utility:

```js
function when(predicate,fn) {
	return function conditional(...args){
		if (predicate( ...args )) {
			return fn( ...args );
		}
	};
}

// or the ES6 => form
var when =
	(predicate,fn) =>
		(...args) =>
			predicate( ...args ) ? fn( ...args ) : undefined;
```

Let's mix `when(..)` with a few other helper utilities we've seen earlier in this chapter, to make the point-free `printIf(..)`:

```js
var printIf = uncurry( rightPartial( when, output ) );
```

Here's how we did it: we right-partially applied the `output` method as the second (`fn`) argument for `when(..)`, which leaves us with a function still expecting the first argument (`predicate`). *That* function when called produces another function expecting the message string; it would look like this: `fn(predicate)(str)`.

A chain of multiple (two) function calls like that looks an awful lot like a curried function, so we `uncurry(..)` this result to produce a single function that expects the two `str` and `predicate` arguments together, which matches the original `printIf(predicate,str)` signature.

Here's the whole example put back together (assuming various utilities we've already detailed in this chapter are present):

```js
function output(msg) {
	console.log( msg );
}

function isShortEnough(str) {
	return str.length <= 5;
}

var isLongEnough = not( isShortEnough );

var printIf = uncurry( partialRight( when, output ) );

var msg1 = "Hello";
var msg2 = msg1 + " World";

printIf( isShortEnough, msg1 );			// Hello
printIf( isShortEnough, msg2 );

printIf( isLongEnough, msg1 );
printIf( isLongEnough, msg2 );			// Hello World
```

Hopefully the FP practice of point-free style coding is starting to make a little more sense. It'll still take a lot of practice to train yourself to think this way naturally. **And you'll still have to make judgement calls** as to whether point-free coding is worth it, as well as what extent will benefit your code's readability.

What do you think? Points or no points for you?

**Note:** Want more practice with point-free style coding? We'll revisit this technique in "Revisiting Points" in Chapter 4, based on new-found knowledge of function composition.

## Summary

Partial Application is a technique for reducing the arity -- expected number of arguments to a function -- by creating a new function where some of the arguments are preset.

Currying is a special form of partial application where the arity is reduced to 1, with a chain of successive chained function calls, each which takes one argument. Once all arguments have been specified by these function calls, the original function is executed with all the collected arguments. You can also undo a currying.

Other important operations like `unary(..)`, `identity(..)`, and `constant(..)` are part of the base toolbox for FP.

Point-free is a style of writing code that eliminates unnecessary verbosity of mapping parameters ("points") to arguments, with the goal of making easier to read/understand code.
