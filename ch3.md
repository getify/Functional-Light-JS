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

可能使用 `uncurry(..)` 的更常见的情况，不是像刚刚展示的这样与一个手动柯里化过的函数一起使用，而是与一个做为某些其他一组操作的结果产生的柯里化函数一起使用。我们将在本章稍后的“无点”一节中讨论这种场景。

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

**注意：** 我称这个帮助工具为 `spreadArgs(..)`，但在 Ramda 这样的库中它经常被称为 `apply(..)`。

现在我们可以使用 `spreadArgs(..)` 来适配 `foo(..)`，使之成为 `bar(..)` 的恰当输入：

```js
bar( spreadArgs( foo ) );			// 12
```

这些场景为什么会发生看起来还不清楚，但相信我，它们会的。实质上，`spreadArgs(..)` 将允许我们定义通过一个数组 `return` 多个值的函数，但依然使那些多个值被独立地视为另一个函数的输入。

当一个函数的输出变为另一个函数的输入时，这称为组合；我们将在第四章中讲解这个话题。

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

**注意：** 在 Ramda 中，由于它是 `apply(..)` 的反义词，所以这个工具称做 `unapply(..)`。但我认为术语“扩散”/“聚集”对发生的事情更具描述性。

我们可以使用这个工具将独立的参数聚集到一个数组中，也许是因为我们想为了另一个分开传递参数的函数而适配一个带有数组形式参数解构的函数。我们将在第八章讲解 `reduce(..)`，但简要地说：它使用两个分开的形式参数反复调用它的递减函数，我们可以把这两个参数 *聚集* 在一起：

```js
function combineFirstTwo([ v1, v2 ]) {
	return v1 + v2;
}

[1,2,3,4,5].reduce( gatherArgs( combineFirstTwo ) );
// 15
```

## Order Matters

对带有多个形式参数的函数进行柯里化和局部应用的令人沮丧的事情之一，就是为了使我们的实际参数变为正确顺序而不得不进行的所有倒腾。有时我们定义一个函数，使它的形式参数顺序符合我们将要对它进行柯里化的顺序，但另一些时候这个顺序无法兼容，我们就不得不费尽周折地重排它们。

这种沮丧不仅仅是我们需要使用一些工具来搬弄这些属性，还有它们的用法带来的额外噪音将我们的代码搞乱了一点点。这种东西就像纸屑，这一点儿那一点儿并不碍事儿，但是这种痛苦无疑会累加起来。

有什么东西能将我们从参数重排的暴政下解放出来吗？

在第二章中，我们看到了命名参数解构模式。回忆一下：

```js
function foo( {x,y} = {} ) {
	console.log( x, y );
}

foo( {
	y: 3
} );					// undefined 3
```

我们将 `foo(..)` 函数的第一个形式参数 —— 它被期望是一个对象 —— 解构为独立的形式参数 `x` 和 `y`。然后，在调用点上，我们传入一个对象实际参数，并提入期待的那样提供属性 —— “命名实际参数”来映射到形式参数上。

命名实际参数的主要优势是无需搬弄参数顺序，因此提高了可读性。我们可以开拓这种模式来改进柯里化/局部应用，发明可以使用对象属性的替代工具：

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

我们甚至不需要 `partialPropsRight(..)`，因为我们不必关心属性被映射的顺序是什么；名称映射使得顺序的问题毫无意义！

这是我们如何使用这些工具：

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

顺序不再重要了！现在我们可以以任何顺序指定参数了。不再有 `reverseArgs(..)` 或其他讨厌的东西了。酷！

### Spreading Properties

不幸的是，真能够工作是因为我们拥有 `foo(..)` 的签名的控制权，并将它定义为解构第一个参数。要是我们想要对形式参数独立罗列（没有形式参数解构）的函数使用这种技术，而且我们还不能改变这个函数的签名呢？

```js
function bar(x,y,z) {
	console.log( `x:${x} y:${y} z:${z}` );
}
```

就像早先的 `spreadArgs(..)` 工具，我们可以定义一个 `spreadArgProps(..)` 帮助工具，它从一个实际参数对象中拿出 `key: value` 对，并将值“扩散”为独立的实际参数。

但是有一些怪异之处需要小心。使用 `spreadArgs(..)` 我们对付的是数组，它的顺序定义良好而且明显。然而，对于对象来说，属性顺序不那么清晰而且不一定可靠。根据对象的创建方式与属性设置的方式不同，我们不能绝对确定什么样的属性枚举顺序会出现。

这样的工具需要一个方法让你定义目标函数期待的实际参数事什么顺序（也就是属性枚举的顺序）。我们可以传递一个 `["x","y","z"]` 这样的数组来告诉工具，从实际参数对象中以这样的顺序来抽取属性。

这很合理，但很不幸的是，即便是对于最简单的函数我们也 *不得不* 加入这个属性-名称数组。有没有某种技巧可以使我们检测一个函数形式参数的罗列顺序，至少是为那些常见的简单情况？幸运的是，有的！

JavaScript 函数有一个 `.toString()` 方法，它会给出这个函数代码的字符串表现，包括函数声明的签名。擦亮我们的正则表达式解析技能，我们可以解析函数的字符串表达，并抽出各个命名形式参数。这段代码看起来有点儿粗糙，但是对于完成这个工作来说够好了：

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

**注意：** 这个工具的形式参数解析逻辑远不够完美；我们使用正则表达式解析代码，这已经是一个错误的前提了！但我们这里唯一的目标是处理常见情况，这时它能工作得相当好。我们只需要为带有简单形式参数的函数（以及那些带有默认形式参数值的函数）准备一个检测参数顺序的合理默认逻辑。我们不会，比如说，需要解析出复杂的被解构的形式参数，因为无论如何，我们不太可能在这样的函数上使用这个工具。所以，这个逻辑可以完成 80% 的工作；对于其他签名更复杂而不能被正确解析的函数，它允许我们覆盖 `propOrder` 数组。这种实用主义的平衡正是本书四处探索的。

让我们展示一下如何使用我们的 `spreadArgProps(..)` 工具：

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

一句提醒：我在这里展示的对象形式参数/命名实际参数模式通过减少搬弄参数顺序的混乱明显增强了可读性，但是据我所知，没有主流的 FP 库在使用这种方式。它的代价就是，与大多数 JavaScript FP 的方式比起来，远不为人所知。

另外，以这种风格定义的函数的用法要求你知道每个参数的名称是什么。你不再只需要记得，“哦，函数作为第一个参数传入”了。而是你不得不记住，“函数形式参数被称为 'fn'”。

要小心权衡这些得失。

## No Points

在 FP 世界中有一种很流行的编码风格，它的目标是通过移除不必要的形式参数-实际参数映射来减少视觉上的混乱。这种风格正式地被称为默认编程，或者更常见的被称为：无点风格。“点”这个词在这里指的是函数的形式参数。

**警告：** 停下一会。让我们确信我们足够小心而没有把这里的讨论作为一个无边界的建议 —— 使你不惜一切代价在你的 FP 代码中沉溺于无点风格。这应当是一种在适度使用的情况下改善可读性的技术。但正如软件开发中的大多数东西一样，你绝对可以滥用它。如果你的代码由于你试图成为无点风格的努力而变得难理解，停下。你不会因为发现了某些从代码中移除“点”的聪明但神秘的方法而获得荣誉的。

让我们从一个简单的例子开始：

```js
function double(x) {
	return x * 2;
}

[1,2,3,4,5].map( function mapper(v){
	return double( v );
} );
// [2,4,6,8,10]
```

你能看到 `mapper(..)` 和 `double(..)` 拥有相同（或兼容，不挂怎样）的签名吗？形式参数（“点”）`v` 可以直接映射到 `double(..)` 调用的响应实际参数上。因此，`mapper(..)` 包装函数是不必要的。让我们用无点风格简化一下：

```js
function double(x) {
	return x * 2;
}

[1,2,3,4,5].map( double );
// [2,4,6,8,10]
```

我们来重温一下早先的一个例子：

```js
["1","2","3"].map( function mapper(v){
	return parseInt( v );
} );
// [1,2,3]
```

在这个例子中，`mapper(..)` 实际上服务于一个重要的目的：丢弃 `map(..)` 将会传入的 `index` 实际参数，因为 `parseInt(..)` 将会在解析时错误地将这个值解释为 `radix`。这是一个 `unary(..)` 可以帮到我们的例子：

