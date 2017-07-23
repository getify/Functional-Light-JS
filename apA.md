# 轻量函数式 JavaScript
# 附录 A：Transducing

与我们在本书中所讲解的内容相比，Transducing 是一种更高级的技术。它扩展了第八章中的列表操作的许多概念。

我不认为这个话题是严格的 “轻量函数式”，它更像是在此之上的额外奖励。我将它留作附录是因为你很可能需要暂且跳过关于它的讨论，而在你对本书正文中的概念感到相当适应 —— 并且确实经过实践！ —— 之后再回到这里。

老实说，即便是教授了 transducing 许多次，而且编写了这一章之后，我依然在努力地尝试使用这种技术来武装自己的头脑。所以，如果它让你感到很绕也不要灰心。给这一章夹上一个书签，当你准备好了之后再回来。

Transducing 意味着带有变形（transforming）的递减（reduction）。

我知道，它听起来就像一个杂乱的词汇 —— 它使人糊涂的地方要比它澄清的东西多。但还是让我们看看它能有多么强大。实际上，我认为一旦你掌握了轻量函数式编程的原理，它就是你能力的最佳展示。

正如本书的其他部分一样，我的方式是首先解释 *为什么*，然后在讲解 *如何做*，最后归结为一种简化的，可重用的 *什么*。这通常与其他许多人的教授方法相反，但我认为这种方式可以使你更深入地学习。

## 首先，为什么

让我们从扩展第三章中的一个场景开始，测试一个单词，看它是否足够短并/或足够长：

```js
function isLongEnough(str) {
	return str.length >= 5;
}

function isShortEnough(str) {
	return str.length <= 10;
}
```

在第三章中，我们使用了这些判定函数来测试一个单词。然后在第八章中，我们学习了如何使用 `filter(..）` 之类的列表操作重复这样的测试。例如：

```js
var words = [ "You", "have", "written", "something", "very", "interesting" ];

words
.filter( isLongEnough )
.filter( isShortEnough );
// ["written","something"]
```

这可能不太明显，不过这种分离且相邻的列表操作模式有些不尽人意的性质。当我们处理仅拥有为数不多的值的单一数组是，一切都很正常。但如果数组中有许多值的时候，分离地处理每个 `filter(..)` 可能会出人意料地降低程序运行的速度。

当我们的数组是异步/懒惰（也称为 observable）的、在对事件作出相应而跨时段处理值（见第十章）的时候也会出现同样的性能问题。在这种场景下，事件流中每次只会有一个值被传递出来，所以使用两个分离的 `filter(..)` 函数处理这些离散的值也不是什么大问题。

但微妙的是，每个 `filter(..)` 方法都生成一个分离的 observable。将一个值从一个 observable 中传递到另一个 observable 的开销可能累积起来。特别是在这些情况下成千或上百万的值需要被处理并非不寻常的事；即便是如此之小的开销也会很快地累积起来。

另一个缺陷是可读性，特别是当我们需要对多个列表（或者 observable）重复这一系列操作的时候。例如：

```js
zip(
	list1.filter( isLongEnough ).filter( isShortEnough ),
	list2.filter( isLongEnough ).filter( isShortEnough ),
	list3.filter( isLongEnough ).filter( isShortEnough )
)
```

很啰嗦，对吧？

如果我们能够将 `isLongEnough(..)` 和 `isShortEnough(..)` 判定函数结合起来不是更好吗（对于可读性和性能来说）？你可以手动这样做：

```js
function isCorrectLength(str) {
	return isLongEnough( str ) && isShortEnough( str );
}
```

但这不是 FP 的方式！

在第八章中，我们谈到了熔合 —— 组合相邻的映射函数。回想一下：

```js
words
.map(
	pipe( removeInvalidChars, upper, elide )
);
```

不幸的是，组合相邻的判定函数不像组合相邻的映射函数那么简单。究其原因，考虑一下判定函数的 “外形（shape）” —— 某种描述输入和输出签名的学术化方式。它接收一个单独的值，并返回一个 `true` 或 `false`。

