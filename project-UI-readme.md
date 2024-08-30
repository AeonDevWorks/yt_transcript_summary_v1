# Youtube Transcript Summarizer UI Design

## Overview

The Youtube Transcript Summarizer is a web application that allows users to easily summarize the transcripts of their favorite YouTube videos. It utilizes advanced AI models to provide concise summaries, making it easier to understand and navigate through long video content.

## Design

### Design Philosophy

- Minimalist Design: The design is simple and clean, with a focus on the content rather than visual effects. Grayscale color palette that inverts for dark mode.
- User-Centric: The design is centered around the user's needs, with a focus on readability and usability.
- Dark Mode: The design is available in system, light & dark mode, with a focus on readability and usability, with default as system (browser's theme) setting.

### Collapsed Button: 
Logo on the left and then "Transcript" centered horizontally with a chevron icon on the right.
- Extension icon on the left
- Header text "Transcript" in the center
- Chevron icon on the right (chevron pointing down)

### Expanded View:
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
    - Summarize with AI - that slides in a summary container overlaying the current transcript to display the summary along with options to nested, takeaways (action pointers), ideas (narratives), long-form (comprehensive) summaries.
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