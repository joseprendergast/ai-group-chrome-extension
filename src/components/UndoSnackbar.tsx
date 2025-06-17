import React, { useState, useEffect } from 'react';
import { UndoAction } from '../utils/types';

const UndoSnackbar: React.FC = () => {
  const [lastAction, setLastAction] = useState<UndoAction | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const listener = (message: any) => {
      if (message.type === 'ACTION_COMPLETED') {
        setLastAction(message.payload);
        setVisible(true);
        // Auto-hide after 5 seconds
        setTimeout(() => setVisible(false), 5000);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const handleUndo = () => {
    if (!lastAction) return;

    chrome.runtime.sendMessage({
      type: 'UNDO_ACTION',
      payload: lastAction
    });
    setVisible(false);
  };

  if (!visible || !lastAction) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 p-4 bg-gray-900 text-white rounded-lg shadow-lg flex items-center justify-between">
      <span className="text-sm">
        {lastAction.type === 'CREATE_GROUP' && 'Group created'}
        {lastAction.type === 'UNGROUP' && 'Group removed'}
        {lastAction.type === 'MERGE_GROUPS' && 'Groups merged'}
      </span>
      <button
        onClick={handleUndo}
        className="ml-4 px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Undo
      </button>
    </div>
  );
};

export default UndoSnackbar; 