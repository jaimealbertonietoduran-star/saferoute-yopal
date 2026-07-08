import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

export default function AppProviders({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}