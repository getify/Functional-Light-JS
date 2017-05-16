# Functional-Light JavaScript
# Chapter 2: Foundations of Functional Functions

函数式编程 **不是使用 `function` 关键字编程。** 如果它真有那么简单，我在这里就可以结束这本书了！但重要的是，函数确实是 FP 的中心。使我们的代码成为 *函数式* 的，使我们如何使用函数。

但是，你确信你知道 *函数* 是什么意思？

在这一章中，我们将要通过讲解函数的所有基本方面来为本书的剩余部分打下基础。在某种意义上，这里的内容即便是对非 FP 程序员来说也是应当知道的关于函数的一切。但是如果我们想要从 FP 的概念中学到竟可能多的东西，我们必须 *知道* 函数的里里外外。

振作起来，关于函数东西可能比你已经知道的东西多得多。

## What Is A Function?

要解释函数式编程，我所能想到的最自然的起点就是 *函数*。这看起来在显而易见不过了，但我想我们的旅程需要坚实的第一步。

那么……什么是函数？

### Brief Math Review

我知道我承诺过尽可能远离数学，但稍稍忍耐我片刻，在继续之前我们快速地观察一些东西：代数中有关函数和图像的基础。

你还记得在学校里学过的关于 `f(x)` 的一些东西吗？等式 `y = f(x)` 呢？

比如说一个等式这样定义的：<code>f(x) = 2x<sup>2</sup> + 3</code>。这是什么意思？给这个函数画出图像是什么意思？这就是图像：

<img src="fig1.png">

你能注意到，对于任何 `x` 的值，比如 `2`，如果你将它插入这个等式，你会得到 `11`。那么 `11` 是什么？它是函数 `f(x)` 的 *返回值*，代表我们刚才说到的 `y` 值。

换句话说，在图像的曲线上有一个点 `(2,11)`。而且对于我们插入的任意的 `x` 的值，我们都能得到另一个与之相对应的 `y` 值作为一个点的坐标。比如另外一个点 `(0,3)`，以及另一个点 `(-1,5)`。将这些点放在一起，你就得到了上面的抛物线图像。

那么这到底与 FP 有什么关系？

在数学中，一个函数总是接受输入，并且总是给出输出。一个你将经常听到的 FP 术语是“态射（morphism）”；这个很炫的词用来描述一个值的集合映射到另一个值的集合，就像一个函数的输入与这个函数的输入的关系一样。

在代数中，这些输入与输出经常被翻译为被绘制的图像的坐标的一部分。然而，我们我可以使用各种各样的输入与输出定义函数，而且它们不必与视觉上图像的曲线有任何关系。

### Function vs Procedure

那么为什么说了半天数学和图像？因为在某种意义上，函数式编程就是以这种数学意义上的 *函数* 来使用函数。

你可能更习惯于将函数考虑为过程（procedures）。它有什么区别？一个任意功能的集合。它可能有输入，也可能没有。它可能有一个输出（`return` 值），也可能没有。

而一个函数接收输入并且绝对总是有一个 `return` 值。

如果你打算进行函数式编程，**你就应当尽可能多地使用函数**，而不是过程。你所有的 `function` 都应当接收输入并返回输出。为什么？这个问题的答案有许多层次的含义，我们将在这本书中逐一揭示它们。

## Function Input

根据这个定义，所有函数都需要输入。

你有时会听到人们称它们为“实际参数（arguments）”，而有时称为“形式参数（parameters）”。那么这都是什么意思？

*实际参数* 是你传入的值，而 *形式参数* 在函数内部被命名的变量，它们接收那些被传入的值。例如：

```js
function foo(x,y) {
	// ..
}

var a = 3;

foo( a, a * 2 );
```

`a` 和 `a * 2`（实际上，是这个表达式的值，`6`） 是 `foo(..)` 调用的 *实际参数*。`x` 和 `y` 是接收实际参数值（分别是 `3` 和 `6`）的 *形式参数*。

**注意：** 在 JavaScript 中，不要求 *实际参数* 的数量要与 *形式参数* 的数量相吻合。如果你传入的 *实际参数* 多于被声明来接受它们的 *形式参数* ，那么这些值会原封不动地被传入。这些值可以用几种不同的方式访问，包括老旧的 `arguments` 对象。如果你传入的 *实际参数* 少于被声明的 *形式参数*，那么每一个无人认领的形式参数都是一个 “undefined” 值，这意味着它在这个函数的作用域中存在而且可用，只是初始值是空的 `undefined`。

### Counting Inputs

被“期待”的实际参数的数量 —— 你可能想向它传递多少实际参数 —— 是由被声明的形式参数的数量决定的。

```js
function foo(x,y,z) {
	// ..
}
```

`foo(..)` *期待* 三个实际参数，因为它拥有三个被声明的形式参数。这个数量有一个特殊的术语：元（arity）。元是函数声明中形式参数的数量。`foo(..)` 的元是 `3`。

你可能会想在运行时期间检查一个函数引用来判定它的元。这可以通过这个函数引用的 `length` 属性来完成：

```js
function foo(x,y,z) {
	// ..
}

foo.length;				// 3
```

一个在执行期间判定元的原因可能是，一段代码从多个源头接受一个函数引用，并且根据每个函数引用的元来发送不同的值。

例如，想象这样一种情况，一个函数引用 `fn` 可能期待一个，两个，或三个实际参数，但你总是想要在最后一个位置上传递变量 `x`：

