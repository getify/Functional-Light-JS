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

让我们来检视一种与局部应用相似的技术，它把一个期待多个实际参数的函数分解为相继链接的函数，这些函数的每一个只接收一个参数（元为1）并返回另一个接收下个参数的函数。

这种技术称为柯里化（currying）。

为了首先展示一下，让我们想象我们已经创建了一个柯里化版本的 `ajax(..)`。这是我们如何使用它：

```js
curriedAjax( "http://some.api/person" )
	( { user: CURRENT_USER_ID } )
		( function foundUser(user){ /* .. */ } );
```

也许将这三个调用分割开有助于我们理解发生了什么：

```js
var personFetcher = curriedAjax( "http://some.api/person" );

var getCurrentUser = personFetcher( { user: CURRENT_USER_ID } );

getCurrentUser( function foundUser(user){ /* .. */ } );
```

与一次性接收所有参数（比如 `ajax(..)`），或者（通过 `partial(..)`）一些参数提前接收剩下的稍后接收不同，这个 `curriedAjax(..)` 函数一次接收一个参数，每个参数都在一个分离的函数调用中。

柯里化与局部应用的相似之处在于，每个连续的柯里化调用都是对原始函进行另一个参数的局部应用，直到所有参数都被传递。

主要的区别是 `curriedAjax(..)` 将会明确地返回一个 **仅期待下个参数 `data`** 的函数（我们称为 `curriedGetPerson(..)`），而不是接收所有剩余参数的函数（比如早先的 `getPerson(..)`）。

如果一个原始函数期待 5 个参数，那么这个函数的柯里化形式将会仅仅接收第一个参数，并返回一个接收第二个参数的函数。而这个函数会仅接收第二个参数，并返回接收第三个参数的函数。以此类推。

所以柯里化是将一个高元函数展开成为一系列链接的一元函数。

我们如何定义一个执行柯里化的工具呢？我们将使用第二章中的一些技巧。

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

而为了 ES6 `=>` 爱好者：

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

这里的处理方式是使用一个空的 `[]` 数组初在 `prevArgs` 中始一个参数的集合，并将收到的每一个 `nextArg` 加入其中，这个连接的结果称为 `args`。当 `args.length` 小于 `arity`（原始 `fn(..)` 函数声明/期待的形式参数个数）时，制造并返回另一个 `curried(..)` 函数来收集下一个 `nextArg` 参数，并将当前的的 `args` 集合做为 `prevArgs` 传递。一旦我们有了足够的 `args`，就使用它们执行原始的 `fn(..)` 函数。

默认情况下，这种实现有赖于能够检查被柯里化函数的 `length` 属性，来知道在收集齐所有期待参数之前需要进行多少次柯里化的迭代。

如果你对一个没有准确 `length` 属性的函数使用这种实现的 `curry(..)` —— 函数的形式参数签名包含默认参数值，形式参数解构，或者它是带有 `...args` 可变参数；见第二章 —— 那么你就需要传递 `arity`（`curry(..)` 第二个形式参数） 来确保 `curry(..)` 工作正常。

这是我们如何对先前的 `ajax(..)` 示例使用 `curry(..)`：

```js
var curriedAjax = curry( ajax );

var personFetcher = curriedAjax( "http://some.api/person" );

var getCurrentUser = personFetcher( { user: CURRENT_USER_ID } );

getCurrentUser( function foundUser(user){ /* .. */ } );
```

每个调用都向原始的 `ajax(..)` 调用多添加一个参数，直到所有三个都被提供 `ajax(..)` 就会被执行。

还记得先前给数字列表的每个值都加 `3` 的例子吗？回想一下柯里化与局部应用的相似性，那么我们就可以使用柯里化以几乎相同的方式完成任务：

```js
[1,2,3,4,5].map( curry( add )( 3 ) );
// [4,5,6,7,8]
```

两者之间有什么区别？`partial(add,3)` vs `curry(add)(3)`。为什么你可能会选择 `curry(..)` 而不是 `partial(..)`？在你提前知道 `add(..)` 是将被采用的函数，而还不知道值 `3` 的情况下，它可能就很有用：

```js
var adder = curry( add );

// later
[1,2,3,4,5].map( adder( 3 ) );
// [4,5,6,7,8]
```

再来看另一个数字的例子，这次将它们的列表加在一起：

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

柯里化在这里的优势是，每次传递一个参数的调用都产生了另一个更加特化的函数，而且我们可以抓住这个新函数并在稍后的程序中使用它。局部应用提前指定所有的局部应用参数，产生一个等待所有剩余参数的函数。

