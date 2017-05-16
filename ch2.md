# Functional-Light JavaScript
# Chapter 2: Foundations of Functional Functions

Functional Programming is **not just programming with the `function` keyword.** Oh if only it was that easy, I could end the book right here! But importantly, the function really *is* at the center of FP. And it's how we use functions that makes our code *functional*.

函数式编程 **不是使用 `function` 关键字编程。** 如果它真有那么简单，我在这里就可以结束这本书了！但重要的是，函数确实是 FP 的中心。使我们的代码成为 *函数式* 的，使我们如何使用函数。

But, how sure are you that you know what *function* means?

但是，你确信你知道 *函数* 是什么意思？

In this chapter, we're going to lay the groundwork for the rest of the book by covering all the foundational aspects of functions. In some ways, the content here is a review of all the things even a non-FP programmer should know about functions. But if we want to get the most out learning FP concepts, we've got to *know* functions inside and out.

在这一章中，我们将要通过讲解函数的所有基本方面来为本书的剩余部分打下基础。在某种意义上，这里的内容即便是对非 FP 程序员来说也是应当知道的关于函数的一切。但是如果我们想要从 FP 的概念中学到竟可能多的东西，我们必须 *知道* 函数的里里外外。

Brace yourself, because there's a lot more to the function than you may have realized.

振作起来，关于函数东西可能比你已经知道的东西多得多。

## What Is A Function?

The most natural place I can think of to start tackling functional programming is with the *function*. That may seem too simplistic and obvious, but I think our journey needs a solid first step.

要解释函数式编程，我所能想到的最自然的起点就是 *函数*。这看起来在显而易见不过了，但我想我们的旅程需要坚实的第一步。

So... what is a function?

那么……什么是函数？

### Brief Math Review

I know I've promised we'd stay away from math as much as possible, but bear with me for a moment as we quickly observe some fundamental things about functions and graphs from algebra before we move on.

我知道我承诺过尽可能远离数学，但稍稍忍耐我片刻，在继续之前我们快速地观察一些东西：代数中有关函数和图像的基础。

Do you remember learning anything about `f(x)` back in school? What about the equation `y = f(x)`?

你还记得在学校里学过的关于 `f(x)` 的一些东西吗？等式 `y = f(x)` 呢？

Let's say an equation is defined like this: <code>f(x) = 2x<sup>2</sup> + 3</code>. What does that mean? What does it mean to graph that equation? Here's the graph:

比如说一个等式这样定义的：<code>f(x) = 2x<sup>2</sup> + 3</code>。这是什么意思？给这个函数画出图像是什么意思？这就是图像：

<img src="fig1.png">

What you can notice is that for any value of `x`, say `2`, if you plug it into the equation, you get `11`. What is `11`, though? It's the *return value* of the `f(x)` function, which earlier we said represents a `y` value.

你能注意到，对于任何 `x` 的值，比如 `2`，如果你将它插入这个等式，你会得到 `11`。那么 `11` 是什么？它是函数 `f(x)` 的 *返回值*，代表我们刚才说到的 `y` 值。

In other words, there's a point at `(2,11)` on that curve in the graph. And for every value of `x` we plug in, we get another `y` value that pairs with it as a coordinate for a point. Another is `(0,3)`, and another is `(-1,5)`. Put all those points together, and you have the graph of that parabolic curve as shown above.

换句话说，在图像的曲线上有一个点 `(2,11)`。而且对于我们插入的任意的 `x` 的值，我们都能得到另一个与之相对应的 `y` 值作为一个点的坐标。比如另外一个点 `(0,3)`，以及另一个点 `(-1,5)`。将这些点放在一起，你就得到了上面的抛物线图像。

So what's any of this got to do with FP?

那么这到底与 FP 有什么关系？

In math, a function always takes input(s), and always gives an output. A term you'll often hear around FP is "morphism"; this is a fancy way of describing a set of values that maps to another set of values, like the inputs of a function related to the outputs of that function.

在数学中，一个函数总是接受输入，并且总是给出输出。一个你将经常听到的 FP 术语是“态射（morphism）”；这个很炫的词用来描述一个值的集合映射到另一个值的集合，就像一个函数的输入与这个函数的输入的关系一样。

In algebraic math, those inputs and outputs are often interpreted as parts of coordinates to be graphed. In our programs, however, we can define functions with all sorts of input(s) and output(s), and they need not have any relationship to a visually plotted curve on a graph.

在代数中，这些输入与输出经常被翻译为被绘制的图像的坐标的一部分。然而，我们我可以使用各种各样的输入与输出定义函数，而且它们不必与视觉上图像的曲线有任何关系。

### Function vs Procedure

So why all the talk of math and graphs? Because in a sense functional programming is about embracing using functions as *functions* in this mathematical sense.

那么为什么说了半天数学和图像？因为在某种意义上，函数式编程就是以这种数学意义上的 *函数* 来使用函数。

You may be more accustomed to thinking of functions as procedures. What's the difference? An arbitrary collection of functionality. It may have inputs, it may not. It may have an output (`return` value), it may not.

你可能更习惯于将函数考虑为过程（procedures）。它有什么区别？一个任意功能的集合。它可能有输入，也可能没有。它可能有一个输出（`return` 值），也可能没有。

A function takes input(s) and definitely always has a `return` value.

而一个函数接收输入并且绝对总是有一个 `return` 值。

If you plan to want to do functional programming, **you should be using functions as much as possible**, and not procedures. All your `function`s should take input(s) and return output(s). Why? The answer to that will have many levels of meaning that we'll uncover throughout this book.

如果你打算进行函数式编程，**你就应当尽可能多地使用函数**，而不是过程。你所有的 `function` 都应当接收输入并返回输出。为什么？这个问题的答案有许多层次的含义，我们将在这本书中逐一揭示它们。

## Function Input

From this definition, all functions need input.

根据这个定义，所有函数都需要输入。

You sometimes hear people refer to them as "arguments" and sometimes as "parameters". So what's that all about?

你有时会听到人们称它们为“实际参数（arguments）”，而有时称为“形式参数（parameters）”。那么这都是什么意思？

*Arguments* are the values you pass in, and *parameters* are the named variables inside the function that receive those passed in values. Example:

*实际参数* 是你传入的值，而 *形式参数* 在函数内部被命名的变量，它们接收那些被传入的值。例如：

```js
function foo(x,y) {
	// ..
}

var a = 3;

foo( a, a * 2 );
```

`a` and `a * 2` (actually, the result of that expression, `6`) are the *arguments* to the `foo(..)` call. `x` and `y` are the *parameters* that receive the argument values (`3` and `6`, respectively).

`a` 和 `a * 2`（实际上，是这个表达式的值，`6`） 是 `foo(..)` 调用的 *实际参数*。`x` 和 `y` 是接收实际参数值（分别是 `3` 和 `6`）的 *形式参数*。

**Note:** In JavaScript, there's no requirement that the number of *arguments* matches the number of *parameters*. If you pass more *arguments* than you have declared *parameters* to receive them, the values pass in just fine untouched. These values can be accessed in a few different ways, including the old-school `arguments` object you may have heard of before. If you pass fewer *arguments* than the declared *parameters*, each unaccounted-for parameter is an "undefined" variable, meaning it's present and available in the scope of the function, but just starts out with the empty `undefined` value.

**注意：** 在 JavaScript 中，不要求 *实际参数* 的数量要与 *形式参数* 的数量相吻合。如果你传入的 *实际参数* 多于被声明来接受它们的 *形式参数* ，那么这些值会原封不动地被传入。这些值可以用几种不同的方式访问，包括老旧的 `arguments` 对象。如果你传入的 *实际参数* 少于被声明的 *形式参数*，那么每一个无人认领的形式参数都是一个 “undefined” 值，这意味着它在这个函数的作用域中存在而且可用，只是初始值是空的 `undefined`。

### Counting Inputs

The number of arguments a function "expects" -- how many arguments you'll probably want to pass to it -- is determined by the number of parameters that are declared.

被“期待”的实际参数的数量 —— 你可能想向它传递多少实际参数 —— 是由被声明的形式参数的数量决定的。

```js
function foo(x,y,z) {
	// ..
}
```

`foo(..)` *expects* three arguments, because it has three declared parameters. This count has a special term: arity. Arity is the number of parameters in a function declaration. The arity of `foo(..)` is `3`.

