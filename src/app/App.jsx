import { Routes, Route, useLocation } from 'react-router-dom';
import Login from '../features/auth/pages/Login';
import DashboardAdmin from '../features/dashboard/pages/Dashboard_admin';
import DashboardUser from '../features/dashboard/pages/Dashboard_user';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import Navbar from '../components/layout/Navbar';
import Debtors from '../features/finance/pages/Debtors';
import LedgerPage from '../features/finance/pages/LedgerPage';
import InvoicePage from '../features/finance/pages/InvoicePage';
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
import MasterPage from '../features/settings/pages/MasterPage';
import MenuManagement from '../features/settings/pages/MenuManagement';
import MasterDebtors from '../features/masters/page/masterDebtors';

import { AreaAssign } from '../features/punchin';
import AreaAssignTableView from '../features/punchin/pages/AreaAssignTableView';
import { SiKfc } from 'react-icons/si';
import { TbAdFilled } from 'react-icons/tb';
import { LuFastForward } from 'react-icons/lu';
import MasterUsers from '../features/masters/page/MasterUsers';

const AppLayout = () => {
    const location = useLocation();
    const hideNavbarRoutes = ['/', '/login'];

    return (
        <>
            {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}

            <Routes>
                {/* Login */}
                <Route path="/" element={<Login />} />

                {/* Dashboards */}
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

                {/* Finance */}
                <Route
                    path="/debtors"
                    element={
                        <ProtectedRoute>
                            <Debtors />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/debtors/ledger/:accountCode"
                    element={
                        <ProtectedRoute>
                            <LedgerPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/debtors/invoice/:accountCode"
                    element={
                        <ProtectedRoute>
                            <InvoicePage />
                        </ProtectedRoute>
                    }
                />

                {/* Punch-In */}
                <Route path="/punch-in/location" element={<LocationRecords />} />
                <Route path="/punch-in/location/capture" element={<StoreLocationCapture />} />
                <Route path="/punch-in" element={<PunchinRecords />} />
                <Route path="/punch-in/capture" element={<PunchInCapture />} />

                {/* Area Assign */}
                <Route path="/area-assign" element={<AreaAssign />} />
                <Route path="/masters/area-table" element={<AreaAssignTableView />} />

                {/* Masters group with nested routes */}
                <Route path="/masters">
                    <Route
                        index
                        element={
                            <ProtectedRoute>
                                <MenuManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="users"
                        element={
                            <ProtectedRoute>
                                <MasterUsers />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="debtors"
                        element={
                            <ProtectedRoute>
                                <MasterDebtors />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* 404 fallback */}
                <Route path="/*" element={<NotFound />} />
            </Routes>
        </>
    );
};

const App = () => {
    return <AppLayout />;
};

export default App;