```js
// `fn` is set to some function reference
// `x` exists with some value

if (fn.length == 1) {
	fn( x );
}
else if (fn.length == 2) {
	fn( undefined, x );
}
else if (fn.length == 3) {
	fn( undefined, undefined, x );
}
```

**提示：** 一个函数的 `length` 属性是只读的，而且它在你声明这个函数时就已经被决定了。它应当被认为实质上是一段元数据，用来描述这个函数意料之中的用法。

一个要小心的坑是，特定种类的形式参数列表可以使函数的 `length` 属性报告与你期待的不同的东西。不要担心，我们会在本章稍后讲解每一种（ES6 引入的）特性：

```js
function foo(x,y = 2) {
	// ..
}

function bar(x,...args) {
	// ..
}

function baz( {a,b} ) {
	// ..
}

foo.length;				// 1
bar.length;				// 1
baz.length;				// 1
```

如果你使用这些形式参数中的任意一种，那么要洗小心你函数的 `length` 值可能会使你惊讶。

那么如何计数当前函数调用收到的实际参数数量呢？这曾经是小菜一碟，但现在情况变得稍微复杂一些。每个函数都有一个可以使用的 `arguments` （类数组）对象，它持有每个被传入的实际参数的医用。你可检查 `arguments` 的 `length` 属性来搞清楚有多少参数被实际传递了：

```js
function foo(x,y,z) {
	console.log( arguments.length );	// 2
}

foo( 3, 4 );
```

在 ES5（具体地说，strict 模式）中，`arguments` 被认为是有些软废弃了；许多人都尽量避免使用它。它永远都不会被移除 —— 在 JS 中，不论那将会变得多么方便，我们“永远”都不会破坏向下的兼容性 —— 但是由于种种原因依然强烈建议你尽可能避免使用它。

然而，我建议 `arguments.length`，而且仅有它，在你需要关心被传入的实际参数的数量时是可以继续使用的。某个未来版本的 JS 中有可能会加入一个特性，在没有 `arguments.length` 的情况下恢复判定被传递的实际参数数量的能力；如果这真的发生了，那么我们就可以完全放弃 `arguments` 的使用了。

小心：**绝不要** 按位置访问实际参数，比如 `arguments[1]`。如果你必须这么做的话，坚持只使用 `arguments.length`。

除非……你如何访问一个在超出被声明的形式参数位置上传入的实际参数？我一会就会回答这个问题；但首先，退一步问你自己，“为什么我想要这么做？”。认真地，把这个问题考虑几分钟。

这种情况的发生应该非常少见；它不应当是你通常所期望的，或者在你编写函数式所依靠的东西。如果你发现自己身陷于此，那么就再花额外的20分钟，试着用一种不同的方式来设计这个函数的交互。即使这个参数是特殊的，也给它起个名字。

一个接收不确定数量的实际参数的函数签名成为可变参函数（variadic function）。有些人喜欢这种风格的函数设计，但我想你将会发现 FP 程序员经常想要尽量避免这些。

好了，在这一点上唠叨得够多了。

假定你需要以一种类似数组下标定位的方式来访问实际参数，这可能是因为你正在访问一个没有正式形式参数位置的实际参数。我们该如何做？

ES6 前来拯救！然我们使用 `...` 操作符来声明我们的函数 —— 它有多个名称：“扩散”、“剩余”、或者（我最喜欢的）“聚集”。

```js
function foo(x,y,z,...args) {
	// ..
}
```

看到形式参数列表中的 `...args` 了吗？这是一种新的 ES6 声明形式，它告诉引擎去收集（嗯哼，聚集）所有剩余的（如果有的话）没被赋值给命名形式参数的实际参数，并将它们名为 `args` 的真正的数组中。`args` 将总是一个数组，即便是空的。但它 **不会** 包含那些已经赋值给形式参数 `x`、`y`、和 `z` 的值，只有超过前三个值被传入的所有东西。

```js
function foo(x,y,z,...args) {
	console.log( x, y, z, args );
}

foo();					// undefined undefined undefined []
foo( 1, 2, 3 );			// 1 2 3 []
foo( 1, 2, 3, 4 );		// 1 2 3 [ 4 ]
foo( 1, 2, 3, 4, 5 );	// 1 2 3 [ 4, 5 ]
```

所以，如果你 *真的* 想要设计一个解析任意多实际参数的函数，就在末尾使用 `...args`（或你喜欢的其他任何名字）。现在，你将得到一个真正的，没有被废弃的，不讨人嫌的数组来访问那些实际参数。

只不过要注意，值 `4` 在这个 `args` 的位置 `0` 上，而不是位置 `3`。而且它的 `length` 值将不会包括 `1`、`2`、和 `3` 这三个值。`...args` 聚集所有其余的东西，不包含 `x`、`y`、和 `z`。

你甚至 *可以* 在没有声明任何正式形式参数的参数列表中使用 `...` 操作符：

```js
function foo(...args) {
	// ..
}
```

无论实际参数是什么，`args` 现在都是一个完全的实际参数的数组，而且你可以使用 `args.length` 来知道究竟有多少个实际参数被传入了。而且如果你选择这样做的话，你可以安全地使用 `args[1]` 或 `args[317]`。但是，拜托不要传入318个实际参数。

