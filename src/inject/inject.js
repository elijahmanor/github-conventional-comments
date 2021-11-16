const LABELS = ['Praise', 'Nitpick', 'Issue', 'Question', 'Thought', 'Chore'];

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
