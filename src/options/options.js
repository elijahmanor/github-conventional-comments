const LIST = document.querySelector("#list");
const createList = labels => {
	const list = document.querySelector( "#list" );
	list.innerHTML = `${ labels.map( item => {
		const listItem = `<li id=${ item }><span>&#10005; </span>${ item }</li>`;
		return listItem;
	} ).join('') }`;
};

let localStorage;
chrome.storage.sync.get( "labels", result => {
	localStorage = result.labels;
	createList( result.labels );
});

LIST.addEventListener( 'click', e => {
	var target = e.target;
	if (target.tagName.toLowerCase() == "span") {
		localStorage = localStorage.filter( item => item !== target.closest("li").textContent.split( ` ` )[ 1 ] );
		target.closest("li").remove();
		chrome.storage.sync.set( { labels: localStorage } );
	}
} );

document.querySelector("button").addEventListener( 'click', e => {
  var target = e.target;
  var input = target.closest(".container").querySelector("input");
  var li = document.createElement("li");

  li.innerHTML = `<span>&#10005; </span>${ input.value }`;

  LIST.appendChild(li);
  localStorage.push( input.value );

  chrome.storage.sync.set( { labels: localStorage } );
  input.value = '';
});