说道 ES6 的好处，关于你函数的实际参数与形式参数，还有几种你可能想知道的其他的技巧。这个简要概览之外的更多信息，参见我的 “你不懂JS —— ES6与未来” 的第二章。

#### Argument Tricks

要是你想要传递一个值的数组作为你函数调用的实际参数呢？

```js
function foo(...args) {
	console.log( args[3] );
}

var arr = [ 1, 2, 3, 4, 5 ];

foo( ...arr );						// 4
```

我们使用了我们的新朋友 `...`，它不只是在形式参数列表中可以使用；而且还可以在调用点的实际参数列表中使用。在这样的上下文环境中它将拥有相反的行为。在形式参数列表中，我们说它将实际参数 *聚集* 在一起。在实际参数列表中，它将它们 *扩散* 开来。所以 `arr` 的内容实际上被扩散为 `foo(..)` 调用的各个独立的实际参数。你能看出这与仅仅传入 `arr` 数组的整个引用有什么不同吗？

顺带一提，多个值与 `...` 扩散是可以穿插的，只要你认为合适：

```js
var arr = [ 2 ];

foo( 1, ...arr, 3, ...[4,5] );		// 4
```

以这种对称的感觉考虑 `...`：在一个值的列表的位置，它 *扩散*。在一个赋值的位置 —— 比如形式参数列表，因为实际参数被 *赋值给* 了形式参数 —— 它 *聚集*。

不管你调用哪一种行为，`...` 都令使用实际参数列表变得非常简单。使用`slice(..)`、`concat(..)` 和 `apply(..)` 来倒腾我们实际参数值数组的日子一去不复返了。

#### Parameter Tricks

在 ES6 中， 形式参数可以被声明 *默认值*。在这个形式参数的实际参数没有被传递，或者被传递了一个 `undefined` 值的情况下，默认的赋值表达式将会取而代之。

考虑如下代码：

```js
function foo(x = 3) {
	console.log( x );
}

foo();					// 3
foo( undefined );		// 3
foo( null );			// null
foo( 0 );				// 0
```

**注意：** 我们不会在此涵盖更多的细节，但是默认值表达式是懒惰的，这意味着除非需要它不会被求值。另外，它可以使任意合法的 JS 表达式，甚至是一个函数调用。这种能力使得许多很酷的技巧成为可能。例如，你可以在形式参数列表中声明 `x = required()`，而在 `required()` 函数中简单地 `throw "This argument is required."`，来确保其他人总是带着指定的实际/形式参数来调用你的函数。

另一个我们可以在形式参数列表中使用的技巧称为 “解构”。我们将简要地扫它一眼，因为这个话题要比我们在这里讨论的复杂太多了。同样，更多信息参考我的 “ES6与未来”。

还记得刚才可以接收318个实际参数的 `foo(..)` 吗！？

```js
function foo(...args) {
	// ..
}

foo( ...[1,2,3] );
```

要是我们想改变这种互动方式，让我们函数的调用方传入一个值的数组而非各个独立的实际参数值呢？只要去掉这两个 `...` 就好：

```js
function foo(args) {
	// ..
}

foo( [1,2,3] );
```

这很简单。但如果我们想给被传入的数组的前两个值赋予形式参数名呢？我们不再声明独立的形式参数了，看起来我们失去了这种能力。但解构就是答案：

```js
function foo( [x,y,...args] = [] ) {
	// ..
}

foo( [1,2,3] );
```

你发现现在形式参数列表周围的方括号 `[ .. ]` 了吗？这就是数组解构。解构为你想看到的某种结构（对象，数组等）声明式了一个 *范例*，描述应当如何将它的分解（分配）为各个独立的部分。

在这个例子中，解构告诉引擎在这个赋值的位置（也就是形式参数）上期待一个数组。范例中说将这个数组的第一个值赋值给称为 `x` 的本地形式参数变量，第二个赋值给 `y`，而剩下的所有东西都 *聚集* 到 `args` 中。

你本可以像下面这样手动地做同样的事情：

```js
function foo(params) {
	var x = params[0];
	var y = params[1];
	var args = params.slice( 2 );

	// ..
}
```

但是现在我们要揭示一个原则 —— 我们将在本文中回顾它许多许多次 —— 的第一点：声明式代码经常要比指令式代码表意更清晰。

声明式代码，就像前面代码段中的解构，关注于一段代码的结果应当是什么样子。指令式代码，就像刚刚展示的手动赋值，关注于如何得到结果。如果稍后再读这段代码，你就不得不在大脑中执行它来得到期望的结果。它的结果被 *编码* 在这里，但不清晰。

不论什么地方，也不论我们的语言或库/框架允许我们这样做到多深的程度，**我们都应当努力使用声明式的、自解释的代码。**

正如我们可以解构数组，我们还可以解构对象形式参数：

```js
function foo( {x,y} = {} ) {
	console.log( x, y );
}

foo( {
	y: 3
} );					// undefined 3
```

我们将一个对象作为实际参数传入，它被解构为两个分离的形式参数变量 `x` 和 `y`，被传入的对象中具有相应属性名称的值将会被赋予这两个变量。对象中不存在 `x` 属性并不要紧；它会如你所想地那样得到一个 `undefined` 变量。

但是在这个形式参数对象解构中我想让你关注的是被传入 `foo(..)` 的对象。

