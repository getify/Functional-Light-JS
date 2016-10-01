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