如果你试着使用 `isShortEnough(isLongEnough(str))`，它是不会正常工作的。`isLongEnough(..)` 将会返回 `true` / `false`，而不是 `isShortEnough(..)` 所期待的字符串值。烦人。

在组合相邻的递减函数时也存在相似的恼人之处。递减函数的 “外形” 是一个接收两个输入值的函数，并返回一个组合好的值。递减函数的单值输出不适于作为另一个期待两个值的递减函数的输入。

另外，`reduce(..)` 帮助函数接收一个可选的输入 `initialValue`。有时它可以被忽略，但有时不得不被传入。这使组合变得更复杂，因为一个递减操作可能需要一个 `initialValue` 而另一个递减操作可能需要一个不同的 `initialValue`。我们如何才能使用某种组合好的递减函数来发起一个 `reduce(..)` 调用呢？

考虑一个这样链条：

```js
words
.map( strUppercase )
.filter( isLongEnough )
.filter( isShortEnough )
.reduce( strConcat, "" );
// "WRITTENSOMETHING"
```

你能想想一个包含所有 `map(strUppercase)`、`filter(isLongEnough)`、`filter(isShortEnough)`、`reduce(strConcat)` 这些步骤的组合吗？每一个操作函数的外形都是不同的，所以它们不能直接组合在一起。我们需要调整一下它们的外形来使它们彼此吻合。

希望这些观察展示了为什么单纯的熔合式组合不能完成这个任务。我们需要更强大的技术，而 transducing 就是工具。

## 接下来，如何做

让我们来谈谈如何才能衍生出一种映射函数、判定函数和/或递减函数的组合。

不要被冲昏了头脑：你不必在你自己的程序中把我们将要探索的所有这些思维步骤都走一遍。一旦你理解并能够认出 trasnducing 解决的问题，你就可以直接跳到使用一个 FP 库的 `transduce(..)` 工具，并继续处理你程序的其余部分！

让我们开始吧。

### 将映射/过滤表达为递减

我们要施展的第一个技巧是将 `filter(..)` 和 `map(..)` 调用表达为 `reduce(..)` 调用。回忆一下我们在第八章中是如何做的：

```js
function strUppercase(str) { return str.toUpperCase(); }
function strConcat(str1,str2) { return str1 + str2; }

function strUppercaseReducer(list,str) {
	list.push( strUppercase( str ) );
	return list;
}

function isLongEnoughReducer(list,str) {
	if (isLongEnough( str )) list.push( str );
	return list;
}

function isShortEnoughReducer(list,str) {
	if (isShortEnough( str )) list.push( str );
	return list;
}

words
.reduce( strUppercaseReducer, [] )
.reduce( isLongEnoughReducer, [] )
.reduce( isShortEnough, [] )
.reduce( strConcat, "" );
// "WRITTENSOMETHING"
```

这是个相当好的改进。我们现在有了四个相邻的 `reduce(..)` 调用而不是拥有不同外形的三种不同方法的混合。但是，我们依然不能简单地 `compose(..)` 这四个递减函数，因为它们接收两个参数而不是一个。

在第八章中，我们作弊并使用了 `list.push(..)` 作为一种副作用进行改变，而不是调用 `list.concat(..)` 来返回一个全新的数组。现在让我们更正式一些：

```js
function strUppercaseReducer(list,str) {
	return list.concat( [strUppercase( str )] );
}

function isLongEnoughReducer(list,str) {
	if (isLongEnough( str )) return list.concat( [str] );
	return list;
}

function isShortEnoughReducer(list,str) {
	if (isShortEnough( str )) return list.concat( [str] );
	return list;
}
```

稍后，我们将看看 `concat(..)` 在这里是否必要。

### 将递减函数参数化

两个过滤递减函数除了使用一个不同的判定函数以外几乎是相同的。让我们将此参数化，这样我们就得到一个可以定义任意过滤递-减函数的工具：

