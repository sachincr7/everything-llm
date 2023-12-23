import { Suspense, lazy } from 'react';
import './App.css';
import { ContextWrapper } from './AuthContext';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
// import Login from 'pages/Login';
// import Login from 'pages/Login';
// import PrivateRoute from 'components/PrivateRoute';
// import Main from 'pages/Main';

const Main = lazy(() => import('./pages/Main'));

function App() {
  return (
    <Suspense fallback={<div />}>
      <ContextWrapper>
        <Routes>
          <Route path='/' element={<PrivateRoute component={<Main />} />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </ContextWrapper>
    </Suspense>
  );
}

export default App;
