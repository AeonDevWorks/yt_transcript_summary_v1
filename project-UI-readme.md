# Youtube Transcript Summarizer UI Design

## Overview

The Youtube Transcript Summarizer is a web application that allows users to easily summarize the transcripts of their favorite YouTube videos. It utilizes advanced AI models to provide concise summaries, making it easier to understand and navigate through long video content.

## Design

### Design Philosophy

- Minimalist Design: The design is simple and clean, with a focus on the content rather than visual effects. Grayscale color palette that inverts for dark mode.
- User-Centric: The design is centered around the user's needs, with a focus on readability and usability.
- Dark Mode: The design is available in system, light & dark mode, with a focus on readability and usability, with default as system (browser's theme) setting.

### Collapsed Button

Logo on the left and then "Transcript" centered horizontally with a chevron icon on the right.

- Extension icon on the left
- Header text "Transcript" in the center
- Chevron icon on the right (chevron pointing down)

### Expanded View

Displays the transcript in a clean, organized manner.

- Chapters are displayed as collapsible sections.
- Each chunk (or paragraph) within a chapter is displayed with its timestamp.
- Clicking on a timestamp navigates to that part of the video.
- Text is formatted for easy readability.

### Added Function Button Icons

- Functional Buttons appear instead of the replace the button content of the collapsed view.
- The 5 buttons (minimal grayscale icon buttons) are:
  - Copy - which copies the text to the clipboard
  - Go to current time - which jumps to and highlights the current timestamp and the caption text at the time where the video is currently at.
  - Summarize with AI - that slides in a summary container overlaying the current transcript to display the summary along with options to nested summary, takeaways/insights (action pointers), ideas (narratives), long-form (comprehensive) summaries.
  - Settings - which allows the user to adjust the settings for the app. Slides in a settings container overlaying the current transcript to display the settings options.
    - Theme - which allows the user to toggle between light and dark modes. (toggle switch)
  - Font Size - which allows the user to adjust the font size of the transcript. (aA adjacent button indicated by small & large letter icon of uppercase A)
  - Chevron Icon - which allows the user to collapse the transcript view (chevron pointing top)

### Transcript Design

- the div for each chapter or logical chunk is a flex container with the timestamp and the title of the chapter (if provided) in a row followed by the transcript-text below them.
    ________________________
    timestamp         title
    transcript-text
    ________________________
- Both the timestamp and the chapter title are navigable. Upon hover and click, the timestamp and the chapter title are styled with a darker grey accent. On-hover and on-click state are distinguished with a shadow and darker font color which normalizes on mouse-leave.
- As the video progresses, the corresponding div's transcript text is highlighted as the corresponding timestamp starts with a contrasting medium grey background color and the text highlighting goes away in a 2 seconds.
- When go to current time button is clicked, the transcript will jump to the corresponding time's div and the text is highlighted with a contrasting medium grey background color and the text highlighting goes away in a 2 seconds.

### Use custom SVG icons for all icon buttons

- put all SVG icon buttons in a separate SVG file and import them in the project.

__________________________________________________________________;

### UI changes to the existing transcript extension 
- Align AI Summary header with the Back Button in a single row
- Back button on the left side with a left pointing arrow icon, followed by the "AI Summary" header in the center
- Ensure that the collapsed transcript button and expanded trasncript container always show up in the same theme as that of the browser's current theme and if possible user's youtube's theme
- Summarize with AI button: modify the icon to improve the layout of the two sparkle shapes used in the icon. Draw the SVG icon such that the upper right sparkle moves a bit more towards the top right corner.


### UI changes for further AI summary enhancements
- Align AI Summary header with the Back Button, the Credits badge and the AI settings button in a single row
- Back button on the left side with a left pointing arrow icon, followed by the "AI Summary "header in the center, followed by the remaining credits badge grouped with settings icon button on the right side.
- AI Summary overlay panel: 
    - Create tag buttons for Gist (short summary), Insights (actionable takeaways), Ideas (important narratives), Nested (nested bullet points), Long-form (comprehensive summary), and Mind-map (visual diagram) summaries.
    - A short summary is displayed by default with gist as the auto selected tag button. 
    - Clicking on the tag button will display the corresponding summary, and the corresponding tag button will be highlighted, while the other tag buttons will be dimmed & unselected.
    - Each summary type has its own unique icon.
        - The gist summary has a speech bubble icon.
        - The insights summary has a compass icon.
        - The ideas summary has a light bulb icon.
        - The nested summary has a bullet list icon.
        - The long-form summary has a book icon.
        - The mind-map summary has a mind map icon.
    - The summary type buttons are rectangualr tag buttons with rounded corner that start with a small enclosed icon followed by the summary type label.
    - The summary type buttons form two rows of buttons
    - Followed by a horizontal line and the summary text content container

    - Design of the Ai Summary overlay panel:
    _____________________________________________________
    Back Btn        AI Summary        5 Credits, Settings 
    _____________________________________________________
    Gist               Insights             Ideas         
    Nested            Long-form             Mind-map
    _____________________________________________________
    Summary Text Content Container
    _____________________________________________________

- Functionality for the AI summary
    - Each summary type has its own prompt for the AI model.
    - The remianing credits badge displays the remaining credits for the user which is 5 per day.
    - By deafult the AI summary overlay panel opens with the summary Gist button selected.
    - As the user switches the summary type button, current summary text content contaienr fades out and the new summary text content container fades in.
    - All the summary variants are generated in the same API call to the LLM model.
    - As of now, each API call to the LLM model costs 1 credit.
    - As per pilot implementation, the user gets 5 credits per day. (to summarize 5 different youtube videos)
    - If all the summary variants can't be generated due Rate Limit or Out of Context length issues, the extension will make an additional API call to generate other variants, and the credits will be deducted accordingly.
    - If the video is too long, the extension will make multiple API calls to generate the summary in chunks, and the credits will be deducted accordingly. 
    - For long videos preffered LLM model is Gemini 1.5 Flash, and for short videos Groq llama 3.1 70b is the preffered model.
     
    - AI summary settings container:
    - Users can add their own API key to the extension to use their own LLM model
    - API key safety is ensured by not saving the API key in the extension and only using it in the API call and saving the API key in the browser's local storage.
    - Users can also use Ollama's API to generate the summaries by adding localhost to the API key field
    - All major LLM models are supported by LiteLLM (python SDK for all major LLM models)