像 `foo(undefined,3)` 这样普通的调用点，位置用于将实际参数映射到形式参数上；我们将 `3` 放在第二个位置上使它被赋值给形式参数 `y`。但是在这种引入了形式参数解构的新型调用点中，一个简单的对象-属性指示了哪个形式参数应该被赋予实际参数值 `3`。

我们不必在这个调用点中说明 `x`，因为我们实际上不关心 `x`。我们只是忽略它，而不是必须去做传入 `undefined` 作为占位符这样令人分心的事情。

有些语言直接拥有这种行为特性：命名实际参数。换句话说，在调用点中，给一个输入值打上一个标签来指示它映射到哪个形式参数上。JavaScript 不具备命名实际参数，但是形式参数对象解构是最佳后备选项。

使用对象解构传入潜在的多个实际参数 —— 这样做的一个与 FP 关联的好处是，只接收单一形式参数（那个对象）的函数与另一个函数的单一输出组合起来要容易得多。稍后会详细讲解这一点。

回想一下，“元”这个术语指一个函数期待接收多少形式参数。一个元为 1 的函数也被称为一元函数。在 FP 中，我们将尽可能使我们的函数是一元的，而且有时我们甚至会使用各种函数式技巧将一个高元函数转换为一个一元的形式。

**注意：** 在第三章中，我们将重温这种命名实际参数解构技巧，来对付恼人的形式参数顺序问题。

### Functions Varying By Input

考虑这个函数：

```js
function foo(x,y) {
	if (typeof x == "number" && typeof y == "number") {
		return x * y;
	}
	else {
		return x + y;
	}
}
```

显然，这个造作的例子会根据你传入的输入不同而表现出不同的行为。

例如：

```js
foo( 3, 4 );			// 12

foo( "3", 4 );			// "34"
```

程序员们像这样定义函数的原因之一，是可以更方便地将不同的行为 *重载（overload）* 入一个函数中。最广为人知的例子就是由许多像 JQuery 这样的主流库提供的 `$(..)` 函数。根据你向它传递什么实际参数，这个“钱号”函数大概拥有十几种非常不同的行为 —— 从 DOM 元素查询到 DOM 元素创建，以及将一个函数拖延到 `DOMContentLoaded` 事件之后。

感觉方式被有一种优势，就是需要学习的 API 少一些（只有一个 `$(..)` 函数），但是在代码可读性上具有明显的缺陷，而且不得不小心地检查到底什么东西被传入了才能解读一个调用要做什么。

这种基于一个函数的输入来重载许多不同行为的技术称为特设多态（ad hoc polymorphism）。

这种设计模式的另一种表现形式是，使一个函数在不同场景下拥有不同的输出（更多细节参加下一节）。

**警告：** 要对这里的 *方便* 的冲动特别小心。仅仅因为你可以这样设计一个函数，而且即便可能立即感知到一些好处，这种设计决定所带来的长期成本也可能不令人愉快。

## Function Output

在 JavaScript 中，函数总是返回一个值。这三个函数都拥有完全相同的 `return` 行为：

```js
function foo() {}

function bar() {
	return;
}

function baz() {
	return undefined;
}
```

如果你没有 `return` 或者你仅仅有一个空的 `return;`，那么 `undefined` 值就会被隐含地 `return`。

但是要尽可能地保持 FP 中函数定义的精神 —— 使用函数而不是过程 —— 我们的函数应当总是拥有输出，这意味着他们应当明确地 `return` 一个值，而且通常不是 `undefined`。

一个 `return` 语句只能返回一个单一的值。所以如果你的函数需要返回多个值，你唯一可行的选项是将它们收集到一个像数组或对象这样的复合值中：

```js
function foo() {
	var retValue1 = 11;
	var retValue2 = 31;
	return [ retValue1, retValue2 ];
}
```

就像解构允许我们在形式参数中拆分数组/对象一样，我们也可以在普通的赋值中这么做：

```js
function foo() {
	var retValue1 = 11;
	var retValue2 = 31;
	return [ retValue1, retValue2 ];
}

var [ x, y ] = foo();
console.log( x + y );			// 42
```

将多个值收集到一个数组（或对象）中返回，继而将这些值解构回独立的赋值，对于函数来说是一种透明地表达多个输出的方法。

**提示：** 如果我没有这么提醒你，那将是我的疏忽：花点时间考虑一下，一个需要多个输出的函数是否能够被重构来避免这种情况，也许分成两个或更多更小的意图单一的函数？有时候这是可能的，有时候不；但你至少应该考虑一下。

### Early Returns

`return` 语句不仅是从一个函数中返回一个值。它还是一种流程控制结构；它会在那一点终止函数的运行。因此一个带有多个 `return` 语句的函数就拥有多个可能的出口，如果有许多路径可以产生输出，那么这就意味着阅读一个函数来理解它的输出行为可能更加困难。

考虑如下代码：

```js
function foo(x) {
	if (x > 10) return x + 1;

	var y = x / 2;

	if (y > 3) {
		if (x % 2 == 0) return x;
	}

	if (y > 1) return y;

	return x;
}
```

突击测验：不使用浏览器运行这段代码，`foo(2)` 返回什么？`foo(4)` 呢？`foo(8)` 呢？`foo(12)` 呢？

你对自己的答案有多自信？你为这些答案交了多少智商税？我考虑它时，前两次都错了，而且我是用写的！

