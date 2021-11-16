const DEFAULT_LABELS = ['Praise', 'Nitpick', 'Issue', 'Question', 'Thought', 'Chore'];
let LABELS = DEFAULT_LABELS;

chrome.storage.sync.get( "labels", function(result) {
	LABELS = result.labels || DEFAULT_LABELS;
} );

chrome.storage.sync.set( { labels: LABELS } )

chrome.storage.onChanged.addListener( ( changes, area ) => {
    console.log( "stuff:", changes, area );
    if (area === 'sync' && changes.labels?.newValue) {
        console.log( "inside" );
        LABELS = changes.labels.newValue;
        const controls = document.querySelector( '.GitHubConventionalComments-controls' );
        const select = controls.querySelector( 'select' );
        const prevSelect = select.value;
        select.innerHTML = `
            <option value=''>No Label</option>
            <option disabled>--------</option>
            ${LABELS.map((l) => `<option value='${l}'>${l}</option>`).join('')}
        `;
        select.value = prevSelect;
    }
});

const buildConversationView = () =>
    createAndAppend({
        triggerSelector:
            '.js-new-comment-form markdown-toolbar div:nth-child(5)',
        controlsSelector: '.js-new-comment-form .comment-form-head',
        commentSelector: '#new_comment_field',
    });
const buildFilesChangedView = (e) => {
    const activeForm = getActiveForm(e);
    createAndAppend({
        root: activeForm,
        triggerSelector: 'markdown-toolbar div:nth-child(6)',
        controlsSelector: '.comment-form-head',
        commentSelector: '[name="comment[body]"]',
    });
};

chrome.runtime.sendMessage({}, (response) => {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === 'complete') {
            clearInterval(readyStateCheckInterval);
            if (document.querySelector('.js-new-comment-form')) {
                buildConversationView();
            }
            document
                .querySelector('.repository-content')
                .addEventListener('click', async (e) => {
                    const target = e.target;
                    if (target.closest('.js-add-line-comment')) {
                        requestAnimationFrame(() => buildFilesChangedView(e));
                    }
                    if (
                        target.closest('.tabnav-tab') &&
                        /\/pull\/\d+$/.test(target.href)
                    ) {
                        (await waitForElement('#new_comment_field')) &&
                            buildConversationView();
                    }
                });
        }
    }, 10);
});
