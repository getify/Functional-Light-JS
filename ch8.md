# Functional-Light JavaScript
# Chapter 8: List Operations

你在前一章闭包/对象的兔子洞中玩儿的开心吗？欢迎回来！

> 如果你能做很赞的事情，那就反复做。

我们在本书先前的部分已经看到了对一些工具的简要引用，现在我们要非常仔细地看看它们，它们是 `map(..)`、`filter(..)`、和 `reduce(..)`。在 JavaScript 中，这些工具经常作为数组（也就是“列表”）原型上的方法使用，所以我们很自然地称它们为数组或列表操作。

在我们讨论具体的数组方法之前，我们要在概念上检视一下这些操作是用来做什么的。在这一章中有两件同等重要的事情：理解列表操作 *为什么* 重要以及理解列表操作时 *如何* 工作的。确保你在头脑中带着这些细节来阅读这一章。

在这本书之外的世界以及这一章中对这些操作的最广大的常见展示方式是，描述一些在值的列表中实施的微不足道的任务（比如将一个数组中的每个数字翻倍）；这是一种讲清要点的简单廉价的方式。

但是不要仅仅将这些简单的例子一带而过却忽略了深层次的意义。理解列表操作对于 FP 来说最重要的价值来源于能够将一个任务的序列 —— 一系列 *看起来* 不太像一个列表的语句 —— 模型化为一个操作的列表，而非分别独立地执行它们。

这不只是一个编写更简洁代码的技巧。我们追求的是从指令式转向声明式，使代码模式可以轻而易举地识别从而更具可读性。

但是这里还有 **更重要的东西需要把握住**。使用指令式代码，一组计算中的每一个中间结果都通过赋值存储在变量中。你的代码越依赖这样的指令式模式，验证它在逻辑上没有错误就越困难 —— 对值的意外改变，或者埋藏下侧因／副作用。

通过将列表操作链接和／或组合在一起，中间结果会被隐含地追踪，并极大地防止这些灾难的发生。

**注意：** 与前面的章节相比，为了尽可能地保持后述代码段的简洁，我们将重度应用 ES6 的 `=>` 形式。但是，我在第二章中关于 `=>` 的建议依然在一般性的编码中适用。

## Non-FP List Processing

作为我们在本章中的讨论的序言，我要指出几个看起来与 JavaScript 数组和 FP 列表操作相关，但其实无关的操作。这些操作将不会在这里讲解，因为它们不符合一般的 FP 最佳实践：

* `forEach(..)`
* `some(..)`
* `every(..)`

`forEach(..)` 是一个迭代帮助函数，但它被设计为对每一个执行的函数调用都带有副作用；你可能猜到了为什么我们讨论不赞同它是一个 FP 列表操作。

`some(..)` 和 `every(..)` 确实鼓励使用纯函数（具体地讲，是像 `filter(..)` 这样的检测函数），但它们实质上像一个检索或匹配一样，不可避免地将一个列表递减为一个 `true` / `false` 的结果。这两个工具不是很适合我们想要对代码进行 FP 建模的模具，所以这里我们跳过它们不讲。

## Map

我们将从最基本而且最基础的 FP 列表操作之一开始我们的探索：`map(..)`。

一个映射是从一个值到另一个值的变形。例如，如果你有一个数字 `2` 而你将它乘以 `3`，那么你就将它映射到了 `6`。值得注意的是，我们所说的映射变形暗示着 *原地* 修改或者再赋值；而不是映射变形将一个新的值从一个地方投射到另一个地方。

换句话说：

```js
var x = 2, y;

// transformation / projection
y = x * 3;

// mutation / reassignment
x = x * 3;
```

如果我们将这个乘以 `3` 定义为一个函数，这个函数作为一个映射（变形）函数动作的话：

```js
var multipleBy3 = v => v * 3;

var x = 2, y;

// transformation / projection
y = multiplyBy3( x );
```

我们可以很自然地将映射从一个单独值的变形扩展到一个值的集合。`map(..)` 操作将列表中的所有值变形并将它们投射到一个新的列表中：

<p align="center">
	<img src="fig9.png" width="400">
</p>

要实现 `map(..)` 的话：

```js
function map(mapperFn,arr) {
	var newList = [];

	for (let idx = 0; i < arr.length; i++) {
		newList.push(
			mapperFn( arr[i], idx, arr )
		);
	}

	return newList;
}
```

**注意：** 形式参数的顺序 `mapperFn, arr` 一开始可能感觉是弄反了，但是在 FP 库中这种惯例非常常见，因为它使这些工具更容易（使用柯里化）组合。

`mapperFn(..)` 自然地讲项目列表传递给映射/变形，同时还有 `idx` 和 `arr`。我们这样做是为了与内建的 `map(..)` 保持一致。在某些情况下这些额外信息可能十分有用。

但是在其他情况下，你可能想使用一个仅有项目列表应当被传入的 `mapperFn(..)`，因为额外的参数有可能会改变它的行为。在第三章中的 “一切为了一个” 中介绍了 `unary(..)`，它限制一个函数仅接收一个实际参数（不论有多少被传递）。

回忆一下第三章中将 `parseInt(..)` 限制为一个参数的例子，它可以安全地用于 `mapperFn(..)`：

```js
map( ["1","2","3"], unary( parseInt ) );
// [1,2,3]
```

JavaScript 在数组上提供了内建的 `map(..)` 工具，使得它很容易地用作一个列表操作链条上的一部分。

**注意：** JavaScript 原型操作（`map(..)`、`filter(..)`、和 `reduce(..)`）都接收一个最后的可选参数，用于函数的 `this` 绑定。在我们第二章的 “This 是什么” 的讨论中，从为了符合 FP 的最佳实践的角度讲，基于 `this` 的编码一般来说应当尽可能避免。因此，我们在这一章的例子实现中不支持这样的 `this` 绑定特性。

除了你可以分别对数字和字符串列表实施的各种显而易见的操作之外，还有一些其他的映射操作的例子。我们可以使用 `map(..)` 来把一个函数的列表变形为一个它们返回值的列表：

```js
var one = () => 1;
var two = () => 2;
var three = () => 3;

[one,two,three].map( fn => fn() );
// [1,2,3]
```

或者我们可以首先将列表中的每一个函数都与另一个函数组合，然后再执行它们：

```js
var increment = v => ++v;
var decrement = v => --v;
var square = v => v * v;

var double = v => v * 2;

[increment,decrement,square]
.map( fn => compose( fn, double ) )
.map( fn => fn( 3 ) );
// [7,5,36]
```

关于 `map(..)` 的一件有趣的事：我们通常会臆测列表是从左到右处理的，但是 `map(..)` 的概念中对此没有任何要求。每一个变形对于其他的变形来说都应该是独立的。

从一般的意义上说，在一个支持并行的环境中映射甚至可以是并行化的，这对很大的列表来说可以极大地提升性能。我们没有看到 JavaScript 实际上在这样做，因为没有任何东西要求你传入一个像 `mapperFn(..)` 这样的纯函数，即使你 **本应这样做**。如果你传入一个非纯函数而且 JS 以不同的顺序运行不同的调用，那么这很快就会引起灾难。

虽然在理论上每一个映射操作都是独立的，但 JS 不得不假定它们不是。这很扫兴。

### Sync vs Async