```js
["1","2","3"].map( unary( parseInt ) );
// [1,2,3]
```

寻找的关键之处是，你是否有一个函数，它的形式参数被直接传递给了一个内部函数调用。在上面两个例子中，`mapper(..)` 有一个形式参数 `v` 被直接传递给了另一个函数调用。所以我们可以用一个使用 `unary(..)` 的无点表达式来替换这层抽象。

**警告：** 你可能有过这种冲动，我也一样，试着用 `map(partialRight(parseInt,10))` 来将值 `10` 从右侧局部应用为 `radix`。但是，正如我们早先看到的，`partialRight(..)` 只能保证 `0` 将是最后一个被传入的参数，而不是特定地保证它将是第二个参数。因为 `map(..)` 本身传递三个参数（`value`、`index`、`arr`）给它的映射函数，所以值 `10` 将会是传给 `parseInt(..)` 的第四个参数；而 `parseInt(..)` 仅关注前两个。

这是另外一个例子：

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

现在我们假定你想仅在一个消息足够长时打印它；换言之，如果它 `!isShortEnough(..)`。你的第一直觉可能是这样：

```js
function isLongEnough(str) {
	return !isShortEnough( str );
}

printIf( isLongEnough, msg1 );
printIf( isLongEnough, msg2 );			// Hello World
```

很简单…… 但是现在有“点”！看到 `str` 是如何被传递的了吗？在不重新实现 `str.length` 的情况下，我们能将这段代码重构为无点风格的吗？

让我们定义一个 `not(..)` 否定帮助工具（在 FP 库中经常被称为 `complement(..)`）：

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

接下来，让我们使用 `not(..)` 来把 `isLongEnough(..)` 重新定义为没有“点”的：

```js
var isLongEnough = not( isShortEnough );

printIf( isLongEnough, msg2 );			// Hello World
```

这相当好，不是吗？但我们 *可以* 走得更远。函数 `printIf(..)` 的定义本身实际上可以被重构为无点风格。

我们可以使用一个 `when(..)` 工具来表达 `if` 条件的部分：

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

让我们把 `when` 与本章早先看到的几种其他帮助工具混合在一起，来制造无点的 `printIf(..)`：

```js
var printIf = uncurry( rightPartial( when, output ) );
```

我们是这样做的：我们将 `output` 方法从右侧局部应用为 `when(..)` 的第二个参数（`fn`），这给了我们一个依然在期望第一个参数（`predicate`）的函数。这个函数在被调用时会产生另一个期待消息字符串的函数；看起来就像这样：`fn(predicate)(str)`。

像这样多个（两个）函数调用的链条看起来像极了柯里化函数，于是我们 `uncurry(..)` 这个结果来产生一个同时期待 `str` 和 `predicate` 这两个参数的函数，它与原先的 `printIf(predicate,str)` 签名吻合。

这是把所有东西放在一起的完整例子（假定我们在本章中讲解过的各种工具都已经存在了）：

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

希望无点风格编码的 FP 实践开始有些讲得通了。你还需要很多练习才能以这种方式自然地思考。而无点编码是否值得 **依然需要由你作出决定**，以及将它使用到何种程度才会使你的代码可读性受益。

你怎么看？对你来说有“点”还是无“点”？

**注意：** 想要更多无点风格代码的练习？我们将在第四章的“重温‘点’”中，基于我们对函数组合的新知再次谈到这种技术.

## Summary

局部应用是一种降低元数 —— 一个函数期待的实际参数个数 —— 的技术，它是通过创建一个已预设一部分参数的新函数来做到的。

柯里化是局部应用的一种特殊形式，它将元数降低为 1 —— 使用一个连续的函数调用链条，每个调用接收一个参数。一旦通过这些函数调用所有参数都被指定了，原始函数就会带着这些被收集的参数被调用。你还可以去柯里化。

其他像 `unary(..)`、`identity(..)`、和 `constant(..)` 这样重要的操作，都是 FP 基础工具箱的一部分。

无点是一种编写代码的风格，它消灭了没必要的形式参数（“点”）到实际参数映射的繁冗，使得代码更易于阅读/理解。