```js
function filterReducer(predicateFn) {
	return function reducer(list,val){
		if (predicateFn( val )) return list.concat( [val] );
		return list;
	};
}

var isLongEnoughReducer = filterReducer( isLongEnough );
var isShortEnoughReducer = filterReducer( isShortEnough );
```

为了得到一个能够生成任意映射-递减函数的工具，让我们对 `mapperFn(..)` 进行相同的参数化：

```js
function mapReducer(mapperFn) {
	return function reducer(list,val){
		return list.concat( [mapperFn( val )] );
	};
}

var strToUppercaseReducer = mapReducer( strUppercase );
```

我们链条看起来没变：

```js
words
.reduce( strUppercaseReducer, [] )
.reduce( isLongEnoughReducer, [] )
.reduce( isShortEnough, [] )
.reduce( strConcat, "" );
```

### 抽取共通的组合逻辑

极其仔细地观察上面的 `mapReducer(..)` 和 `filterReducer(..)` 函数。你发现它们共享的共通功能了吗？

这一部分：

```js
return list.concat( .. );

// 或者
return list;
```

让我们为这个共同逻辑定义一个帮助函数。但我们如何称呼它？

```js
function WHATSITCALLED(list,val) {
	return list.concat( [val] );
}
```

检视一下 `WHATSITCALLED(..)` 函数在做什么，它接收两个值（一个数组和另一个值）并通过将值连接到数组末尾来将它们 “组合”，再返回一个新数组。非常没有创意，但我们可以将它命名为 `listCombination(..)`：

```js
function listCombination(list,val) {
	return list.concat( [val] );
}
```

现在让我们重新定义递减函数的帮助函数，来使用 `listCombination(..)`：

```js
function mapReducer(mapperFn) {
	return function reducer(list,val){
		return listCombination( list, mapperFn( val ) );
	};
}

function filterReducer(predicateFn) {
	return function reducer(list,val){
		if (predicateFn( val )) return listCombination( list, val );
		return list;
	};
}
```

我们的链条依然没变（所以我们不在啰嗦这一点）。

### 将组合参数化

我们简单的 `listCombination(..)` 工具只是我们结合两个值的一种可能的方式。让我们将使用它的过程参数化，来时我们的递减函数更加一般化：

```js
function mapReducer(mapperFn,combinationFn) {
	return function reducer(list,val){
		return combinationFn( list, mapperFn( val ) );
	};
}

function filterReducer(predicateFn,combinationFn) {
	return function reducer(list,val){
		if (predicateFn( val )) return combinationFn( list, val );
		return list;
	};
}
```

要使用这种形式的帮助函数：

```js
var strToUppercaseReducer = mapReducer( strUppercase, listCombination );
var isLongEnoughReducer = filterReducer( isLongEnough, listCombination );
var isShortEnoughReducer = filterReducer( isShortEnough, listCombination );
```

将这些工具定义为接收两个参数而非一个对于组合来说不太方便，所以让我们使用我们的 `curry(..)` 方法：

```js
var curriedMapReducer = curry( function mapReducer(mapperFn,combinationFn){
	return function reducer(list,val){
		return combinationFn( list, mapperFn( val ) );
	};
} );

var curriedFilterReducer = curry( function filterReducer(predicateFn,combinationFn){
	return function reducer(list,val){
		if (predicateFn( val )) return combinationFn( list, val );
		return list;
	};
} );

var strToUppercaseReducer =
	curriedMapReducer( strUppercase )( listCombination );
var isLongEnoughReducer =
	curriedFilterReducer( isLongEnough )( listCombination );
var isShortEnoughReducer =
	curriedFilterReducer( isShortEnough )( listCombination );
```

这看起来烦冗了一些，而且看起来可能不是非常有用。

但是为了进行到我们衍生物的下一步来说这实际上是必要的。记住，我们这里的终极目标是能够 `compose(..)` 这些递减函数，我们就快成功了。

### 组合柯里化后的函数

