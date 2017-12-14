# 轻量函数式 JavaScript
# 附录 B：谦逊的单子

让我通过承认一个事实来开始这篇附录：在我开始写下后续这些内容之前，我对单子（monad）知之甚少。而且为了写出一些有道理的东西犯了不少错误。如果你不信，就去看看[这本书的 Git 仓库](https://github.com/getify/Functional-Light-JS)中关于这篇附录的提交履历！

我在这本书中引入单子的话题，是因为它是每一个开发者在学习 FP 的旅程中都会遇到的一部分，就像我在编写这本书时遇到的情况一样。

我们基本上是在用对单子的简要一瞥来结束这本书，而其他大多数 FP 文献在某种意义上几乎是以单子作为开始的！在我的 “轻量函数式” 编程中，我没有遇到太多需要明确以单子的角度来思考的东西，所以这就是为什么这里的内容更像是额外的福利而非核心。但这不是说单子没用或不流行 —— 它们非常有用而且普遍。

在 JavaScript 的 FP 世界中有一个小笑话：关于单子是什么，几乎每一个人都必须写一篇自己的教程或博文，这种写作就像是旅程中的仪式一样。这些年来，单子被描绘成卷饼、洋葱、以及所有其他各种古怪的概念抽象。我希望这里不要发生这种蠢事！

> 一个单子只是自函子范畴中的幺半群。

我们用这句话开始了前言，我们在这里回到它看起来很合适。但是不，我们不会谈到幺半群、自函子、或者范畴论。这句引言不仅傲慢，而且完全没有用处。

我唯一希望你从这篇讨论中学到的东西是，不要再畏惧单子这个术语或它的概念了 —— 我就是，好多年！—— 而且能够在你看到它们的时候认出它们。你可能，只是可能，甚至已经在不经意间用过它们了。

## 类型

我们在这本书中基本上通篇都在与之保持距离，但 FP 中存在一个巨大的关注领域：类型论。我不会非常深入类型论，因为老实说我没资格这么做。而且就算我这么做了你也不会对此表示欣赏。

但我要说单子基本上是一个值类型。

数字 `42` 有一个值类型（数字！），这给它带来了我们可以依赖的特定性质与能力。字符串 `"42"` 可能看起来很相似，但它在我们的程序中有不同的目的。

在面向对象编程中，当你有一组数据（即使是一个单独的离散值）而且你有一些想要与之绑定的行为，你就可以创建一个对象/类来表达这种 “类型”。于是实例就是这种类型的成员。这种做法通常被称为 “数据结构”。

我将在这里非常松散地使用数据结构的概念，并断言我们可能会发现它在一个程序中很有用 —— 为一个特定的值定义一组行为和制约，并将它们与这个值一起打包为一个单独的抽象。当我们在自己的程序中使用一个或多个这个种类的值时，它们的行为会自然地跟随着它们，使它们使用起来更方便。而由于方便，意味着对你代码的读者来说更具声明性、更易理解！

一个单子就是一个数据结构。它是一个类型。它是一组行为，被特意设计为与一个值以可预见的方式一起工作。

回忆一下[第九章我们谈到的函子](ch9.md/#a-word-functors)：一个值与一个类似映射的工具，在组成这个值的所有数据成员上实施一个操作。一个单子就是一个包含了一些额外行为的函子。

## 宽松接口

实际上，一个单子不是一个单独的数据类型，它更像一个相关的数据类型集合。它有些像一个根据不同值的需要而不同实现的接口。每一种实现都是一种不同类型的单子。

例如，你可能读到过 “恒等单子”、“IO 单子”、“Maybe 单子”、“Either 单子”，或者其他各种。这些中的每一种都定义了基本的单子行为，但根据每种不同类型单子的用例，它们扩展或覆盖了交互。

但它稍稍大于接口，因为不只是特定 API 方法的出现才使一个对象成为一个单子的。一组关于这些方法之间互动的特定保证，才是成为单子所必要的。这些众所周知的不变法则是使用单子通过亲和性改进可读性的关键；否则，它只不过是一种特殊的数据结构，需要读者必须完全阅读才能理解。

事实上，甚至在这些单子方法的名称上都没有统一的意见，一个真正的接口名称是强制规定的；而单子更像是一个宽松的接口。一些人称一个特定方法为 `bind(..)`，一些人称之为 `chain(..)`，一些人称之为 `flatMap(..)`，如此等等。

所以一个单子是一个对象数据结构，带有满足这个单子定义的最小行为需求的（事实上任意名称或种类的）方法。每一种单子都对这个最小需求有一种不同的扩展。但是，因为它们都在行为上拥有一个重叠，一起使用两个不同种类的单子依然是直接而且可预期的。

在这种意义上单子有些像一个接口。

## Just 单子

你将会遇到一个位于许多其他单子底层的基本类型单子，称为 Just。它只是一个任意常规（也就是，非空）值的单子包装。

因为单子是一个类型，你可能会认为我们将把 `Just` 定义为一个将要被初始化的类。那是一种合法的方式，但它会在方法中引入我不想费力去调整的 `this` 绑定问题；相反，我们将坚持仅使用一个简单函数的方式。

这是一个基本的实现：

```js
function Just(val) {
    return { map, chain, ap, inspect };

    // *********************

    function map(fn) { return Just( fn( val ) ); }

    // 也称为：bind, flatMap
    function chain(fn) { return fn( val ); }

    function ap(anotherMonad) { return anotherMonad.map( val ); }

    function inspect() {
        return `Just(${ val })`;
    }
}
```

**注意：** 在这里包含 `inspect(..)` 方法只是为了我们演示的目的。它在单子的意义上不扮演任何角色。

你会发现，无论一个 `Just(..)` 实例持有一个什么样的值 `val`，它从不改变。所有的单子方法都创建新的单子实例而非改变单子本身的值。

如果这些内容的大部分现在还讲不通，不要担心。我们不会太痴迷于单子设计背后的数学/理论细节。相反，我们将更关注于展示我们能用它们来做什么。

### 使用单子方法

所有的单子实例都拥有 `map(..)`、`chain(..)`（也被称为 `bind(..)` 或 `flatMap(..)`）、和 `ap(..)` 方法。这些方法的目的和行为是为了给多个单子实例之间的互动提供一个标准的方式。

让我们先来看看单子 `map(..)` 函数。就像 `map(..)` 在一个数组上（见[第九章](ch9.md/#map)）使用它的值调用映射函数并生成一个新数组一样，一个单子的 `map(..)` 使用这个单子的值调用映射函数，而且它返回的任何值都会被包装在一个新的 Just 单子实例中：

```js
var A = Just( 10 );
var B = A.map( v => v * 2 );

B.inspect();                // Just(20)
```

单子 `chain(..)` 做的事情与 `map(..)` 是有些相同的，但会从新它的新单子中展开结果值。然而，预期非正式地考虑 “展开” 一个单子，更正式的解释是 `chain(..)` 将单子进行了扁平化。考虑如下代码：

```js
var A = Just( 10 );
var eleven = A.chain( v => v + 1 );

eleven;                     // 11
typeof eleven;              // "number"
```

`eleven` 实际上是一个基本类型数字 `11`，不是一个持有该值的单子。

为了将这个 `chain(..)` 方法在概念上与我们学过的东西联系起来，我们将指出许多单子的实现将这个方法命名为 `flatMap(..)`。现在，回忆一下[第九章中 `flatMap(..)`](ch9.md/#user-content-flatmap) 对一个数组做的事情（对比 `map(..)`）：

```js
var x = [3];

map( v => [v,v+1], x );         // [[3,4]]
flatMap( v => [v,v+1], x );     // [3,4]
```

看到区别了？映射函数 `v => [v,v+1]` 得到一个数组 `[3,4]`，它位于外部数组的第一个位置，所以我们得到了 `[[3,4]]`。但是 `flatMap(..)` 将内部数组平整到外部数组中，于是我们仅得到了 `[3,4]`。

这也是一个单子的 `chain(..)`（经常被称为 `flatMap(..)`）中发生的事情。与使一个单子像 `map(..)` 那样持有值不同，`chain(..)` 额外地将单子平整化为底层的值。实际上，与其仅仅为了立即平整它而创建一个中间单子，`chain(..)` 一般都被实现得更高效，它会走一条捷径而且不会一上来就创建单子。不论哪种方式，最终结果都是相同的。

一个展示这种行为的 `chain(..)` 的方式是，将它与 `identity(..)` 工具（见[第三章](ch3.md/#one-on-one)）相结合，来高效地从一个单子中抽取值：

```js
var identity = v => v;

A.chain( identity );        // 10
```

`A.chain(..)` 使用 `A` 中的值调用 `identity(..)`，无论 `identity(..)` 返回什么值（这里是 `10`）都不经任何中间的单子直接返回出来。换言之，在早先的 `Just(..)` 代码列表中，我们实际上不需要包含那个可选的 `inspect(..)` 帮助函数，因为 `chain(inspect)` 完成了相同的目标；它纯粹是为了我们学习单子时易于调试存在的。

至此，但愿对你来说 `map(..)` 和 `chain(..)` 感觉相当合理了。

相比之下，单子的 `ap(..)` 方法一眼看上去可能很不直观。它可能看起来像是交互的一种奇怪扭曲，但是在这种设计的背后有着深刻且重要的原因。让我们花些时间将它分解一下。

`ap(..)` 接收一个包装在单子中的值并使用另一个单子的 `map(..)` 来 “应用” 它。好，目前还不错。

然而，`map(..)` 总是期待一个函数。所以这意味着在你调用 `ap(..)` 的那个单子上面必须实际包含一个作为值的函数，以传递给另一个单子的 `map(..)`。

糊涂了？是的，这可能不是你期待中的东西。我们将试着简要展示一下，但是要做好心理准备：这些东西可能在一段时间里让你感到模糊，直到你在单子中受到足够多的熏陶和练习之后才会变得清晰。

我们将 `A` 定义为包含值 `10` 的单子，`B` 为包含值 `3` 的单子：

```js
var A = Just( 10 );
var B = Just( 3 );

A.inspect();                // Just(10)
B.inspect();                // Just(3)
```

现在，我们该如何制造一个新的单子，它的值是通过比如 `sum(..)` 函数将 `10` 和 `3` 加到一起的？事实证明  `ap(..)` 可以帮到我们。

要使用 `ap(..)`，我们说过我们首先需要构建一个持有一个函数的单子。具体地讲，我们需要它持有一个函数，而这个函数持有（通过闭包） `A` 中的值。花点儿时间领会一下这句话。

为了从 `A` 中制造一个单子，使它持有一个包含值的函数，我们调用 `A.map(..)`，给它一个能够将抽出的值作为第一个参数 “记住” 的柯里化函数（见[第三章](ch3.md/#one-at-a-time)）。我们称这个新的包含函数的单子为 `C`：

```js
function sum(x,y) { return x + y; }

var C = A.map( curry( sum ) );

C.inspect();
// Just(function curried...)
```

考虑一下这如何工作。柯里化后的 `sum(..)` 函数期待两个值来完成它的工作，而我们通过使 `A.map(..)` 抽出 `10` 并传递给它来赋予它第一个值。`C` 现在持有一个通过闭包记住了 `10` 的函数。

现在，为了得到将传递给 `C` 中等待着的柯里化函数的第二个值（`B` 中的 `3`）：

```js
var D = C.ap( B );

D.inspect();                // Just(13)
```

值 `10` 从 `C` 中而来，`3` 从 `B` 中而来，`sum(..)` 将它们相加得到 `13` 并包装在单子 `D` 中。让我们把这两个步骤放在一起，这样你就能更清晰地看到它们的联系：

```js
var D = A.map( curry( sum ) ).ap( B );

D.inspect();                // Just(13)
```

为了展示一下 `ap(..)` 在何处帮了我们，考虑一下，我们本可以通过这种方式得到相同的结果：

```js
var D = B.map( A.chain( curry( sum ) ) );

D.inspect();                // Just(13);
```

当然，这只是一个组合（见[第四章](ch4.md)）：

```js
var D = compose( B.map, A.chain, curry )( sum );

D.inspect();                // Just(13)
```

酷，对吧！？

如果这些关于单子方法的讨论的 *用法* 还不清楚，那么就回头重读一遍。如果其中的 *原理* 难以琢磨，那就到此打住。单子很容易使开发者们糊涂，它就是这样的东西！

## Maybe

在 FP 的文献资料中讲解诸如 Maybe 之类众所周知的单子十分常见。实际上，Maybe 单子是另外两种其他更简单的单子 —— Just 和 Nothing —— 的特殊配对。

我们已经看过了 Just；Nothing 是持有一个空值的单子。Maybe 是持有一个 Just 或一个 Empty 两者之一的单子。

这是 Maybe 的最小实现：

```js
var Maybe = { Just, Nothing, of/* 也称为：unit, pure */: Just };

function Just(val) { /* .. */ }

function Nothing() {
    return { map: Nothing, chain: Nothing, ap: Nothing, inspect };

    // *********************

    function inspect() {
        return "Nothing";
    }
}
```

**注意：** `Maybe.of(..)`（有时称作 `unit(..)` 或 `pure(..)`）是 `Just(..)` 的一个便利别名。

与 `Just()` 实例相比而言，`Nothing()` 实例将所有单子方法定义为空操作。所以如果这样的一个单子实例出现在任何单子操作中的话，它的效果基本上是短接为不发生任何行为。注意这里没有强制 “空” 是什么意思 —— 你的代码要为此做出决定。稍后有更多关于这一点的内容。

在 Maybe 中，如果一个值是非空值，那么它就通过一个 `Just(..)` 实例的形式进行表现；如果是一个空值，它就通过一个 `Nothing()` 实例的形式进行表现。

但是这种单子表现形式的重要性在于，不管我们是得到一个 `Just(..)` 实例还是一个 `Nothing()` 实例，我们都将以相同的方式使用 API 方法。

Maybe 抽象的力量是隐含地封装了行为/空操作二元性。

### 不同的 Maybes

一个 JavaScript Maybe 单子的许多实现包括检查（通常是在 `map(..)` 中）一个值是否是 `null`/`undefined`，如果是的话就跳过行为。事实上，正是因为这种通过封装的空值检查来自动短接它行为的特性，Maybe 才被鼓吹为有价值。

这是 Maybe 经常被展示的方式：

```js
// 取代不安全的 `console.log( someObj.something.else.entirely )`:

Maybe.of( someObj )
.map( prop( "something" ) )
.map( prop( "else" ) )
.map( prop( "entirely" ) )
.map( console.log );
```

换句话说，如果我们在这个链条的任意一点上得到一个 `null`/`undefined` 值，那么 Maybe 就会魔法般地切换到空操作模式 —— 它现在是一个 `Nothing()` 单子实例！—— 而且停止对链条的其余部分做任何事。这使得嵌套属性访问更安全，如果一些属性丢掉了/为空也不会抛出 JS 异常。这很酷，而且绝对是一种很有用的抽象！

但是…… ***Maybe 的这种方式不是纯粹的单子。***

单子的核心精神是，它必须对所有的值都合法，而且不能对值做任何检查 —— 一个 null 检查也不行。所以那些其他的实现方式都是为了方便而偷工减料。这不是什么大问题，但是在学习某些东西的时候，在你重塑规则之前，你可能应当先以它最纯粹的形式学习它。

我早先提供的 Maybe 单子实现与其他 Maybe 的主要不同之处在于，它内部没有空值检查逻辑。另外，我们只不过是将 `Maybe` 表达为 `Just(..)`/`Nothing()` 的松散配对。

那么等一下。如果我们得不到自动短接的特性，那么 Maybe 还有什么用？！？这似乎是它的全部意义。

不要怕！我们可以简单地从外部提供控制检查逻辑，同时让 Maybe 单子其余的短接行为将依然正常工作。这是你如何更加 “正确” 地进行嵌套属性访问（`someObj.something.else.entirely`）：

```js
function isEmpty(val) {
    return val === null || val === undefined;
}

var safeProp = curry( function safeProp(prop,obj){
    if (isEmpty( obj[prop] )) return Maybe.Nothing();
    return Maybe.of( obj[prop] );
} );

Maybe.of( someObj )
.chain( safeProp( "something" ) )
.chain( safeProp( "else" ) )
.chain( safeProp( "entirely" ) )
.map( console.log );
```

我们制造了一个执行控制检查的 `safeProp(..)`，如果是空值就选择一个 `Nothing()` 单子实例，要么就将值（通过 `Maybe.of(..)`）包装在一个 `Just(..)` 实例中。与使用 `map(..)` 不同，我们使用知道如何 “展开” `safeProp(..)` 所返回的单子的 `chain(..)`。

我们得到了相同的功能 —— 在遇到空值时短接链条。我们只是没有把这个逻辑内嵌在 Maybe 内部。

单子，具体说是 Maybe 的好处是，无论什么种类的单子被返，回我们的 `map(..)` 和 `chain(..)` 方法拥有一致而且可预期的交互行为。这相当酷！

## Humble

现在我们对 Maybe 以及它所做的事情有了更多的了解，我将要在它上面加一点儿花样 —— 而且给我们的讨论添加一些关于自我尊重的幽默 —— 发明 Maybe+Humble 单子。技术上讲，`MaybeHumble(..)` 本身不是一个单子，而是一个生产 Maybe 单子实例的工厂。

不可否认，Humble 是一个造作的数据结构包装器，它使用 Maybe 来追踪一个数字 `egoLevel` 的状态。具体点儿说，`MaybeHumble(..)` 生成这样的单子实例：仅在它们的自负水平（ego-Level）足够低（小于 `42`）时被认为是谦逊的，从而会服从地进行操作；否则它就是一个无操作的 `Nothing()`。这应当听起来很像 Maybe；它十分相似！

这是我们 Maybe+Humble 单子的工厂函数：

```js
function MaybeHumble(egoLevel) {
    // 除了 42 或更大的数字以外接收所有东西
    return !(Number( egoLevel ) >= 42) ?
        Maybe.of( egoLevel ) :
        Maybe.Nothing();
}
```

你会注意到这个工厂函数有点儿像 `safeProp(..)`，因为它也使用一个条件来决定挑选 Maybe 的 `Just(..)` 部分还是 `Nothing()` 部分。

让我们展示一下基本的用法：

```js
var bob = MaybeHumble( 45 );
var alice = MaybeHumble( 39 );

bob.inspect();              // Nothing
alice.inspect();            // Just(39)
```

要是 Alice 赢了一个大奖，现在变得更骄傲了呢？

```js
function winAward(ego) {
    return MaybeHumble( ego + 3 );
}

alice = alice.chain( winAward );
alice.inspect();            // Nothing
```

`MaybeHumble( 39 + 3 )` 调用创建了一个 `Nothing()` 单子实例并从 `chain(..)` 调用中返回，于是现在 Alice 不再谦逊了。

现在，让我们一起使用几个单子：

```js
var bob = MaybeHumble( 41 );
var alice = MaybeHumble( 39 );

var teamMembers = curry( function teamMembers(ego1,ego2){
    console.log( `Our humble team's egos: ${ego1} ${ego2}` );
} );

bob.map( teamMembers ).ap( alice );
// Our humble team's egos: 41 39
```

回一下先前 `ap(..)` 的用法，现在我们可以解释这段代码如何工作了。

因为 `teamMembers(..)` 是被柯里化的，`bob.map(..)` 调用传入 `bob` 的自负水平（`41`），并创建一个单子实例将剩余的函数包装起来。在这个单子上调用 `ap(alice)` 会调用 `alice.map(..)` 并传入单子的函数。其效果就是 `bob` 和 `alice` 单子的数字值被提供给 `teamMembers(..)` 函数，打印出上面展示的消息。

然而，如果这两个单子之一或两者实际上是 `Nothing()` 实例（因为它们的自负水平太高）：

```js
var frank = MaybeHumble( 45 );

bob.map( teamMembers ).ap( frank );
// ……没有输出……

frank.map( teamMembers ).ap( bob );
// ……没有输出……
```

`teamMembers(..)` 永远不会被调用（因此没有消息被打印），因为 `frank` 是一个 `Nothing()` 实例。这就是 Maybe 单子的力量，而且我们的 `MaybeHumble(..)` 工厂允许我们基于自负水平进行选择。酷！

### 谦逊

展示我们 Maybe+Humble 数据结构行为的另一个例子：

```js
function introduction() {
    console.log( "I'm just a learner like you! :)" );
}

var egoChange = curry( function egoChange(amount,concept,egoLevel) {
    console.log( `${amount > 0 ? "Learned" : "Shared"} ${concept}.` );
    return MaybeHumble( egoLevel + amount );
} );

var learn = egoChange( 3 );

var learner = MaybeHumble( 35 );

learner
.chain( learn( "closures" ) )
.chain( learn( "side effects" ) )
.chain( learn( "recursion" ) )
.chain( learn( "map/reduce" ) )
.map( introduction );
// Learned closures.
// Learned side effects.
// Learned recursion.
// ……没有别的了……
```

不幸的是，学习的过程被切断了。你看，我发现学习一大堆东西但不与人分享会让你过于自满，而对你的技能没有好处。

让我们尝试一种更好的学习方式：

```js
var share = egoChange( -2 );

learner
.chain( learn( "closures" ) )
.chain( share( "closures" ) )
.chain( learn( "side effects" ) )
.chain( share( "side effects" ) )
.chain( learn( "recursion" ) )
.chain( share( "recursion" ) )
.chain( learn( "map/reduce" ) )
.chain( share( "map/reduce" ) )
.map( introduction );
// Learned closures.
// Shared closures.
// Learned side effects.
// Shared side effects.
// Learned recursion.
// Shared recursion.
// Learned map/reduce.
// Shared map/reduce.
// I'm just a learner like you! :)
```

学习同时分享。这些学得更多更好的最佳方法。

## Summary

到底什么是单子？单子是一个值类型，一个借口，一个封装好行为的数据结构。

但这些定义都不是非常有用。我们在这里尝试更好地定义它：**单子是你如何使用声明式的方式在一个值的周围组织行为。**

正如这本书中其他的东西一样，在单子能提供帮助的地方使用它们，但是不要仅仅因为大家都在 FP 中谈论它而是用它。单子不是一枚放之四海而皆准的银弹，但在被谨慎使用的时候它们的确能发挥一些作用。