我们在这一章中讨论的列表操作都是在一个所有值都已存在的列表上同步地操作；`map(..)` 在这里被认为是一种迫切的操作。但另一种考虑映射函数的方法是将它作为一个事件处理器，为在列表中遇到的每一个新的值而被调用。

想象一个如下虚构的东西：

```js
var newArr = arr.map();

arr.addEventListener( "value", multiplyBy3 );
```

现在，无论什么时候一个值被添加到 `arr` 种，事件处理器 `multiplyBy3(..)` —— 映射函数 —— 都会用这个值被调用，它变形出的值被添加到 `newArr`。

我们在暗示的是，数组以及我们在它们之上施加的数组操作，都是饥饿的同步版本，而这些相同的操作也可以在一个经过一段时间后才收到值的 “懒惰列表” （也就是流）上建模。

### Mapping vs Eaching

一些人鼓吹将 `map(..)` 作为一个一般形式的 `forEach(..)` 迭代使用，让它收到的值原封不动地通过，但之后可能实施一些副作用：

```js
[1,2,3,4,5]
.map( function mapperFn(v){
	console.log( v );			// side effect!
	return v;
} )
..
```

这种技术看起来好像有用是因为 `map(..)` 返回这个数组，于是你就可以继续在它后面链接更多操作；而 `forEach(..)` 的返回值是 `undefined`。然而，我认为你应当避免以这种方式使用 `map(..)`，因为以一种明确的非 FP 方式使用一种 FP 核心操作除了困惑不会造成其他任何东西。

你听说过用正确的工具做正确的工作这句谚语，对吧？锤子对钉子，改锥对螺丝，等等。这里有点儿不同：它是 *用正确的方式* 使用正确的工具。

一把锤子本应在你的手中挥动；但如果你用嘴叼住它来砸钉子，那你就不会非常高效。`map(..)` 的本意是映射值，不是造成副作用。

### A Word: Functors

在这本书中我们绝大多数时候都尽可能地与人工发明的 FP 术语保持距离。我们有时候用一些官方术语，但这多数是在我们可以从中衍生出一些对普通日常对话有意义的东西的时候。

我将要非常简要地打破这种模式，而使用一个可能有点儿吓人的词：仿函数。我想谈一下仿函数的原因是因为我们现在已经知道它们是做什么的了，也因为这个词在其他的 FP 文献中被频繁使用；至少你熟悉它并且不会被它吓到是有好处的。

一个仿函数是一个值，它有一个工具可以使一个操作函数作用于这个值。

如果这个值是复合的，也就是它由一些独立的值组成 —— 例如像数组一样！—— 那么仿函数会在每一个独立的值上应用操作函数。另外，仿函数工具会创建一个新的复合值来持有所有独立操作函数调用的结果。

这只是对我们刚刚看到的 `map(..)` 的一种炫酷的描述。`map(..)` 函数拿着与它关联的值（一个数组）和一个映射函数（操作函数），并对每一个数组中的独立值执行这个映射函数。最终，它返回一个带有所有被映射好的值的数组。

另一个例子：一个字符串仿函数将是一个字符串外加一个工具，这个工具对字符串中的每一个字符执行一些操作函数，返回一个带有被处理过的字符的新字符串。考虑这个高度造作的例子：

```js
function uppercaseLetter(c) {
	var code = c.charCodeAt( 0 );

	// lowercase letter?
	if (code >= 97 && code <= 122) {
		// uppercase it!
		code = code - 32;
	}

	return String.fromCharCode( code );
}

function stringMap(mapperFn,str) {
	return [...str].map( mapperFn ).join( "" );
}

stringMap( uppercaseLetter, "Hello World!" );
// HELLO WORLD!
```

`stringMap(..)` 允许一个字符串是一个仿函数。你可以为任意数据结构定义一个映射函数；只要这个工具符合这些规则，那么这种数据结构就是一个仿函数。

## Filter

想象我在百货商店里拿着一个空篮子来到了水果卖场；这里有一大堆水果货架（苹果、橘子、和香蕉）。我真的很饿，所以要尽可能多地拿水果，但我非常喜欢圆形的水果（苹果和橘子）。于是我一个一个地筛选水果，然后带着仅装有苹果和橘子的篮子离开了。

假定我们称这种处理为 *过滤*。你将如何更自然地描述我的购物过程？是以一个空篮子为起点并仅仅 **滤入**（选择，包含）苹果和橘子，还是以整个水果货架为起点并 **滤除**（跳过，排除）香蕉，直到我的篮子装满水果？

如果你在一锅水中煮意大利面，然后把它倒进水槽上的笊篱（也就是过滤器）中，你是在滤入意大利面还是在滤除水？如果你将咖啡粉末放进滤纸中泡一杯咖啡，你是在自己的杯子中滤入了咖啡，还是滤除了咖啡粉末？

你对过滤的视角是不是有赖于你想要的东西是否 “保留” 在过滤器中或者通过了过滤器？

那么当你在航空公司/酒店的网站上制定一些选项来 “过滤你的结果” 呢？你是在滤入符合你标准的结果，还是在滤除所有不符合标准的东西？仔细考虑一下：这个例子与前一个比起来可能有不同的语义。

根据你的视角不同，过滤不是排除性的就是包含性的。这种概念上的冲突非常不幸。

我想对过滤的最常见的解释 —— 在编程的世界之外 —— 是你在滤除不想要的东西。不幸的是，在编程中，我们实质上更像是将这种语义反转为滤入想要的东西。

`filter(..)` 列表操作用一个函数来决定原来数组中的每一个值是否应该保留在新的数组中。如果一个值应当被保留，那么这个函数需要返回 `true`，如果它应当被跳过则返回 `false`。一个为做决定而返回 `true` / `false` 的函数有一个特殊的名字：判定函数。

如果你将 `true` 作为一个正面的信号，那么 `filter(..)` 的定义就是你想要 “保留”（滤入）一个值而非 “丢弃”（滤除）一个值。

为了将 `filter(..)` 作为一种排除性操作使用，你不得不把思维拧过来，通过返回 `false` 将正面信号考虑为一种排除，并通过返回 `true` 别动地让一个值通过。

这种语义错位很重要的原因，是因为它会影响你如何命名那个用作 `predicateFn(..)` 的函数，以及它对代码可读性的意义。我们马上就会谈到这一点。

这是 `filter(..)` 操作在一个值的列表中的可视化表达：

<p align="center">
	<img src="fig10.png" width="400">
</p>

要实现 `filter(..)`：

```js
function filter(predicateFn,arr) {
	var newList = [];

	for (let idx = 0; idx < arr.length; idx++) {
		if (predicateFn( arr[idx], idx, arr )) {
			newList.push( arr[idx] );
		}
	}

	return newList;
}
```

注意，正如之前的 `mapperFn(..)` 一样，`predicateFn(..)` 不仅被传入一个值，而且还被传入了 `idx` 和 `arr`。根据需要使用 `unary(..)` 来限制它的参数。

和 `map(..)` 一样，`filter(..)` 作为一种 JS 数组上的内建工具被提供。

让我们考虑一个这样的判定函数：

```js
var whatToCallIt = v => v % 2 == 1;
```

这个函数使用 `v % 2 == 1` 来返回 `true` 或 `false`。这里的效果是一个奇数将会返回 `true`，而一个偶数将会返回 `false`。那么，我们应该管这个函数叫什么？一个自然的名字可能是：

```js
var isOdd = v => v % 2 == 1;
```

考虑一下在你代码中的某处你将如何使用 `isOdd(..)` 进行简单的值校验：

