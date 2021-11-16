window.addEventListener('DOMContentLoaded', (event) => {
    document
        .querySelector('#go-to-options')
        .addEventListener('click', () => chrome.runtime.openOptionsPage());
});
