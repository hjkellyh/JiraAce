// Function to send a message to background.js to encrypt data
function encryptDataInBackground(data) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { action: 'encrypt', data },
            (response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.encryptedData);
                }
            }
        );
    });
}

// Function to send a message to background.js to decrypt data
function decryptDataInBackground(encryptedData) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { action: 'decrypt', encryptedData },
            (response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.decryptedData);
                }
            }
        );
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const emailInput = document.getElementById('email');
    const apiTokenInput = document.getElementById('apiToken');
    const toggleApiTokenIcon = document.getElementById('toggleApiToken');
    const saveButton = document.getElementById('save');

    // Load saved settings
    chrome.storage.local.get(['jiraEmail', 'jiraApiToken'], async (items) => {
        if (items.jiraEmail && items.jiraApiToken) {
            try {
                emailInput.value = await decryptDataInBackground(items.jiraEmail);
                apiTokenInput.value = await decryptDataInBackground(items.jiraApiToken);
            } catch (error) {
                console.error('Error decrypting Jira credentials:', error);
                chrome.storage.local.remove(['jiraEmail', 'jiraApiToken'], () => {
                    alert('The encryption key has been updated. Please re-enter your Jira email and Jira API token.');
                });
            }
        }
    });

    // Toggle API token visibility
    toggleApiTokenIcon.addEventListener('click', () => {
        const type = apiTokenInput.type === 'password' ? 'text' : 'password';
        apiTokenInput.type = type;
        toggleApiTokenIcon.classList.toggle('visible');
        toggleApiTokenIcon.innerHTML = type === 'password' ? '&#128065;' : '&#128065;&#xFE0E;';
    });

    // Save settings
    saveButton.addEventListener('click', async () => {
        const jiraEmail = emailInput.value;
        const jiraApiToken = apiTokenInput.value;
        if (!jiraEmail || !jiraApiToken) {
            alert('Email and API token are required');
            return;
        }
        
        try {
            const encryptedEmail = await encryptDataInBackground(jiraEmail);
            const encryptedApiToken = await encryptDataInBackground(jiraApiToken);
            
            chrome.storage.local.set(
                { 
                    jiraEmail: encryptedEmail, 
                    jiraApiToken: encryptedApiToken 
                }, 
                () => {
                    alert('Settings saved');
                }
            );
        } catch (error) {
            console.error('Error saving credentials:', error);
            alert('Error saving credentials. Please try again.');
        }
    });
});