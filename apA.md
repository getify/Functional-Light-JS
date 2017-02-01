# Functional-Light JavaScript
# Appendix A: Transducing

Transducing means transforming with reduction.

Example:

```js
function compose(fn2,fn1) {
	return function composed(...args){
		return fn2( fn1( ...args ) );
	};
}

function listCombination(list,v) {
	list.push( v );
	return list;
}

function filterReducer(predicateFn) {
	return function toCombine(combineFn){
		return function reducer(list,v){
			if (predicateFn( v )) combineFn( list, v );
			return list;
		};
	}
}

function isLongEnough(str) { return str.length >= 5; }
function isShortEnough(str) { return str.length <= 10; }

var words = [ "You", "have", "written", "something", "very", "interesting" ];

// words
// .filter( isLongEnough )
// .filter( isShortEnough );


// words
// .reduce( filterReducer( isLongEnough ), [] )
// .reduce( filterReducer( isShortEnough ), [] );


words
.reduce(
	compose(
		filterReducer( isShortEnough ),
		filterReducer( isLongEnough )
	)( listCombination ),
	[]
);
```

## Summary

To transduce means to transform + reduce.

More practically, we use transducing to compose adjacent `map(..)`, `filter(..)`, and `reduce(..)` operations together. We accomplish this by first expressing `map(..)`s and `filter(..)`s as `reduce(..)`s.

A transducer is the composition of multiple adjacent reducers. Composing reducers can't just be done naively with `compose(..)` because of the multiple-parameters signature of a reducer. So we have to abstract the combination step -- taking two values and combining them into one -- so it can be parameterized.

Transducing primarily improves performance, which is especially obvious if used on a lazy sequence (async observable). But more broadly, transducing is how we express a more declarative composition of functions that would otherwise not be composable.
