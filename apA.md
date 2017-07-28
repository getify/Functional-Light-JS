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

我们的链条依然没变（所以我们不再啰嗦这一点）。

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

`longAndShortEnoughReducer(..)` 工具滤除了既不够长也不够短的值，而且它是在同一个步骤中做了这两个过滤的。它是一个组合的递减函数！

再花点儿时间让它消化吸收。它还是有些让我混乱。

现在，把 `x(..)` （大写递减函数生成器）代入组合之中：

```js
var longAndShortEnoughReducer = y( z( listCombination) );
var upperLongAndShortEnoughReducer = x( longAndShortEnoughReducer );
```

正如 `upperLongAndShortEnoughReducer(..)` 这个名字所暗示的，它一次完成所有三个步骤 —— 一个映射和两个过滤！它内部看起来就像这样：

```js
// upperLongAndShortEnoughReducer:
function reducer(list,val) {
	return longAndShortEnoughReducer( list, strUppercase( val ) );
}
```

一个字符串 `val` 被传入，由 `strUppercase(..)` 改为大写，然后被传递给 `longAndShortEnoughReducer(..)`。这个函数仅条件性地 —— 如果这个字符串长短合适 —— 将这个大写字符串添加到 `list`，否则 `list` 保持不变。

我的大脑花了好几周才完全理解了这套杂耍的含义。所以如果你需要在这里停下并重读几遍（几十遍！）来搞明白它也不要担心。慢慢来。

现在我们验证一下：

```js
upperLongAndShortEnoughReducer( [], "nope" );
// []

upperLongAndShortEnoughReducer( [], "hello" );
// ["HELLO"]

upperLongAndShortEnoughReducer( [], "hello world" );
// []
```

这个递减函数是一个映射函数和两个过滤函数的组合！这真令人吃惊！

概括一下我们目前身在何处：

```js
var x = curriedMapReducer( strUppercase );
var y = curriedFilterReducer( isLongEnough );
var z = curriedFilterReducer( isShortEnough );

var upperLongAndShortEnoughReducer = x( y( z( listCombination ) ) );

words.reduce( upperLongAndShortEnoughReducer, [] );
// ["WRITTEN","SOMETHING"]
```

这很酷。但是我们可以做得更好。

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

考虑一下这个组合函数的 “数据” 流：

1. `listCombination(..)` 作为组合函数流入 `isShortEnough(..)`，为它制造了过滤-递减函数。
2. 然后这个结果递减函数作为组合函数流入 `isLongEnough(..)`，为它制造了过滤-递减函数。
3. 最后，这个结果递减函数作为组合函数流入 `strUppercase(..)`，为它制造了映射-递减函数。

在前一个代码段中，`composition(..)` 是一个组合好的函数，它期待一个组合函数来制造一个递减函数；`composition(..)` 有一个特殊的标签：transducer。向一个 transducer 提供组合函数就生成了组合好的递减函数：

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

**注意：** 我们应当关注一下前两个代码段中的 `compose(..)` 顺序，它可能有些令人糊涂。回忆一下我们原来例子中的链条，我们 `map(strUppercase)` 然后 `filter(isLongEnough)` 最后 `filter(isShortEnough)`；这些操作确实是按照这样的顺序发生的。但是在第四章中，我们学习了 `compose(..)` 通常会以函数被罗列的相反方向运行它们。所以，为什么我们在 *这里* 不需要反转顺序来得到我们期望的相同结果呢？来自于每个递减函数的 `combinationFn(..)` 的抽象在底层反转了操作实际的实施顺序。所以与直觉相悖地，当你组合一个 transducer 时，你实际上要以你所期望的函数执行的顺序来罗列它们！

#### 列表组合：纯粹 vs 不纯粹

一个快速的旁注，让我们重温一下 `listCombination(..)`组合函数的实现：

```js
function listCombination(list,val) {
	return list.concat( [val] );
}
```

虽然这种方式是纯粹的，但是它对性能产生了负面的影响。首先，它创建 `[..]` 临时数组包装了 `val`。然后，`concat(..)` 创建了一个全新的数组，将这个临时数组链接在它后面。在我们组合好的递减函数的每一步中，有许多数组被创建又被扔掉，这对不仅对 CPU 很不好而且还会引发内存的垃圾回收。

性能好一些的，不纯粹版本：

```js
function listCombination(list,val) {
	list.push( val );
	return list;
}
```

孤立地考虑一下 `listCombination(..)`，无疑它是不纯粹的，而这是我们通常想要避免的。但是，我们考虑的角度应当更高一些。

`listCombination(..)` 根本不是我们要与之交互的函数。我们没有在程序的任何部分直接使用它，而是让 transducer 处理使用它。

回顾第五章，我们声称降低副作用与定义纯函数的目标仅仅是向我们将要在程序中通篇使用的 API 级别的函数暴露纯函数。我们在一个纯函数内部观察了它的底层，只要它不违反外部纯粹性的约定，就可以为了性能而使用任何作弊的方法。

`listCombination(..)` 更像是一个 transducing 的内部实现细节 —— 事实上，它经常由一个 transducing 库提供给你！ —— 而非一个你平常在程序中与之交互的顶层方法。

底线：我认为使用性能优化后的非纯粹版本的 `listCombination(..)` 是完全可以接受的，甚至是明智的。但要确保你用了一段代码注释将它的非纯粹性记录下来！

### 替换组合函数

至此，这就是我们从 transducing 中衍生出的东西：

