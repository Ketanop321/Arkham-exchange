import React, { useState } from 'react';
import ArkhamXchange from './components/Trading/ArkhamXchange';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <div className="font-mono antialiased bg-black text-green-400 min-h-screen">
        <ArkhamXchange />
      </div>
    </ToastProvider>
  );
}

export default App;