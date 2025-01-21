// Function to send a message to background.js to derive a key
function deriveKeyInBackground(passphrase) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { action: 'deriveKey', passphrase },
            (response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.key);
                }
            }
        );
    });
}

// Function to send a message to background.js to encrypt data
function encryptDataInBackground(key, data) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { action: 'encrypt', key, data },
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
function decryptDataInBackground(key, encryptedData) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { action: 'decrypt', key, encryptedData },
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

    // Get the passphrase from chrome.storage.local
    const { passphrase } = await new Promise((resolve) => {
        chrome.storage.local.get(['passphrase'], resolve);
    });

    if (!passphrase) {
        throw new Error('Passphrase is missing');
    }

    // Derive the cryptographic key from a passphrase
    const cryptoKey = await deriveKeyInBackground(passphrase);
    // console.log('Derived key:', cryptoKey);

    // Load saved settings
    chrome.storage.sync.get(['jiraEmail', 'jiraApiToken'], async (items) => {
        if (items.jiraEmail && items.jiraApiToken) {
            try {
                // console.log('Encrypted email:', items.jiraEmail);
                emailInput.value = await decryptDataInBackground(cryptoKey, items.jiraEmail);
                // console.log('Decrypted email:', emailInput.value);
                
                // console.log('Encrypted API token:', items.jiraApiToken);
                apiTokenInput.value = await decryptDataInBackground(cryptoKey, items.jiraApiToken);
                // console.log('Decrypted API token:', apiTokenInput.value);
            } catch (error) {
                console.error('Error decrypting Jira email:', error);
                chrome.storage.sync.remove(['jiraEmail', 'jiraApiToken'], () => {
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
        toggleApiTokenIcon.innerHTML = type === 'password' ? '&#128065;' : '&#128065;&#xFE0E;'; // Ensure the icon remains consistent
    });

    // Save settings
    saveButton.addEventListener('click', async () => {
        const jiraEmail = emailInput.value;
        const jiraApiToken = apiTokenInput.value;
        if (!jiraEmail || !jiraApiToken) {
            alert('Email and API token are required');
            return;
        }
        const encryptedEmail = await encryptDataInBackground(cryptoKey, jiraEmail);
        const encryptedApiToken = await encryptDataInBackground(cryptoKey, jiraApiToken);
        console.log('Encrypted email:', encryptedEmail);
        console.log('Encrypted API token:', encryptedApiToken);
        chrome.storage.sync.set({ jiraEmail: encryptedEmail, jiraApiToken: encryptedApiToken }, () => {
            alert('Settings saved');
        });
    });
});