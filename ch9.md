# Functional-Light JavaScript
# Chapter 9: Recursion

在下一页，我们将进入递归的话题。

<hr>

*(rest of the page intentionally left blank)*

<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>

<div style="page-break-after: always;"></div>

让我们来谈谈递归。在深入之前，参见前一页来了解其正式的定义。

很弱的玩笑，我知道。:)

递归是那些大多数开发者都承认其非常强大，但同时也不喜欢使用的技术之一。在这种意义上，我将之与正则表达式归为同一范畴。强大，但令人糊涂，因此看起来 *不值得花那么多力气*。

我是一个递归的狂热爱好者，而且你也可以是！我在本章的目标就是说服你，递归是一种你应当带入到你 FP 编码方式中的重要工具。当使用得当的时候，递归对于复杂的问题是一种强大的声明式编码。

## Definition

递归是一个函数调用它自己，而且这个调用也做同样的事情，这种循环一直持续到基准条件达成，然后所有的调用都被展开。

**注意：** 如果你不能确保基准条件会 *最终* 达成，那么递归就会永远运行下去，并使你的程序崩溃或锁住你的程序；搞对基准条件十分重要！

但是…… 这个定义的书面形式太过模糊。我们可以做得更好。考虑这个递归函数：

```js
function foo(x) {
	if (x < 5) return x;
	return foo( x / 2 );
}
```

让我们将调用 `foo(16)` 时这个函数发生的事情图形化一下：

<p align="center">
	<img src="fig13.png" width="850">
</p>

在第二步中，`x / 2` 产生 `8`，它作为实际参数传入递归的 `foo(..)` 调用。在第三步中，同样的事情，`x / 2` 产生 `4`，而它又作为实际参数被传入另一个 `foo(..)` 调动。但愿这部分看起来相当直截了当。

但一些人可能会被第四步发生的事情绊倒。一旦我们满足了 `x`（值 `4`）`< 5`的基准条件，我们就不再进行递归调用了，而仅仅（实际上）`return 4`。特别是这幅图中返回 `4` 的虚线简化了那里发生的事情，所以让我们深入这最后一步并将它图形化为这三个子步骤：

<p align="center">
	<img src="fig14.png" width="850">
</p>

一旦基准条件被满足，这个返回值就逐一回溯调用栈中所有的调用（因此这些调用会 `return`），最终 `return` 出最后的结果。

另一个递归的例子：

```js
function isPrime(num,divisor = 2){
	if (num < 2 || (num > 2 && num % divisor == 0)) {
		return false;
	}
	if (divisor <= Math.sqrt( num )) {
		return isPrime( num, divisor + 1 );
	}

	return true;
}
```

素数检查的基本工作方式是，尝试从整数 `2` 开始一直到被检查的 `num` 的平方根，看它们中之一是否可以除尽（`%` 模运算返回 `0`）这个数字。如果有，它就不是素数。否则，它一定是一个素数。`divisor + 1` 使用递归来迭代每一个可能的 `divisor` 值。

递归的最著名的例子之一就是计算斐波那契数列，这个数列被定义为：

```
fib( 0 ): 0
fib( 1 ): 1
fib( n ):
	fib( n - 2 ) + fib( n - 1 )
```

**注意：** 这个数列的前几个数字是：0、1、1、2、3、5、8、13、21、34、…… 每一个数字都是数列中前两个数字的和。

用代码直接表达斐波那契数列的定义：

```js
function fib(n) {
	if (n <= 1) return n;
	return fib( n - 2 ) + fib( n - 1 );
}
```

`fib(..)` 递归地调用自己两次，这常被称为二元递归。我们稍后将会更多地谈到二元递归。

我们将在本章的各个地方使用 `fib(..)` 来展示关于递归的思想，但是这种特殊形式的一个缺点是存在很多重复工作。`fib(n-1)` 和 `fib(n-2)` 并不互相共享它们的任何工作成果，而是在整个整数递减到 `0` 的过程中，几乎完全互相重叠。

我们在第五章的“性能影响”一节中简要地谈到了墨记。这里，墨记将允许任何给定数字的 `fib(..)` 仅被计算一次，而不是重复计算许多次。我们不会在这个话题上走得太远，但意识到性能上的问题对任何算法都很重要，不管是不是递归。

### Mutual Recursion

当一个函数调用它自己时，被特别地称为直接递归。这是我们在前一节的 `foo(..)`、`isPrime(..)`、和 `fib(..)` 中看到的。两个或更多函数可以在一个递归周期中相互调动，这称为相互递归。

这两个函数就是相互递归的：

```js
function isOdd(v) {
	if (v === 0) return false;
	return isEven( Math.abs( v ) - 1 );
}

function isEven(v) {
	if (v === 0) return true;
	return isOdd( Math.abs( v ) - 1 );
}
```

是的，这是一个计算数字奇偶性的笨办法。但它展示了特定的算法可以根据互相递归进行定义的想法。

回忆一下前一节中的二元递归 `fib(..)`；我们可以使用相互递归来表达它：

```js
function fib_(n) {
	if (n == 1) return 1;
	else return fib( n - 2 );
}

function fib(n) {
	if (n == 0) return 0;
	else return fib( n - 1 ) + fib_( n );
}
```

**注意：** 这种相互递归的 `fib(..)` 实现摘自“使用相互递归的斐波那契数列”中的研究(https://www.researchgate.net/publication/246180510_Fibonacci_Numbers_Using_Mutual_Recursion)。

虽然这里展示的相互递归的例子非常造作，但是确实存在相互递归可能非常有用的更复杂的用例。

### Why Recursion?

现在我们已经定义并展示了递归，我们应当检视一下为什么递归如此有用。

最常为人所引用的理由是递归符合 FP 的精神，因为它用调用栈上的隐含状态取代了（绝大多数）明确的状态追踪。递归通常在这样的情况下最有用：当一个问题需要条件分支与回溯，而在一个纯粹的迭代环境中管理这种状态可能十分复杂；至少，这样的代码高度指令化而且很难阅读与验证。但在调用栈上每一层分支自己的作用域中追踪它们，通常会显著地提高代码可读性。

简单的迭代算法可以很容易地表达为递归：

```js
function sum(total,...nums) {
	for (let i = 0; i < nums.length; i++) {
		total = total + nums[i];
	}

	return total;
}

// vs

function sum(num1,...nums) {
	if (nums.length == 0) return num1;
	return num1 + sum( ...nums );
}
```

它不仅是调用栈取代并消灭了 `for` 循环，而且递增的部分结果一直在调用栈的 `return` 中隐含地追踪，而不是在每次迭代中给 `total` 重新赋值。FP 程序员经常喜欢在可能的地方避免对本地变量进行重新赋值。

在像这种求和的基本算法中，其区别是微小和微妙的。但是你的算法越精巧，你就越有可能看到递归取代指令式状态追踪的回报。

## Declarative Recursion

数学家们使用 **Σ** 符号作为占位符来表示一个数字列表的求和。他们这么做的主要原因是因为，如果他们在研究更复杂的公式时不得不手动写出像 `1 + 3 + 5 + 7 + 9 + ..` 这样的求和的话，就太麻烦了（也不易读懂！）。使用符号就是声明式的数学！

递归对算法的声明性，与 **Σ** 对数学的声明性的含义是相同的。递归表达的是一个问题的解决方案存在，但不必要求代码的读者理解这种解决方案是如何工作的。让我们考虑两种找出参数中最大偶数的方式：

```js
function maxEven(...nums) {
	var num = -Infinity;

	for (let i = 0; i < nums.length; i++) {
		if (nums[i] % 2 == 0 && nums[i] > num) {
			num = nums[i];
		}
	}

	if (num !== -Infinity) {
		return num;
	}
}
```

这个实现不是特别的难对付，但看懂它的微妙之处也不是很容易。`maxEven()`、`maxEven(1)`、和 `maxEven(1,13)` 都返回 `undefined` 这件事有多明显？最后一个 `if` 语句为什么必要这件事很快就能搞明白吗？

为了比较，让我们来考虑一种递归的方式。我们可以将递归这样符号化：

```
maxEven( nums ):
	maxEven( nums.0, maxEven( ...nums.1 ) )
```

换言之，我们可以将一个数列中的最大偶数定义为，第一个数字与其余数字中的最大偶数相比之下的最大偶数。例如：

```
maxEven( 1, 10, 3, 2 ):
	maxEven( 1, maxEven( 10, maxEven( 3, maxEven( 2 ) ) )
```

要在 JS 中实现这种递归定义，一个方式是：

```js
function maxEven(num1,...restNums) {
	var maxRest = restNums.length > 0 ?
			maxEven( ...restNums ) :
			undefined;

	return (num1 % 2 != 0 || num1 < maxRest) ?
		maxRest :
		num1;
}
```

那么这种方式有什么好处？

首先，它的签名与之前稍有不同。我有意地将第一个参数名称叫做 `num1`，将剩余的参数收集到 `restNums` 中。但为什么？我们本可以将它们全部收集到一个 `nums` 数组中，然后引用 `nums[0]`。

这个函数签名是对递归定义的一种有意提示。它读起来就像这样：

```
maxEven( num1, ...restNums ):
	maxEven( num1, maxEven( ...restNums ) )
```

你看到签名与递归定义之间的对称性了吗？

当我们能够在函数签名中使递归的定义更加明显时，我们就改进了函数的声明性。而且如果我们进而能够将递归的定义投射到函数体中的话，它就会变得更好。

但我要说最明显的改进是指令式 `for` 循环使人分心的地方被压制了。这个循环的所有逻辑都被抽象到递归调用栈中，这样这些东西就不会搞乱代码。之后我们就可以将注意力集中到每次比较两个数字并找出最大偶数的逻辑中 —— 总之是最重要的部分！

心理上，这里发生的事与一个数学家在一个很大的等式中使用 **Σ** 求和相似。我们再说，“这个列表中剩余部分的最大偶数是由 `maxEven(...restNums)` 计算的，所以我们假设这部分成立继续向下进行。”

另外，我们使用了 `restNums.length > 0` 守护条件来强化这个概念，因为如果没有更多数字需要考虑了，那么自然的结果就是 `maxRest` 必定是 `undefined`。我们不必再花费任何额外的精力来推理这一部分。基准条件（没有更多数字要考虑了）是显而易见的。

接下来，我们将注意力转移至对照 `maxRest` 来检查 `num1` —— 这个算法的主逻辑是如何判定两个数字中的哪一个是最大偶数。如果 `num1` 不是偶数（`num1 % 2 != 0`），或者它小于 `maxRest`，那么 `maxRest` *必须* 被 `return`，即使它是 `undefined`。否则，`num1` 就是答案。

我在制造的情景是，与指令式的方式相比，它使阅读一个实现时推理它变得更加直截了当，使我们分心的微小差别和噪音更少；它要比使用 `-Infinity` 的 `for` 循环方式更具声明性。

**提示：** 我们应当指出除了手动迭代或递归之外的另一种（很可能是更好的）建模方式是第七章中讨论的列表操作。数列可以首先被 `filter(..)` 为仅含有偶数，然后寻找最大值是一个 `reduce(..)`，它简单比较两个数字并返回较大的一个。我们使用这个例子只是为了展示与手动迭代相比，递归更具声明性的性质。

这是另一个递归的例子：计算二叉树的深度。一个二叉树的深度是树中向下（要么在左侧要么在右侧）最长的节点路径。另一种定义它的方法是递归的：一个树在任意节点的深度，是 1（当前节点）加上它左侧或右侧子树中深度较大的那一棵树的深度。

```
depth( node ):
	1 + max( depth( node.left ), depth( node.right ) )
```

将它直接翻译为一个二元递归函数：

```js
function depth(node) {
	if (node) {
		let depthLeft = depth( node.left );
		let depthRight = depth( node.right );
		return 1 + max( depthLeft, depthRight );
	}

	return 0;
}
```

我不会给出这个算法的指令式形式，但相信我，它要混乱得多而且更具指令性。这种递归的方式具有良好且优雅的声明性。它紧贴着算法的递归定义而且很少有令人分心的事情。

不是所有的问题都是纯粹递归的。它不是你应当广泛应用的某种杀手锏。但递归可以很有效地将一个问题的表达从更多的指令性演化为更多的声明性。

## Stack

让我们重新审视早先的 `isOdd(..)` / `isEven(..)` 递归：

```js
function isOdd(v) {
	if (v === 0) return false;
	return isEven( Math.abs( v ) - 1 );
}

function isEven(v) {
	if (v === 0) return true;
	return isOdd( Math.abs( v ) - 1 );
}
```

在大多数浏览器中，如果你试着运行这个你就会得到一个错误：

```js
isOdd( 33333 );			// RangeError: Maximum call stack size exceeded
```

发生了什么错误？引擎抛出这个错误是因为它想防止你的程序耗尽系统内存。为了解释这一切，我们需要看看当函数调用发生时，JS 引擎背后发生了什么。

每一个函数调用都会留出一小块称为栈帧的内存。栈帧中持有一些特定的重要信息：在一个函数中当前正在处理的语句的状态，包括所有变量中的值。这些信息需要被存储在内存（栈帧）中的原因是函数可能会调用另一个函数，这会暂停当前函数的运行。当另一个函数结束时，引擎需要从当前函数正好被暂停时的状态继续它的运行。

当第二个函数调用开始时，它也需要一个栈帧，从而将栈帧的数量增加到 2。如果这个函数再调用另一个函数，我们就需要第三个栈帧。以此类推。“栈” 这个词说的是这样的概念：每次一个函数被前一个函数调用时，下一个帧会被 *压入* 栈的顶部。当一个函数调用完成时，它的帧会从栈中弹出。

考虑这段程序：

```js
function foo() {
	var z = "foo!";
}

function bar() {
	var y = "bar!";
	foo();
}

function baz() {
	var x = "baz!";
	bar();
}

baz();
```

一步一步地将这段程序的栈可视化：

<p align="center">
	<img src="fig15.png" width="600">
</p>

**注意：** 如果这些函数没有相互调用，而只是顺序地被调用的话 —— 比如 `baz(); bar(); foo();`，这样每一个函数都会在下一个开始之前完成 —— 这样栈帧就不会堆积起来；每个函数调用都会在下一个栈帧加入栈中之前将自己的栈帧移除掉。

好了，那么每个函数调用都需要一点儿内存。在大多数普通程序的情况下没什么大不了的，对吧？一旦当你引入递归后它很快就会成为一个大问题。虽然你几乎绝对不会手动地在一个调用栈中将上千（甚至不会有上百个！）个不同的函数调用堆积在一起，但是你会很容易地看到有成千上万的递归调用堆积起来。

成对的 `isOdd(..)` / `isEven(..)` 抛出一个 `RangeError` 是因为引擎遇到了一个被随意设置的限制，从而认为调用栈增长的太大而需要被停止。这不是一个基于实际内存水平接近于零的限制，而是由引擎进行的预测：如果放任这种程序运行下去，内存就会耗尽了。知道或证明一个程序最终会停止是不可能的，所以引擎不得不进行一次有依据的猜测。

这种限制是依赖于实现的。语言规范中对此没有任何说明，所以它不是 *必须* 的。但在实际中所有的 JS 引擎都确实有一个限制，因为不作限制将会制造出不稳定的设备，它们很容易受到烂代码或恶意代码的攻击。在每一个不同设备环境中的每一个引擎都会强制一个它自己的限制，所以没有办法可以预测或保证我们可以在函数调用栈上走多远。

这种限制对我们开发者的意义是，在解决关于大型数据集合的问题时递归的用途有一种应用的局限性。事实上，我认为这种局限性才是使递归在开发者工具箱中沦为二等公民的最大原因。令人遗憾的是，递归是一种事后思考而不是一种主要技术。

### Tail Calls

Recursion far predates JS, and so do these memory limitations. Back in the 1960s, developers were wanting to use recursion and running up against hard limits of device memory of their powerful computers that were far lower than we have on our watches today.

递归的出现远早于 JS，这些内存的限制也是。早在 1960 年代，开发者们就因想使用递归而遭遇了设备内存限制的困难，而他们强大的计算机的内存比我们今天的手表还要小得多。

Fortunately, a powerful observation was made in those early days that still offers hope. The technique is called *tail calls*.

幸运的是，在那些早年间的日子里产生的一种强大的远见依然能给出了希望。这种技术称为 *尾部调用*。

The idea is that if a call from function `baz()` to function `bar()` happens at the very end of function `baz()`'s execution -- referred to as a tail call -- the stack frame for `baz()` isn't needed anymore. That means that either the memory can be reclaimed, or even better, simply reused to handle function `bar()`'s execution. Visualizing:

它的想法是，如果从函数 `baz()` 到函数 `bar()` 的调用发生在函数 `baz()` 执行的最末尾 —— 这称为一个尾部调用 —— 那么 `baz()` 的栈帧就不再需要了。这意味着内存要么被回收，要么或者更好地，简单地被重用于函数 `bar()` 的执行。图形化一下的话：

<p align="center">
	<img src="fig16.png" width="600">
</p>

Tail calls are not really directly related to recursion, per se; this notion holds for any function call. But your manual non-recursion call stacks are unlikely to go beyond maybe 10 levels deep in most cases, so the chances of tail calls impacting your program's memory footprint are pretty low.

尾部调用本质上和递归没有直接的联系；这个概念对任何函数调用都成立。但是你的手动非递归调用在大多数情况下不太可能超出 10 层的深度，所以尾部调用对你程序的内存使用空间造成明显影响的可能性非常低。

Tail calls really shine in the recursion case, because it means that a recursive stack could run "forever", and the only performance concern would be computation, not fixed memory limitations. Tail call recursion can run in `O(1)` fixed memory usage.

尾部调用真正闪光的地方是在递归的情况下，因为它意味着一个递归栈可以 “永远” 运行，而唯一需要关心的性能问题时计算，而不是固定的内存限制。尾部调用递归可以运行在固定为 `O(1)` 的内存用量中。

These sorts of techniques are often referred to as Tail Call Optimizations (TCO), but it's important to distinguish the ability to detect a tail call to run in fixed memory space, from the techniques that optimize this approach. Technically, tail calls themselves are not a performance optimization as most people would think, as they might actually run slower than normal calls. TCO is about optimizing tail calls to run more efficiently.

这种类型的技术经常被称为尾部调用优化（TCO），但重要的是要区别

### Proper Tail Calls (PTC)

JavaScript has never required (nor forbidden) tail calls, until ES6. ES6 mandates recognition of tail calls, of a specific form referred to as Proper Tail Calls (PTC), and the guarantee that code in PTC form will run without unbounded stack memory growth. Practically speaking, this means we should not get `RangeError`s thrown if we adhere to PTC.

First, PTC in JavaScript requires strict mode. You should already be using strict mode, but if you aren't, this is yet another reason you should already be using strict mode. Did I mention, yet, you should already be using strict mode!?

Second, a *proper* tail call is exactly like this:

```js
return foo( .. );
```

In other words, the function call is the last thing to execute in the function, and whatever value it returns is explicitly `return`ed. In this way, JS can be absolutely guaranteed that the current stack frame won't be needed anymore.

These *are not* PTC:

```js
foo();
return;

// or

var x = foo( .. );
return x;

// or

return 1 + foo( .. );
```

**Note:** A JS engine *could* do some code reorganization to realize that `var x = foo(); return x;` is effectively the same as `return foo();`, which would then make it eligible as PTC. But that is not be required by the specification.

The `1 +` part is definitely processed *after* `foo(..)` finishes, so the stack frame has to be kept around.

However, this *is* PTC:

```js
return x ? foo( .. ) : bar( .. );
```

After the `x` condition is computed, either `foo(..)` or `bar(..)` will run, and in either case, the return value will be always be `return`ed back. That's PTC form.

Binary recursion -- two (or more!) recursive calls are made -- can never be effective PTC as-is, because all the recursion has to be in tail call position to avoid the stack growth. Earlier, we showed an example of refactoring from binary recursion to mutual recursion. It may be possible to achieve PTC from a multiple-recursive algorithm by splitting each into separate function calls, where each is expressed respectively in PTC form.

## Rearranging Recursion

If you want to use recursion but your problem set could grow enough eventually to exceed the stack limit of the JS engine, you're going to need to rearrange your recursive calls to take advantage of PTC (or avoid nested calls entirely). There are several refactoring strategies that can help, but there are of course tradeoffs to be aware of.

As a word of caution, always keep in mind that code readability is our overall most important goal. If recursion along with some combination of these following strategies results in harder to read/understand code, **don't use recursion**; find another more readable approach.

### Replacing The Stack

The main problem with recursion is its memory usage, keeping around the stack frames to track the state of a function call while it dispatches to the next recursive call iteration. If we can figure out how to rearrange our usage of recursion so that the stack frame doesn't need to be kept, then we can express recursion with PTC and take advantage of the JS engine's optimized handling of tail calls.

Let's recall the summation example from earlier:

```js
function sum(num1,...nums) {
	if (nums.length == 0) return num1;
	return num1 + sum( ...nums );
}
```

This isn't in PTC form because after the recursive call to `sum(...nums)` is finished, the `total` variable is added to that result. So, the stack frame has to be preserved to keep track of the `total` partial result while the rest of the recursion proceeds.

The key recognition point for this refactoring strategy is that we could remove our dependence on the stack by doing the addition *now* instead of *after*, and then forward-passing that partial result as an argument to the recursive call. In other words, instead of keeping `total` in the current function's stack frame, push it into the stack frame of the next recursive call; that frees up the current stack frame to be removed/reused.

To start, we could alter the signature our `sum(..)` function to have a new first parameter as the partial result:

```js
function sum(result,num1,...nums) {
	// ..
}
```

Now, we should pre-calculate the addition of `result` and `num1`, and pass that along:

```js
"use strict";

function sum(result,num1,...nums) {
	result = result + num1;
	if (nums.length == 0) return result;
	return sum( result, ...nums );
}
```

Now our `sum(..)` is in PTC form! Yay!

But the downside is we now have altered the signature of the function that makes using it stranger. The caller essentially has to pass `0` as the first argument ahead of the rest of the numbers they want to sum.

```js
sum( /*initialResult=*/0, 3, 1, 17, 94, 8 );		// 123
```

That's unfortunate.

Typically, people will solve this by naming their awkward-signature recursive function differently, then defining an interface function that hides the awkwardness:

```js
"use strict";

function sumRec(result,num1,...nums) {
	result = result + num1;
	if (nums.length == 0) return result;
	return sumRec( result, ...nums );
}

function sum(...nums) {
	return sumRec( /*initialResult=*/0, ...nums );
}

sum( 3, 1, 17, 94, 8 );								// 123
```

That's better. Still unfortunate that we've now created multiple functions instead of just one. Sometimes you'll see developers "hide" the recursive function as an inner function, like this:

```js
"use strict";

function sum(...nums) {
	return sumRec( /*initialResult=*/0, ...nums );

	function sumRec(result,num1,...nums) {
		result = result + num1;
		if (nums.length == 0) return result;
		return sumRec( result, ...nums );
	}
}

sum( 3, 1, 17, 94, 8 );								// 123
```

The downside here is that we'll recreate that inner `sumRec(..)` function each time the outer `sum(..)` is called. So, we can go back to them being side-by-side functions, but hide them both inside an IIFE, and expose just the one we want to:

```js
"use strict";

var sum = (function IIFE(){

	return function sum(...nums) {
		return sumRec( /*initialResult=*/0, ...nums );
	}

	function sumRec(result,num1,...nums) {
		result = result + num1;
		if (nums.length == 0) return result;
		return sumRec( result, ...nums );
	}

})();

sum( 3, 1, 17, 94, 8 );								// 123
```

OK, we've got PTC and we've got a nice clean signature for our `sum(..)` that doesn't require the caller to know about our implementation details. Yay!

But... wow, our simple recursive function has a lot more noise now. The readability has definitely been reduced. That's unfortunate to say the least. Sometimes, that's just the best we can do.

Luckily, in some other cases, like the present one, there's a better way. Let's reset back to this version:

```js
"use strict";

function sum(result,num1,...nums) {
	result = result + num1;
	if (nums.length == 0) return result;
	return sum( result, ...nums );
}

sum( /*initialResult=*/0, 3, 1, 17, 94, 8 );		// 123
```

What you might observe is that `result` is a number just like `num1`, which means that we can always treat the first number in our list as our running total; that includes even the first call. All we need is to rename those params to make this clear:

```js
"use strict";

function sum(num1,num2,...nums) {
	num1 = num1 + num2;
	if (nums.length == 0) return num1;
	return sum( num1, ...nums );
}

sum( 3, 1, 17, 94, 8 );								// 123
```

Awesome. That's much better, huh!? I think this pattern achieves a good balance between declarative/reasonable and performant.

Let's try refactoring with PTC once more, revisiting our earlier `maxEven(..)` (currently not PTC). We'll observe that similar to keeping the sum as the first argument, we can narrow the list of numbers one at a time, keeping the first argument as the highest even we've come across thus far.

For clarity, the algorithm strategy (similar to what we discussed earlier) we might use:

1. Start by comparing the first two numbers, `num1` and `num2`.
2. Is `num1` even, and is `num1` greater than `num2`? If so, keep `num1`.
3. If `num2` is even, keep it (store in `num1`).
4. Otherwise, fall back to `undefined` (store in `num1`).
5. If there are more `nums` to consider, recursively compare them to `num1`.
6. Finally, just return whatever value is left in `num1`.

Our code can follow these steps almost exactly:

```js
"use strict";

function maxEven(num1,num2,...nums) {
	num1 =
		(num1 % 2 == 0 && !(maxEven( num2 ) > num1)) ?
			num1 :
			(num2 % 2 == 0 ? num2 : undefined);

	return nums.length == 0 ?
		num1 :
		maxEven( num1, ...nums )
}
```

**Note:** The first `maxEven(..)` call is not in PTC position, but since it only passes in `num2`, it only recurses just that one level then returns right back out; this is only a trick to avoid repeating the `%` logic. As such, this call won't increase the growth of the recursive stack, any more than if that call was to an entirely different function. The second `maxEven(..)` call is the legitimate recursive call, and it is in fact in PTC position, meaning our stack won't grow as the recursion proceeds.

It should be repeated that this example is only to illustrate the approach to moving recursion to the PTC form to optimize the stack (memory) usage. The more direct way to express a max-even algorithm might indeed be a filtering of the `nums` list for evens first, followed then by a max bubbling or even a sort.

Refactoring recursion into PTC is admittedly a little intrusive on the simple declarative form, but it still gets the job done reasonably. Unfortunately, some kinds of recursion won't work well even with an interface function, so we'll need different strategies.

### Continuation Passing Style (CPS)

In JavaScript, the word *continuation* is often used to mean a function callback that specifies the next step(s) to execute after a certain function finishes its work. Organizing code so that each function receives another function to execute at its end, is referred to as Continuation Passing Style (CPS).

Some forms of recursion cannot practically be refactored to pure PTC, especially multiple recursion. Recall the `fib(..)` function earlier, and even the mutual recursion form we derived. In both cases, there are multiple recursive calls, which effectively defeats PTC memory optimizations.

However, you can perform the first recursive call, and wrap the subsequent recursive calls in a continuation function to pass into that first call. Even though this would mean ultimately many more functions will need to be executed in the stack, as long all of them, continuations included, are in PTC form, stack memory usage will not grow unbounded.

We could do this for `fib(..)`:

```js
"use strict";

function fib(n,cont = identity) {
	if (n <= 1) return cont( n );
	return fib(
		n - 2,
		n2 => fib(
			n - 1,
			n1 => cont( n2 + n1 )
		)
	);
}
```

Pay close attention to what's happening here. First, we default the `cont(..)` continuation function as our `identity(..)` utility from Chapter 3; remember, it simply returns whatever is passed to it.

Morever, not just one but two continuation functions are added to the mix. The first one receives the `n2` argument, which eventually receives the computation of the `fib(n-2)` value. The next inner continuation receives the `n1` argument, which eventually is the `fib(n-1)` value. Once both `n2` and `n1` values are known, they can be added together (`n2 + n1`), and that value is passed along to the next `cont(..)` continuation step.

Perhaps this will help mentally sort out what's going on: just like in the previous discussion when we passed partial results along instead of returning them back after the recursive stack, we're doing the same here, but each step gets wrapped in a continuation, which defers its computation. That trick allows us to perform multiple steps where each is in PTC form.

In static languages, CPS is often an opportunity for tail calls the compiler can automatically identify and rearrange recursive code to take advantage of. Unfortunately, that doesn't really apply to the nature of JS.

In JavaScript, you'd likely need to write the CPS form yourself. It's clunkier, for sure; the declarative notation-like form has certainly been obscured. But overall, this form is still more declarative than the `for`-loop imperative implementation.

**Warning:** One major caveat that should be noted is that in CPS, creating the extra inner continuation functions still consumes memory, but of a different sort. Instead of piling up stack frames, the closures just consume free memory (typically, from the heap). Engines don't seem to apply the `RangeError` limits in these cases, but that doesn't mean your memory usage is fixed in scale.

### Trampolines

Where CPS creates continuations and passes them along, another technique for alleviating memory pressure is called trampolines. In this style of code, CPS-like continuations are created, but instead of passed in, they are shallowly returned.

Instead of functions calling functions, the stack never goes beyond depth of one, because each function just returns the next function that should be called. A loop simply keeps running each returned function until there are no more functions to run.

One advantage with trampolines is you aren't limited to environments that support PTC; another is that each function call is regular, not PTC optimized, so it may run quicker.

Let's sketch out a `trampoline(..)` utility:

```js
function trampoline(fn) {
	return function trampolined(...args) {
		var result = fn( ...args );

		while (typeof result == "function") {
			result = result();
		}

		return result;
	};
}
```

As long as a function is returned, the loop keeps going, executing that function and capturing its return, then checking its type. Once a non-function comes back, the trampoline assumes the function calling is complete, and just gives back the value.

Because each continuation needs to return another continuation, we likely we'll need to use the earlier trick of forward-passing the partial result as an argument. Here's how we could use this utility with our earlier example of summation of a list of numbers:

```js
var sum = trampoline(
	function sum(num1,num2,...nums) {
		num1 = num1 + num2;
		if (nums.length == 0) return num1;
		return () => sum( num1, ...nums );
	}
);

var xs = [];
for (let i=0; i<20000; i++) {
	xs.push( i );
}

sum( ...xs );					// 199990000
```

The downside is that a trampoline requires you to wrap your recursive function in the trampoline driving function; moreover, just like CPS, closures are created for each continuation. However, unlike CPS, each continuation function returned runs and finishes right away, so the engine won't have to accumulate a growing amount of closure memory while the call stack depth of the problem is exhausted.

Beyond execution and memory performance, the advantage of trampolines over CPS is that they're less intrusive on the declarative recursion form, in that you don't have to change the function signature to receive a continuation function argument. Trampolines are not ideal, but they can be effective in your balancing act between imperative looping code and declarative recursion.

## Summary

Recursion is when a function recursively calls itself. Heh. A recursive definition for recursion. Get it!?

Direct recursion is a function that makes at least one call to itself, and it keeps dispatching to itself until it satisifies a base condition. Multiple recursion (like binary recursion) is when a function calls itself multiple times. Mutual recursion is when a two or more functions recursively loop by *mutually* calling each other.

The upside of recursion is that it's more declarative and thus typically more readable. The downside is usually performance, but more memory constraints even than execution speed.

Tail calls alleviate the memory pressure by reusing/discarding stack frames. JavaScript requires strict mode and proper tail calls (PTC) to take advantage of this "optimization". There are several techniques we can mix-n-match to refactor a non-PTC recursive function to PTC form, or at least avoid the memory constraints by flattening the stack.

Remember: recursion should be used to make code more readable. If you misuse or abuse recursion, the readability will end up worse than the imperative form. Don't do that!
