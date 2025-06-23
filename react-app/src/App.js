import { CssBaseline } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import './css/main.css';
import AdminPanel from './pages/admin-panel/AdminPanel';
import BoosterConfiguration from './pages/configuration/booster/BoosterConfiguration';
import OpticalPortConfiguration from './pages/configuration/optical-port/OpticalPortConfiguration';
import PreamplifierConfiguration from './pages/configuration/preamplifier/PreamplifierConfiguration';
import Home from './pages/home/Home';
import DemultiplexerPorts from './pages/monitoring/demultiplexer/demultiplexer-ports/DemultiplexerPorts';
import Booster from './pages/monitoring/edfas/booster/Booster';
import Preamplifier from './pages/monitoring/edfas/preamplifier/PreAmplifier';
import MultiplexerPorts from './pages/monitoring/multiplexer/multiplexer-ports/MultiplexerPorts';
import OpticalPort from './pages/monitoring/optical-port/OpticalPort';
import MuxSettings from './pages/mux-settings/MuxSettings';
import Settings from './pages/settings/Settings';

function App() {
  return (
    <div>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path='/'>
            <Route index element={<Home />} />
            <Route path='admin'>
              <Route index element={<AdminPanel />} />
            </Route>
            <Route path='settings'>
              <Route index element={<Settings />} />
            </Route>

            <Route path='monitoring'>
              <Route path='booster'>
                <Route index element={<Booster />} />
              </Route>
              <Route path='preamplifier'>
                <Route index element={<Preamplifier />} />
              </Route>
              <Route path='multiplexer'>
                <Route path='ports'>
                  <Route index element={<MultiplexerPorts />} />
                </Route>
              </Route>
              <Route path='demultiplexer'>
                <Route path='ports'>
                  <Route index element={<DemultiplexerPorts />} />
                </Route>
              </Route>
              <Route path='optical-ports'>
                <Route path=':port'>
                  <Route index element={<OpticalPort />} />
                </Route>
              </Route>
            </Route>
            <Route path='configuration'>
              <Route path='booster'>
                <Route index element={<BoosterConfiguration />} />
              </Route>
              <Route path='preamplifier'>
                <Route index element={<PreamplifierConfiguration />} />
              </Route>
              <Route path='optical-ports'>
                <Route path=':port'>
                  <Route index element={<OpticalPortConfiguration />} />
                </Route>
              </Route>
            </Route>
            <Route path='mux-settings'>
              <Route index element={<MuxSettings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
