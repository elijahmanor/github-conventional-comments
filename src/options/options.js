const LIST_WRAPPER = document.querySelector('.Options-addItemWrapper');
const LIST = LIST_WRAPPER.querySelector('ul');

const createList = (labels) => {
	LIST.innerHTML = `${labels
		.map((item) => `<li id=${item}><span>&#10005; </span>${sentenceCase(item)}</li>`)
		.join('')}`;
};

let labelsStore;
chrome.storage.sync.get('labels', (result) => {
	labelsStore = result.labels;
	createList(result.labels);
});

LIST.addEventListener('click', (e) => {
	const target = e.target;
	if (target.closest('span')) {
		labelsStore = labelsStore.filter(
			(item) => item !== target.closest('li').id
		);
		target.closest('li').remove();
		chrome.storage.sync.set({ labels: labelsStore });
	}
});

document.querySelector('button').addEventListener('click', (e) => {
	const target = e.target;
	const input = target
		.closest('.Options-actionsWrapper')
		.querySelector('input');
	const li = document.createElement('li');

	li.innerHTML = `<span>&#10005; </span>${input.value}`;
	LIST.appendChild(li);
	labelsStore.push(input.value.toLocaleLowerCase());
	const collator = new Intl.Collator('en', { sensitivity: 'base' });
	labelsStore.sort(collator.compare);
	createList(labelsStore);
	chrome.storage.sync.set({ labels: labelsStore });
	input.value = '';
});