这一步是所有思考中最刁钻的一步。所以这里要慢慢读并集中注意力。

让我们考虑一下上面柯里化后的函数，但不带 `listCombination(..)` 函数被传入的部分：

```js
var x = curriedMapReducer( strUppercase );
var y = curriedFilterReducer( isLongEnough );
var z = curriedFilterReducer( isShortEnough );
```

考虑所有这三个中间函数的外形，`x(..)`、`y(..)`、和 `z(..)`。每一个都期待一个单独的组合函数，并为它生成一个递减函数。

记住，如果我们想要得到所有这些函数的独立的递减函数，我们可以这样做：

```js
var upperReducer = x( listCombination );
var longEnoughReducer = y( listCombination );
var shortEnoughReducer = z( listCombination );
```

但如果调用了 `y(z)` 你会得到什么？基本上是说，当将 `z` 作为 `y(..)` 的 `combinationFn(..)`传入时发生了什么？这会返回一个内部看起来像这样的递减函数：

```js
function reducer(list,val) {
	if (isLongEnough( val )) return z( list, val );
	return list;
}
```

看到内部的 `z(..)` 调用了吗？这在你看来应当是错的，因为 `z(..)` 函数本应只接收一个参数（一个 `combinationFn(..)`），不是两个（`list` 和 `val`）。外形不匹配。这不能工作。

相反让我们看看组合 `y(z(listCombination))`。我们将它分解为两个分离的步骤：

```js
var shortEnoughReducer = z( listCombination );
var longAndShortEnoughReducer = y( shortEnoughReducer );
```

我们创建了 `shortEnoughReducer(..)`，然后我们将它作为 `combinationFn(..)` 传递给 `y(..)`，生成了 `longAndShortEnoughReducer(..)`。将这一句重读即便，直到你领悟为止。

现在考虑一下：`shortEnoughReducer(..)` 和 `longAndShortEnoughReducer(..)`内部看起来什么样？你能在思维中看到它们吗？

```js
// shortEnoughReducer，来自 z(..):
function reducer(list,val) {
	if (isShortEnough( val )) return listCombination( list, val );
	return list;
}

// longAndShortEnoughReducer，来自 y(..):
function reducer(list,val) {
	if (isLongEnough( val )) return shortEnoughReducer( list, val );
	return list;
}
```

你看到 `shortEnoughReducer(..)` 是如何在 `longAndShortEnoughReducer(..)` 内部取代了 `listCombination(..)` 吗？为什么这个好用？

因为 **一个 `reducer(..)` 的外形和 `listCombination(..)` 的外形是相同的。** 换言之，一个递减函数可以被用作另一个递减函数的组合函数；这就是它们如何组合的！`listCombination(..)` 函数制造了第一个递减函数，然后这个递减函数可以作为组合函数来制造下一个递减函数，以此类推。

让我们使用几个不同的值来测试一下我们的 `longAndShortEnoughReducer(..)`：

```js
longAndShortEnoughReducer( [], "nope" );
// []

longAndShortEnoughReducer( [], "hello" );
// ["hello"]

longAndShortEnoughReducer( [], "hello world" );
// []
```

The `longAndShortEnoughReducer(..)` utility is filtering out both values that are not long enough and values that are not short enough, and it's doing both these filterings in the same step. It's a composed reducer!

`longAndShortEnoughReducer(..)` 工具滤除了既不够长也不够短的值，而且它是在同一个步骤中做了这两个过滤的。它是一个组合的递减函数！

Take another moment to let that sink in. It still kinda blows my mind.

再花点儿时间让它消化吸收。它还是有些让我混乱。

Now, to bring `x(..)` (the uppercase reducer producer) into the composition:

现在，把 `x(..)` （大写递减函数生成器）带入组合之中：

```js
var longAndShortEnoughReducer = y( z( listCombination) );
var upperLongAndShortEnoughReducer = x( longAndShortEnoughReducer );
```

