
import React, { useState, useRef } from 'react';
import { parseWhatsAppChat } from '@/utils/chatParser';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface UploadSectionProps {
  onChatDataParsed: (chatData: ReturnType<typeof parseWhatsAppChat>) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onChatDataParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (file.type !== 'text/plain') {
      toast({
        title: "Invalid file format",
        description: "Please upload a WhatsApp .txt file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const text = await file.text();
      setFileContent(text);
      
      // Log first few lines for debugging
      console.log("File preview:", text.split('\n').slice(0, 10));
      
      const parsedData = parseWhatsAppChat(text);
      
      if (parsedData.messages.length === 0) {
        setError("Couldn't parse any messages from the file. Make sure it's a valid WhatsApp chat export.");
        toast({
          title: "No messages found",
          description: "Couldn't parse any messages from the file. Make sure it's a valid WhatsApp chat export.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "Chat imported successfully",
        description: `Analyzed ${parsedData.messages.length} messages between ${parsedData.participants.join(' and ')}`,
      });
      
      onChatDataParsed(parsedData);
    } catch (error) {
      console.error("Error processing file:", error);
      setError("Something went wrong while processing the chat file.");
      toast({
        title: "Error processing file",
        description: "Something went wrong while processing the chat file.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 px-4">
      <div
        className={`file-drop-zone ${isDragging ? 'active' : ''} ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-apple-blue/10 flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-apple-blue"
            >
              <path
                d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 16.2091 19.2091 18 17 18H7C4.79086 18 3 16.2091 3 14C3 11.7909 4.79086 10 7 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 12V16M12 16L14 14M12 16L10 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <h3 className="text-xl font-medium mb-2 text-apple-black">Upload WhatsApp Chat</h3>
          <p className="text-apple-dark-gray text-center max-w-md mb-2">
            Drag and drop your exported WhatsApp chat file (.txt) here, or click to browse
          </p>
          <p className="text-xs text-apple-dark-gray/70 text-center max-w-md">
            All analysis happens locally on your device. Your data never leaves your browser.
          </p>
          
          {isLoading && (
            <div className="mt-4 w-full max-w-xs">
              <div className="h-1 w-full bg-apple-gray rounded-full overflow-hidden">
                <div className="h-full bg-apple-blue progress-animation"></div>
              </div>
              <p className="text-xs text-apple-dark-gray mt-2 text-center">Processing your chat data...</p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error Processing Chat</AlertTitle>
          <AlertDescription>
            {error}
            {fileContent && (
              <div className="mt-2">
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium">Show first few lines of your file</summary>
                  <pre className="mt-2 bg-black/5 p-2 rounded overflow-x-auto">
                    {fileContent.split('\n').slice(0, 5).join('\n')}
                  </pre>
                </details>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="text-center mt-8 text-sm text-apple-dark-gray">
        <h4 className="font-medium mb-2">How to export your WhatsApp chat:</h4>
        <ol className="text-left inline-block">
          <li className="mb-1">1. Open a chat in WhatsApp</li>
          <li className="mb-1">2. Tap the three dots (⋮) in the top right</li>
          <li className="mb-1">3. Select "More" &gt; "Export chat"</li>
          <li className="mb-1">4. Choose "Without media"</li>
          <li>5. Save the .txt file and upload it here</li>
        </ol>
      </div>
    </div>
  );
};

export default UploadSection;
