const createList = labels => {
	const list = document.querySelector( "#list" );
	list.innerHTML = `${ labels.map( item => {
		const listItem = `<li id=${ item }>${ item }</li>`;
		// listItem.addEventListener( "click", e => {
		// 	console.log( "item click" );
		// 	e.target.remove();
		// } );
		return listItem;
	} ).join('') }`;
};

chrome.storage.sync.get( "labels", function(result) {
	document.querySelector( "#labels" ).value = result.labels;
	console.log( "here:", result.labels );
	createList( result.labels );
});

const labelArea = document.querySelector( "#labels" );
labelArea.addEventListener( "blur", () => {
	// probably need to make this more smarter. :)
	chrome.storage.sync.set( { labels: labelArea.value.split(",").map( item => item.trim() ) } );
} );

document.getElementById("list").addEventListener( 'click', e => {
    var target = e.target;
    if (target.tagName == "LI") {
      target.parentNode.removeChild( target );
    }
} );
