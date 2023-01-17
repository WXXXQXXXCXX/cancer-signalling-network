
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PathwayNetwork from './pathway-network/PathwayNetwork';
import Root from './signalling-network/Root';
import Subnet from './subnet/Subnet';

const App = () => {
    
    return (
    <BrowserRouter>

    <Routes>
        <Route path='/cancer-signalling-network' element={<Root />} />
        <Route path='/cancer-signalling-network/pathway-network' element={<PathwayNetwork />} />
        <Route path='/cancer-signalling-network/subnet' element={<Subnet />} />
    </Routes>
    </BrowserRouter>

      );
}

export default App;