```js
var midIdx;

if (isOdd( list.length )) {
	midIdx = (list.length + 1) / 2;
}
else {
	midIdx = list.length / 2;
}
```

有些道理，对吧？让我们再考虑一下将它与数组内建的 `filter(..)` 一起使用来过滤一组值：

```js
[1,2,3,4,5].filter( isOdd );
// [1,3,5]
```

如果要你描述一下 `[1,3,5]` 这个结果，你会说 “我滤除了偶数” 还是 “我滤入了奇数”？我觉得前者是描述它的更自然的方式。但是代码读起来却相反。代码读起来几乎就是，我们 “过滤（入）了每一个是奇数的数字”。

我个人觉得这种语义令人糊涂。对于有经验的开发者来说无疑有许多先例可循。但是如果你刚刚起步，这种逻辑表达式看起来有点儿像不用双否定就不说话 —— 也就是，用双否定说话。

我们可以通过把函数 `isOdd(..)` 重命名为 `isEven(..)` 让事情容易一些：

```js
var isEven = v => v % 2 == 1;

[1,2,3,4,5].filter( isEven );
// [1,3,5]
```

呀！但这个函数用这个名字根本讲不通，因为当数字为偶数时它返回 `false`：

```js
isEven( 2 );		// false
```

讨厌。

回忆一下第三章中的 “无点”，我们定义了一个对判定函数取反的 `not(..)` 操作符。考虑：

```js
var isEven = not( isOdd );

isEven( 2 );		// true
```

But we can't use *this* `isEven(..)` with `filter(..)` the way it's currently defined, because our logic will be reversed; we'll end up with evens, not odds. We'd need to do:

```js
[1,2,3,4,5].filter( not( isEven ) );
// [1,3,5]
```

That defeats the whole purpose, though, so let's not do that. We're just going in circles.

### Filtering-Out & Filtering-In

To clear up all this confusion, let's define a `filterOut(..)` that actually **filters out** values by internally negating the predicate check. While we're at it, we'll alias `filterIn(..)` to the existing `filter(..)`:

```js
var filterIn = filter;

function filterOut(predicateFn,arr) {
	return filterIn( not( predicateFn ), arr );
}
```

Now we can use whichever filtering makes most sense at any point in our code:

```js
isOdd( 3 );								// true
isEven( 2 );							// true

filterIn( isOdd, [1,2,3,4,5] );			// [1,3,5]
filterOut( isEven, [1,2,3,4,5] );		// [1,3,5]
```

I think using `filterIn(..)` and `filterOut(..)` (known as `reject(..)` in Ramda) will make your code a lot more readable than just using `filter(..)` and leaving the semantics conflated and confusing for the reader.

## Reduce

While `map(..)` and `filter(..)` produce new lists, typically this third operator (`reduce(..)`) combines (aka "reduces") the values of a list down to a single finite (non-list) value, like a number or string. However, later in this chapter, we'll look at how you can push `reduce(..)` to use it in more advanced ways. `reduce(..)` is one of the most important FP tools; it's like a swiss army all-in-one knife with all its usefulness.

A combination/reduction is abstractly defined as taking two values and making them into one value. Some FP contexts refer to this as "folding", as if you're folding two values together into on value. That's a helpful visualization, I think.

Just like with mapping and filtering, the manner of the combination is entirely up to you, and generally dependent on the types of values in the list. For example, numbers will typically be combined through arithmetic, strings through concatenation, and functions through composition.

Sometimes a reduction will specify an `initialValue` and start its work by combining it with the first value in the list, cascading down through each of the rest of the values in the list. That looks like this:

<p align="center">
	<img src="fig11.png" width="400">
</p>

Alternately, you can omit the `initialValue` in which case the first value of the list will act in place of the `initialValue` and the combining will start with the second value in the list, like this:

<p align="center">
	<img src="fig12.png" width="400">
</p>

**Warning:** In JavaScript, if there's not at least one value in the reduction (either in the array or specified as `initialValue`), an error is thrown. Be careful not to omit the `initialValue` if the list for the reduction could possibly be empty under any circumstance.

The function you pass to `reduce(..)` to perform the reduction is typically called a reducer. A reducer has a different signature from the mapper and predicate functions we looked at earlier. Reducers primarily receive the current reduction result as well as the next value to reduce it with. The current result at each step of the reduction is often referred to as the accumulator.

For example, consider the steps involved in multiply-reducing the numbers `5`, `10`, and `15`, with an `initialValue` of `3`:

1. `3` * `5` = `15`
2. `15` * `10` = `150`
3. `150` * `15` = `2250`

Expressed in JavaScript using the built-in `reduce(..)` method on arrays:

```js
[5,10,15].reduce( (product,v) => product * v, 3 );
// 2250
```

But a standalone implementation of `reduce(..)` might look like this:

```js
function reduce(reducerFn,initialValue,arr) {
	var acc, startIdx;

	if (arguments.length == 3) {
		acc = initialValue;
		startIdx = 0;
	}
	else if (arr.length > 0) {
		acc = arr[0];
		startIdx = 1;
	}
	else {
		throw new Error( "Must provide at least one value." );
	}

	for (let idx = startIdx; idx < arr.length; idx++) {
		acc = reducerFn( acc, arr[idx], idx, arr );
	}

	return acc;
}
```

Just as with `map(..)` and `filter(..)`, the reducer function is also passed the lesser-common `idx` and `arr` arguments in case that's useful to the reduction. I would say I don't typically use these, but I guess it's nice to have them available.

Recall in Chapter 4, we discussed the `compose(..)` utility and showed an implementation with `reduce(..)`:

```js
function compose(...fns) {
	return function composed(result){
		return fns.reverse().reduce( function reducer(result,fn){
			return fn( result );
		}, result );
	};
}
```

To illustrate `reduce(..)`-based composition differently, consider a reducer that will compose functions left-to-right (like `pipe(..)` does), to use in an array chain:

```js
var pipeReducer = (composedFn,fn) => pipe( composedFn, fn );

var fn =
	[3,17,6,4]
	.map( v => n => v * n )
	.reduce( pipeReducer );

fn( 9 );			// 11016  (9 * 3 * 17 * 6 * 4)
fn( 10 );			// 12240  (10 * 3 * 17 * 6 * 4)
```

`pipeReducer(..)` is unfortunately not point-free (see "No Points" in Chapter 3), but we can't just pass `pipe(..)` as the reducer itself, because it's variadic; the extra arguments (`idx` and `arr`) that `reduce(..)` passes to its reducer function would be problematic.

Earlier we talked about using `unary(..)` to limit a `mapperFn(..)` or `predicateFn(..)` to just a single argument. It might be handy to have a `binary(..)` that does something similar but limits to two arguments, for a `reducerFn(..)` function:

```js
var binary =
	fn =>
		(arg1,arg2) =>
			fn( arg1, arg2 );
```

Using `binary(..)`, our previous example is a little cleaner:

```js
var pipeReducer = binary( pipe );

var fn =
	[3,17,6,4]
	.map( v => n => v * n )
	.reduce( pipeReducer );

fn( 9 );			// 11016  (9 * 3 * 17 * 6 * 4)
fn( 10 );			// 12240  (10 * 3 * 17 * 6 * 4)
```

Unlike `map(..)` and `filter(..)` whose order of passing through the array wouldn't actually matter, `reduce(..)` definitely uses left-to-right processing. If you want to reduce right-to-left, JavaScript provides a `reduceRight(..)`, with all other behaviors the same as `reduce(..)`:

```js
var hyphenate = (str,char) => str + "-" + char;

["a","b","c"].reduce( hyphenate );
// "a-b-c"

["a","b","c"].reduceRight( hyphenate );
// "c-b-a"
```

Where `reduce(..)` works left-to-right and thus acts naturally like `pipe(..)` in composing functions, `reduceRight(..)`'s right-to-left ordering is natural for performing a `compose(..)`-like operation. So, let's revisit `compose(..)` using `reduceRight(..)`:

```js
function compose(...fns) {
	return function composed(result){
		return fns.reduceRight( function reducer(result,fn){
			return fn( result );
		}, result );
	};
}
```

Now, we don't need to do `fns.reverse()`; we just reduce from the other direction!

### Map As Reduce

The `map(..)` operation is iterative in its nature, so it can also be represented as a reduction (`reduce(..)`). The trick is to realize that the `initialValue` of `reduce(..)` can be itself an (empty) array, in which case the result of a reduction can be another list!

```js
var double = v => v * 2;

[1,2,3,4,5].map( double );
// [2,4,6,8,10]

[1,2,3,4,5].reduce(
	(list,v) => (
		list.push( double( v ) ),
		list
	), []
);
// [2,4,6,8,10]
```

**Note:** We're cheating with this reducer and allowing a side effect by allowing `list.push(..)` to mutate the list that was passed in. In general, that's not a good idea, obviously, but since we know the `[]` list is being created and passed in, it's less dangerous. You could be more formal -- yet less performant! -- by creating a new list with the val `concat(..)`d onto the end. We'll come back to this cheat in Appendix A.

Implementing `map(..)` with `reduce(..)` is not on its surface an obvious step or even an improvement. However, this ability will be a crucial recognition for more advanced techniques like those we'll cover in Appendix A "Transducing".

### Filter As Reduce

Just as `map(..)` can be done with `reduce(..)`, so can `filter(..)`:

```js
var isOdd = v => v % 2 == 1;

[1,2,3,4,5].filter( isOdd );
// [1,3,5]

[1,2,3,4,5].reduce(
	(list,v) => (
		isOdd( v ) ? list.push( v ) : undefined,
		list
	), []
);
// [1,3,5]
```

**Note:** More impure reducer cheating here. Instead of `list.push(..)`, we could have done `list.concat(..)` and returned the new list. We'll come back to this cheat in Appendix A.

## Advanced List Operations

Now that we feel somewhat comfortable with the foundational list operations `map(..)`, `filter(..)`, and `reduce(..)`, let's look at a few more-sophisticated operations you may find useful in various situations. These are generally utilities you'll find in various FP libraries.

### Unique

Filtering a list to include only unique values, based on `indexOf(..)` searching ( which uses `===` strict equality comparision):

```js
var unique =
	arr =>
		arr.filter(
			(v,idx) =>
				arr.indexOf( v ) == idx
		);
```

This technique works by observing that we should only include the first occurrence of an item from `arr` into the new list; when running left-to-right, this will only be true if its `idx` position is the same as the `indexOf(..)` found position.

Another way to implement `unique(..)` is to run through `arr` and include an item into a new (initially empty) list if that item cannot already be found in the new list. For that processing, we use `reduce(..)`:

```js
var unique =
	arr =>
		arr.reduce(
			(list,v) =>
				list.indexOf( v ) == -1 ?
					( list.push( v ), list ) : list
		, [] );
```

**Note:** There are many other ways to implement this algorithm using more imperative approaches like loops, and many of them are likely "more efficient" performance-wise. However, the advantage of either of these presented approaches is that they use existing built-in list operations, which makes them easier to chain/compose alongside other list operations. We'll talk more about those concerns later in this chapter.

`unique(..)` nicely produces a new list with no duplicates:

```js
unique( [1,4,7,1,3,1,7,9,2,6,4,0,5,3] );
// [1, 4, 7, 3, 9, 2, 6, 0, 5]
```

### Flatten

From time to time, you may have (or produce through some other operations) an array that's not just a flat list of values, but with nested arrays, such as:

```js
[ [1, 2, 3], 4, 5, [6, [7, 8]] ]
```

What if you'd like to transform it into:

```js
[ 1, 2, 3, 4, 5, 6, 7, 8 ]
```

The operation we're looking for is typically called `flatten(..)`, and it could be implemented like this using our swiss army knife `reduce(..)`:

```js
var flatten =
	arr =>
		arr.reduce(
			(list,v) =>
				list.concat( Array.isArray( v ) ? flatten( v ) : v )
		, [] );
```

**Note:** This implementation choice relies on recursion to handle the nesting of lists. More on recursion in a later chapter.

To use `flatten(..)` with an array of arrays (of any nested depth):

```js
flatten( [[0,1],2,3,[4,[5,6,7],[8,[9,[10,[11,12],13]]]]] );
// [0,1,2,3,4,5,6,7,8,9,10,11,12,13]
```

You might like to limit the recursive flattening to a certain depth. We can handle this by adding an optional `depth` limit argument to the implementaiton:

```js
var flatten =
	(arr,depth = Infinity) =>
		arr.reduce(
			(list,v) =>
				list.concat(
					depth > 0 ?
						(depth > 1 && Array.isArray( v ) ?
							flatten( v, depth - 1 ) :
							v
						) :
						[v]
				)
		, [] );
```

Illustrating the results with different flattening depths:

```js
flatten( [[0,1],2,3,[4,[5,6,7],[8,[9,[10,[11,12],13]]]]], 0 );
// [[0,1],2,3,[4,[5,6,7],[8,[9,[10,[11,12],13]]]]]

flatten( [[0,1],2,3,[4,[5,6,7],[8,[9,[10,[11,12],13]]]]], 1 );
// [0,1,2,3,4,[5,6,7],[8,[9,[10,[11,12],13]]]]

flatten( [[0,1],2,3,[4,[5,6,7],[8,[9,[10,[11,12],13]]]]], 2 );
// [0,1,2,3,4,5,6,7,8,[9,[10,[11,12],13]]]

flatten( [[0,1],2,3,[4,[5,6,7],[8,[9,[10,[11,12],13]]]]], 3 );
// [0,1,2,3,4,5,6,7,8,9,[10,[11,12],13]]

flatten( [[0,1],2,3,[4,[5,6,7],[8,[9,[10,[11,12],13]]]]], 4 );
// [0,1,2,3,4,5,6,7,8,9,10,[11,12],13]

flatten( [[0,1],2,3,[4,[5,6,7],[8,[9,[10,[11,12],13]]]]], 5 );
// [0,1,2,3,4,5,6,7,8,9,10,11,12,13]
```

#### Mapping, Then Flattening

One of the most common usages of `flatten(..)` behavior is when you've mapped a list of elements where each transformed value from the original list is now itself a list of values. For example:

```js
var firstNames = [
	{ name: "Jonathan", variations: [ "John", "Jon", "Jonny" ] },
	{ name: "Stephanie", variations: [ "Steph", "Stephy" ] },
	{ name: "Frederick", variations: [ "Fred", "Freddy" ] }
];

firstNames
.map( entry => [entry.name].concat( entry.variations ) );
// [ ["Jonathan","John","Jon","Jonny"], ["Stephanie","Steph","Stephy"],
//   ["Frederick","Fred","Freddy"] ]
```

