# Functional-Light JavaScript
# Chapter 6: Value Immutability

在第五章中，我们谈论了减少侧因/副作用的重要性：它们使你的应用程序状态会出乎意料地改变并造成以外的结果（bug）。这样有地雷的地方越少，我们就能对自己的代码更有信心，而且它也更具可读性。我们在本章中的话题紧跟着为了相同的目的而做出的努力。

如果编程风格的幂等性是关于定义一个只影响状态一次的改变值的操作，那么我们现在将注意力转向另一个目标：将改变发生的数量从一降为零。

现在我们来探索一下值的不可变性，这个概念是说我们在程序中仅使用不能被改变的值。

## Primitive Immutability

基本类型（`number`、`string`、`boolean`、`null`、以及 `undefined`）的值已经是不可变得了；你无法做任何事情来改变它们。

```js
// invalid, and also makes no sense
2 = 2.5;
```

然而，JS 确实有一种特殊的行为，使它看起来允许修改这样的基本类型值：“封箱”。当你访问特定基本类型值上的一个属性时 —— 具体说是 `number`、`string`、和 `boolean` —— JS 在底层自动地将这个值包装（也就是“封箱”）在它对应的对象中（分别是 `Number`、`String`、以及 `Boolean`）。

考虑如下代码：

```js
var x = 2;

x.length = 4;

x;				// 2
x.length;		// undefined
```

数字一般没有 `length` 属性可用，所以设置 `x.length = 4` 是在试图添加一个新属性，而且它无声地失败了（或者说被忽略/丢弃了，这要看你的视角）；`x` 继续持有简单基本类型数字 `2`。

但是如果除了潜在地使读者糊涂以外没有其他原因，JS 允许语句 `x.length = 4` 运行这件事看起来根本就是个麻烦。好消息是，如果你使用 strict 模式（`"use strict";`），这样的语句将抛出一个错误。

要是你试着改变一个被明确封箱为对象表现形式的这样一个值呢？

```js
var x = new Number( 2 );

// works fine
x.length = 4;
```

这段代码中的 `x` 持有一个指向对象的引用，所以添加和改变自定义属性没有问题。

像 `number` 这样的简单基本类型值的不可变性看起来相当显而易见。那 `string` 值呢？JS 开发者们有一个很常见的误解，就是字符串和数组很像而且因此可以被改变。JS 语法甚至使用 `[]` 访问操作符暗示它们为 “类数组”。然而，字符串也是不可变的。

```js
var s = "hello";

s[1];				// "e"

s[1] = "E";
s.length = 10;

s;					// "hello"
```

除了能够像在一个数组中那样访问 `s[1]`，JS 字符串不是真正的数组。设置 `s[1] = "E"` 和 `s.length = 10` 都会无声地失败，就像上面的 `x.length = 4` 一样。在 strict 模式中，这些语句会失败，因为属性 `1` 和属性 `length` 在击基本类型的 `string` 值上都是只读的。

有趣的是，即使是封箱后的 `String` 对象值也会表现为（几乎）不可变，因为如果你在 strict 模式下改变它的既存属性的话，它将抛出错误：

```js
"use strict";

var s = new String( "hello" );

s[1] = "E";			// error
s.length = 10;		// error

s[42] = "?";		// OK

s;					// "hello"
```

## Value To Value

我们将在本章中更彻底地展开这个概念，但为了在开始的时让我们的大脑中形成一个清晰的认识：值的不可变性不意味着我们不能拥有在程序运行的整个进程中一直改变的值。一个没有改变的值的程序可不是非常有趣！它也不意味着我们的变量不能持有不同的值。这些都是对值的不可变性的误解。

值的不可变性意味着，当我们需要在程序中改变状态时，我们必须创建并追踪一个新的值而不是改变一个既存的值。

例如：

```js
function addValue(arr) {
	var newArr = [ ...arr, 4 ];
	return newArr;
}

addValue( [1,2,3] );	// [1,2,3,4]
```

注意我们没有改变 `arr` 引用的数组，而是创建了一个新数组 —— 它包含既存的值外加新的值 `4`。

基于我们在第五章中关于侧因/副作用的讨论来分析一下 `addValue(..)`。它是纯粹的吗？它具有引用透明性吗？给它相同的数组，它会总是产生相同的输出吗？它既没有侧因也没有副作用吗？**是的。**

想象一下，数组 `[1,2,3]` 表示一系列来自于某些先前的操作数据，而且我们把它存储在某些变量中。这就是我们的当前状态。如果我们想计算我们应用程序的下一个状态是什么，我们调用了 `addValue(..)`。但我们想要下一个状态的计算进行得直接且明确。所以 `addValue(..)` 操作接收一个直接的输入，返回一个直接的输出，并且避免通过改变 `arr` 引用的原始数组来制造副作用。

