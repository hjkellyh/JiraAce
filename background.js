import { deriveKey, encryptData, decryptData, generateRandomPassphrase } from './crypto.js';

let cryptoKey = null;
let cryptoKeyInitialized = false;
let pendingOperations = [];

function initializeCryptoKey() {
    return chrome.storage.local.get(['passphrase'])
        .then(({ passphrase }) => {
            if (!passphrase) {
                const newPassphrase = generateRandomPassphrase(16);
                return chrome.storage.local.set({ passphrase: newPassphrase })
                    .then(() => deriveKey(newPassphrase));
            } else {
                return deriveKey(passphrase);
            }
        })
        .then(key => {
            cryptoKey = key;
            cryptoKeyInitialized = true;
            console.log('Crypto key initialized');
            
            // Process any pending operations
            pendingOperations.forEach(op => op());
            pendingOperations = [];
        })
        .catch(error => {
            console.error('Error initializing crypto key:', error);
            cryptoKeyInitialized = false;
        });
}

// Initialize the crypto key when the service worker starts
initializeCryptoKey();

// Handle messages from content scripts and options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'encrypt') {
        if (!cryptoKeyInitialized) {
            // Queue the encryption operation
            pendingOperations.push(() => {
                encryptData(cryptoKey, message.data)
                    .then(encryptedData => {
                        sendResponse({ encryptedData });
                    })
                    .catch(error => {
                        console.error('Error encrypting data:', error);
                        sendResponse({ error: 'Error encrypting data' });
                    });
            });
            return true;
        }

        encryptData(cryptoKey, message.data)
            .then(encryptedData => {
                sendResponse({ encryptedData });
            })
            .catch(error => {
                console.error('Error encrypting data:', error);
                sendResponse({ error: 'Error encrypting data' });
            });
        return true;
    } 
    else if (message.action === 'decrypt') {
        if (!cryptoKeyInitialized) {
            // Queue the decryption operation
            pendingOperations.push(() => {
                decryptData(cryptoKey, message.encryptedData)
                    .then(decryptedData => {
                        sendResponse({ decryptedData });
                    })
                    .catch(error => {
                        console.error('Error decrypting data:', error);
                        sendResponse({ error: 'Error decrypting data' });
                    });
            });
            return true;
        }

        decryptData(cryptoKey, message.encryptedData)
            .then(decryptedData => {
                sendResponse({ decryptedData });
            })
            .catch(error => {
                console.error('Error decrypting data:', error);
                sendResponse({ error: 'Error decrypting data' });
            });
        return true;
    }
    else if (message.action === 'openOptionsPage') {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    }
});

// Listen for installation or update
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed or updated');
    initializeCryptoKey();
});