我认为这里的一部分可读性问题是，我们不仅将 `return` 用于返回不同的值，而且还将它作为一种流程控制结构，在特定的情况下提前退出函数的执行。当然有更好的方式编写这种流程控制（例如 `if` 逻辑），但我也认为有办法使输出的路径更加明显。

**注意：** 突击测验的答案是 `2`、`2`、`8`、和 `13`.

考虑一下这个版本的代码：

```js
function foo(x) {
	var retValue;

	if (retValue == undefined && x > 10) {
		retValue = x + 1;
	}

	var y = x / 2;

	if (y > 3) {
		if (retValue == undefined && x % 2 == 0) {
			retValue = x;
		}
	}

	if (retValue == undefined && y > 1) {
		retValue = y;
	}

	if (retValue == undefined) {
		retValue = x;
	}

	return retValue;
}
```

这个版本无疑更加繁冗。但我要争辩的是它的逻辑追溯起来更简单，因为每一个 `retValue` 可能被设置的分支都被一个检查它是否已经被设置过的条件 *守护* 着。

我们没有提前从函数中 `return` 出来，而是使用了普通的流程控制来决定 `retValue` 的赋值。最后，我们单纯地 `return retValue`。

我并不是在无条件地宣称你应当总是拥有一个单独的 `return`，或者你绝不应该提早 `return`，但我确实认为你应该对 `return` 在你的函数定义中制造隐晦的流程控制部分多加小心。试着找出表达逻辑的最明确的方式；那通常是最好的方式。

### Un`return`ed Outputs

你可能在你写过的大部分代码中用过，而且你可能没有太多考虑过的技术之一，就是通过简单地改变函数外部的变量来使它输出一些或全部的值。

记得我们在本章早先的 <code>f(x) = 2x<sup>2</sup> + 3</code> 函数吗？我们可以用 JS 这样定义它：

```js
var y;

function foo(x) {
	y = (2 * Math.pow( x, 2 )) + 3;
}

foo( 2 );

y;						// 11
```

我知道这是一个愚蠢的例子；我们本可以简单地 `return` 值，而非在函数内部将它设置在 `y` 中：

```js
function foo(x) {
	return (2 * Math.pow( x, 2 )) + 3;
}

var y = foo( 2 );

y;						// 11
```

两个函数都完成相同的任务。我们有任何理由优先使用其中之一吗？**有，绝对有。**

一个解释其中不同的方式是，第二个版本中的 `return` 标明了一个明确的输出，而前者中的 `y` 赋值是一种隐含的输出。此时你能已经有了某种指引你的直觉；通常，开发者们优先使用明确的模式，而非隐含的。

但是改变外部作用域中的变量，就像我们在 `foo(..)` 内部中对 `y` 赋值所做的，只是得到隐含输出的方式之一。一个更微妙的例子是通过引用来改变非本地值。

考虑如下代码：

```js
function sum(list) {
	var total = 0;
	for (let i = 0; i < list.length; i++) {
		if (!list[i]) list[i] = 0;

		total = total + list[i];
	}

	return total;
}

var nums = [ 1, 3, 9, 27, , 84 ];

sum( nums );			// 124
```

这个函数最明显的输出是我们明确地 `return` 的和 `124`。但你发现其他的输出了吗？试着运行这代码然后检查 `nums` 数组。现在你发现不同了吗？

现在在位置 `4` 上取代 `undefined` 空槽值的是一个 `0`。看起来无害的 `list[i] = 0` 操作影响了外部的数组值，即便我们操作的是本地形式参数变量 `list`。

为什么？因为 `list` 持有一个 `nums` 引用的引用拷贝，而不是数组值 `[1,3,9,..]` 的值拷贝。因为 JS 对数组，对象，以及函数使用引用和引用拷贝，所以我们可以很容易地从我们的函数中制造输出，这甚至是偶然的。

这种隐含的函数输出在 FP 世界中有一个特殊名称：副作用（side effects）。而一个 *没有副作用* 的函数也有一个特殊名称：纯函数（pure function）。在后面的章节中我们将更多地讨论这些内容，但要点是，我们将尽一切可能优先使用纯函数并避免副作用。

## Functions Of Functions

Functions can receive and return values of any type. A function that receives or returns one or more other function values has the special name: higher-order function.

函数可以接收并返回任意类型的值。一个接收或返回一个或多个其他函数的函数有一个特殊的名称：高阶函数（higher-order function）。

Consider:

考虑如下代码：

```js
function forEach(list,fn) {
	for (let i = 0; i < list.length; i++) {
		fn( list[i] );
	}
}

forEach( [1,2,3,4,5], function each(val){
	console.log( val );
} );
// 1 2 3 4 5
```

`forEach(..)` is a higher-order function because it receives a function as an argument.

`forEach(..)` 是一个高阶函数，因为它接收一个函数作为实际参数。

A higher-order function can also output another function, like:

一个高阶函数还可以输出另一个函数，比如：

```js
function foo() {
	var fn = function inner(msg){
		console.log( msg );
	};

	return fn;
}

var f = foo();

f( "Hello!" );			// Hello!
```

`return` is not the only way to "output" another function:

`return` 不是“输出”另一个函数的唯一方法：

```js
function foo() {
	var fn = function inner(msg){
		console.log( msg );
	};

	bar( fn );
}

function bar(func) {
	func( "Hello!" );
}

foo();					// Hello!
```

Functions that treat other functions as values are higher-order functions by definition. FPers write these all the time!

