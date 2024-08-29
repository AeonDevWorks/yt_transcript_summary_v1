import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
import { fetchTranscript } from '../lib/transcriptFetcher';
import { summarizeTranscript } from '../lib/aiSummarizer';

function TranscriptDisplay() {
    const [transcript, setTranscript] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [summary, setSummary] = useState<string>('');

    useEffect(() => {
        // Add logic to check if on YouTube video page
        // and update extension icon badge
    }, []);

    const handleTranscribe = async () => {
        setIsLoading(true);
        try {
            const fetchedTranscript = await fetchTranscript();
            setTranscript(fetchedTranscript);
        } catch (error) {
            console.error('Error fetching transcript:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSummarize = async () => {
        if (!transcript) return;
        try {
            const generatedSummary = await summarizeTranscript(transcript);
            setSummary(generatedSummary);
        } catch (error) {
            console.error('Error summarizing transcript:', error);
        }
    };

    return (
        <div className="transcript-container bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <Button onClick={handleTranscribe} disabled={isLoading}>
                {isLoading ? <Spinner /> : 'Transcribe Video'}
            </Button>
            {transcript && (
                <>
                    <div className="transcript-text mt-4 max-h-[60vh] overflow-y-auto">
                        {/* Render transcript with timestamps */}
                    </div>
                    <div className="actions mt-4 flex space-x-2">
                        <Button onClick={() => navigator.clipboard.writeText(transcript)}>
                            Copy
                        </Button>
                        <Button onClick={handleSummarize}>Summarize</Button>
                        {/* Add download button */}
                    </div>
                </>
            )}
            {summary && (
                <div className="summary mt-4 p-2 bg-gray-200 dark:bg-gray-700 rounded">
                    <h3 className="font-bold">Summary:</h3>
                    <p>{summary}</p>
                </div>
            )}
        </div>
    );
}

export default TranscriptDisplay;