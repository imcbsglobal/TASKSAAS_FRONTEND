import { Routes, Route, useLocation } from 'react-router-dom';
import Login from '../features/auth/pages/Login';
import DashboardAdmin from '../features/dashboard/pages/Dashboard_admin';
import DashboardUser from '../features/dashboard/pages/Dashboard_user';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import Navbar from '../components/layout/Navbar';
// import Debtors from '../features/finance/pages/Debtors';
// import BankBook from "../features/finance/pages/BankBook";
// import CashBook from "../features/finance/pages/CashBook";
// import CashBookLedger from "../features/finance/pages/CashBookLedger";
// import BankBookLedger from "../features/finance/pages/BankBookLedger";
import NotFound from '../components/ui/NotFound';
// import LocationCapture from '../features/punchin/pages/LocationRecords';
import StoreLocationCapture from '../features/punchin/pages/StoreLocationCapture';
import LocationRecords from '../features/punchin/pages/LocationRecords';
import PunchinRecords from '../features/punchin/pages/PunchinRecords';
import PunchInCapture from '../features/punchin/pages/PunchInCapture';
import SettingsPage from '../features/settings/pages/MasterPage';
import MasterPage from '../features/settings/pages/MasterPage';
import UserManagement from '../features/settings/pages/MenuManagement';
import MenuManagement from '../features/settings/pages/MenuManagement';
import { AreaAssign, AreaAssignView } from '../features/punchin';
import { SiKfc } from 'react-icons/si';
import { TbAdFilled } from 'react-icons/tb';
import { LuFastForward } from 'react-icons/lu';
import js from '@eslint/js';
const AppLayout = () => {
    const location = useLocation();
    const hideNavbarRoutes = ['/', '/login'];

    return (
        <>
            {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}

            <Routes>
                <Route path="/" element={<Login />} />

                <Route
                    path="/dashboard/admin"
                    element={
                        <ProtectedRoute>
                            <DashboardAdmin />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard/user"
                    element={
                        <ProtectedRoute>
                            <DashboardUser />
                        </ProtectedRoute>
                    }
                />
                {/* <Route
                    path="/debtors"
                    element={<ProtectedRoute><Debtors /></ProtectedRoute>}
                /> */}
                {/* <Route
                    path="/cash-book"
                    element={<ProtectedRoute><CashBook /></ProtectedRoute>}
                /> */}
                {/* <Route
                    path="/cash-book-ledger"
                    element={<ProtectedRoute><CashBookLedger /></ProtectedRoute>}
                /> */}
                {/* <Route
                    path="/bank-book"
                    element={<ProtectedRoute><BankBook /></ProtectedRoute>}
                /> */}
                {/* <Route
                    path="/bank-book-ledger"
                    element={<ProtectedRoute><BankBookLedger /></ProtectedRoute>}
                /> */}

                <Route
                    path="/punch-in/location"
                    element={<LocationRecords />}
                />
                <Route path='/punch-in/location/capture' element={<StoreLocationCapture />} />

                <Route
                    path="/punch-in"
                    element={<PunchinRecords />}
                />
                <Route path='/punch-in/capture' element={<PunchInCapture />} />
                <Route path='/area-assign' element={<AreaAssign />} />
                {/* <Route path='/area-assign-view' element={<AreaAssignView />} /> */}

                <Route path="/master" >
                    <Route path='users' element={<MenuManagement />} />
                </Route>
                <Route
                    path='/*'
                    element={<NotFound />}
                />
            </Routes>
        </>
    );
};

const App = () => {
    return <AppLayout />;
};

export default App;