`foo(..)` *期待* 三个实际参数，因为它拥有三个被声明的形式参数。这个数量有一个特殊的术语：元（arity）。元是函数声明中形式参数的数量。`foo(..)` 的元是 `3`。

You may wish to inspect a function reference during the runtime of a program to determine its arity. This can be done with the `length` property of that function reference:

你可能会想在运行时期间检查一个函数引用来判定它的元。这可以通过这个函数引用的 `length` 属性来完成：

```js
function foo(x,y,z) {
	// ..
}

foo.length;				// 3
```

One reason for determining the arity during execution would be if a piece of code received a function reference from multiple sources, and sent different values depending on the arity of each.

一个在执行期间判定元的原因可能是，一段代码从多个源头接受一个函数引用，并且根据每个函数引用的元来发送不同的值。

For example, imagine a case where an `fn` function reference could expect one, two, or three arguments, but you always want to just pass a variable `x` in the last position:

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

**Tip:** The `length` property of a function is read-only and it's determined at the time you declare the function. It should be thought of as essentially a piece of metadata that describes something about the intended usage of the function.

**提示：** 一个函数的 `length` 属性是只读的，而且它在你声明这个函数时就已经被决定了。它应当被认为实质上是一段元数据，用来描述这个函数意料之中的用法。

One gotcha to be aware of is that certain kinds of parameter list variations can make the `length` property of the function report something different than you might expect. Don't worry, we'll explain each of these (ES6-introduced) features later in this chapter:

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

If you use any of these forms of parameters, be aware that your function's `length` value may surprise you.

如果你使用这些形式参数中的任意一种，那么要洗小心你函数的 `length` 值可能会使你惊讶。

What about counting the number of arguments the current function call received? This used to be trivial, but now the situation is slightly more complicated. Each function has an `arguments` object (array-like) available that holds a reference to each of the arguments passed in. You can then inspect the `length` property of `arguments` to figure out how many were actually passed:

那么如何计数当前函数调用收到的实际参数数量呢？这曾经是小菜一碟，但现在情况变得稍微复杂一些。每个函数都有一个可以使用的 `arguments` （类数组）对象，它持有每个被传入的实际参数的医用。你可检查 `arguments` 的 `length` 属性来搞清楚有多少参数被实际传递了：

```js
function foo(x,y,z) {
	console.log( arguments.length );	// 2
}

foo( 3, 4 );
```

As of ES5 (and strict mode, specifically), `arguments` is considered by some to be soft-deprecated; many will avoid using it if possible. It'll never be removed -- in JS we "never" break backwards-compatibility no matter how convenient that may be -- but it's strongly suggested for several reasons that you avoid using it whenever possible.

在 ES5（具体地说，strict 模式）中，`arguments` 被认为是有些软废弃了；许多人都尽量避免使用它。它永远都不会被移除 —— 在 JS 中，不论那将会变得多么方便，我们“永远”都不会破坏向下的兼容性 —— 但是由于种种原因依然强烈建议你尽可能避免使用它。

However, I suggest that `arguments.length`, and only that, is OK to keep using for those cases where you need to care about the passed number of arguments. A future version of JS might possibly add a feature that restores the ability to determine the number of arguments passed without `arguments.length`; if that happens, then we can fully drop usage of `arguments`.

然而，我建议 `arguments.length`，而且仅有它，在你需要关心被传入的实际参数的数量时是可以继续使用的。某个未来版本的 JS 中有可能会加入一个特性，在没有 `arguments.length` 的情况下恢复判定被传递的实际参数数量的能力；如果这真的发生了，那么我们就可以完全放弃 `arguments` 的使用了。

Be careful: **never** access arguments positionally, like `arguments[1]`. Stick to `arguments.length` only, if you must.

小心：**绝不要** 按位置访问实际参数，比如 `arguments[1]`。如果你必须这么做的话，坚持只使用 `arguments.length`。

Except... how will you access an argument that was passed in a position beyond the declared parameters? I'll answer that in a moment; but first, take a step back and ask yourself, "Why would I want to do that?". Seriously. Think about that closely for a minute.

除非……你如何访问一个在超出被声明的形式参数位置上传入的实际参数？我一会就会回答这个问题；但首先，退一步问你自己，“为什么我想要这么做？”。认真地，把这个问题考虑几分钟。

It should be pretty rare that this occurs; it shouldn't be something you regularly expect or rely on when writing your functions. If you find yourself in such a scenario, spend an extra 20 minutes trying to design the interaction with that function in a different way. Name that extra argument even if it's exceptional.

这种情况的发生应该非常少见；它不应当是你通常所期望的，或者在你编写函数式所依靠的东西。如果你发现自己身陷于此，那么就再花额外的20分钟，试着用一种不同的方式来设计这个函数的交互。即使这个参数是特殊的，也给它起个名字。

A function signature that accepts an indeterminate amount of arguments is referred to as a variadic function. Some people prefer this style of function design, but I think you'll find that often the FPer wants to avoid these where possible.

一个接收不确定数量的实际参数的函数签名成为可变参函数（variadic function）。有些人喜欢这种风格的函数设计，但我想你将会发现 FP 程序员经常想要尽量避免这些。

OK, enough harping on that point.

好了，在这一点上唠叨得够多了。

Say you do need to access the arguments in a positional array-like way, possibly because you're accessing an argument that doesn't have a formal parameter at that position. How do we do it?

假定你需要以一种类似数组下标定位的方式来访问实际参数，这可能是因为你正在访问一个没有正式形式参数位置的实际参数。我们该如何做？

ES6 to the rescue! Let's declare our function with the `...` operator -- variously referred to as "spread", "rest", or (my preference) "gather".

ES6 前来拯救！然我们使用 `...` 操作符来声明我们的函数 —— 它有多个名称：“扩散”、“剩余”、或者（我最喜欢的）“聚集”。

```js
function foo(x,y,z,...args) {
	// ..
}
```

See the `...args` in the parameter list? That's a new ES6 declarative form that tells the engine to collect (ahem, "gather") all remaining arguments (if any) not assigned to named parameters, and put them in a real array named `args`. `args` will always be an array, even if it's empty. But it **will not** include values that are assigned to the `x`, `y`, and `z` parameters, only anything else that's passed in beyond those first three values.

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

So, if you *really* want to be design a function that can account for an arbitrary number of arguments to be passed in, use `...args` (or whatever name you like) on the end. Now, you'll have a real, non-deprecated, non-yucky array to access those argument values from.

所以，如果你 *真的* 想要设计一个解析任意多实际参数的函数，就在末尾使用 `...args`（或你喜欢的其他任何名字）。现在，你将得到一个真正的，没有被废弃的，不讨人嫌的数组来访问那些实际参数。

Just pay attention to the fact that the value `4` is at position `0` of that `args`, not position `3`. And its `length` value won't include those three `1`, `2`, and `3` values. `...args` gathers everything else, not including the `x`, `y`, and `z`.

只不过要注意，值 `4` 在这个 `args` 的位置 `0` 上，而不是位置 `3`。而且它的 `length` 值将不会包括 `1`、`2`、和 `3` 这三个值。`...args` 聚集所有其余的东西，不包含 `x`、`y`、和 `z`。

You *can* even use the `...` operator in the parameter list even if there's no other formal parameters declared:

你甚至 *可以* 在没有声明任何正式形式参数的参数列表中使用 `...` 操作符：

```js
function foo(...args) {
	// ..
}
```

Now `args` will be the full array of arguments, whatever they are, and you can use `args.length` to know exactly how many arguments have been passed in. And you're safe to use `args[1]` or `args[317]` if you so choose. Please don't pass in 318 arguments, though.

无论实际参数是什么，`args` 现在都是一个完全的实际参数的数组，而且你可以使用 `args.length` 来知道究竟有多少个实际参数被传入了。而且如果你选择这样做的话，你可以安全地使用 `args[1]` 或 `args[317]`。但是，拜托不要传入318个实际参数。

Speaking of ES6 goodies, there's a few other tricks you may want to know about with your function arguments and parameters. For more information beyond this brief overview, see Chapter 2 of my "You Don't Know JS: ES6 & Beyond" book.

说道 ES6 的好处，关于你函数的实际参数与形式参数，还有几种你可能想知道的其他的技巧。这个简要概览之外的更多信息，参见我的 “你不懂JS —— ES6与未来” 的第二章。

