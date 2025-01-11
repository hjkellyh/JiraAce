document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const apiTokenInput = document.getElementById('apiToken');
    const toggleApiTokenIcon = document.getElementById('toggleApiToken');
    const saveButton = document.getElementById('save');

    // Load saved settings
    chrome.storage.sync.get(['jiraEmail', 'jiraApiToken'], (items) => {
        if (items.jiraEmail) {
            emailInput.value = items.jiraEmail;
        }
        if (items.jiraApiToken) {
            apiTokenInput.value = items.jiraApiToken;
        }
    });

    // Toggle API token visibility
    toggleApiTokenIcon.addEventListener('click', () => {
        const type = apiTokenInput.type === 'password' ? 'text' : 'password';
        apiTokenInput.type = type;
        toggleApiTokenIcon.classList.toggle('visible');
        toggleApiTokenIcon.innerHTML = type === 'password' ? '&#128065;' : '&#128065;&#xFE0E;'; // Ensure the icon remains consistent
    });

    // Save settings
    saveButton.addEventListener('click', () => {
        const jiraEmail = emailInput.value;
        const jiraApiToken = apiTokenInput.value;
        chrome.storage.sync.set({ jiraEmail, jiraApiToken }, () => {
            alert('Settings saved');
        });
    });
});