The return value is an array of arrays, which might be more awkward to work with. If we want a single dimension list with all the names, we can then `flatten(..)` that result:

```js
flatten(
	firstNames
	.map( entry => [entry.name].concat( entry.variations ) )
);
// ["Jonathan","John","Jon","Jonny","Stephanie","Steph","Stephy","Frederick",
//  "Fred","Freddy"]
```

Besides being slightly more verbose, the disadvantage of doing the `map(..)` and `flatten(..)` as separate steps is primarily around performance; this approach processes the list twice.

FP libraries typically define a `flatMap(..)` (often also called `chain(..)`) that does the mapping-then-flattening combined. For consistency and ease of composition (via currying), the `flatMap(..)` / `chain(..)` utility typically matches the `mapperFn, arr` parameter order that we saw earlier with the standalone `map(..)`, `filter(..)`, and `reduce(..)` utilities.

```js
flatMap( entry => [entry.name].concat( entry.variations ), firstNames );
// ["Jonathan","John","Jon","Jonny","Stephanie","Steph","Stephy","Frederick",
//  "Fred","Freddy"]
```

The naive implementation of `flatMap(..)` with both steps done separately:

```js
var flatMap =
	(mapperFn,arr) =>
		flatten( arr.map( mapperFn ), 1 );
```

**Note:** We use `1` for the flattening-depth because the typical definition of `flatMap(..)` is that the flattening is shallow on just the first level.

Since this approach still processes the list twice resulting in worse performance, we can combine the operations manually, using `reduce(..)`:

```js
var flatMap =
	(mapperFn,arr) =>
		arr.reduce(
			(list,v) =>
				list.concat( mapperFn( v ) )
		, [] );
```

While there's some convenience and performance gained with a `flatMap(..)` utility, there may very well be times when you need other operations like `filter(..)`ing mixed in. If that's the case, doing the `map(..)` and `flatten(..)` separately might still be more appropriate.

### Zip

So far, the list operations we've examined have operated on a single list. But some cases will need to process multiple lists. One well-known operation alternates selection of values from each of two input lists into sub-lists, called `zip(..)`:

```js
zip( [1,3,5,7,9], [2,4,6,8,10] );
// [ [1,2], [3,4], [5,6], [7,8], [9,10] ]
```

Values `1` and `2` were selected into the sub-list `[1,2]`, then `3` and `4` into `[3,4]`, etc. The definition of `zip(..)` requires a value from each of the two lists. If the two lists are of different lengths, the selection of values will continue until the shorter list has been exhausted, with the extra values in the other list ignored.

An implementation of `zip(..)`:

```js
function zip(arr1,arr2) {
	var zipped = [];
	arr1 = arr1.slice();
	arr2 = arr2.slice();

	while (arr1.length > 0 && arr2.length > 0) {
		zipped.push( [ arr1.shift(), arr2.shift() ] );
	}

	return zipped;
}
```

The `arr1.slice()` and `arr2.slice()` calls ensure `zip(..)` is pure by not causing side effects on the received array references.

**Note:** There are some decidedly un-FP things going on in this implementation. There's an imperative `while`-loop and mutations of lists with both `shift()` and `push(..)`. Earlier in the book, I asserted that it's reasonable for pure functions to use impure behavior inside them (usually for performance), as long as the effects are fully self-contained. This implementation is safely pure.

### Merge

Merging two lists by interleaving values from each source looks like this:

```js
mergeLists( [1,3,5,7,9], [2,4,6,8,10] );
// [1,2,3,4,5,6,7,8,9,10]
```

It may not be obvious, but this result seems similar to what we get if we compose `flatten(..)` and `zip(..)`:

```js
zip( [1,3,5,7,9], [2,4,6,8,10] );
// [ [1,2], [3,4], [5,6], [7,8], [9,10] ]

flatten( [ [1,2], [3,4], [5,6], [7,8], [9,10] ] );
// [1,2,3,4,5,6,7,8,9,10]

// composed:
flatten( zip( [1,3,5,7,9], [2,4,6,8,10] ) );
// [1,2,3,4,5,6,7,8,9,10]
```

However, recall that `zip(..)` only selects values until the shorter of two lists is exhausted, ignoring the leftover values; merging two lists would most naturally retain those extra values. Also, `flatten(..)` works recursively on nested lists, but you might expect list-merging to only work shallowly, keeping nested lists.

So, let's define a `mergeLists(..)` that works more like we'd expect:

```js
function mergeLists(arr1,arr2) {
	var merged = [];
	arr1 = arr1.slice();
	arr2 = arr2.slice();

	while (arr1.length > 0 || arr2.length > 0) {
		if (arr1.length > 0) {
			merged.push( arr1.shift() );
		}
		if (arr2.length > 0) {
			merged.push( arr2.shift() );
		}
	}

	return merged;
}
```

**Note:** Various FP libraries don't define a `mergeLists(..)` but instead define a `merge(..)` that merges properties of two objects; the results of such a `merge(..)` will differ from our `mergeLists(..)`.

Alternatively, here's a couple of options to implement the list merging as a reducer:

```js
// via @rwaldron
var mergeReducer =
	(merged,v,idx) =>
		(merged.splice( idx * 2, 0, v ), merged);


// via @WebReflection
var mergeReducer =
	(merged,v,idx) =>
		merged
			.slice( 0, idx * 2 )
			.concat( v, merged.slice( idx * 2 ) );
```

And using a `mergeReducer(..)`:

```js
[1,3,5,7,9]
.reduce( mergeReducer, [2,4,6,8,10] );
// [1,2,3,4,5,6,7,8,9,10]
```

**Tip:** We'll use the `mergeReducer(..)` trick later in the chapter.

## Method vs. Standalone

A common source of frustration for FPers in JavaScript is unifying their strategy for working with utilities when some of them are provided as standalone functions -- think about the various FP utilities we've derived in previous chapters -- and others are methods of the array prototype -- like the ones we've seen in this chapter.

The pain of this problem becomes more evident when you consider combining multiple operations:

```js
[1,2,3,4,5]
.filter( isOdd )
.map( double )
.reduce( sum, 0 );					// 18

// vs.

reduce(
	map(
		filter( [1,2,3,4,5], isOdd ),
		double
	),
	sum,
	0
);									// 18
```

Both API styles accomplish the same task, but they have very different ergonomics. Many FPers will prefer the latter to the former, but the former is unquestionably more common in JavaScript. One thing specifically that's disliked about the latter is the nesting of the calls. The preference for the method chain style -- typically called a fluent API style, as in jQuery and other tools -- is that it's compact/concise and it reads in declarative top-down order.

The visual order for that manual composition of the standalone style is neither strictly left-to-right (top-to-bottom) nor right-to-left (bottom-to-top); it's inner-to-outer, which harms the readability.

Automatic composition normalizes the reading order as right-to-left (bottom-to-top) for both styles. So, to explore the implications of the style differences, let's examine composition specifically; it seems like it should be straightforward, but it's a little awkward in both cases.

### Composing Method Chains

The array methods receive the implicit `this` argument, so despite their appearance, they can't be treated as unary; that makes composition more awkward. To cope, we'll first need a `this`-aware version of `partial(..)`:

```js
var partialThis =
	(fn,...presetArgs) =>
		// intentionally `function` to allow `this`-binding
		function partiallyApplied(...laterArgs){
			return fn.apply( this, [...presetArgs, ...laterArgs] );
		};
```

