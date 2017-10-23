"use strict";

var stockTickerUI = {

	updateStockElems(stockInfoChildElemList,data) {
		var getDataVal = curry( reverseArgs( prop ), 2 )( data );
		var extractInfoChildElemVal = pipe(
			getClassName,
			curry( stripPrefix )( /\bstock-/i ),
			getDataVal
		);
		var orderedDataVals =
			map( extractInfoChildElemVal )( stockInfoChildElemList );
		var elemsValsTuples =
			filterOut( function updateValueMissing([infoChildElem,val]){
				return val === undefined;
			} )
			( zip( stockInfoChildElemList, orderedDataVals ) );

		// !!SIDE EFFECTS!!
		compose( each, spreadArgs )( setDOMContent )
		( elemsValsTuples );
	},

	updateStock(tickerElem,data) {
		var getStockElemFromId = curry( getStockElem )( tickerElem );
		var stockInfoChildElemList = pipe(
			getStockElemFromId,
			getStockInfoChildElems
		)
		( data.id );

		return stockTickerUI.updateStockElems(
			stockInfoChildElemList,
			data
		);
	},

	addStock(tickerElem,data) {
		var [stockElem, ...infoChildElems] = map(
			createElement
		)
		( [ "li", "span", "span", "span" ] );
		var attrValTuples = [
			[ ["class","stock"], ["data-stock-id",data.id] ],
			[ ["class","stock-name"] ],
			[ ["class","stock-price"] ],
			[ ["class","stock-change"] ]
		];
		var elemsAttrsTuples =
			zip( [stockElem, ...infoChildElems], attrValTuples );

		// !!SIDE EFFECTS!!
		each( function setElemAttrs([elem,attrValTupleList]){
			each(
				spreadArgs( partial( setElemAttr, elem ) )
			)
			( attrValTupleList );
		} )
		( elemsAttrsTuples );

		// !!SIDE EFFECTS!!
		stockTickerUI.updateStockElems( infoChildElems, data );
		reduce( appendDOMChild )( stockElem )( infoChildElems );
		appendDOMChild( tickerElem, stockElem );
	}

};

var getDOMChildren = pipe(
	listify,
	flatMap(
		pipe(
			curry( prop )( "childNodes" ),
			Array.from
		)
	)
);
var createElement = document.createElement.bind( document );
var getElemAttrByName = curry( getElemAttr, 2 );
var getStockId = getElemAttrByName( "data-stock-id" );
var getClassName = getElemAttrByName( "class" );
var isMatchingStock = curry( matchingStockId, 2 );
var ticker = document.getElementById( "stock-ticker" );
var stockTickerUIMethodsWithDOMContext = map(
	curry( partialRight, 2 )( ticker )
)
( [ stockTickerUI.addStock, stockTickerUI.updateStock ] );
var subscribeToObservable =
	pipe( unboundMethod, uncurry )( "subscribe" );
var stockTickerObservables = [ newStocks, stockUpdates ];

// !!SIDE EFFECTS!!
each( spreadArgs( subscribeToObservable ) )
( zip( stockTickerUIMethodsWithDOMContext, stockTickerObservables ) );


// *********************

function stripPrefix(prefixRegex,val) {
	return val.replace( prefixRegex, "" );
}

function listify(listOrItem) {
	if (!Array.isArray( listOrItem )) {
		return [ listOrItem ];
	}
	return listOrItem;
}

function isTextNode(node) {
	return node && node.nodeType == 3;
}

function getElemAttr(prop,elem) {
	return elem.getAttribute( prop );
}

function setElemAttr(elem,prop,val) {
	// !!SIDE EFFECTS!!
	return elem.setAttribute( prop, val );
}

function matchingStockId(id,node) {
	return getStockId( node ) == id;
}

function isStockInfoChildElem(elem) {
	return /\bstock-/i.test( getClassName( elem ) );
}

function getStockElem(tickerElem,stockId) {
	return pipe(
		getDOMChildren,
		filterOut( isTextNode ),
		filterIn( isMatchingStock( stockId ) )
	)
	( tickerElem );
}

function getStockInfoChildElems(stockElem) {
	return pipe(
		getDOMChildren,
		filterOut( isTextNode ),
		filterIn( isStockInfoChildElem )
	)
	( stockElem );
}

function appendDOMChild(parentNode,childNode) {
	// !!SIDE EFFECTS!!
	parentNode.appendChild( childNode );
	return parentNode;
}

function setDOMContent(elem,html) {
	// !!SIDE EFFECTS!!
	elem.innerHTML = html;
	return elem;
}
