export interface TranscribedText {
    type: 'text' | 'file' | 'system';
    content: string;
    fileName?: string;
    fileType?: string;
};

export interface MessageType {
    type: 'text' | 'file' | 'system';
    content: string;
    fileName?: string;
    fileType?: string;
};