We'll also need a version of `compose(..)` that calls each of the partially applied methods in the context of the chain -- the input value it's being "passed" (via implicit `this`) from the previous step:

```js
var composeChainedMethods =
	(...fns) =>
		result =>
			fns.reduceRight(
				(result,fn) =>
					fn.call( result )
				, result
			);
```

And using these two `this`-aware utilities together:

```js
composeChainedMethods(
   partialThis( Array.prototype.reduce, sum, 0 ),
   partialThis( Array.prototype.map, double ),
   partialThis( Array.prototype.filter, isOdd )
)
( [1,2,3,4,5] );					// 18
```

**Note:** The three `Array.prototype.XXX`-style references are grabbing references to the built-in `Array.prototype.*` methods so that we can reuse them with our own arrays.

### Composing Standalone Utilities

Standalone `compose(..)`-style composition of these utilities doesn't need all the `this` contortions, which is its most favorable argument. For example, we could define standalones as:

```js
var filter = (arr,predicateFn) => arr.filter( predicateFn );

var map = (arr,mapperFn) => arr.map( mapperFn );

var reduce = (arr,reducerFn,initialValue) =>
	arr.reduce( reducerFn, initialValue );
```

But this particular standalone style suffers from its own awkwardness; the cascading array context is the first argument rather than the last, so we have to use right-partial application to compose them:

```js
compose(
	partialRight( reduce, sum, 0 )
	partialRight( map, double )
	partialRight( filter, isOdd )
)
( [1,2,3,4,5] );					// 18
```

That's why FP libraries typically define `filter(..)`, `map(..)`, and `reduce(..)` to alternately receive the array last instead of first. They also typically automatically curry the utilities:

```js
var filter = curry(
	(predicateFn,arr) =>
		arr.filter( predicateFn )
);

var map = curry(
	(mapperFn,arr) =>
		arr.map( mapperFn )
);

var reduce = curry(
	(reducerFn,initialValue,arr) =>
		arr.reduce( reducerFn, initialValue );
```

Working with the utilities defined in this way, the composition flow is a bit nicer:

```js
compose(
	reduce( sum )( 0 ),
	map( double ),
	filter( isOdd )
)
( [1,2,3,4,5] );					// 18
```

The cleanliness of this approach is in part why FPers prefer the standalone utility style instead of instance methods. But your mileage may vary.

### Adapting Methods To Standalones

In the previous definition of `filter(..)` / `map(..)` / `reduce(..)`, you might have spotted the common pattern across all three: they all dispatch to the corresponding native array method. So, can we generate these standalone adaptations with a utility? Yes! Let's make a utility called `unboundMethod(..)` to do just that:

```js
var unboundMethod =
	(methodName,argCount = 2) =>
		curry(
			(...args) => {
				var obj = args.pop();
				return obj[methodName]( ...args );
			},
			argCount
		);
```

And to use this utility:

```js
var filter = unboundMethod( "filter", 2 );
var map = unboundMethod( "map", 2 );
var reduce = unboundMethod( "reduce", 3 );

compose(
	reduce( sum )( 0 ),
	map( double ),
	filter( isOdd )
)
( [1,2,3,4,5] );					// 18
```

**Note:** `unboundMethod(..)` is called `invoker(..)` in Ramda.

### Adapting Standalones To Methods

If you prefer to work with only array methods (fluent chain style), you have two choices. You can:

1. Extend the built-in `Array.prototype` with additional methods.
2. Adapt a standalone utility to work as a reducer function and pass it to the `reduce(..)` instance method.

**Don't do (1).** It's never a good idea to extend built-in natives like `Array.prototype` -- unless you define a subclass of `Array`, but that's beyond our discussion scope here. In an effort to discourage bad practices, we won't go any further into this approach.

Let's **focus on (2)** instead. To illustrate this point, we'll convert the recursive `flatten(..)` standalone utility from earlier:

```js
var flatten =
	arr =>
		arr.reduce(
			(list,v) =>
				list.concat( Array.isArray( v ) ? flatten( v ) : v )
		, [] );
```

Let's pull out the inner `reducer(..)` function as the standalone utility (and adapt it to work without the outer `flatten(..)`):

```js
// intentionally a function to allow recursion by name
function flattenReducer(list,v) {
	return list.concat(
		Array.isArray( v ) ? v.reduce( flattenReducer, [] ) : v
	);
}
```

Now, we can use this utility in an array method chain via `reduce(..)`:

```js
[ [1, 2, 3], 4, 5, [6, [7, 8]] ]
.reduce( flattenReducer, [] )
// ..
```

## Looking For Lists

So far, most of the examples have been rather trivial, based on simple lists of numbers or strings. Let's now talk about where list operations can start to shine: modeling an imperative series of statements declaratively.

Consider this base example:

```js
var getSessionId = partial( prop, "sessId" );
var getUserId = partial( prop, "uId" );

var session, sessionId, user, userId, orders;

session = getCurrentSession();
if (session != null) sessionId = getSessionId( sessionId );
if (sessionId != null) user = lookupUser( sessionId );
if (user != null) userId = getUserId( user );
if (userId != null) orders = lookupOrders( userId );
if (orders != null) processOrders( orders );
```

First, let's observe that the five variable declarations and the running series of `if` conditionals guarding the function calls are effectively one big composition of these six calls `getCurrentSession()`, `getSessionId(..)`, `lookupUser(..)`, `getUserId(..)`, `lookupOrders(..)`, and `processOrders(..)`. Ideally, we'd like to get rid of all these variable declarations and imperative conditionals.

Unfortunately, the `compose(..)` / `pipe(..)` utilties we explored in Chapter 4 don't by themselves offer a convenient way to express the `!= null` conditionals in the composition. Let's define a utility to help:

```js
var guard =
	fn =>
		arg =>
			arg != null ? fn( arg ) : arg;
```

This `guard(..)` utility lets us map the five conditional-guarded functions:

```js
[ getSessionId, lookupUser, getUserId, lookupOrders, processOrders ]
.map( guard )
```

The result of this mapping is an array of functions that are ready to compose (actually, pipe, in this listed order). We could spread this array to `pipe(..)`, but since we're already doing list operations, let's do it with a `reduce(..)`, using the session value from `getCurrentSession()` as the initial value:

```js
.reduce(
	(result,nextFn) => nextFn( result )
	, getCurrentSession()
)
```

Next, let's observe that `getSessionId(..)` and `getUserId(..)` can be expressed as a mapping from the respective values `"sessId"` and `"uId"`:

```js
[ "sessId", "uId" ].map( propName => partial( prop, propName ) )
```

But to use these, we'll need to interleave them with the other three functions (`lookupUser(..)`, `lookupOrders(..)`, and `processOrders(..)`) to get the array of five functions to guard / compose as discussed above.

To do the interleaving, we can model this as list merging. Recall `mergeReducer(..)` from earlier in the chapter:

```js
var mergeReducer =
	(merged,v,idx) =>
		(merged.splice( idx * 2, 0, v ), merged);
```

We can use `reduce(..)` (our swiss army knife, remember!?) to "insert" `lookupUser(..)` in the array between the generated `getSessionId(..)` and `getUserId(..)` functions, by merging two lists:

```js
.reduce( mergeReducer, [ lookupUser ] )
```

Then we'll concatenate `lookupOrders(..)` and `processOrders(..)` onto the end of the running functions array:

```js
.concat( lookupOrders, processOrders )
```