#### Argument Tricks

What if you wanted to pass along an array of values as the arguments in your function call?

要是你想要传递一个值的数组作为你函数调用的实际参数呢？

```js
function foo(...args) {
	console.log( args[3] );
}

var arr = [ 1, 2, 3, 4, 5 ];

foo( ...arr );						// 4
```

Our new friend `...` is used, but not just in the parameter list; it's also used in the argument list at the call-site. It has the opposite behavior in this context. In a parameter list, we said it *gathered* arguments together. In an argument list, it *spreads* them out. So the contents of `arr` are actually spread out as individual arguments to the `foo(..)` call. Do you see how that's different from just passing in a reference to the whole `arr` array?

我们使用了我们的新朋友 `...`，它不只是在形式参数列表中可以使用；而且还可以在调用点的实际参数列表中使用。在这样的上下文环境中它将拥有相反的行为。在形式参数列表中，我们说它将实际参数 *聚集* 在一起。在实际参数列表中，它将它们 *扩散* 开来。所以 `arr` 的内容实际上被扩散为 `foo(..)` 调用的各个独立的实际参数。你能看出这与仅仅传入 `arr` 数组的整个引用有什么不同吗？

By the way, multiple values and `...` spreadings can be interleaved, as you see fit:

顺带一提，多个值与 `...` 扩散是可以穿插的，只要你认为合适：

```js
var arr = [ 2 ];

foo( 1, ...arr, 3, ...[4,5] );		// 4
```

Think of `...` in this symmetric sense: in a value-list position, it *spreads*. In an assignment position -- like a parameter list, because arguments get *assigned to* parameters -- it *gathers*.

以这种对称的感觉考虑 `...`：在一个值的列表的位置，它 *扩散*。在一个赋值的位置 —— 比如形式参数列表，因为实际参数被 *赋值给* 了形式参数 —— 它 *聚集*。

Whichever behavior you invoke, `...` makes working with arrays of arguments much easier. Gone are the days of `slice(..)`, `concat(..)` and `apply(..)` to wrangle our argument value arrays.

不管你调用哪一种行为，`...` 都令使用实际参数列表变得非常简单。使用`slice(..)`、`concat(..)` 和 `apply(..)` 来倒腾我们实际参数值数组的日子一去不复返了。

#### Parameter Tricks

As of ES6, parameters can have declared *default values*. In the case where the argument for that parameter is not passed, or it's passed as the value `undefined`, the default assignment expression takes over.

在 ES6 中， 形式参数可以被声明 *默认值*。在这个形式参数的实际参数没有被传递，或者被传递了一个 `undefined` 值的情况下，默认的赋值表达式将会取而代之。

Consider:

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

**Note:** We won't cover it here in any more detail, but the default value expression is lazy, meaning it's not evaluated unless and until needed. Also, it can be any valid JS expression, even a function call. Many cool tricks are possible with this capability. For example, you could declare `x = required()` in your parameter list, and in the `required()` function simply `throw "This argument is required."` to make sure someone always calls your function with that argument/parameter specified.

**注意：** 我们不会在此涵盖更多的细节，但是默认值表达式是懒惰的，这意味着除非需要它不会被求值。另外，它可以使任意合法的 JS 表达式，甚至是一个函数调用。这种能力使得许多很酷的技巧成为可能。例如，你可以在形式参数列表中声明 `x = required()`，而在 `required()` 函数中简单地 `throw "This argument is required."`，来确保其他人总是带着指定的实际/形式参数来调用你的函数。

Another ES6 trick we can use with our parameters is called "destructuring". We'll only glance briefly at it because this topic is much more complex than we have space to cover here. But again, refer to my "ES6 & Beyond" book for lots more info.

另一个我们可以在形式参数列表中使用的技巧称为 “解构”。我们将简要地扫它一眼，因为这个话题要比我们在这里讨论的复杂太多了。同样，更多信息参考我的 “ES6与未来”。

Remember our `foo(..)` from before that could receive as many as 318 arguments!?

还记得刚才可以接收318个实际参数的 `foo(..)` 吗！？

```js
function foo(...args) {
	// ..
}

foo( ...[1,2,3] );
```

What if we wanted to change that interaction so the caller of our function passes in an array of values instead of individual argument values? Just drop the two `...` usages:

要是我们想改变这种互动方式，让我们函数的调用方传入一个值的数组而非各个独立的实际参数值呢？只要去掉这两个 `...` 就好：

```js
function foo(args) {
	// ..
}

foo( [1,2,3] );
```

Simple enough. But what if now we wanted to give a parameter name to each of the first two values in the passed in array? We aren't declaring individual parameters anymore, so it seems we lost that ability. Destructuring is the answer:

这很简单。但如果我们想给被传入的数组的前两个值赋予形式参数名呢？我们不再声明独立的形式参数了，看起来我们失去了这种能力。但解构就是答案：

```js
function foo( [x,y,...args] = [] ) {
	// ..
}

foo( [1,2,3] );
```

Do you spot the `[ .. ]` brackets around the argument list now? That's array destructuring. Destructuring is a way to declaratively describe a *pattern* for the kind of structure (object, array, etc) that you expect to see, and how decomposition (assignment) of its individual parts should happen.

你发现现在形式参数列表周围的方括号 `[ .. ]` 了吗？这就是数组解构。解构为你想看到的某种结构（对象，数组等）声明式了一个 *范例*，描述应当如何将它的分解（分配）为各个独立的部分。

In this example, destructuring tells the engine that an array is expected in this assignment position (aka parameter). The pattern says to take the first value of that array and assign to a local parameter variable called `x`, the second to `y`, and whatever is left is *gathered* into `args`.

在这个例子中，解构告诉引擎在这个赋值的位置（也就是形式参数）上期待一个数组。范例中说将这个数组的第一个值赋值给称为 `x` 的本地形式参数变量，第二个赋值给 `y`，而剩下的所有东西都 *聚集* 到 `args` 中。

You could have done that same thing manually like this:

你本可以像下面这样手动地做同样的事情：

```js
function foo(params) {
	var x = params[0];
	var y = params[1];
	var args = params.slice( 2 );

	// ..
}
```

But now we start to uncover the first bits of a principle that we'll come back to many more times in this text: declarative code often communicates more cleanly than imperative code.

但是现在我们要揭示一个原则 —— 我们将在本文中回顾它许多许多次 —— 的第一点：声明式代码经常要比指令式代码表意更清晰。

Declarative code, like destructuring in the earlier snippet, focuses on what the outcome of a piece of code should be. Imperative code, like the manual assignments just shown, focuses more on how to get the outcome. If you later read the code, you have to mentally execute it to understand the desired outcome. The outcome is *coded* there, but it's not as clear.

声明式代码，就像前面代码段中的解构，关注于一段代码的结果应当是什么样子。指令式代码，就像刚刚展示的手动赋值，关注于如何得到结果。如果稍后再读这段代码，你就不得不在大脑中执行它来得到期望的结果。它的结果被 *编码* 在这里，但不清晰。

Wherever possible, and to whatever degrees our language and our libraries/frameworks will let us, **we should be striving for declarative and self-explanatory code.**

不论什么地方，也不论我们的语言或库/框架允许我们这样做到多深的程度，**我们都应当努力使用声明式的、自解释的代码。**

Just as we can destructure arrays, we can destructure object parameters:

正如我们可以解构数组，我们还可以解构对象形式参数：

```js
function foo( {x,y} = {} ) {
	console.log( x, y );
}

foo( {
	y: 3
} );					// undefined 3
```

We pass in an object as the single argument, and it's destructured into two separate parameter variables `x` and `y`, which are assigned the values of those corresponding property names from the object passed in. It didn't matter that the `x` property wasn't on the object; it just ended up as a variable with `undefined` like you'd expect.

我们将一个对象作为实际参数传入，它被解构为两个分离的形式参数变量 `x` 和 `y`，被传入的对象中具有相应属性名称的值将会被赋予这两个变量。对象中不存在 `x` 属性并不要紧；它会如你所想地那样得到一个 `undefined` 变量。

But the part of parameter object destructuring I want you to pay attention to is the object being passed into `foo(..)`.

但是在这个形式参数对象解构中我想让你关注的是被传入 `foo(..)` 的对象。