```js
words
.reduce( transducer( listCombination ), [] )
.reduce( strConcat, "" );
// WRITTENSOMETHING
```

这相当好，但关于 transducing 我们手中还有最后一个技巧。而且老实说，我认为这部分才是使你至此做出的所有思维上的努力得到回报的东西。

我们能否 “组合” 这两个 `reduce(..)` 调用使它们成为一个 `reduce(..)`？不幸的是，我们不能仅仅将 `strConcat(..)` 加入 `compose(..)` 调用；它的外形对于这种组合来说不正确。

但让我肩并肩地看看这两个函数：

```js
function strConcat(str1,str2) { return str1 + str2; }

function listCombination(list,val) { list.push( val ); return list; }
```

如果你眯起眼，你就能看到这两个函数几乎是可以互换的。它们操作不同的数据类型，但是在概念上它们做的是相同的事情：将两个值结合为一个。

换句话说，`strConcat(..)` 是一个组合函数！

这意味着如果我们的最终目标是得到一个字符串链接而非一个列表的话，我们就可以使用它替换 `listCombination(..)`：

```js
words.reduce( transducer( strConcat ), "" );
// WRITTENSOMETHING
```

轰！这就是你的 transducing。我不会真的在这里摔麦克，而是轻轻地将它放下……

## 最后，什么

深呼吸。这真是有太多东西要消化了。

用几分钟清理一下大脑，摆脱所有那些推导它如何工作的思维圈子，让我们将注意力返回到在我们的应用程序中如何使用 transducing。

回忆一下我们早先定义的帮助函数；为了清晰让我们重命名它们：

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

再回忆一下我们是这样使用它们的：

```js
var transducer = compose(
	transduceMap( strUppercase ),
	transduceFilter( isLongEnough ),
	transduceFilter( isShortEnough )
);
```

`transducer(..)` 任然需要被传入一个组合函数（比如 `listCombination(..)` 或 `strConcat(..)`）来声称一个 transduce-递减函数，然后这个函数才能在 `reduce(..)` 中使用（与一个初始值一起）。

但是为了更具声明性地表达所有这些 transducing 步骤，让我们制造一个实施所有这些步骤的 `transduce(..)` 工具：

```js
function transduce(transducer,combinationFn,initialValue,list) {
	var reducer = transducer( combinationFn );
	return list.reduce( reducer, initialValue );
}
```

这是我们清理过后的例子：

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

不赖吧！？看到 `listCombination(..)` 和 `strConcat(..)` 函数作为组合函数被互换地使用了吗？

### Transducers.js

最后，让我们使用 `transducers-js` 库 (https://github.com/cognitect-labs/transducers-js) 来展示我们的例子：

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

这看起来几乎和上面一模一样。

**注意：** 上面的代码段使用 `transformers.comp(..)` 是因为库提供了它，但在这种情况下我们第四章的 `compose(..)` 将生成相同的结果。换言之，组合本身不是一个 transducing 敏感的操作。

在这个代码段中，组合好的函数被命名为 `transformer` 而不是 `transducer`。这是因为如果我们调用 `transformer(listCombination)`（或者 `transformer(strConcat)`），我们不会像之前那样直接得到 transduce-递减函数。

`transducers.map(..)` 和 `transducers.filter(..)` 是特殊的帮助函数，它们将普通的判定或映射函数适配为生成一个特殊（在底层包装了一个 transducer 函数的）变形对象的函数；这个库将这些变形对象用于 transducing。这个变形函数抽象的额外能力超出了我们要探索的范围，更多的信息请参阅库的文档。

因为调用 `transformer(..)` 会生成一个变形对象，而且不是一个典型的二元 transduce-递减函数，所以库还提供了 `toFn(..)` 来将这个变形对象适配为可以被原生数组 `reduce(..)` 使用的函数：

```js
words.reduce(
	transducers.toFn( transformer, strConcat ),
	""
);
// WRITTENSOMETHING
```

`into(..)` 是库提供的另一个帮助函数，它根据被指定的空/初始值类型自动地选择一个默认组合函数：

```js
transducers.into( [], transformer, words );
// ["WRITTEN","SOMETHING"]

transducers.into( "", transformer, words );
// WRITTENSOMETHING
```

当指定一个空数组 `[]` 时，在底层被调用的 `transduce(..)` 使用一个默认的函数实现，它就像我们的 `listCombination(..)` 帮助函数。但当指定一个空字符串 `""` 时，一个如我们 `strConcat(..)` 的函数就会被使用。酷！

如你所见，`transducers-js` 库使得 transducing 变得相当直接了当。我们可以非常高效地利用这种技术的力量，而不必亲自深入所有这些定义中间 transducer 生成工具的过程。

## 总结

Transduce 意味着使用递减来变形。更具体点儿说，一个 transducer 是一个可以进行组合的递减函数。

我们使用 transducing 将相邻的 `map(..)`、`filter(..)`、以及 `reduce(..)` 组合在一起。我们是这样做到的：首先将 `map(..)` 和 `filter(..)` 表达为 `reduce(..)`，然后将共通的组合操作抽象出来，创建一个很容易组合的一元递减函数生成函数。

Transducing 主要改善了新能，这在用于一个懒惰序列（异步 observable）时尤其明显。

但更广泛地说，transducing 是我们如何将不能直接组合的函数表达为声明性更强的函数组合的方式。如果与本书中的其他技术一起恰当地使用，它就能产生更干净，可读性更强的代码！推理一个使用 transducer 的单独 `reduce(..)` 调用，要比跟踪多个 `reduce(..)` 调用容易许多。
