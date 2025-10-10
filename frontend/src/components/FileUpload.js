import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { filesAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    CloudArrowUpIcon,
    DocumentIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

//! TANISHA DID THIS CHANGE
const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            setUploadedFile(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            setUploadedFile(null);
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file to upload');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await filesAPI.upload(formData);
            setUploadedFile(response.data.file);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            toast.success('File uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.msg || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Link copied to clipboard!');
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Upload File</h1>
                <p className="mt-2 text-gray-600">
                    Upload your files securely. All files expire automatically in 24 hours.
                </p>
            </div>

            {/* Upload Area */}
            {!uploadedFile && (
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            Drop your file here, or{' '}
                            <button
                                type="button"
                                className="text-blue-600 hover:text-blue-500"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                browse
                            </button>
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            PNG, JPG, PDF, DOC, DOCX up to 10MB
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect}
                            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.txt,.zip,.rar"
                        />
                    </div>

                    {/* Selected File */}
                    {selectedFile && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <DocumentIcon className="h-8 w-8 text-blue-600" />
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatFileSize(selectedFile.size)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={removeSelectedFile}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    {selectedFile && (
                        <div className="mt-6">
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    'Upload File'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Success */}
            {uploadedFile && (
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            File uploaded successfully!
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Your file has been uploaded and is ready to share.
                        </p>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Filename
                            </label>
                            <p className="mt-1 text-sm text-gray-900">{uploadedFile.filename}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Expires
                            </label>
                            <p className="mt-1 text-sm text-gray-900">
                                {new Date(uploadedFile.expiryTime).toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Download Link
                            </label>
                            <div className="mt-1 flex">
                                <input
                                    type="text"
                                    readOnly
                                    value={uploadedFile.downloadLink}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                                />
                                <button
                                    onClick={() => copyToClipboard(uploadedFile.downloadLink)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 text-sm"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                        <button
                            onClick={() => navigate(`/share/${uploadedFile.uuid}`)}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                        >
                            Share via Email
                        </button>
                        <button
                            onClick={() => {
                                setUploadedFile(null);
                                setSelectedFile(null);
                            }}
                            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                        >
                            Upload Another
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;