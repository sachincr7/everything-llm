import { Suspense } from 'react';
import './App.css';
import { ContextWrapper } from './AuthContext';

function App() {
  return (
    <Suspense fallback={<div />}>
      <ContextWrapper>
        <h1 className="text-3xl font-bold underline">
          Hello world!
        </h1>
      </ContextWrapper>
      
    </Suspense>
  );
}

export default App;