With a normal call-site like `foo(undefined,3)`, position is used to map from argument to parameter; we put the `3` in the second position to get it assigned to a `y` parameter. But at this new kind of call-site where parameter destructuring is involved, a simple object-property indicates which parameter (`y`) the argument value `3` should be assigned to.

像 `foo(undefined,3)` 这样普通的调用点，位置用于将实际参数映射到形式参数上；我们将 `3` 放在第二个位置上使它被赋值给形式参数 `y`。但是在这种引入了形式参数解构的新型调用点中，一个简单的对象-属性指示了哪个形式参数应该被赋予实际参数值 `3`。

We didn't have to account for `x` in *that* call-site because in effect we didn't care about `x`. We just omitted it, instead of having to do something distracting like passing `undefined` as a positional placeholder.

我们不必在这个调用点中说明 `x`，因为我们实际上不关心 `x`。我们只是忽略它，而不是必须去做传入 `undefined` 作为占位符这样令人分心的事情。

Some languages have a direct feature for this behavior: named arguments. In other words, at the call-site, labeling an input value to indicate which parameter it maps to. JavaScript doesn't have named arguments, but parameter object destructuring is the next best thing.

有些语言直接拥有这种行为特性：命名实际参数。换句话说，在调用点中，给一个输入值打上一个标签来指示它映射到哪个形式参数上。JavaScript 不具备命名实际参数，但是形式参数对象解构是最佳后备选项。

The FP-related benefit of using an object destructuring to pass in potentially multiple arguments is that a function that only takes one parameter (the object) is much easier to compose with another function's single output. Much more on that later.



Recall that the term arity refers to how many parameters a function expects to receive. A function with arity of 1 is also referred to as a unary function. In FP, we'll want our functions to be unary whenever possible, and sometimes we'll even use a variety of functional tricks to transform a function of higher arity to a unary form.

**Note:** In Chapter 3, we'll revisit this named-argument destructuring trick to deal with annoying issues around parameter ordering.

### Functions Varying By Input

Consider this function:

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

Obviously, this contrived example is going to behave differently depending on what inputs you pass in.

For example:

```js
foo( 3, 4 );			// 12

foo( "3", 4 );			// "34"
```

One reason programmers define functions like this is because it can be more convenient to *overload* different behaviors into a single function. The most well-known example is the `$(..)` function provided by many major JS libraries like jQuery. The "dollar sign" function has about a dozen very different kinds of behaviors -- from DOM element lookup to DOM element creation to deferring a function until the `DOMContentLoaded` event -- depending on what arguments you pass to it.

The perceived advantage is learning a smaller API (just one `$(..)` function), but the obvious downside is in reading code and having to carefully inspect exactly what's being passed in to try to decipher what a call will do.

This technique of overloading a function with lots of behaviors based on its inputs is called ad hoc polymorphism.

Another manifestation of this design pattern is making a function that has different outputs (see the next section for more detail) under different scenarios.

**Warning:** Be very careful of the *convenience* temptation here. Just because you can design a function in this way, and even though there may be immediate perceived wins, the long-term costs of this design decision can be unpleasant.

## Function Output

In JavaScript, functions always return a value. These three functions all have identical `return` behavior:

```js
function foo() {}

function bar() {
	return;
}

function baz() {
	return undefined;
}
```

The `undefined` value is implicitly `return`ed if you have no `return` or if you just have an empty `return;`.

But keeping as much with the spirit of FP function definition as possible -- using functions and not procedures -- our functions should always have outputs, which means they should explicitly `return` a value, and usually not `undefined`.

A `return` statement can only return a single value. So if your function needs to return multiple values, your only viable option is to collect them into a compound value like an array or an object:

```js
function foo() {
	var retValue1 = 11;
	var retValue2 = 31;
	return [ retValue1, retValue2 ];
}
```

Just like destructuring lets us de-construct array/object values in parameters, we can also do so in regular assignments:

```js
function foo() {
	var retValue1 = 11;
	var retValue2 = 31;
	return [ retValue1, retValue2 ];
}

var [ x, y ] = foo();
console.log( x + y );			// 42
```

Collecting multiple values into an array (or object) to return, and subsequently destructuring those values back into distinct assignments, is a way to transparently express multiple outputs for a function.