As the name `upperLongAndShortEnoughReducer(..)` implies, it does all three steps at once -- a mapping and two filters! What it kinda look likes internally:

正如 `upperLongAndShortEnoughReducer(..)` 这个名字所暗示的，它一次完成所有三个步骤 —— 一个映射和两个过滤！它内部看起来就像这样：

```js
// upperLongAndShortEnoughReducer:
function reducer(list,val) {
	return longAndShortEnoughReducer( list, strUppercase( val ) );
}
```

A string `val` is passed in, uppercased by `strUppercase(..)` and then passed along to `longAndShortEnoughReducer(..)`. *That* function only conditionally adds this uppercased string to the `list` if it's both long enough and short enough. Otherwise, `list` will remain unchanged.

一个字符串 `val` 被传入，由 `strUppercase(..)` 改为大写，然后被传递给 `longAndShortEnoughReducer(..)`。这个函数仅条件性地 —— 如果这个字符串长短合适 —— 将这个大写字符串添加到 `list`，否则 `list` 保持不变。

It took my brain weeks to fully understand the implications of that juggling. So don't worry if you need to stop here and re-read a few (dozen!) times to get it. Take your time.

我的大脑花了好几周才完全理解了这套杂耍的含义。所以如果你需要在这里停下并重读几遍（几十遍！）来搞明白它也不要担心。慢慢来。

Now let's verify:

现在我们验证一下：

```js
upperLongAndShortEnoughReducer( [], "nope" );
// []

upperLongAndShortEnoughReducer( [], "hello" );
// ["HELLO"]

upperLongAndShortEnoughReducer( [], "hello world" );
// []
```

This reducer is the composition of the map and both filters! That's amazing!

这个递减函数是一个映射函数和两个过滤函数的组合！这真令人吃惊！

Let's recap where we're at so far:

概括一下我们目前身在何处：

```js
var x = curriedMapReducer( strUppercase );
var y = curriedFilterReducer( isLongEnough );
var z = curriedFilterReducer( isShortEnough );

var upperLongAndShortEnoughReducer = x( y( z( listCombination ) ) );

words.reduce( upperLongAndShortEnoughReducer, [] );
// ["WRITTEN","SOMETHING"]
```

That's pretty cool. But let's make it even better.

这很酷。但是我们可以做得更好。

`x(y(z( .. )))` is a composition. Let's skip the intermediate `x` / `y` / `z` variable names, and just express that composition directly:

`x(y(z( .. )))` 是一个组合。让我们跳过中间的变量名 `x` / `y` / `z`，直接表达这个组合：

```js
var composition = compose(
	curriedMapReducer( strUppercase ),
	curriedFilterReducer( isLongEnough ),
	curriedFilterReducer( isShortEnough )
);

var upperLongAndShortEnoughReducer = composition( listCombination );

words.reduce( upperLongAndShortEnoughReducer, [] );
// ["WRITTEN","SOMETHING"]
```

Think about the flow of "data" in that composed function:

考虑一下这个组合函数的 “数据” 流：

1. `listCombination(..)` flows in as the combination function to make the filter-reducer for `isShortEnough(..)`.
1. 
2. *That* resulting reducer function then flows in as the combination function to make the filter-reducer for `isLongEnough(..)`.
3. Finally, *that* resulting reducer function flows in as the combination function to make the map-reducer for `strUppercase(..)`.

In the previous snippet, `composition(..)` is a composed function expecting a combination function to make a reducer; `composition(..)` has a special label: transducer. Providing the combination function to a transducer produces the composed reducer:

// TODO: fact-check if the transducer *produces* the reducer or *is* the reducer

```js
var transducer = compose(
	curriedMapReducer( strUppercase ),
	curriedFilterReducer( isLongEnough ),
	curriedFilterReducer( isShortEnough )
);

words
.reduce( transducer( listCombination ), [] );
// ["WRITTEN","SOMETHING"]
```

