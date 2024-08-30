# YT Transcriber Chrome Extension - basic outline

This is a Chrome browser extension that transcribes YouTube videos and displays the transcript in a beautiful UI.
The extension should add a "Transcribe Video" button right above the related videos column on a YouTube page.
Whenever this button or the extension icon is clicked, the transcript box should expand and display the transcript.
The transcript can be copied, downloaded and further summarized using AI tool options.
Upon being clicked the button expands the container downwards to the length of the Video player,
and display the transcript along with associated startTime timestamps in a collapsible scrollable sleek container
that has open/collapse chevron, copy, download, go to current timestamp, and AI summarization button icons.

The extension should be built using React, Next.js, Tailwind CSS, and ShadCN UI components.
Ensure that all libraries are bundled and packaged within the Chrome extension to avoid remotely hosted code, which is not permitted in Manifest V3.
Ensure that the extension widget automatically adjusts to the system theme settings.

This browser extension should comply with all the chrome extension's best practices, policies, and guidelines, including the latest Chrome extension policies.
Including those specific to YouTube extension apps, such as using the appropriate trusted types for the inserted HTML to prevent cross-site scripting attacks..
User privacy and security are paramount.
Ensure that the extension requests only the necessary Chrome permissions and nothing beyond that.
It is very important that all guidelines are met and no policy is violated when creating this extension.It is crucial to adhere to all guidelines and avoid any policy violations when developing this extension.

Implement transcription logic:
Extract the transcription form the captions if available for the Youtube video
If video chapters are available divide the transcript chapter-wise
and store along with the start timestamp for each chapter.
If chapters aren't available, divide the transcript into logical groups
averaging with a timestamp for each minute of the video.

Let the extension icon indicate separately for each tab whether the transcript is available or not.
If captions are available it shows CC on the extension icon badge.
Clicking the extension button displays the transcript similar to that of the injected button.

for AI summarization, the extension will use Gemini Flash API at this point,
using the "@google/generative-ai" library
In future, as we get permission to use the new built-in AI using Gemini Nano finetuned models
in the chrome browser, the summarization will take place locally in the browser.

## YouTube Transcriber Chrome Extension

## Overview

This Chrome extension transcribes YouTube videos and displays the transcript in a beautiful, user-friendly interface. It adds a "Transcribe Video" button above the related videos column on YouTube pages, allowing users to easily access and interact with video transcripts.

## Features

- Transcribe YouTube videos
- Display transcripts in an expandable UI
- Copy and download transcripts
- AI-powered transcript summarization
- Automatic theme adjustment based on system settings

## Tech Stack

- React
- Next.js
- Tailwind CSS
- ShadCN UI components

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Build the extension using `npm run build`
4. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `build` folder

## Usage

1. Navigate to a YouTube video
2. Click the "Transcribe Video" button or the extension icon
3. View, copy, download, or summarize the transcript

## Development

### Setup

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`

### Building

Run `npm run build` to create a production-ready extension

## Security and Compliance

This extension adheres to Chrome extension best practices and policies:

- Uses Manifest V3
- Implements trusted types for HTML insertion
- Requests minimal permissions
- Packages all libraries to avoid external API calls
- Prioritizes user privacy and security

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Disclaimer

This extension is not affiliated with or endorsed by YouTube. Use it responsibly and in compliance with YouTube's terms of service.