如果你想使用局部应用一次指定一个参数，你就不得不在每一个后续函数上持续调用 `partialApply(..)`。柯里化的函数会自动这样做，使得一次一个地使用独立的参数更符合人体工程学。

在 JavaScript 中，柯里化和局部应用两者都是用闭包来跨越时间地记住参数，直到所有参数都被收到，继而原始的操作可以被实施。

### Why Currying And Partial Application?

不管是柯里化风格（`sum(1)(2)(3)`）还是局部应用风格（`partial(sum,1,2)(3)`），调用点都毫无疑问地比更常见的 `sum(1,2,3)` 看起来更奇怪。那么在采用 FP 时 **我们为什么要走向这个方向呢**？有许多层面可以回答这个问题。

第一个也是最明显的原因是，当参数在不同的时间与位置被声明时，柯里化与局部应用都允许你在时间/空间上分离（在你的整个代码库中），而传统函数调用要求所有的参数都被提前准备好。如果你将在你的代码中的一个地方知道参数中的一些，而在另一个地方其他参数才能被确定，柯里化与局部应用就非常有用。

这个回答的另一个层面最适用于柯里化，也就是当函数仅有一个参数时进行函数的组合要简单得多。所以一个最终需要三个参数的函数被柯里化后会变成一个一次仅需一个参数、连续三次的函数。这种一元函数在我们开始组合它们的时候非常容易使用。我们会在本书稍后阐明这个话题。

### Currying More Than One Argument?

到目前为止我给出的柯里化的定义和实现，我相信，是我们能在 JavaScript 中得到的最接近柯里化本色的定义和实现。

特别是，如果我们简要地看一下在 Haskell 中柯里化是如何工作的，我们就能观察到多个参数总是一次一个，每次柯里化调用一个地进入函数中 —— 而不是像元组（tuples，类似于数组的东西）那样在一个参数中传送多个值。

例如，在 Haskell 中：

```
foo 1 2 3
```

这调用了函数 `foo`，而且得到传入 `1`、`2` 和 `3` 三个值的结果。但在 Haskell 中函数是自动柯里化的，这意味着每个值都是作为分离的柯里化调用传入的。它的 JS 等价物看起来将是 `foo(1)(2)(3)`，与我在上面展示的 `curry(..)` 风格相同。

**注意：** 在 Haskell 中，`foo (1,2,3)` 不会立即将这三个值作为三个分离的参数传入，而是作为一个单独的元组（有些像 JS 的数组）参数。为了能使它工作，`foo` 需要被修改来处理出现在这个参数位置上的元组。据我所知，在 Haskell 中没有办法仅在一次函数调用中就分离地传递三个参数；每个参数都有它自己的柯里化调用。当然，这多次的调用对于 Haskell 开发者来说是透明的，但是对于 JS 开发者来说在语法上就明显多了。

由于这些原因，我认为我早先展示的 `curry(..)` 是一种忠于其本色的适配，或者我可以称之为“严格柯里化”。

然而，值得注意的是，有一种宽松的定义被用于大多数流行的 JavaScript FP 库中。

具体地讲，JS 柯里化工具经常允许你在每个柯里化调用中指定多个参数。重温我们之前的 `sum(..)` 的例子，它看起来将像是这样：

```js
var curriedSum = looseCurry( sum, 5 );

curriedSum( 1 )( 2, 3 )( 4, 5 );			// 15
```

我们看到在语法上稍稍节省了几个 `( )`，以及一个隐含的性能收益 —— 现在只有三个函数调用而不是五个。但除此之外，使用 `looseCurry(..)` 在结果上与早先严格的 `curry(..)` 定义是完全相同的。我猜这种方便/性能的因素可能就是这些框架允许多参数的原因。这看起来更像是个人口味的问题。

**注意：** 宽松柯里化确实给了你发送多于元数（检测到的或指定的）的参数的能力。如果你的函数设计带有可选/可变参数，这可能就有好处。例如，如果你柯里化五个参数，宽松柯里化依然允许多于五个参数（`curriedSum(1)(2,3,4)(5,6)`），但是严格柯里化不会支持 `curriedSum(1)(2)(3)(4)(5)(6)`。

我们可以让前一个柯里化实现采用这种常见的宽松定义：

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

现在每一个柯里化调用都接受一个或多个参数（作为 `nextArgs`）。定义 ES6 `=>` 版本的 `looseCurry(..)` 与我们先前为 `curry(..)` 所做的内容是类似的，我们将此作为练习留给感兴趣的读者。

