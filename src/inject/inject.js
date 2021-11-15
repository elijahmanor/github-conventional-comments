// https://conventionalcomments.org/

const LABELS = ['Praise', 'Nitpick', 'Issue', 'Question', 'Thought', 'Chore'];

const getRawComment = (comment) => {
    const matches = comment.match(/.*: (.*)/);
    return matches ? matches[1] : comment;
};

const updateComment = (label, decorations) => {
    const comment = document.querySelector('#new_comment_field');
    const rawComment = getRawComment(comment.value);
    comment.value = `${label} (${decorations}): ${rawComment || ''}`;
};

chrome.runtime.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === 'complete') {
            clearInterval(readyStateCheckInterval);

            const controls = document.createElement('div');
            controls.innerHTML = `
                <select class=''>
                    <option value=''>None</option>
                    ${LABELS.map(
                        (l) => `<option value='${l}'>${l}</option>`
                    ).join('')}
                </select>
                <input class='' type='text' placeholder="blocking" />
            `;
            controls.className = 'GitHubConventionalComments-controls';
            const label = controls.querySelector('select');
            const decorations = controls.querySelector('input');
            decorations.addEventListener('keyup', (e) => {
                updateComment(label.value, e.target.value);
            });
            label.addEventListener('change', (e) => {
                updateComment(e.target.value, decorations.value);
            });
            document
                .querySelector('.js-new-comment-form .comment-form-head')
                .insertAdjacentElement('afterend', controls);

            const trigger = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
            trigger.innerHTML = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.00136 5H18.9986C18.9989 5 18.9991 5 18.9992 5.00001C18.9994 5.00016 18.9997 5.00038 19 5.00066C19 5.00067 19 5.00067 19 5.00068V13.7085H11.9976C11.3708 13.7085 10.7802 14.0024 10.4022 14.5024L8.06345 17.5963L7.6365 15.3371C7.45798 14.3925 6.63263 13.7085 5.67128 13.7085H5V5.00068C5.00001 5.00067 5.00001 5.00067 5.00002 5.00066C5.0003 5.00038 5.00055 5.00016 5.00075 5.00001C5.00093 5 5.00113 5 5.00136 5Z" stroke="currentColor" stroke-width="2"/>
                </svg>`;
            trigger.className = 'GitHubConventionalComments-trigger';
            trigger.addEventListener('click', () => {
                controls.classList.toggle('is-open');
                trigger.classList.toggle('is-open');
                window.setTimeout(() => {
                    controls.querySelector('select').focus();
                }, 100);
            });
            document
                .querySelector(
                    '.js-new-comment-form markdown-toolbar div:nth-child(5)'
                )
                .appendChild(trigger);

            console.log('Hello. This message was sent from scripts/inject.js');
        }
    }, 10);
});
