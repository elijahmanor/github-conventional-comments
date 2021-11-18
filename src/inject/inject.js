const DEFAULT_LABELS = [
	'chore',
	'issue',
	'nitpick',
	'praise',
	'question',
	'suggestion',
	'thought',
];
let LABELS = DEFAULT_LABELS;

const ROUTE_MATCH = {
	'pull/#': {
		triggerSelector:
			'.js-new-comment-form markdown-toolbar div:nth-child(5)',
		controlsSelector: '.js-new-comment-form .comment-form-head',
		commentSelector: '#new_comment_field',
		async init() {
			const element = await waitForElement('#new_comment_field');
			if (element) {
				buildView();
			}
		},
	},
	'pull/#/files': {
		triggerSelector: 'markdown-toolbar div:nth-child(6)',
		controlsSelector: '.comment-form-head',
		commentSelector: '[name="comment[body]"]',
		init(e) {
			buildView(getActiveForm(e));
		},
	},
};

chrome.storage.sync.get('labels', function (result) {
	LABELS = result.labels || DEFAULT_LABELS;
	const selectors = getSelectors();
	if (!selectors) {
		return;
	}
	const controls = document.querySelector(selectors.controlsSelector);
	const select = controls.querySelector('select');
	if (controls && select) {
		const prevSelect = select.value;
		select.innerHTML = `
			<option value=''>No Label</option>
			<option disabled>--------</option>
			${LABELS.map((l) => `<option value='${l}'>${sentenceCase(l)}</option>`).join(
				''
			)}
		`;
		select.value = prevSelect;
	}
});

chrome.storage.onChanged.addListener((changes, area) => {
	if (area === 'sync' && changes.labels?.newValue) {
		LABELS = changes.labels.newValue;
		const controls = document.querySelector(
			'.GitHubConventionalComments-controls'
		);
		const select = controls.querySelector('select');
		const prevSelect = select.value;
		select.innerHTML = `
            <option value=''>No Label</option>
            <option disabled>--------</option>
            ${LABELS.map(
				(l) => `<option value='${l}'>${sentenceCase(l)}</option>`
			).join('')}
        `;
		select.value = prevSelect;
	}
});

const getPath = () => {
	let [, path] =
		window.location.href.match(/github.com.*\/(pull\/\d+(\/.*)?)/) || [];
	return path?.replace(/\d+/, '#');
};

const getSelectors = () => ROUTE_MATCH[getPath()];

const buildView = (root = document) =>
	createAndAppend({
		root,
		...getSelectors(),
	});

chrome.runtime.sendMessage({}, () => {
	let url = location.href;
	document.body.addEventListener('click', (e) => {
		requestAnimationFrame(async () => {
			const target = e.target;
			const path = getPath();
			if (url !== location.href) {
				url = location.href;
				path === 'pull/#' && ROUTE_MATCH[path].init(e);
			} else {
				if (
					target.closest('.js-add-line-comment') &&
					path === 'pull/#/files'
				) {
					ROUTE_MATCH[path].init(e);
				}
			}
		});
	});

	const readyStateCheckInterval = setInterval(function () {
		if (document.readyState === 'complete') {
			clearInterval(readyStateCheckInterval);
			if (getPath() === 'pull/#') {
				ROUTE_MATCH[getPath()].init();
			}
		}
	}, 10);
});