### No Curry For Me, Please

可能还有这样的情况：你有一个柯里化函数，而你想进行某种去柯里化 —— 基本上，是将一个 `f(1)(2)(3)` 这样的函数转换回 `g(1,2,3)` 这样的函数。

这样的标准化工具经常（不）令人惊异地称为 `uncurry(..)`。这是一个幼稚的实现：

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

**警告：** 不要臆测 `uncurry(curry(f))` 将会与 `f` 有相同的行为。在某些库中去柯里化会得到一个与原函数相同的函数，但不是所有的库都是这样；我们这里例子就不是。去柯里化的函数会在你传递如原函数所期待的参数个数同样多的参数时表现得与原函数（几乎）相同。然而，如果你传入的参数少了，你依然会得到一个等待更多参数的局部柯里化的函数；这个怪异之处体现在下面的代码中。

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

可能使用 `uncurry(..)` 的更常见的情况，不是像刚刚展示的这样与一个手动柯里化过的函数一起使用，而是与一个做为某些其他一组操作的结果产生的柯里化函数一起使用。我们将在本章稍后的“无意义”一节中讨论这种场景。

## All For One

想象你正向一工具传递一个函数，这个工具将向你的函数发送多个参数。但你可能只希望收到一个参数。特别是当你有一个像我们前面讨论过的宽松柯里化函数时 —— 它 *可以* 接收更多的你不想要的参数。

我们可以设计一个简单的工具，它包装一个函数调用来确保只有一个参数将会通过。由于这实质上强制一个函数被视为一元（unary）的，那么就让我们如此命名吧：

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

我们早先看到过 `map(..)` 工具。它使用三个参数调用被提供的映射函数：`value`、`index`、和 `list`。如果你想让你的映射函数只接收其中之一，比如 `value`，就可以使用这个 `unary(..)` 操作：

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

另一个常被人说起的 `unary(..)` 用法是：

```js
["1","2","3"].map( parseFloat );
// [1,2,3]

["1","2","3"].map( parseInt );
// [1,NaN,NaN]

["1","2","3"].map( unary( parseInt ) );
// [1,2,3]
```

对于签名 `parseInt(str,radix)` 来说很明显，如果 `map(..)` 在第二个参数位置上传递一个 `index`，它将被 `parseInt(..)` 解释为 `radix`，这不是我们想要的。`unary(..)` 创建一个函数，它将会忽略除第一个之外所有被传递给它的参数，这意味着传入 `index` 不会被错认为 `radix`。

### One On One

说道仅含一个参数的函数，在 FP 工具箱中有另一个基本操作：一个函数，接收一个参数但不作任何事情并原封不动地返回它的值：

```js
function identity(v) {
	return v;
}

// or the ES6 => arrow form
var identity =
	v =>
		v;
```

这个工具看起来如此简单，以至于很难有什么用处。但即使是简单的函数也可以在 FP 的世界中很有用处。就像人们关于表演所说的：剧中没有小角色，只有小演员。

例如，想象你想使用一个正则表达式分割一个字符串，但是结果数组中可能含有一些空值。要去掉这些空值，我们可以使用 JS 的 `filter(..)` 数组操作（将在本书稍后详细讲解），将 `identity(..)` 作为判断函数：

```js
var words = "   Now is the time for all...  ".split( /\s|\b/ );
words;
// ["","Now","is","the","time","for","all","...",""]

words.filter( identity );
// ["Now","is","the","time","for","all","..."]
```

因为 `identity(..)` 简单地返回传递给它的值，JS 会将每个值强制转换为 `true` 或 `false`，并以此决定每个值是保留还是排除出最终的数组。

**提示：** 另一个可以用在前面例子中作为判断函数的一元函数是 JS 自己的 `Boolean(..)` 函数，它明确地将值强制转换为 `true` 或 `false`。

使用 `identity(..)` 的另一个例子是在变形的地方作为默认函数：

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

如果 `output(..)` 没有为 `formatFn` 准备默认值，我们可以拿出早前的朋友 `partialRight(..)`：

```js
var specialOutput = partialRight( output, upper );
var simpleOutput = partialRight( output, identity );

specialOutput( "Hello World" );		// HELLO WORLD
simpleOutput( "Hello World" );		// Hello World
```

你还可能看到 `identity(..)` 被用作 `map(..)` 的默认变形函数，或者在一个函数列表的 `reduce(..)` 中作为初始值；这两种工具都将在第八章中讲解。

