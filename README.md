# JiraAce
 a chrome extension for jira operation for Scrum Master

## Installation

1. Clone the repository OR download the zip to your local machine:
    ```sh
    git clone https://github.com/hjkellyh/JiraAce.git
    cd JiraAce
    ```

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable "Developer mode" by toggling the switch in the top right corner.

4. Click on the "Load unpacked" button and select the directory where you cloned the repository.

5. The JiraAce extension should now be installed and active.

## Usage

The extension will automatically run on Jira pages matching the specified URLs in the  file:
- `https://ehealthinsurance.atlassian.net/*`

## Features

- Displays warnings for missing Epic Link and Story Points on Jira issues.
- Provides quick access to ticket information and allows copying ticket details.

## Development

To make changes to the extension, edit the source files and reload the extension in Chrome:
1. Make your changes in the source files.
2. Go to `chrome://extensions/` and click the "Reload" button for the JiraAce extension.