To review, the generated list of five functions is expressed as:

```js
[ "sessId", "uId" ].map( propName => partial( prop, propName ) )
.reduce( mergeReducer, [ lookupUser ] )
.concat( lookupOrders, processOrders )
```

Finally, to put it all together, take this list of functions and tack on the guarding and composition from earlier:

```js
[ "sessId", "uId" ].map( propName => partial( prop, propName ) )
.reduce( mergeReducer, [ lookupUser ] )
.concat( lookupOrders, processOrders )
.map( guard )
.reduce(
	(result,nextFn) => nextFn( result )
	, getCurrentSession()
);
```

Gone are all the imperative variable declarations and conditionals, and in their place we have clean and declarative list operations chained together.

If this version is harder for you read right now than the original, don't worry. The original is unquestionably the imperative form you're probably more familiar with. Part of your evolution to become a functional programmer is to develop a recognition of FP patterns such as list operations. Over time, these will jump out of the code more readily as your sense of code readability shifts to declarative style.

Before we leave this topic, let's take a reality check: the example here is heavily contrived. Not all code segments will be straightforwardly modeled as list operations. The pragmatic take-away is to develop the instinct to look for these opportunities, but not get too hung up on code acrobatics; some improvement is better than none. Always step back and ask if you're **improving or harming** code readability.

## Fusion

As you roll FP list operations into more of your thinking about code, you'll likely start seeing very quickly chains that combine behavior like:

```js
..
.filter(..)
.map(..)
.reduce(..);
```

And more often than not, you're also probably going to end up with chains with multiple adjacent instances of each operation, like:

```js
someList
.filter(..)
.filter(..)
.map(..)
.map(..)
.map(..)
.reduce(..);
```

The good news is the chain-style is declarative and it's easy to read the specific steps that will happen, in order. The downside is that each of these operations loops over the entire list, meaning performance can suffer unnecessarily, especially if the list is longer.

With the alternate standalone style, you might see code like this:

```js
map(
	fn3,
	map(
		fn2,
		map( fn1, someList )
	)
);
```

With this style, the operations are listed from bottom-to-top, and we still loop over the list 3 times.

Fusion deals with combining adjacent operators to reduce the number of times the list is iterated over. We'll focus here on collapsing adjacent `map(..)`s as it's the most straightforward to explain.

Imagine this scenario:

```js
var removeInvalidChars = str => str.replace( /[^\w]*/g, "" );

var upper = str => str.toUpperCase();

var elide = str =>
	str.length > 10 ?
		str.substr( 0, 7 ) + "..." :
		str;

var words = "Mr. Jones isn't responsible for this disaster!"
	.split( /\s/ );

words;
// ["Mr.","Jones","isn't","responsible","for","this","disaster!"]

words
.map( removeInvalidChars )
.map( upper )
.map( elide );
// ["MR","JONES","ISNT","RESPONS...","FOR","THIS","DISASTER"]
```

Think about each value that goes through this flow of transformations. The first value in the `words` list starts out as `"Mr."`, becomes `"Mr"`, then `"MR"`, and then passes through `elide(..)` unchanged. Another piece of data flows: `"responsible"` -> `"responsible"` -> `"RESPONSIBLE"` -> `"RESPONS..."`.

In other words, you could think of these data transformations like this:

```js
elide( upper( removeInvalidChars( "Mr." ) ) );
// "MR"

elide( upper( removeInvalidChars( "responsible" ) ) );
// "RESPONS..."
```

Did you catch the point? We can express the three separate steps of the adjacent `map(..)` calls as a composition of the transformers, since they are all unary functions and each returns the value that's suitable as input to the next. We can fuse the mapper functions using `compose(..)`, and then pass the composed function to a single `map(..)` call:

```js
words
.map(
	compose( elide, upper, removeInvalidChars )
);
// ["MR","JONES","ISNT","RESPONS...","FOR","THIS","DISASTER"]
```

This is another case where `pipe(..)` can be a more convenient form of composition, for its ordering readability:

```js
words
.map(
	pipe( removeInvalidChars, upper, elide )
);
// ["MR","JONES","ISNT","RESPONS...","FOR","THIS","DISASTER"]
```

What about fusing two or more `filter(..)` predicate functions? Typically treated as unary functions, they seem suitable for composition. But the wrinkle is they each return a different kind of value (`boolean`) than the next one would want as input. Fusing adjacent `reduce(..)` calls is also possible, but reducers are not unary so that's a bit more challenging; we need more sophisticated tricks to pull this kind of fusion off. We'll cover these advanced techniques in Appendix A "Transducing".

## Beyond Lists

So far we've been discussing operations in the context of the list (array) data structure; it's by far the most common scenario you encounter them. But in a more general sense, these operations can be performed against any collection of values.

Just as we said earlier that array's `map(..)` adapts a single-value operation to all its values, any data structure can provide a `map(..)` operation to do the same. Likewise, it can implement `filter(..)`, `reduce(..)`, or any other operation that makes sense for working with the data structure's values.

The important part to maintain in the spirit of FP is that these operators must behave according to value immutability, meaning that they must return a new data structure rather than mutating the existing one.

Let's illustrate with a well-known data structure: the binary tree. A binary tree is a node (just an object!) that has two references to other nodes (themselves binary trees), typically referred to as *left* and *right* child trees. Each node in the tree holds one value of the overall data structure.

<p align="center">
	<img src="fig7.png" width="250">
</p>

For ease of illustration, we'll make our binary tree a binary search tree (BST). However, the operations we'll identify work the same for any regular non-BST binary tree.

**Note:** A binary search tree is a general binary tree with a special constraint on the relationship of values in the tree to each other. Each value of nodes on the left side of a tree is less than the value of the node at the root of that tree, which in turn is less than each value of nodes in the right side of the tree. The notion of "less than" is relative to the kind of data stored; it can be numerical for numbers, lexicographic for strings, etc. BSTs are useful because they make searching for a value in the tree straightforward and more efficient, using a recursive binary search algorithm.

To make a binary tree node object, let's use this factory function:

```js
var BinaryTree =
	(value,parent,left,right) => ({ value, parent, left, right });
```

For convenience, we make each node store the `left` and `right` child trees as well as a reference to its own `parent` node.

Let's now define a BST of names of common produce (fruits, vegetables):

```js
var banana = BinaryTree( "banana" );
var apple = banana.left = BinaryTree( "apple", banana );
var cherry = banana.right = BinaryTree( "cherry", banana );
var apricot = apple.right = BinaryTree( "apricot", apple );
var avocado = apricot.right = BinaryTree( "avocado", apricot );
var cantelope = cherry.left = BinaryTree( "cantelope", cherry );
var cucumber = cherry.right = BinaryTree( "cucumber", cherry );
var grape = cucumber.right = BinaryTree( "grape", cucumber );
```

In this particular tree structure, `banana` is the root node; this tree could have been set up with nodes in different locations, but still had a BST with the same traversal.

Our tree looks like:

<p align="center">
	<img src="fig8.png" width="450">
</p>

There are multiple ways to traverse a binary tree to process its values. If it's a BST (our's is!) and we do an *in-order* traversal -- always visit the left child tree first, then the node itself, then the right child tree -- we'll visit the values in ascending (sorted) order.

Since you can't just easily `console.log(..)` a binary tree like you can with an array, let's first define a convenience method, mostly to use for printing. `forEach(..)` will visit the nodes of a binary tree in the same manner as an array:

```js
// in-order traversal
BinaryTree.forEach = function forEach(visitFn,node){
	if (node) {
		if (node.left) {
			forEach( visitFn, node.left );
		}

		visitFn( node );

		if (node.right) {
			forEach( visitFn, node.right );
		}
	}
};
```

**Note:** Working with binary trees lends itself most naturally to recursive processing. Our `forEach(..)` utility recursively calls itself to process both the left and right child trees. We'll cover recursion in more detail in a later chapter, where we'll cover recursion in that chapter on recursion.

Recall `forEach(..)` was described at the beginning of this chapter as only being useful for side effects, which is not very typically desired in FP. In this case, we'll use `forEach(..)` only for the side effect of I/O, so it's perfectly reasonable as a helper.

Use `forEach(..)` to print out values from the tree:

```js
BinaryTree.forEach( node => console.log( node.value ), banana );
// apple apricot avocado banana cantelope cherry cucumber grape

// visit only the `cherry`-rooted subtree
BinaryTree.forEach( node => console.log( node.value ), cherry );
// cantelope cherry cucumber grape
```

To operate on our binary tree data structure using FP patterns, let's start by defining a `map(..)`:

```js
BinaryTree.map = function map(mapperFn,node){
	if (node) {
		let newNode = mapperFn( node );
		newNode.parent = node.parent;
		newNode.left = node.left ?
			map( mapperFn, node.left ) : undefined;
		newNode.right = node.right ?
			map( mapperFn, node.right ): undefined;

		if (newNode.left) {
			newNode.left.parent = newNode;
		}
		if (newNode.right) {
			newNode.right.parent = newNode;
		}

		return newNode;
	}
};
```

You might have assumed we'd `map(..)` only the node `value` properties, but in general we might actually want to map the tree nodes themselves. So, the `mapperFn(..)` is passed the whole node being visited, and it expects to receive a new `BinaryTree(..)` node back, with the transformation applied. If you just return the same node, this operation will mutate your tree and quite possibly cause unexpected results!

Let's map our tree to a list of produce with all uppercase names:

```js
var BANANA = BinaryTree.map(
	node => BinaryTree( node.value.toUpperCase() ),
	banana
);

BinaryTree.forEach( node => console.log( node.value ), BANANA );
// APPLE APRICOT AVOCADO BANANA CANTELOPE CHERRY CUCUMBER GRAPE
```

`BANANA` is a different tree (with all different nodes) than `banana`, just like calling `map(..)` on an array returns a new array. Just like arrays of other objects/arrays, if `node.value` itself references some object/array, you'll also need to handle manually copying it in the mapper function if you want deeper immutability.

How about `reduce(..)`? Same basic process: do an in-order traversal of the tree nodes. One usage would be to `reduce(..)` our tree to an array of its values, which would be useful in further adapting other typical list operations. Or we can `reduce(..)` our tree to a string concatenation of all its produce names.

We'll mimic the behavior of the array `reduce(..)`, which makes passing the `initialValue` argument optional. This algorithm is a little trickier, but still manageable:

```js
BinaryTree.reduce = function reduce(reducerFn,initialValue,node){
	if (arguments.length < 3) {
		// shift the parameters since `initialValue` was omitted
		node = initialValue;
	}

	if (node) {
		let result;

		if (arguments.length < 3) {
			if (node.left) {
				result = reduce( reducerFn, node.left );
			}
			else {
				return node.right ?
					reduce( reducerFn, node, node.right ) :
					node;
			}
		}
		else {
			result = node.left ?
				reduce( reducerFn, initialValue, node.left ) :
				initialValue;
		}

		result = reducerFn( result, node );
		result = node.right ?
			reduce( reducerFn, result, node.right ) : result;
		return result;
	}

	return initialValue;
};
```

Let's use `reduce(..)` to make our shopping list (an array):

```js
BinaryTree.reduce(
	(result,node) => result.concat( node.value ),
	[],
	banana
);
// ["apple","apricot","avocado","banana","cantelope"
//   "cherry","cucumber","grape"]
```

Finally, let's consider `filter(..)` for our tree. This algorithm is trickiest so far because it effectively (not actually) involves removing nodes from the tree, which requires handling several corner cases. Don't get intimiated by the implementation, though. Just skip over it for now, if you prefer, and focus on how we use it instead.

```js
BinaryTree.filter = function filter(predicateFn,node){
	if (node) {
		let newNode;
		let newLeft = node.left ?
			filter( predicateFn, node.left ) : undefined;
		let newRight = node.right ?
			filter( predicateFn, node.right ) : undefined;

		if (predicateFn( node )) {
			newNode = BinaryTree(
				node.value,
				node.parent,
				newLeft,
				newRight
			);
			if (newLeft) {
				newLeft.parent = newNode;
			}
			if (newRight) {
				newRight.parent = newNode;
			}
		}
		else {
			if (newLeft) {
				if (newRight) {
					newNode = BinaryTree(
						undefined,
						node.parent,
						newLeft,
						newRight
					);
					newLeft.parent = newRight.parent = newNode;

					if (newRight.left) {
						let minRightNode = newRight;
						while (minRightNode.left) {
							minRightNode = minRightNode.left;
						}

						newNode.value = minRightNode.value;

						if (minRightNode.right) {
							minRightNode.parent.left =
								minRightNode.right;
							minRightNode.right.parent =
								minRightNode.parent;
						}
						else {
							minRightNode.parent.left = undefined;
						}

						minRightNode.right =
							minRightNode.parent = undefined;
					}
					else {
						newNode.value = newRight.value;
						newNode.right = newRight.right;
						if (newRight.right) {
							newRight.right.parent = newNode;
						}
					}
				}
				else {
					return newLeft;
				}
			}
			else {
				return newRight;
			}
		}

		return newNode;
	}
};
```

The majority of this code listing is dedicated to handling the shifting of a node's parent/child references if it's "removed" (filtered out) of the duplicated tree structure.

As an example to illustrate using `filter(..)`, let's narrow our produce tree down to only vegetables:

```js
var vegetables = [ "asparagus", "avocado", "brocolli", "carrot",
	"celery", "corn", "cucumber", "lettuce", "potato", "squash",
	"zucchini" ];

var whatToBuy = BinaryTree.filter(
	// filter the produce list only for vegetables
	node => vegetables.indexOf( node.value ) != -1,
	banana
);

// shopping list
BinaryTree.reduce(
	(result,node) => result.concat( node.value ),
	[],
	whatToBuy
);
// ["avocado","cucumber"]
```

You will likely use most of the list operations from this chapter in the context of simple arrays. But now we've seen that the concepts apply to whatever data structures and operations you might need. That's a powerful expression of how FP can be widely applied to many different application scenarios!

## Summary

Three common and powerful list operations:

* `map(..)`: transforms values as it projects them to a new list.
* `filter(..)`: selects or excludes values as it projects them to a new list.
* `reduce(..)`: combines values in a list to produce some other (usually but not always non-list) value.

Other more advanced operations that can be very useful in processing lists: `unique(..)`, `flatten(..)`, and `merge(..)`.

Fusion uses function composition techniques to consolidate multiple adjacent `map(..)` calls. This is mostly a performance optimization, but it also improves the declarative nature of your list operations.

Lists are typically visualized as arrays, but can be generalized as any data structure that represents/produces an ordered collection of values. As such, all these "list operations" are actually "data structure operations".