### Unchanging One

特定的 API 不允许你将一个值直接传入一个方法，但要求你传入一个函数，即使这个函数只是返回这个值。一个这样的 API 就是 JS Promise 的 `then(..)` 方法。许多人声称 ES6 `=>` 箭头函数就是“解决方案”。但是有一个完美适合此任务的 FP 工具：

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

使用这个小小的工具，我们可以解决 `then(..)` 的烦恼：

```js
p1.then( foo ).then( () => p2 ).then( bar );

// vs

p1.then( foo ).then( constant( p2 ) ).then( bar );
```

**警告：** 虽然箭头函数的版本 `() => p2` 要比 `constant(p2)` 更短，但我鼓励你压制使用它的冲动。箭头函数返回了一个它外部的值，从 FP 的视角看来这不太好。我们将在本书稍后讲解这种行为的陷阱，第五章“降低副作用”。

## Spread 'Em Out

在第二章中，我们简要地看了一下形式参数数组解构。回想一下这个例子：

```js
function foo( [x,y,...args] ) {
	// ..
}

foo( [1,2,3] );
```

在 `foo(..)` 的形式参数列表中，我们声明我们期待一个数组参数，想要将它分解 —— 实质上是散开 —— 为独立的命名形式参数 `x` 与 `y`。任何在数组中超过前两个位置的值都被 `...` 操作符聚集到 `args` 数组中。

如果一个数组必须被传入但你想将它的内容看做独立的形式参数时，这种技巧十分方面。

然而，有时你不具备改变函数声明来让它使用数组解构的能力。例如，想象这些函数：

```js
function foo(x,y) {
	console.log( x + y );
}

function bar(fn) {
	fn( [ 3, 9 ] );
}

bar( foo );			// fails
```

你能看出 `bar(foo)` 为什么失败吗？

数组 `[3,9]` 作为一个单独的值被发送到 `fn(..)`，但是 `foo(..)` 分开期待 `x` 和 `y`。如果我们能将 `foo(..)` 的声明改变为 `function foo([x,y]) {..` 的话就没有问题。或者，如果我们能改变 `bar(..)` 的行为使它发起的调用为 `fn(...[3,9])` 的话，值 `3` 和 `9` 就将会被独立地传入。

会有这样的场景，你有两个这样不兼容的函数，而且由于种种外部原因你又不能改变它们的声明/定义。那么，你如何才能一起使用它们呢？

我们可以定义一个帮助工具来适配一个函数，让它把收到的数组分散为独立的实际参数值：

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

**注意：** 我称这个帮助工具为 `spreadArgs(..)`，但在 Ramda 这样的库中它经常被称为 `apply(..)`。

Now we can use `spreadArgs(..)` to adapt `foo(..)` to work as the proper input to `bar(..)`:

现在我们可以使用 `spreadArgs(..)` 来适配 `foo(..)`，使之成为 `bar(..)` 的恰当输入：

```js
bar( spreadArgs( foo ) );			// 12
```

It won't seem clear yet why these occassions will arise, but trust me, they do. Essentially, `spreadArgs(..)` will allow us to define functions that `return` multiple values via an array, but still have those multiple values treated independently as inputs to another function.

这些场景为什么会发生看起来还不清楚，但相信我，它们会的。实质上，`spreadArgs(..)` 将允许我们定义通过一个数组 `return` 多个值的函数，但依然使那些多个值被独立地视为另一个函数的输入。

When function output becomes input to another function, this is called composition; we'll cover this topic in detail in Chapter 4.

当一个函数的输出变为另一个函数的输入时，这称为组合；我们将在第四章中讲解这个话题。

While we're talking about a `spreadArgs(..)` utility, let's also define a utility to handle the opposite action:

我们谈到了 `spreadArgs(..)` 工具，让我们再定义一个处理相反动作的工具：

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

**注意：** 在 Ramda 中，由于它是 `apply(..)` 的反义词，所以这个工具称做 `unapply(..)`。但我认为术语“扩散”/“聚集”对发生的事情更具描述性。

We can use this utility to gather individual arguments into a single array, perhaps because we want to adapt a function with array parameter destructuring to another utility that passes arguments separately. We will cover `reduce(..)` in Chapter 8, but briefly: it repeatedly calls its reducer function with two individual parameters, which we can now *gather* together:

我们可以使用这个工具将独立的参数聚集到一个数组中，也许是因为我们想为另一个，适配一个带有数组形式参数解构的函数

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