**Note:** We should make an observation about the `compose(..)` order in the previous two snippets, which may be confusing. Recall that in our original example chain, we `map(strUppercase)` and then `filter(isLongEnough)` and finally `filter(isShortEnough)`; those operations indeed happen in that order. But in Chapter 4, we learned that `compose(..)` typically has the effect of running its functions in reverse order of listing. So why don't we need to reverse the order *here* to get the same desired outcome? The abstraction of the `combinationFn(..)` from each reducer reverses the effective applied order of operations under the hood. So counter-intuitively, when composing a tranducer, you actually want to list them in desired order of execution!

#### List Combination: Pure vs Impure

As a quick aside, let's revisit our `listCombination(..)` combination function implementation:

```js
function listCombination(list,val) {
	return list.concat( [val] );
}
```

While this approach is pure, it has negative consequences for performance. First, it creates the `[..]` temporary array wrapped around `val`. Then, `concat(..)` creates a whole new array to append this temporary array onto. For each step in our composed reduction, that's a lot of arrays being created and thrown away, which is not only bad for CPU but also GC memory churn.

The better-performing, impure version:

```js
function listCombination(list,val) {
	list.push( val );
	return list;
}
```

Thinking about `listCombination(..)` in isolation, there's no question it's impure and that's usually something we'd want to avoid. However, there's a bigger context we should consider.

`listCombination(..)` is not a function we interact with at all. We don't directly use it anywhere in the program, instead we let the transducing process use it.

Back in Chapter 5, we asserted that our goal with reducing side effects and defining pure functions was only that we expose pure functions to the API level of functions we'll use throughout our program. We observed that under the covers, inside a pure function, it can cheat for performance sake all it wants, as long as it doesn't violate the external contract of purity.

`listCombination(..)` is more an internal implementation detail of the transducing -- in fact, it'll often be provided by the transducing library for you! -- rather than a top-level method you'd interact with on a normal basis throughout your program.

Bottom line: I think it's perfectly acceptable, and advisable even, to use the performance-optimal impure version of `listCombination(..)`. Just make sure you document that it's impure with a code comment!

### Alternate Combination

So far, this is what we've derived with transducing:

```js
words
.reduce( transducer( listCombination ), [] )
.reduce( strConcat, "" );
// WRITTENSOMETHING
```

That's pretty good, but we have one final trick up our sleeve with transducing. And frankly, I think this part is what makes all this mental effort you've expended thus far, actually worth it.

Can we somehow "compose" these two `reduce(..)` calls to get it down to just one `reduce(..)`? Unfortunately, we can't just add `strConcat(..)` into the `compose(..)` call; its shape is not correct for that kind of composition.

But let's look at these two functions side-by-side:

```js
function strConcat(str1,str2) { return str1 + str2; }

function listCombination(list,val) { list.push( val ); return list; }
```

If you squint your eyes, you can almost see how these two functions are interchangable. They operate with different data types, but conceptually they do the same thing: combine two values into one.

In other words, `strConcat(..)` is a combination function!

That means that we can use *it* instead of `listCombination(..)` if our end goal is to get a string concatenation rather than a list:

```js
words.reduce( transducer( strConcat ), "" );
// WRITTENSOMETHING
```

Boom! That's transducing for you. I won't actually drop the mic here, but just gently set it down...

## What, Finally

Take a deep breath. That was a lot to digest.

Clearing our brains for a minute, let's turn our attention back to just using transducing in our applications without jumping through all those mental hoops to derive how it works.

Recall the helpers we defined earlier; let's rename them for clarity:

```js
var transduceMap = curry( function mapReducer(mapperFn,combinationFn){
	return function reducer(list,v){
		return combinationFn( list, mapperFn( v ) );
	};
} );

var transduceFilter = curry( function filterReducer(predicateFn,combinationFn){
	return function reducer(list,v){
		if (predicateFn( v )) return combinationFn( list, v );
		return list;
	};
} );
```

Also recall that we use them like this:

```js
var transducer = compose(
	transduceMap( strUppercase ),
	transduceFilter( isLongEnough ),
	transduceFilter( isShortEnough )
);
```