高阶函数的定义就是将其他函数看做值的函数。FP 程序员一天到晚都在写这些东西！

### Keeping Scope

One of the most powerful things in all of programming, and especially in FP, is how a function behaves when it's inside another function's scope. When the inner function makes reference to a variable from the outer function, this is called closure.

在一切编程方式 —— 特别是 FP —— 中最强大的东西之一，就是当一个函数位于另一个函数的作用域中时如何动作。当内部函数引用外部函数的一个变量时，这称为闭包（closure）。

Defined pragmatically, closure is when a function remembers and accesses variables from outside of its own scope, even when that function is executed in a different scope.

实用的定义是，闭包是当一个函数记住并访问它自己作用域之外的变量时发生的，即使是在这个函数在不同的作用域中被执行时。

Consider:

```js
function foo(msg) {
	var fn = function inner(){
		console.log( msg );
	};

	return fn;
}

var helloFn = foo( "Hello!" );

helloFn();				// Hello!
```

The `msg` parameter variable in the scope of `foo(..)` is referenced inside the inner function. When `foo(..)` is executed and the inner function is created, it captures the access to the `msg` variable, and retains that access even after being `return`d.

Once we have `helloFn`, a reference to the inner function, `foo(..)` has finished and it would seem as if its scope should have gone away, meaning the `msg` variable would no longer exist. But that doesn't happen, because the inner function has a closure over `msg` that keeps it alive. The closed over `msg` variable survives for as long as the inner function (now referenced by `helloFn` in a different scope) stays around.

Let's look at a few more examples of closure in action:

```js
function person(id) {
	var randNumber = Math.random();

	return function identify(){
		console.log( "I am " + id + ": " + randNumber );
	};
}

var fred = person( "Fred" );
var susan = person( "Susan" );

fred();					// I am Fred: 0.8331252801601532
susan();				// I am Susan: 0.3940753308893741
```

The inner function `identify()` has closure over two variables, the parameter `id` and the inner variable `randNumber`.

The access that closure enables is not restricted to merely reading the variable's original value -- it's not just a snapshot but rather a live link. You can update the value, and that new current state remains remembered until the next access.

```js
function runningCounter(start) {
	var val = start;

	return function current(increment = 1){
		val = val + increment;
		return val;
	};
}

var score = runningCounter( 0 );

score();				// 1
score();				// 2
score( 13 );			// 15
```

**Warning:** For reasons that we'll cover more later in the text, this example of using closure to remember a state that changes (`val`) is probably something you'll want to avoid where possible.

If you have an operation that needs two inputs, one of which you know now but the other will be specified later, you can use closure to remember the first input:

```js
function makeAdder(x) {
	return function sum(y){
		return x + y;
	};
}

// we already know `10` and `37` as first inputs, respectively
var addTo10 = makeAdder( 10 );
var addTo37 = makeAdder( 37 );

// later, we specify the second inputs
addTo10( 3 );			// 13
addTo10( 90 );			// 100

addTo37( 13 );			// 50
```

Normally, a `sum(..)` function would take both an `x` and `y` input to add them together. But in this example we receive and remember (via closure) the `x` value(s) first, while the `y` value(s) are separately specified later.

**Note:** This technique of specifying inputs in successive function calls is very common in FP, and comes in two forms: partial application and currying. We'll dive into them more thoroughly later in the text.

Of course, since functions are just values in JS, we can remember function values via closure.

```js
function formatter(formatFn) {
	return function inner(str){
		return formatFn( str );
	};
}

var lower = formatter( function formatting(v){
	return v.toLowerCase();
} );

var upperFirst = formatter( function formatting(v){
	return v[0].toUpperCase() + v.substr( 1 ).toLowerCase();
} );

lower( "WOW" );				// wow
upperFirst( "hello" );		// Hello
```

Instead of distributing/repeating the `toUpperCase()` and `toLowerCase()` logic all over our code, FP encourages us to create simple functions that encapsulate -- a fancy way of saying wrapping up -- that behavior.

Specifically, we create two simple unary functions `lower(..)` and `upperFirst(..)`, because those functions will be much easier to wire up to work with other functions in the rest of our program.

**Tip:** Did you spot how `upperFirst(..)` could have used `lower(..)`?

We'll use closure heavily throughout the rest of the text. It may just be the most important foundational practice in all of FP, if not programming as a whole. Get really comfortable with it!

## Syntax

Before we move on from this primer on functions, let's take a moment to discuss their syntax.

More than many other parts of this text, the discussions in this section are mostly opinion and preference, whether you agree with the views presented here or take opposite ones. These ideas are highly subjective, though many people seem to feel rather absolutely about them. Ultimately, you decide.

### What's In A Name?

Syntatically speaking, function declarations require the inclusion of a name:

```js
function helloMyNameIs() {
	// ..
}
```

But function expressions can come in both named and anonymous forms:

```js
foo( function namedFunctionExpr(){
	// ..
} );

bar( function(){	// <-- look, no name!
	// ..
} );
```

What exactly do we mean by anonymous, by the way? Specifically, functions have a `name` property that holds the string value of the name the function was given syntactically, such as `"helloMyNameIs"` or `"namedFunctionExpr"`. This `name` property is most notably used by the console/developer tools of your JS environment to list the function when it participates in a stack trace (usually from an exception).

Anonymous functions are generally displayed as `(anonymous function)`.

