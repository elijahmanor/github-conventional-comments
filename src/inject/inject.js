// https://conventionalcomments.org/

const LABELS = ['Praise', 'Nitpick', 'Issue', 'Question', 'Thought', 'Chore'];

const getRawComment = (comment) => {
    const matches = comment.match(/.*: (.*)/);
    return matches ? matches[1] : comment;
};
const updateComment = (label, decorations) => {
    const comment = document.querySelector('#new_comment_field');
    const rawComment = getRawComment(comment.value);
    comment.value = `${label}${decorations ? ` (${decorations})` : ''}: ${
        rawComment || ''
    }`;
};
const getLabelAndDecorations = (comment) => {
    const [, label, decorations] = comment.match(/(.*) \((.*)\): (.*)/) || [];
    return { label, decorations };
};
const createControls = () => {
    const controls = document.createElement('div');
    controls.innerHTML = `
        <select class=''>
            <option value=''>None</option>
            ${LABELS.map((l) => `<option value='${l}'>${l}</option>`).join('')}
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
    return controls;
};
const createTrigger = (controls) => {
    const trigger = document.createElementNS(
        'http://www.w3.org/1999/xhtml',
        'div'
    );
    trigger.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.00218 4.5H20.9978C21.2754 4.5 21.5 4.72528 21.5 5V15.8C21.5 16.0761 21.2761 16.3 21 16.3H9.36275C8.901 16.3 8.46498 16.5127 8.18071 16.8765L6.76901 18.6835C6.56883 18.9397 6.18117 18.9397 5.98099 18.6835L4.56929 16.8765C4.28502 16.5127 3.849 16.3 3.38725 16.3H3C2.72386 16.3 2.5 16.0761 2.5 15.8V5C2.5 4.72528 2.72462 4.5 3.00218 4.5Z" stroke="currentColor"/>
        </svg>`;
    trigger.className = 'GitHubConventionalComments-trigger';
    trigger.addEventListener('click', () => {
        controls.classList.toggle('is-open');

        const comment = document.querySelector('#new_comment_field');
        const options = getLabelAndDecorations(comment.value);
        controls.querySelector('select').value = options.label;
        controls.querySelector('input').value = options.decorations || '';

        window.setTimeout(() => {
            controls.querySelector('select').focus();
        }, 100);
    });
    return trigger;
};

chrome.runtime.sendMessage({}, (response) => {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === 'complete') {
            clearInterval(readyStateCheckInterval);

            const controls = createControls();
            const trigger = createTrigger(controls);
            if (document.querySelector('.js-new-comment-form')) {
                document
                    .querySelector('.js-new-comment-form .comment-form-head')
                    .insertAdjacentElement('afterend', controls);
                document
                    .querySelector(
                        '.js-new-comment-form markdown-toolbar div:nth-child(5)'
                    )
                    .appendChild(trigger);
            }

            jQuery('.repository-content').on(
                'click',
                '.js-add-line-comment',
                () => {
                    console.log('dynamic click of add-line-comment');
                }
            );
        }
    }, 10);
});