这意味着我们可以计算出新的状态 `[1,2,3,4]` 而且完全掌控这种状态的转换。我们程序中没有其他部分可以意外地将我们提早地转换到这个状态，或者完全转换为另一个状态，比如 `[1,2,3,5]`。通过管控我们的值并将它们视为不可变的，我们极大地缩小了意外的表面积，使我们的程序更易于阅读，易于推理，而最终更可信任。

`arr` 引用的数组实际上是可变的。我们只是选择不去改变它，所以我们践行了值的不可变性的精神。

我们也可以对对象使用这种拷贝而非改变的策略。考虑如下代码：

```js
function updateLastLogin(user) {
	var newUserRecord = Object.assign( {}, user );
	newUserRecord.lastLogin = Date.now();
	return newUserRecord;
}

var user = {
	// ..
};

user = updateLastLogin( user );
```

### Non-Local

如果你做这样的事情，就可以看出不可变值的重要性：

```js
var arr = [1,2,3];

foo( arr );

console.log( arr[0] );
```

表面上，你希望 `arr[0]` 依然是值 `1`。但它是吗？你不知道，因为 `foo(..)` *可能* 会使用你传递给它的引用改变这个数组。

在前一章中我们已经看到了一种作弊的方法可以避免这样的意外：

```js
var arr = [1,2,3];

foo( arr.slice() );			// ha! a copy!

console.log( arr[0] );		// 1
```

当然，仅在 `foo` 没有跳过它的形式参数而通过自由变量词法引用来引用我们同一个 `arr` 时，这种断言才能够成立！

In a little bit, we'll see another strategy for protecting ourselves from a value being mutated out from underneath us unexpectedly.

再过一会，我们将看到另一种策略，

## Reassignment

How would you describe what a "constant" is? Think about that for a moment before you move onto the next paragraph.

...

Some of you may have conjured descriptions like, "a value that can't change", "a variable that can't be changed", etc. These are all approximately in the neighborhood, but not quite at the right house. The precise definition we should use for a constant is: a variable that cannot be reassigned.

This nitpicking is really important, because it clarifies that a constant actually has nothing to do with the value, except to say that whatever value a constant holds, that variable cannot be reassigned to any other value. But it says nothing about the nature of the value itself.

Consider:

```js
var x = 2;
```

Like we discussed earlier, the value `2` is an unchangeable (immutable) primitive. If I change that code to:

```js
const x = 2;
```

The presence of the `const` keyword, known familiarly as a "constant declaration", actually does nothing at all to change the nature of `2`; it's already unchangeable, and it always will be.

It's true that this later line will fail with an error:

```js
// try to change `x`, fingers crossed!
x = 3;		// Error!
```

But again, we're not changing anything about the value. We're attempting to reassign the variable `x`. The values involved are almost incidental.

To prove that `const` has nothing to do with the nature of the value, consider:

```js
const x = [ 2 ];
```

Is the array a constant? **No.** `x` is a constant because it cannot be reassigned. But this later line is totally OK:

```js
x[0] = 3;
```

Why? Because the array is still totally mutable, even though `x` is a constant.

The confusion around `const` and "constant" only dealing with assignments and not value semantics is a long and dirty story. It seems a high degree of developers in just about every language that has a `const` stumble over the same sorts of confusions. Java in fact deprecated `const` and introduced a new keyword `final` at least in part to separate itself from the confusion over "constant" semantics.

Setting aside the confusion detractions, what importance does `const` hold for the FPer, if not to have anything to do with creating an immutable value?

### Intent

The use of `const` tells the reader of your code that *that* variable will not be reassigned. As a signal of intent, `const` is often highly lauded as a welcome addition to JavaScript and universal improvement in code readability.

In my opinion, this is mostly hype; there's not much substance to these claims. I see only the mildest of faint benefit in signaling your intent in this way. And when you match that up against decades of precedent around confusion about it implying value immutability, I don't think `const` comes even close to carrying its own weight.

To back up my assertion, let's take a reality check. `const` creates a block scoped variable, meaning that variable only exists in that one localized block:

```js
// lots of code

{
	const x = 2;

	// a few lines of code
}

// lots of code
```

Typically, blocks are considered best designed to be only a few lines long. If you have blocks of more than say 10 lines, most developers will advise you to refactor. So `const x = 2` only applies to those next 9 lines of code at most.

No other part of the program can ever affect the assignment of `x`. **Period.**

My claims is: that program has basically the same magnitude of readability as this one:

```js
// lots of code

{
	let x = 2;

	// a few lines of code
}

// lots of code
```

If you look at the next few lines of code after `let x = 2;`, you'll be able to easily tell that `x` is not in fact reassigned. That to me is a **much stronger signal** -- actually not reassigning it -- than the use of some confusable `const` declaration to say "won't reassign it".

