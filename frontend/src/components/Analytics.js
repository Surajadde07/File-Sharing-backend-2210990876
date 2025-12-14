import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    ChartBarIcon,
    DocumentIcon,
    ArrowDownTrayIcon,
    ClockIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

//! ANALYTICS FEATURE - Final Project Feature
const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await analyticsAPI.getAnalytics();
            setAnalytics(response.data.analytics);
        } catch (error) {
            console.error('Analytics fetch error:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const getFileTypeIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'pdf': return '📄';
            case 'doc':
            case 'docx': return '📝';
            case 'jpg':
            case 'jpeg':
            case 'png': return '🖼️';
            case 'zip':
            case 'rar': return '📦';
            case 'txt': return '📃';
            default: return '📄';
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gray-300 h-32 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics Unavailable</h1>
                <p className="text-gray-600">Unable to load analytics data.</p>
            </div>
        );
    }

    const { overview, fileTypes, dailyUploads, topFiles } = analytics;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <ChartBarIcon className="h-8 w-8 mr-3 text-blue-600" />
                    Analytics Dashboard
                </h1>
                <p className="mt-2 text-gray-600">
                    Insights into your file sharing activities and usage patterns
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <DocumentIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Files</p>
                            <p className="text-2xl font-bold text-gray-900">{overview.totalFiles}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ArrowDownTrayIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Downloads</p>
                            <p className="text-2xl font-bold text-gray-900">{overview.totalDownloads}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ArrowTrendingUpIcon className="h-8 w-8 text-emerald-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Active Files</p>
                            <p className="text-2xl font-bold text-gray-900">{overview.activeFiles}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ClockIcon className="h-8 w-8 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Expired Files</p>
                            <p className="text-2xl font-bold text-gray-900">{overview.expiredFiles}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* File Types Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">File Types Distribution</h2>
                    <div className="space-y-4">
                        {Object.entries(fileTypes).map(([type, count]) => {
                            const percentage = ((count / overview.totalFiles) * 100).toFixed(1);
                            return (
                                <div key={type} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">{getFileTypeIcon(type)}</span>
                                        <span className="text-sm font-medium text-gray-700 uppercase">
                                            {type}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-12">
                                            {count} ({percentage}%)
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Daily Upload Trend */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Daily Upload Trend (Last 7 Days)</h2>
                    <div className="space-y-3">
                        {Object.entries(dailyUploads).map(([date, count]) => (
                            <div key={date} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    {new Date(date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{
                                                width: `${count > 0 ? Math.max((count / Math.max(...Object.values(dailyUploads))) * 100, 10) : 0}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 w-8">
                                        {count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Downloaded Files */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Most Downloaded Files</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">File Name</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Downloads</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Uploaded</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topFiles.length > 0 ? (
                                    topFiles.map((file, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <span className="text-xl mr-3">
                                                        {getFileTypeIcon(file.filename.split('.').pop())}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                        {file.filename}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {file.downloadCount} downloads
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {new Date(file.uploadTime).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="py-8 text-center text-gray-500">
                                            No files downloaded yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;