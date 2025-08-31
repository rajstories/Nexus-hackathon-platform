import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters?: () => Promise<{
    method: "POST";
    url: string;
    headers?: Record<string, string>;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  onFileAdded?: (file: any) => void;
  buttonClassName?: string;
  children: ReactNode;
  disabled?: boolean;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 50 * 1024 * 1024, // 50MB default to match backend
  onGetUploadParameters,
  onComplete,
  onFileAdded,
  buttonClassName,
  children,
  disabled = false,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() => {
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: [
          // Images
          '.jpg', '.jpeg', '.png', '.gif', '.webp',
          // Documents
          '.pdf', '.doc', '.docx', '.txt', '.md',
          // Archives
          '.zip', '.rar', '.7z', '.tar.gz',
          // Code
          '.js', '.ts', '.py', '.java', '.cpp', '.c', '.html', '.css',
          // Presentations
          '.ppt', '.pptx',
          // Spreadsheets
          '.xls', '.xlsx', '.csv',
          // Other
          '.json', '.xml', '.yml', '.yaml'
        ],
      },
      autoProceed: false,
    });

    // Handle file added
    uppyInstance.on('file-added', (file) => {
      console.log('File added:', file.name);
      if (onFileAdded) {
        onFileAdded(file);
      }
    });

    // Handle upload completion
    uppyInstance.on('complete', (result) => {
      console.log('Upload complete:', result);
      setShowModal(false);
      if (onComplete) {
        onComplete(result);
      }
    });

    // Handle upload errors
    uppyInstance.on('upload-error', (file, error) => {
      console.error('Upload error:', error);
    });

    return uppyInstance;
  });

  const handleOpenModal = () => {
    if (disabled) return;
    setShowModal(true);
  };

  return (
    <div>
      <Button 
        onClick={handleOpenModal} 
        className={buttonClassName}
        disabled={disabled}
        data-testid="button-upload-file"
      >
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
        closeModalOnClickOutside
        showProgressDetails
      />
    </div>
  );
}