If you've ever had to debug a JS program from nothing but a stack trace of an exception, you probably have felt the pain of seeing `(anonymous function)` appear line after line. This listing doesn't give a developer any clue whatsoever as to the path the exception came from. It's not doing the developer any favors.

If you name your function expressions, the name is always used. So if you use a good name like `handleProfileClicks` instead of `foo`, you'll get much more helpful stack traces.

As of ES6, anonymous function expressions can be aided by *name inferencing*. Consider:

```js
var x = function(){};

x.name;			// x
```

If the engine is able to guess what name you *probably* want the function to take, it will go ahead and do so.

But beware, not all syntactic forms benefit from name inferencing. Probably the most common place a function expression shows up is as an argument to a function call:

```js
function foo(fn) {
	console.log( fn.name );
}

var x = function(){};

foo( x );				// x
foo( function(){} );	//
```

When the name can't be inferred from the immediate surrounding syntax, it remains an empty string. Such a function will be reported as `(anonymous function)` in a stack trace should one occur.

There are other benefits to a function being named besides the debugging question. First, the syntactic name (aka lexical name) is useful for internal self-reference. Self-reference is necessary for recursion (both sync and async) and also helpful with event handlers.

Consider these different scenarios:

```js
// sync recursion:
function findPropIn(propName,obj) {
	if (obj == undefined || typeof obj != "object") return;

	if (propName in obj) {
		return obj[propName];
	}
	else {
		let props = Object.keys( obj );
		for (let i = 0; i < props.length; i++) {
			let ret = findPropIn( propName, obj[props[i]] );
			if (ret !== undefined) {
				return ret;
			}
		}
	}
}
```

```js
// async recursion:
setTimeout( function waitForIt(){
	// does `it` exist yet?
	if (!o.it) {
		// try again later
		setTimeout( waitForIt, 100 );
	}
}, 100 );
```

```js
// event handler unbinding
document.getElementById( "onceBtn" )
	.addEventListener( "click", function handleClick(evt){
		// unbind event
		evt.target.removeEventListener( "click", handleClick, false );

		// ..
	}, false );
```

In all these cases, the named function's name was a useful and reliable self-reference from inside itself.

Moreover, even in simple cases with one-liner functions, naming them tends to make code more self-explanatory and thus easier to read for those who haven't read it before:

```js
people.map( function getPreferredName(person){
	return person.nicknames[0] || person.firstName;
} )
// ..
```

The function name `getPreferredName(..)` tells the reader something about what the mapping operation is intending to do that is not entirely obvious from just its code. This name label helps the code be more readable.

Another place where anonymous function expressions are common is with IIFEs (immediately invoked function expressions):

```js
(function(){

	// look, I'm an IIFE!

})();
```

You virtually never see IIFEs using names for their function expressions, but they should. Why? For all the same reasons we just went over: stack trace debugging, reliable self-reference, and readability. If you can't come up with any other name for your IIFE, at least use the word IIFE:

```js
(function IIFE(){

	// You already knew I was an IIFE!

})();
```

What I'm getting at is there's multiple reasons why **named functions are always more preferable to anonymous functions.** As a matter of fact, I'd go so far as to say that there's basically never a case where an anonymous function is more preferable. They just don't really have any advantage over their named counterparts.

It's incredibly easy to write anonymous functions, because it's one less name we have to devote our mental attention to figuring out.

I'll be honest; I'm as guilty of this as anyone. I don't like to struggle with naming. The first 3 or 4 names I come up with a function are usually bad. I have to revisit the naming over and over. I'd much rather just punt with a good ol' anonymous function expression.

But we're trading ease-of-writing for pain-of-reading. This is not a good trade off. Being lazy or uncreative enough to not want to figure out names for your functions is an all too common, but poor, excuse for using anonymous functions.

**Name every single function.** And if you sit there stumped, unable to come up with a good name for some function you've written, I'd strongly suggest you don't fully understand that function's purpose yet -- or it's just too broad or abstract. You need to go back and re-design the function until this is more clear. And by that point, a name will become more apparent.

I can testify from my own experience that in the struggle to name something well, I usually have come to understand it better and often even refactor its design for improved readability and maintability. This time investment is well worth it.

### Functions Without `function`

So far we've been using the full canonical syntax for functions. But you've no doubt also heard all the buzz around the new ES6 `=>` arrow function syntax.

Compare:

```js
people.map( function getPreferredName(person){
	return person.nicknames[0] || person.firstName;
} )
// ..

people.map( person => person.nicknames[0] || person.firstName );
```

Whoa.

The keyword `function` is gone, so is `return`, the `( )` parentheses, the `{ }` curly braces, and the `;` semicolon. For all that, we traded for a so-called fat arrow `=>` symbol.

But there's another thing we omitted. Did you spot it? The `getPreferredName` function name.

That's right; `=>` arrow functions are lexically anonymous; there's no way to syntatically provide it a name. Their names can be inferred like regular functions, but again, the most common case of function expression values as arguments won't get any assistance in that way.

If `person.nicknames` isn't defined for some reason, an exception will be thrown, meaning this `(anonymous function)` will be at the top of the stack trace. Ugh.

Honestly, the anonymity of `=>` arrow functions is a `=>` dagger to the heart, for me. I cannot abide by the loss of naming. It's harder to read, harder to debug, and impossible to self-reference.