**Tip:** I'd be remiss if I didn't suggest you take a moment to consider if a function needing multiple outputs could be refactored to avoid that, perhaps separated into two or more smaller single-purpose functions? Sometimes that will be possible, sometimes not; but you should at least consider it.

### Early Returns

The `return` statement doesn't just return a value from a function. It's also a flow control structure; it ends the execution of the function at that point. A function with multiple `return` statements thus has multiple possible exit points, meaning that it may be harder to read a function to understand its output behavior if there are many paths that output.

Consider:

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

Pop quiz: without cheating and running this code in your browser, what does `foo(2)` return? What about `foo(4)`? And `foo(8)`? And `foo(12)`?

How confident are you in your answers? How much mental tax did you pay to get those answers? I got it wrong the first two times I tried to think it through, and I wrote it!

I think part of the readability problem here is that we're using `return` not just to return different values, but also as a flow control construct to quit a function's execution early in certain cases. There are obviously better ways to write that flow control (the `if` logic, etc), but I also think there are ways to make the output paths more obvious.

**Note:** The answers to the pop quiz are `2`, `2`, `8`, and `13`.

Consider this version of the code:

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

This version is unquestionably more verbose. But I would argue it's slightly simpler logic to follow, because every branch where `retValue` can get set is *guarded* by the condition that checks if it's already been set.

Rather than `return`ing from the function early, we used normal flow control (`if` logic) to determine the `retValue`'s assignment. At the end, we simply `return retValue`.

I'm not unconditionally saying that you should always have a single `return`, or that you should never do early `return`s, but I do think you should be careful about the flow control part of `return` creating more implicitness in your function definitions. Try to figure out the most explicit way to express the logic; that will often be the best way.

### Un`return`ed Outputs

One technique that you've probably used in most code you've written, and maybe didn't even think about it much, is to have a function output some or all of its values by simply changing variables outside itself.

Remember our <code>f(x) = 2x<sup>2</sup> + 3</code> function from earlier in the chapter? We could have defined it like this in JS:

```js
var y;

function foo(x) {
	y = (2 * Math.pow( x, 2 )) + 3;
}

foo( 2 );

y;						// 11
```

I know this is a silly example; we could just as easily have `return`d the value instead of setting it into `y` from within the function:

```js
function foo(x) {
	return (2 * Math.pow( x, 2 )) + 3;
}

var y = foo( 2 );

y;						// 11
```

Both functions accomplish the same task. Is there any reason we should pick one over the other? **Yes, absolutely.**

One way to explain the difference is that the `return` in the latter version signals an explicit output, whereas the `y` assignment in the former is an implicit output. You may already have some intuition that guides you in such cases; typically, developers prefer explicit patterns over implicit ones.

But changing a variable in an outer scope, as we did with the `y` assignment inside of `foo(..)`, is just one way of achieving an implicit output. A more subtle example is making changes to non-local values via reference.

Consider:

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

The most obvious output from this function is the sum `124`, which we explicitly `return`ed. But do you spot the other output? Try that code and then inspect the `nums` array. Now do you spot the difference?

Instead of an `undefined` empty slot value in position `4`, now there's a `0`. The harmless looking `list[i] = 0` operation ended up affecting the array value on the outside, even though we operated on a local `list` parameter variable.

Why? Because `list` holds a reference-copy of the `nums` reference, not a value-copy of the `[1,3,9,..]` array value. Because JS uses references and reference-copies for arrays, objects, and functions, we can create an output from our function all too easily, even if by accident.

This implicit function output has a special name in the FP world: side effects. But a function that has *no side effects* also has a special name: pure function. We'll talk a lot more about these in a later chapter, but the punchline is that we'll want to prefer pure functions and avoid side effects if at all possible.

## Functions Of Functions

Functions can receive and return values of any type. A function that receives or returns one or more other function values has the special name: higher-order function.

Consider:

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

A higher-order function can also output another function, like:

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

### Keeping Scope

One of the most powerful things in all of programming, and especially in FP, is how a function behaves when it's inside another function's scope. When the inner function makes reference to a variable from the outer function, this is called closure.

Defined pragmatically, closure is when a function remembers and accesses variables from outside of its own scope, even when that function is executed in a different scope.

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
