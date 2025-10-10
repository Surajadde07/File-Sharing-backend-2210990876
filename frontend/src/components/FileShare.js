import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { filesAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    EnvelopeIcon,
    DocumentIcon,
    ClockIcon,
    ShareIcon
} from '@heroicons/react/24/outline';

const FileShare = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [fileInfo, setFileInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sharing, setSharing] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');

    useEffect(() => {
        if (uuid) {
            fetchFileInfo();
        }
    }, [uuid]);

    const fetchFileInfo = async () => {
        try {
            const response = await filesAPI.getFileInfo(uuid);
            setFileInfo(response.data);
        } catch (error) {
            console.error('Fetch file info error:', error);
            if (error.response?.status === 404) {
                toast.error('File not found');
                navigate('/my-files');
            } else if (error.response?.status === 403) {
                toast.error('You can only share files you uploaded');
                navigate('/my-files');
            } else {
                toast.error('Failed to fetch file information');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();

        if (!recipientEmail) {
            toast.error('Please enter recipient email');
            return;
        }

        if (!recipientEmail.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        setSharing(true);

        try {
            await filesAPI.shareFile(uuid, recipientEmail);
            toast.success(`File shared successfully with ${recipientEmail}`);
            setRecipientEmail('');
        } catch (error) {
            console.error('Share error:', error);
            toast.error(error.response?.data?.msg || 'Failed to share file');
        } finally {
            setSharing(false);
        }
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
                return '🖼';
            case 'zip':
            case 'rar':
                return '📦';
            default:
                return '📄';
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
                    <div className="bg-gray-300 h-64 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (!fileInfo) {
        return (
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">File Not Found</h1>
                <p className="text-gray-600">The file you're looking for doesn't exist or you don't have permission to share it.</p>
            </div>
        );
    }

    //! TANEY DID THIS CHANGE
    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Share File</h1>
                <p className="mt-2 text-gray-600">
                    Send a secure download link via email
                </p>
            </div>

            {/* File Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4">
                        {getFileIcon(fileInfo.filename)}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                            {fileInfo.filename}
                        </h3>
                        <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {formatTimeRemaining(fileInfo.expiryTime)}
                            </span>
                            <span>
                                Downloaded {fileInfo.downloadCount} time{fileInfo.downloadCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>

                {fileInfo.expired ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ClockIcon className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    File Expired
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>This file has expired and can no longer be downloaded or shared.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Uploaded:</span>
                                <p className="font-medium">{new Date(fileInfo.uploadTime).toLocaleString()}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Expires:</span>
                                <p className="font-medium">{new Date(fileInfo.expiryTime).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Share Form */}
            {!fileInfo.expired && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <ShareIcon className="h-6 w-6 text-blue-600 mr-2" />
                        <h2 className="text-lg font-medium text-gray-900">
                            Share via Email
                        </h2>
                    </div>

                    <form onSubmit={handleShare}>
                        <div className="mb-4">
                            <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                                Recipient Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="recipientEmail"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter recipient's email address"
                                    required
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                The recipient will receive an email with a secure download link.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={sharing}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {sharing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                                    Send Download Link
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <DocumentIcon className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    How it works
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>An email will be sent to the recipient with a secure download link</li>
                                        <li>The recipient must be logged in to download the file</li>
                                        <li>The link will expire when the file expires (24 hours after upload)</li>
                                        <li>Download activity is tracked and visible to you</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-center">
                <button
                    onClick={() => navigate('/my-files')}
                    className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
                >
                    Back to My Files
                </button>
            </div>
        </div>
    );
};

export default FileShare;