`transducer(..)` still needs a combination function (like `listCombination(..)` or `strConcat(..)`) passed to it to produce a transduce-reducer function, which then can then be used (along with an initial value) in `reduce(..)`.

But to express all these transducing steps more declaratively, let's make a `transduce(..)` utility that does these steps for us:

```js
function transduce(transducer,combinationFn,initialValue,list) {
	var reducer = transducer( combinationFn );
	return list.reduce( reducer, initialValue );
}
```

Here's our running example, cleaned up:

```js
var transducer = compose(
	transduceMap( strUppercase ),
	transduceFilter( isLongEnough ),
	transduceFilter( isShortEnough )
);

transduce( transducer, listCombination, [], words );
// ["WRITTEN","SOMETHING"]

transduce( transducer, strConcat, "", words );
// WRITTENSOMETHING
```

Not bad, huh!? See the `listCombination(..)` and `strConcat(..)` functions used interchangably as combination functions?

### Transducers.js

Finally, let's illustrate our running example using the `transducers-js` library (https://github.com/cognitect-labs/transducers-js):

```js
var transformer = transducers.comp(
	transducers.map( strUppercase ),
	transducers.filter( isLongEnough ),
	transducers.filter( isShortEnough )
);

transducers.transduce( transformer, listCombination, [], words );
// ["WRITTEN","SOMETHING"]

transducers.transduce( transformer, strConcat, "", words );
// WRITTENSOMETHING
```

Looks almost identical to above.

**Note:** The above snippet uses `transformers.comp(..)` since the library provides it, but in this case our `compose(..)` from Chapter 4 would produce the same outcome. In other words, composition itself isn't a transducing-sensitive operation.

The composed function in this snippet is named `transformer` instead of `transducer`. That's because if we call `transformer(listCombination)` (or `transformer(strConcat)`), we won't get a straight up transduce-reducer function as earlier.

`transducers.map(..)` and `transducers.filter(..)` are special helpers that adapt regular predicate or mapper functions into functions that produce a special transform object (with the transducer function wrapped underneath); the library uses these transform objects for transducing. The extra capabilities of this transform object abstraction are beyond what we'll explore, so consult the library's documentation for more information.

Since calling `transformer(..)` produces a transform object and not a typical two-arity transduce-reducer function, the library also provides `toFn(..)` to adapt the transform object to be useable by native array `reduce(..)`:

```js
words.reduce(
	transducers.toFn( transformer, strConcat ),
	""
);
// WRITTENSOMETHING
```

`into(..)` is another provided helper that automatically selects a default combination function based on the type of empty/initial value specified:

```js
transducers.into( [], transformer, words );
// ["WRITTEN","SOMETHING"]

transducers.into( "", transformer, words );
// WRITTENSOMETHING
```

When specifying an empty `[]` array, the `transduce(..)` called under the covers uses a default implementation of a function like our `listCombination(..)` helper. But when specifying an empty `""` string, something like our `strConcat(..)` is used. Cool!

As you can see, the `transducers-js` library makes transducing pretty straightforward. We can very effectively leverage the power of this technique without getting into the weeds of defining all those intermediate transducer-producing utilities ourselves.

## Summary

To transduce means to transform with a reduce. More specifically, a transducer is a composable reducer.

We use transducing to compose adjacent `map(..)`, `filter(..)`, and `reduce(..)` operations together. We accomplish this by first expressing `map(..)`s and `filter(..)`s as `reduce(..)`s, and then abstracting out the common combination operation to create unary reducer-producing functions that are easily composed.

Transducing primarily improves performance, which is especially obvious if used on a lazy sequence (async observable).

But more broadly, transducing is how we express a more declarative composition of functions that would otherwise not be directly composable. The result, if used appropriately as with all other techniques in this book, is clearer, more readable code! A single `reduce(..)` call with a transducer is easier to reason about than tracking multiple `reduce(..)` calls.
