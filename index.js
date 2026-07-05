import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import React from 'react';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

registerRootComponent(Root);