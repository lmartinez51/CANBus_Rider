import React from 'react';

const SignalContext = React.createContext({
  signal: 'WheelBasedVehicleSpeed', // default value
  setSignal: () => {}, // default function
});

export default SignalContext;
