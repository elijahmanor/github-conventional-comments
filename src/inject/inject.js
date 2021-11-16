// https://conventionalcomments.org/

const LABELS = ['Praise', 'Nitpick', 'Issue', 'Question', 'Thought', 'Chore'];

const getRawComment = (comment) => {
    const matches = comment.match(/.*: (.*)/);
    return matches ? matches[1] : comment;
};
const updateComment = (comment, label, decorations) => {
    const rawComment = getRawComment(comment.value);
    comment.value = label
        ? `${label}${decorations ? ` (${decorations})` : ''}: ${
              rawComment || ''
          }`
        : rawComment;
};
const getLabelAndDecorations = (comment) => {
    const [, label, decorations] = comment.match(/(.*) \((.*)\): (.*)/) || [];
    return { label, decorations };
};
const createControls = ({ comment }) => {
    const controls = document.createElement('div');
    controls.innerHTML = `
        <select class=''>
            <option value=''>No Label</option>
            <option disabled>--------</option>
            ${LABELS.map((l) => `<option value='${l}'>${l}</option>`).join('')}
        </select>
        <input class='' type='text' placeholder="Decorations" />
    `;
    controls.className = 'GitHubConventionalComments-controls';
    const label = controls.querySelector('select');
    const decorations = controls.querySelector('input');
    decorations.addEventListener('keyup', (e) => {
        updateComment(comment, label.value, e.target.value);
    });
    label.addEventListener('change', (e) => {
        updateComment(comment, e.target.value, decorations.value);
    });
    return controls;
};
const createTrigger = ({ comment, controls }) => {
    const trigger = document.createElementNS(
        'http://www.w3.org/1999/xhtml',
        'div'
    );
    trigger.ariaLabel = 'Conventional Comments';
    trigger.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.00136 5H18.9986C18.9989 5 18.9991 5 18.9992 5.00001C18.9994 5.00016 18.9997 5.00038 19 5.00066C19 5.00067 19 5.00067 19 5.00068V13.7085H11.9976C11.3708 13.7085 10.7802 14.0024 10.4022 14.5024L8.06345 17.5963L7.6365 15.3371C7.45798 14.3925 6.63263 13.7085 5.67128 13.7085H5V5.00068C5.00001 5.00067 5.00001 5.00067 5.00002 5.00066C5.0003 5.00038 5.00055 5.00016 5.00075 5.00001C5.00093 5 5.00113 5 5.00136 5Z" stroke="currentColor" stroke-width="2"/>
        </svg>`;
    trigger.className =
        'GitHubConventionalComments-trigger toolbar-item tooltipped tooltipped-sw';
    trigger.addEventListener('click', () => {
        controls.classList.toggle('is-open');
        trigger.classList.toggle('is-open');

        const options = getLabelAndDecorations(comment.value);
        controls.querySelector('select').value = options.label || '';
        controls.querySelector('input').value = options.decorations || '';

        setTimeout(() => {
            controls.querySelector('select').focus();
        }, 100);
    });
    return trigger;
};
const getActiveForm = (e) => {
    const tr = e.target.closest('tr');
    const next = tr.nextElementSibling;
    return next;
};
const createAndAppend = ({
    root = document,
    triggerSelector,
    controlsSelector,
    commentSelector,
}) => {
    const comment = root.querySelector(commentSelector);
    const controls = createControls({ comment });
    const trigger = createTrigger({ comment, controls });
    root.querySelector(controlsSelector).insertAdjacentElement(
        'afterend',
        controls
    );
    root.querySelector(triggerSelector).appendChild(trigger);
};
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
const waitForElement = (
    selector,
    { timeout = Number.POSITIVE_INFINITY } = {}
) => {
    let element = null;
    let rafId;
    return new Promise((resolve) => {
        const stop = (element) => {
            cancelAnimationFrame(rafId);
            resolve(element);
        };
        if (timeout !== Number.POSITIVE_INFINITY) {
            setTimeout(stop, timeout);
        }
        (function check() {
            element = document.querySelector(selector);
            if (element) {
                stop(element);
                return;
            }
            rafId = requestAnimationFrame(check);
        })();
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
