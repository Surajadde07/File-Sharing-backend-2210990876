import React from 'react';
import { Link } from 'react-router-dom';
import {
    CloudArrowUpIcon,
    DocumentDuplicateIcon,
    ShareIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
    const features = [
        {
            icon: CloudArrowUpIcon,
            title: 'Upload Files',
            description: 'Upload and share your files securely with automatic expiration.',
            link: '/upload',
            color: 'bg-blue-50 text-blue-600'
        },
        {
            icon: DocumentDuplicateIcon,
            title: 'My Files',
            description: 'View and manage all your uploaded files in one place.',
            link: '/my-files',
            color: 'bg-green-50 text-green-600'
        },
        {
            icon: ShareIcon,
            title: 'Share Files',
            description: 'Share files via email with secure download links.',
            link: '/my-files',
            color: 'bg-purple-50 text-purple-600'
        },
        {
            icon: UserGroupIcon,
            title: 'Secure Sharing',
            description: 'All files are protected with JWT authentication and expire automatically.',
            link: '/upload',
            color: 'bg-orange-50 text-orange-600'
        }
    ];

    //! SOUBHAGYA DID THIS CHANGE
    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center py-12">
                <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                    Welcome to <span className="text-blue-600">WeShare</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    Upload, share, and manage your files securely. All files expire automatically in 24 hours for maximum security.
                </p>
                <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                    <div className="rounded-md shadow">
                        <Link
                            to="/upload"
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                        >
                            Start Uploading
                        </Link>
                    </div>
                    <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                        <Link
                            to="/my-files"
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                        >
                            View Files
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
                            Features
                        </h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Everything you need to share files securely
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
                            {features.map((feature, index) => (
                                <Link
                                    key={index}
                                    to={feature.link}
                                    className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <div>
                                        <span className={`rounded-lg inline-flex p-3 ring-4 ring-white ${feature.color}`}>
                                            <feature.icon className="h-6 w-6" aria-hidden="true" />
                                        </span>
                                    </div>
                                    <div className="mt-8">
                                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            {feature.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Secure File Sharing Made Simple
                        </h2>
                        <p className="mt-3 text-xl text-gray-500 sm:mt-4">
                            Your files are protected with enterprise-grade security
                        </p>
                    </div>
                    <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
                        <div className="flex flex-col">
                            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                                Auto Expiry
                            </dt>
                            <dd className="order-1 text-5xl font-extrabold text-blue-600">
                                24h
                            </dd>
                        </div>
                        <div className="flex flex-col mt-10 sm:mt-0">
                            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                                JWT Protected
                            </dt>
                            <dd className="order-1 text-5xl font-extrabold text-blue-600">
                                100%
                            </dd>
                        </div>
                        <div className="flex flex-col mt-10 sm:mt-0">
                            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                                Email Sharing
                            </dt>
                            <dd className="order-1 text-5xl font-extrabold text-blue-600">
                                Instant
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;