Moreover, let's consider what this code is likely to communicate to a reader at first glance:

```js
const magicNums = [1,2,3,4];

// ..
```

Isn't it at least possible (probable?) that the reader of your code will assume (wrongly) that your intent is to never mutate the array? That seems like a reasonable inference to me. Imagine their confusion if you do in fact allow the array value referenced by `magicNums` to be mutated. That will create quite a surprise, won't it!?

Worse, what if you intentionally mutate `magicNums` in some way that turns out to not be obvious to the reader? Later in the code, they see a usage of `magicNums` and assume (again, wrongly) that it's still `[1,2,3,4]` because they read your intent as, "not gonna change this".

I think you should use `var` or `let` for declaring variables to hold values that you intend to mutate. I think that actually is a **much clearer signal** than using `const`.

But the troubles with `const` don't stop there. Remember we asserted at the top of the chapter that to treat values as immutable means that when our state needs to change, we have to create a new value instead of mutating it? What are you going to do with that new array once you've created it? If you declared your reference to it using `const`, you can't reassign it. So... what next?

In this light, I see `const` as actually making our efforts to adhere to FP harder, not easier. My conclusion: `const` is not all that useful. It creates unnecessary confusion and restricts us in inconvenient ways. I only use `const` for simple constants like:

```js
const PI = 3.141592;
```

The value `3.141592` is already immutable, and I'm clearly signaling, "this `PI` will always be used as stand-in placeholder for this literal value." To me, that's what `const` is good for. And to be frank, I don't use many of those kinds of declarations in my typical coding.

I've written and seen a lot of JavaScript, and I just think it's an imagined problem that very many of our bugs come from accidental reassignment.

The thing we need to worry about is not whether our variables get reassigned, but **whether our values get mutated**. Why? Because values are portable; lexical assignments are not. You can pass an array to a function, and it can be changed without you realizing it. But you cannot have a reassignment happen unexpectedly caused by some other part of your program.

### It's Freezing In Here

There's a cheap and simple way to turn a mutable object/array/function into an "immutable value" (of sorts):

```js
var x = Object.freeze( [2] );
```

The `Object.freeze(..)` utility goes through all the properties/indices of an object/array and marks them as read-only, so they cannot be reassigned. It's sorta like declaring properties with a `const`, actually! `Object.freeze(..)` also marks the properties as non-reconfigurable, and it marks the object/array itself as non-extensible (no new properties can be added). In effect, it makes the top level of the object immutable.

Top level only, though. Be careful!

```js
var x = Object.freeze( [ 2, 3, [4, 5] ] );

// not allowed:
x[0] = 42;

// oops, still allowed:
x[2][0] = 42;
```

`Object.freeze(..)` provides shallow, naive immutability. You'll have to walk the entire object/array structure manually and apply `Object.freeze(..)` to each sub-object/array if you want a deeply immutable value.

But contrasted with `const` which can confuse you into thinking you're getting an immutable value when you aren't, `Object.freeze(..)` *actually* gives you an immutable value.

Recall the protection example from earlier:

```js
var arr = Object.freeze( [1,2,3] );

foo( arr );

console.log( arr[0] );			// 1
```

Now `arr[0]` is quite reliably `1`.

This is so important because it makes reasoning about our code much easier when we know we can trust that a value doesn't change when passed somewhere that we do not see or control.

## Performance

Whenever we start creating new values (arrays, objects, etc) instead of mutating existing ones, the obvious next question is: what does that mean for performance?

If we have to reallocate a new array each time we need to add to it, that's not only churning CPU time and consuming extra memory, the old values (if no longer referenced) are being garbage collected; That's even more CPU burn.

Is that an acceptable trade-off? It depends. No discussion or optimization of code performance should happen **without context.**

If you have a single state change that happens once (or even a couple of times) in the whole life of the program, throwing away an old array/object for a new one is almost certainly not a concern. The churn we're talking about will be so small -- probably mere microseconds at most -- as to have no practical effect on the performance of your application. Compared to the minutes or hours you will save not having to track down and fix a bug related to unexpected value mutation, there's not even a contest here.

Then again, if such an operation is going to occur frequently, or specifically happen in a *critical path* of your application, then performance -- consider both performance and memory! -- is a totally valid concern.

Think about a specialized data structure that's like an array, but that you want to be able to make changes to and have each change behave implicitly as if the result was a new array. How could you accomplish this without actually creating a new array each time? Such a special array data structure could store the original value and then track each change made as a delta from the previous version.

Internally, it might be like a linked-list tree of object references where each node in the tree represents a mutation of the original value. Actually, this is conceptually similar to how **git** version control works.

<p align="center">
	<img src="fig18.png" width="490">
</p>

Imagine using this hypothetical specialized array data structure like this:

