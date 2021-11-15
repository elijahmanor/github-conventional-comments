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
                <input class='' type='text' />
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

            const trigger = document.createElement('div');
            // const image = document.createElement("img");
            // image.src =  chrome.runtime.getURL('images/comment.png');
            // trigger.appendChild(image);
            trigger.innerText = '';
            trigger.className = 'GitHubConventionalComments-trigger';
            trigger.addEventListener('click', () => {
                controls.classList.toggle('is-open');
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