But if that wasn't bad enough, the other slap in the face is that there's a whole bunch of subtle syntactic variations that you must wade through if you have different scenarios for your function definition. I'm not going to cover all of them in detail here, but briefly:

```js
people.map( person => person.nicknames[0] || person.firstName );

// multiple parameters? need ( )
people.map( (person,idx) => person.nicknames[0] || person.firstName );

// parameter destructuring? need ( )
people.map( ({ person }) => person.nicknames[0] || person.firstName );

// parameter default? need ( )
people.map( (person = {}) => person.nicknames[0] || person.firstName );

// returning an object? need ( )
people.map( person =>
	({ preferredName: person.nicknames[0] || person.firstName })
);
```

The case for excitement over `=>` in the FP world is primarily that it follows almost exactly from the mathematical notation for functions, especially around FP languages like Haskell. The shape of `=>` arrow function syntax communicates mathematically.

Digging even further, I'd suggest that the argument in favor of `=>` is that by using much lighter-weight syntax, we reduce the visual boundaries between functions which lets us use simple function expressions much like we'd use lazy expressions -- another favorite of the FPer.

I think most FPers are going to blink and wave off these concerns. They love anonymous functions and they love saving on syntax. But like I said before: you decide.

**Note:** Though I do not prefer to use `=>` in practice in my applications, we will use it in many places throughout the rest of this book -- especially when we present typical FP utilities -- where conciseness is preferred to optimize for the limited physical space in code snippets. Make your own determinations whether this approach will make your own code more or less readable.

## What's This?

If you're not familiar with the `this` binding rules in JavaScript, I recommend you check out my "You Don't Know JS: this & Object Prototypes" book. For the purposes of this section, I'll assume you know how `this` gets determined for a function call (one of the four rules). But even if you're still fuzzy on *this*, the good news is we're going to conclude that you shouldn't be using `this` if you're trying to do FP.

JavaScript `function`s have a `this` keyword that's automatically bound per function call. The `this` keyword can be described in many different ways, but I prefer to say it provides an object context for the function to run against.

`this` is an implicit parameter input for your function.

Consider:

```js
function sum() {
	return this.x + this.y;
}

var context = {
	x: 1,
	y: 2
};

sum.call( context );		// 3

context.sum = sum;
context.sum();				// 3

var s = sum.bind( context );
s();						// 3
```

Of course, if `this` can be input into a function implicitly, the same object context could be sent in as an explicit argument:

```js
function sum(ctx) {
	return ctx.x + ctx.y;
}

var context = {
	x: 1,
	y: 2
};

sum( context );
```

Simpler. And this kind of code will be a lot easier to deal with in FP. It's much easier to wire multiple functions together, or use any of the other input wrangling techniques we will get into in the next chapter, when inputs are always explicit. Doing them with implicit inputs like `this` ranges from awkward to nearly-impossible depending on the scenario.

There are other tricks we can leverage in a `this`-based system, like for example prototype-delegation (also covered in detail in the "this & Object Prototypes" book):

```js
var Auth = {
	authorize() {
		var credentials = this.username + ":" + this.password;
		this.send( credentials, resp => {
			if (resp.error) this.displayError( resp.error );
			else this.displaySuccess();
		} );
	},
	send(/* .. */) {
		// ..
	}
};

var Login = Object.assign( Object.create( Auth ), {
	doLogin(user,pw) {
		this.username = user;
		this.password = pw;
		this.authorize();
	},
	displayError(err) {
		// ..
	},
	displaySuccess() {
		// ..
	}
} );

Login.doLogin( "fred", "123456" );
```

**Note:** `Object.assign(..)` is an ES6+ utility for doing a shallow assignment copy of properties from one or more source objects to a single target object: `Object.assign( target, source1, ... )`.

In case you're having trouble parsing what this code does: we have two separate objects `Login` and `Auth`, where `Login` performs prototype-delegation to `Auth`. Through delegation and the implicit `this` context sharing, these two objects virtually compose during the `this.authorize()` function call, so that properties/methods on `this` are dynamically shared with the `Auth.authorize(..)` function.

*This* code doesn't fit with various principles of FP for a variety of reasons, but one of the obvious hitches is the implicit `this` sharing. We could be more explicit about it and keep code that was easier to push in the FP direction:

```js
// ..

authorize(ctx) {
	var credentials = ctx.username + ":" + ctx.password;
	Auth.send( credentials, function onResp(resp){
		if (resp.error) ctx.displayError( resp.error );
		else ctx.displaySuccess();
	} );
}

// ..

doLogin(user,pw) {
	Auth.authorize( {
		username: user,
		password: pw
	} );
}

// ..
```

From my perspective, the problem is not with using objects to organize behavior. It's that we're trying to use implicit input instead of being explicit about it. When I'm wearing my FP hat, I want to leave `this` stuff on the shelf.

## Summary

Functions are powerful.

But let's be clear what a function is. It's not just a collection of statements/operations. Specifically, a function needs one or more inputs (ideally, just one!) and an output.

Functions inside of functions can have closure over outer variables and remember them for later. This is one of the most important concepts in all of programming, and a fundamental foundation of FP.

Be careful of anonymous functions, especially `=>` arrow functions. They're convenient to write, but they shift the cost from author to reader. The whole reason we're studying FP here is to write more readable code, so don't be so quick to jump on that bandwagon.

Don't use `this`-aware functions. Just don't.
