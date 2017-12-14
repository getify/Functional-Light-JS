# 轻量函数式 JavaScript
# 附录 C：FP 库

如果你从头到尾地读了这本书，那么停下一会，回顾一下从[第一章](ch1.md)开始你走了多远。这真是一次漫长的旅行。我希望你学到了许多，并对如何对自己的程序进行函数式的思考有了一些心得。

我想在结束这本书之前给你留一些如何使用常见/流行的 FP 库的快速指引。这可不是它们其中每一个的完整文档，而是简要提及一下在你超越 “轻量函数式” 到更广阔的 FP 世界中冒险时应当注意的事情。

无论何处，我建议你 *不要* 重新发明任何轮子。如果你找到一个适合你的需要的 FP 库，那么就使用它。仅在你无法为自己的情景找到合适的库方法时才来使用这本书中的 —— 或者发明你自己的！—— 特殊帮助工具。

## 调研对象

让我们展开[第一章中的需要注意的 FP 库列表](ch1.md/#libraries)。我们不会讲解所有这些（因为它们有许多重叠的东西），但它们都是应当出现在你视野中的东西：

* [Ramda](http://ramdajs.com)：常规 FP 工具
* [Sanctuary](https://github.com/sanctuary-js/sanctuary)：Ramda 的 FP 类型伴侣
* [lodash/fp](https://github.com/lodash/lodash/wiki/FP-Guide)：常规 FP 工具
* [functional.js](http://functionaljs.com/)：常规 FP 工具
* [Immutable](https://github.com/facebook/immutable-js)：不可变数据结构
* [Mori](https://github.com/swannodette/mori)：（受 ClojureScript 启发的）不可变数据结构
* [Seamless-Immutable](https://github.com/rtfeldman/seamless-immutable)：不可变数据帮助工具
* [transducers-js](https://github.com/cognitect-labs/transducers-js)： Transducers
* [monet.js](https://github.com/monet/monet.js)：单子类型

还有几十种其他优秀的库没有罗列在这里。不在我的列表中不意味着它不好，这个列表也不是一种特殊的担保。它只是对 JavaScript 中 FP 风景的一瞥。一个长得多的 FP 资源列表可以在[这里找到](https://github.com/stoeffel/awesome-fp-js)。

一个对于 FP 世界来说极其重要的资源是 —— 它不是一个库而更像一部百科全书！—— [Fantasy Land](https://github.com/fantasyland/fantasy-land)（也成为 FL）。

这绝对不是为胆小鬼准备的轻量阅读。它是一切 FP 被翻译为 JavaScript 时的完整详细的路线图。为了确保最大的互换性，FL 实质上已经成为了 JavaScript FP 库遵循的标准。

Fantasy Land 正是 “轻量函数式” 的反面。它是在 JavaScript 中无限接近 FP。也就是说，在你超越这本书继续自己的冒险时，FL 很可能会出现在你的旅途中。我建议你把它加入收藏夹，而且当你在现实世界中将这本书中的概念实践了最少六个月以后再回头来看它。

## Ramda (0.23.0)

源自 [Ramda 文档](http://ramdajs.com/):

> Ramda 的函数都是自动被柯里化的。
>
> Ramda 函数的形式参数被安排为便于柯里化。需要被操作的数据一般都在最后被提供。

我觉得这种设计决策是 Ramda 的优势之一。另外需要注意的是，Ramda 的柯里化形式是（而且看起来大多数库都是）[我们在第三章中谈到的 “宽松柯里化”](ch3.md/#user-content-loosecurry)。

[第三章中的最后一个例子](ch3.md/#user-content-finalshortlong) —— 定义一个无点的 `printIf(..)` 工具 —— 可以使用 Ramda 这样完成：

```js
function output(msg) {
    console.log( msg );
}

function isShortEnough(str) {
    return str.length <= 5;
}

var isLongEnough = R.complement( isShortEnough );

var printIf = R.partial( R.flip( R.when ), [output] );

var msg1 = "Hello";
var msg2 = msg1 + " World";

printIf( isShortEnough, msg1 );            // Hello
printIf( isShortEnough, msg2 );

printIf( isLongEnough, msg1 );
printIf( isLongEnough, msg2 );            // Hello World
```

与[第三章的方式](ch3.md/#user-content-finalshortlong)相比，有几个需要指出的不同：

* 我们使用 `R.complement(..)` 取代 `not(..)` 来在 `isShortEnough(..)` 外层创建一个否定函数 `isLongEnough(..)`。

* 我们使用 `R.flip(..)` 取代 `reverseArgs(..)`。要注意的是 `R.flip(..)` 仅仅调换前两个参数，而 `reverseArgs(..)` 会翻转所有的。在这种情况下，`flip(..)` 对我们来说更方便，所以我们不需要做 `partialRight(..)` 或任何同种类的调整。

* `R.partial(..)` 将所有后续（函数之后的）参数接收为一个数组。

* 因为 Ramda 使用宽松柯里化，我们不必使用 `R.uncurryN(..)` 来得到一个同时接收两个参数的 `printIf(..)`。如果我们这么做，它看起来会像是 `R.uncurryN( 2, .. )` 包裹着 `R.partial(..)` 调用；但这是不必要的。

Ramda 是一个非常流行且强大的库。如果你想练习将 FP 引入你的代码库，它将是一个非常好的起点。

## Lodash/fp (4.17.4)

Lodash 是在整个 JS 生态中最受欢迎的库之一。他们发布了一个 “FP 友好” 版本的 API，称为 ["lodash/fp"](https://github.com/lodash/lodash/wiki/FP-Guide)。

在[第九章中，我们看到了组合独立列表操作](ch9.md/#composing-standalone-utilities) （`map(..)`、`filter(..)`、和 `reduce(..)`）。这是我们如何使用 “lodash/fp” 来完成相同的任务：

```js
var sum = (x,y) => x + y;
var double = x => x * 2;
var isOdd = x => x % 2 == 1;

fp.compose( [
    fp.reduce( sum )( 0 ),
    fp.map( double ),
    fp.filter( isOdd )
] )
( [1,2,3,4,5] );                    // 18
```

与人们更熟悉的 `_.` 名称空间前缀不同，"lodash/fp" 将 `fp.` 作为名称空间前缀来定义它的方法。我觉得这种区分很有帮助，而且与 `_.` 比起来通常更易于我的眼睛分辨！

注意，`fp.compose(..)`（在 lodash 中也被称为 `_.flowRight(..)`）接收一个函数的数组，而不是独立的参数。

你无法击败 lodash 的稳定性，广泛的社区支持，以及性能。它是你 FP 探索旅途中最可靠的赌注。

## Mori (0.3.2)

在[第六章](ch6.md)中，我们已经简要地看过了 Immutable.js 库，对于不可变数据结构来说，它可能是最广为人知的。

让我们看看另一个很流行的库：[Mori](https://github.com/swannodette/mori)。Mori 被设计为呈现一种不同的（表面上更像 FP 的） API：它使用独立函数，而不是直接在值上使用方法。

```js
var state = mori.vector( 1, 2, 3, 4 );

var newState = mori.assoc(
    mori.into( state, Array.from( {length: 39} ) ),
    42,
    "meaning of life"
);

state === newState;                        // false

mori.get( state, 2 );                    // 3
mori.get( state, 42 );                    // undefined

mori.get( newState, 2 );                // 3
mori.get( newState, 42 );                // "meaning of life"

mori.toJs( newState ).slice( 1, 3 );    // [2,3]
```

在这个例子中，需要指出一些关于 Mori 的有趣的事情：

* 我们使用了一个 `vector` 而不是一个（人们可能假设的）`list`，这主要是因为文档上说它的行为要比我们所期待的更像一个 JS 数组。

* 我们不能像对 JS 数组那样随机地设置一个超出向量末尾的位置；那样会抛出一个异常。所以我们不得不首先使用 `mori.into(..)` 和一个拥有恰当多值槽的数组来 “增长” 这个向量。一旦我们获得一个拥有 43（4 + 39）个值槽的向量，我们就可以使用 `mori.assoc(..)` 方法将它最后的值槽（位置 `42`）设置为值 `"meaning of life"`。

* 使用 `mori.into(..)` 来创建一个大向量的中间步骤，以及之后使用 `mori.assoc(..)` 从中创建另一个向量可能看起来很低效。但是不可变数据结构的优美之处就在于这里没有发生克隆。每次发生一个 “改变” 时，新的数据结构就会追踪与之前状态的区别。

Mori 是很大程度上受到 ClojureScript 的启发的。如果你有这种语言的经验（或者正在使用！），那么对你来说它的 API 就非常令人熟悉。因为我没有这种经验，所以我觉得方法的名称要熟悉起来有点儿奇怪。

但是与值上面的方法相比，我很喜欢这种独立函数的设计。Mori 还有一些自动返回常规 JS 数组的函数，这非常方便。

## 福利：FPO

在[第二章中我们介绍了一种模式](ch2.md/#named-arguments)，用来处理称为 “命名实际参数” 的参数，在 JS 中这意味着在调用点使用一个对象将属性映射到被解构的函数形式参数上：

```js
function foo( {x,y} = {} ) {
    console.log( x, y );
}

foo( {
    y: 3
} );                    // undefined 3
```

然后在[第三章中，我们谈到了将我们的想法扩展](ch3.md/#order-matters)至柯里化和局部应用，以使它们能够利用命名实际参数，就像这样：

```js
function foo({ x, y, z } = {}) {
    console.log( `x:${x} y:${y} z:${z}` );
}

var f1 = curryProps( foo, 3 );

f1( {y: 2} )( {x: 1} )( {z: 3} );
```

这种风格的一个主要的好处是能够以任意顺序传递参数（即使是对柯里化和局部应用！），不必使用 `reverseArgs(..)` 来搬弄形式参数。另一个好处是可以通过不指定来省略一个可选的参数，而不必传递一个难看的占位符。

在我学习 FP 的旅程中，用位置指定参数的传统函数总是用这两件恼人之事把我弄得沮丧不堪；因此我真的非常感激命名实际参数风格解决了这些问题。

一天，我正在沉思这种 FP 的编码风格，想知道如果有一个库，它所有的 API 方法都用这种方式暴露出来会是什么样子。我开始试验，将这些试验给一些 FP 的朋友们看，并得到了一些正面的反馈。

从这些实验中，最终诞生了 [FPO](https://github.com/getify/fpo) （发音为：“eff-poh”）库；FPO 代表 FP-with-Objects，如果你想知道的话。

摘自文档：

```js
// Ramda 的 `reduce(..)`
R.reduce(
    (acc,v) => acc + v,
    0,
    [3,7,9]
);  // 19

// FPO 命名实际参数方法风格
FPO.reduce({
    arr: [3,7,9],
    fn: ({acc,v}) => acc + v
}); // 19
```

在传统库（比如 Ramda）的 `reduce(..)` 实现中，初始值的形式参数位于中间，而且不是可选的。FPO 的 `reduce(..)` 方法可以以任意顺序接收参数，而且如果你乐意的话可以省略可选的初始值。

和其他大多数 FP 库一样，FPO 的 API 方法是自动宽松柯里化的，所以你不仅可以用任意的顺序提供参数，而且还可以通过多个调用为它提供参数来特化函数：

```js
var f = FPO.reduce({ arr: [3,7,9] });

// 稍后

f({ fn: ({acc,v}) => acc + v });    // 19
```

最后，所有 FPO 的 API 方法还在 `FPO.std.*` 名称空间下，通过传统的用位置指定参数的风格暴露出来 —— 你会发现它们与 Ramda 和其他库都很相似：

```js
FPO.std.reduce(
    (acc,v) => acc + v,
    undefined,
    [3,7,9]
);  // 19
```

如果 FPO 的命名实际参数形式 FP 很吸引你，也许你可以看看这个库并得出自己的想法。它有一组完整的测试套件，以及你所期望的大多数主要 FP 功能，包括我们在这本书中所讲解的、帮助你入门轻量函数式 JavaScript 的一切！

## 福利 #2：fasy

FP 迭代（`map(..)`, `filter(..)` 等等）几乎总是被模型化为同步操作，这意味着我们立即急切地运行迭代中所有的步骤。事实上，其他的 FP 模式，比如组合甚至 transducing 也是迭代，而且也都正是用这种方式模型化的。

但如果一次迭代步骤中的一步或几步需要异步地完成呢？你可能会认为 Observable（见[第十章](ch10.md/#observables)）是自然的答案，但它们不是我们需要的。

让我快速展示一下。

想象你有一个 URL 的列表，表示你想要加载到网页上的图片。很明显，图片的取得是异步的。所以，这工作起来不会和你希望的十分相像：

```js
var imageURLs = [
    "https://some.tld/image1.png",
    "https://other.tld/image2.png",
    "https://various.tld/image3.png"
];

var images = imageURLs.map( fetchImage );
```

`images` 数组不会包含图片。根据 `fetchImage(..)` 的行为，它可能返回一个 promise，在图片完成下载后提供一个图片对象。所以 `image` 将会成为一个 promise 的列表。

当然，你可以之后使用 `Promise.all(..)` 等待所有这些 promise 解析，然后在它完成时展开一个图片对象的数组：

```js
Promise.all( images )
.then(function allImages(imgObjs){
    // ..
});
```

不幸的是，这个 “技巧” 仅在你并发地（不是一个接一个串行地）执行所有异步步骤，而且仅在操作是一个像上面展示的 `map(..)` 时可以工作。如果想要串行异步，或者例如你想要并发地执行 `filter(..)`，这就不能工作；这是可能的，但是更混乱。

而且一些操作天然地要求串行异步，例如一个异步 `reduce(..)`，它显然需要从左至有一个一个地处理；这些步骤无法并发地运行，那样也不会有任何意义。

就像我说的，Observable（见[第十章](ch10.md/#observables)）不是这些问题的答案。究其原因，一个 Observable 协调的是对分离操作间的异步，而非一个单独操作中的步骤/迭代之间的异步。

另一种将这种区别可视化的方式是，Observable 支持 “纵向异步”，而我想说的是 “水平异步”。

考虑如下代码：

```js
var obsv = Rx.Observable.from( [1,2,3,4,5] );

obsv
.map( x => x * 2 )
.delay( 100 )        // <-- 纵向异步
.map( x => x + 1 )
.subscribe( v => console.log );
// {after 100 ms}
// 3
// 5
// 7
// 9
// 11
```

如果为了某些原因我想要在 `1` 被第一个 `map(..)` 处理的时间点和 `2` 被处理的时间点之间确保一个 100 毫秒的延迟，那么这就是我所指的 “水平异步”。确实没有一种干净的方法模型化这种东西。

当然，我在这个描述中使用的是一个很随意的 delay，但在实践中更可能是一个类似异步递减的串行异步，在它的异步递减中的每一个步骤都可能花一些时间才能完成，之后才能让下一个步骤被处理。

那么，我们如何才能在异步操作上支持串行和并发迭代呢？

**fasy**（读音像 “Tracy” 但以 “f” 开头）正是我为这类问题建造的一个小型工具库。你可以在[这里](https://github.com/getify/fasy)找到关于它的更多信息。

为了展示一下 **fasy**，让我们考虑一个并发 `map(..)` 和一个串行 `map(..)` 的对比：

```js
FA.concurrent.map( fetchImage, imageURLs )
.then( function allImages(imgObjs){
    // ..
} );

FA.serial.map( fetchImage, imageURLs )
.then( function allImages(imgObjs){
    // ..
} );
```

在这两种情况下，`then(..)` 处理器都将仅在所有下载完全完成之后被调用一次。区别是下载是否将同时并发地（也就是 “并行”）被发起还是一次一个地进行。

你的直觉可告诉你并发总是好一些，虽然这常常是对的，但却不总是这样。

例如，如果 `fetchImage(..)` 维护着下载好的图片的缓存，在实际发起网络请求之前检查这个缓存呢？另外，如果 `imageURLs` 列表在其中存在重复呢？你当然会希望一个图片 URL 的下载首先完成（并填充缓存），然后再在这个列表中检查重复的图片 URL。

同样，将会不可避免地存在要求并发或串行异步的情况。异步递减将总是串行的，而异步映射可能更趋于并发但在某些情况下也需要是串行的。这就是为什么 **fasy** 支持所有这些操作。

与 Observable 一起，**fasy** 将帮助你为你的异步操作扩展出更多 FP 模式和原理。

## 总结

JavaScript 没有被特意设计为一种 FP 语言。然而，它确实拥有让我们使它变为 FP 友好的基础（比如函数值，闭包，等等）。我们在这里检视的库将帮助你做到这一点。

武装着这本书中的概念，你已经准备好了对付现实世界的代码。找一个优秀、舒适的 FP 库扎进去。练习、练习、练习！

那么…… 就是这样。我已经分享了目前我为你准备的一切。我特此正式授予你 “轻量函数式 JavaScript” 程序员的称号！在我们一起学习 FP 的故事中，这一 “章” 就要结束了。但是我的旅途仍在继续；我希望你的也是！
