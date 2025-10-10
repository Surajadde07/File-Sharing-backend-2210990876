import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { filesAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    DocumentIcon,
    ShareIcon,
    ArrowDownTrayIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';


//! TANISHA DID THIS CHANGE
const MyFiles = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyFiles();
    }, []);

    const fetchMyFiles = async () => {
        try {
            const response = await filesAPI.getMyFiles();
            setFiles(response.data.files);
        } catch (error) {
            console.error('Fetch files error:', error);
            toast.error('Failed to fetch files');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Link copied to clipboard!');
    };

    const formatFileSize = (filename) => {
        // This is a simple estimation based on filename
        // In a real app, you'd store the file size in the backend
        return 'Unknown size';
    };

    const formatTimeRemaining = (expiryTime) => {
        const now = new Date();
        const expiry = new Date(expiryTime);
        const diffMs = expiry - now;

        if (diffMs <= 0) {
            return 'Expired';
        }

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m remaining`;
        } else {
            return `${diffMinutes}m remaining`;
        }
    };

    const getFileIcon = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'jpg':
            case 'jpeg':
            case 'png':
                return '🖼️';
            case 'zip':
            case 'rar':
                return '📦';
            default:
                return '📄';
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-gray-300 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
                    <p className="mt-2 text-gray-600">
                        Manage your uploaded files and share them securely.
                    </p>
                </div>
                <Link
                    to="/upload"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                    <DocumentIcon className="h-5 w-5 mr-2" />
                    Upload New File
                </Link>
            </div>

            {files.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <DocumentIcon className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        No files uploaded yet
                    </h3>
                    <p className="mt-2 text-gray-500">
                        Start by uploading your first file to share with others.
                    </p>
                    <Link
                        to="/upload"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Upload Your First File
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Files ({files.length})
                        </h3>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {files.map((file) => (
                            <div key={file.id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center min-w-0 flex-1">
                                        <div className="text-2xl mr-4">
                                            {getFileIcon(file.filename)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {file.filename}
                                                </p>
                                                {file.expired && (
                                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                                        Expired
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <ClockIcon className="h-4 w-4 mr-1" />
                                                    {formatTimeRemaining(file.expiryTime)}
                                                </span>
                                                <span>
                                                    Downloaded {file.downloadCount} time{file.downloadCount !== 1 ? 's' : ''}
                                                </span>
                                                <span>
                                                    Uploaded {new Date(file.uploadTime).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {!file.expired && (
                                            <>
                                                <button
                                                    onClick={() => copyToClipboard(file.downloadLink)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 rounded-md"
                                                    title="Copy download link"
                                                >
                                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                                </button>
                                                <Link
                                                    to={`/share/${file.uuid}`}
                                                    className="p-2 text-gray-400 hover:text-green-600 rounded-md"
                                                    title="Share via email"
                                                >
                                                    <ShareIcon className="h-5 w-5" />
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {files.length > 0 && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <ClockIcon className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                File Expiration Notice
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    All uploaded files automatically expire after 24 hours for security purposes.
                                    Expired files cannot be downloaded and are automatically removed from the server.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyFiles;