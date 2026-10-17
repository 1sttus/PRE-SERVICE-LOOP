import React from 'react';
import { PresentationProvider, usePresentationContext } from '../context/PresentationContext';
import { ControlPanel } from '../components/ControlPanel';

const ControlContent: React.FC = () => {
  const { state, actions } = usePresentationContext();
  return <ControlPanel state={state} actions={actions} />;
};

export const ControlRoute: React.FC = () => {
  return (
    <PresentationProvider isController={true}>
      <ControlContent />
    </PresentationProvider>
  );
};