```js
var state = specialArray( 1, 2, 3, 4 );

var newState = state.set( 42, "meaning of life" );

state === newState;					// false

state.get( 2 );						// 3
state.get( 42 );					// undefined

newState.get( 2 );					// 3
newState.get( 42 );					// "meaning of life"

newState.slice( 1, 3 );				// [2,3]
```

The `specialArray(..)` data structure would internally keep track of each mutation operation (like `set(..)`) as a *diff*, so it won't have to reallocate memory for the original values (`1`, `2`, `3`, and `4`) just to add the `"meaning of life"` value to the list. But importantly, `state` and `newState` point at different versions of the array value, so **the value immutability semantic is preserved.**

Inventing your own performance-optimized data structures is an interesting challenge. But pragmatically, you should probably use a library that already does this well. One great option is **Immutable.js** (http://facebook.github.io/immutable-js), which provides a variety of data structures, including `List` (like array) and `Map` (like object).

Consider the above `specialArray` example but using `Immutable.List`:

```js
var state = Immutable.List.of( 1, 2, 3, 4 );

var newState = state.set( 42, "meaning of life" );

state === newState;					// false

state.get( 2 );						// 3
state.get( 42 );					// undefined

newState.get( 2 );					// 3
newState.get( 42 );					// "meaning of life"

newState.toArray().slice( 1, 3 );	// [2,3]
```

A powerful library like Immutable.js employs very sophisticated performance optimizations. Handling all the details and corner-cases manually without such a library would be quite difficult.

When changes to a value are few or infrequent and performance is less of a concern, I'd recommend the lighter-weight solution, sticking with built-in `Object.freeze(..)` as discussed earlier.

## Treatment

What if we receive a value to our function and we're not sure if it's mutable or immutable? Is it ever OK to just go ahead and try to mutate it? **No.** As we asserted at the beginning of this chapter, we should treat all received values as immutable -- to avoid side effects and remain pure -- regardless of whether they are or not.

Recall this example from earlier:

```js
function updateLastLogin(user) {
	var newUserRecord = Object.assign( {}, user );
	newUserRecord.lastLogin = Date.now();
	return newUserRecord;
}
```

This implementation treats `user` as a value that should not be mutated; whether it *is* immutable or not is irrelevant to reading this part of the code. Contrast that with this implementation:

```js
function updateLastLogin(user) {
	user.lastLogin = Date.now();
	return user;
}
```

That version is a lot easier to write, and even performs better. But not only does this approach make `updateLastLogin(..)` impure, it also mutates a value in a way that makes both the reading of this code, as well as the places it's used, more complicated.

**We should treat `user` as immutable**, always, because at this point of reading the code we do not know where the value comes from, or what potential issues we may cause if we mutate it.

Nice examples of this approach can be seen in various built-in methods of the JS array, such as `concat(..)` and `slice(..)`:

```js
var arr = [1,2,3,4,5];

var arr2 = arr.concat( 6 );

arr;					// [1,2,3,4,5]
arr2;					// [1,2,3,4,5,6]

var arr3 = arr2.slice( 1 );

arr2;					// [1,2,3,4,5,6]
arr3;					// [2,3,4,5,6]
```

Other array prototype methods that treat the value instance as immutable and return a new array instead of mutating: `map(..)` and `filter(..)`. The `reduce(..)` / `reduceRight(..)` utilities also avoid mutating the instance, though they also don't by default return a new array.

Unfortunately, for historical reasons, quite a few other array methods are impure mutators of their instance: `splice(..)`, `pop(..)`, `push(..)`, `shift(..)`, `unshift(..)`, `reverse(..)`, `sort(..)`, and `fill(..)`.

It should not be seen as *forbidden* to use these kinds utilities, as some claim. For reasons such as performance optimization, sometimes you will want to use them. But you should never use such a method on an array value that is not already local to the function you're working in, to avoid creating a side effect on some other remote part of the code.

Be disciplined and always treat *received values* as immutable, whether they are or not. That effort will improve the readability and trustability of your code.

## Summary

Value immutability is not about unchanging values. It's about creating and tracking new values as the state of the program changes, rather than mutating existing values. This approach leads to more confidence in reading the code, because we limit the places where our state can change in ways we don't readily see or expect.

`const` declarations (constants) are commonly mistaken for their ability to signal intent and enforce immutability. In reality, `const` has basically nothing to do with value immutability, and its usage will likely create more confusion than it solves. Instead, `Object.freeze(..)` provides a nice built-in way of setting shallow value immutability on an array or object. In many cases, this will be sufficient.

For performance sensitive parts of the program, or in cases where changes happen frequently, creating a new array or object (especially if it contains lots of data) is undesirable, for both processsing and memory concerns. In these cases, using immutable data structures from a library like **Immutable.js** is probably the best idea.

The importance of value immutability on code readability is less in the inability to change a value, and more in the discipline to treat a value as immutable.
