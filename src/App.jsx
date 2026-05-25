import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Portfolio       from './Portfolio';
import RiskMatrix      from './RiskMatrix';
import StaffScheduler  from './StaffScheduler';
import StaffAttendance from './StaffAttendance';
import ComplianceTracker from './ComplianceTracker';
import IncidentLog     from './IncidentLog';
import VendorScorecard from './VendorScorecard';
import PolicyGapAnalyzer from './PolicyGapAnalyzer';
import TrainingTracker from './TrainingTracker';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<Portfolio />} />
        <Route path="/risk-matrix"       element={<RiskMatrix />} />
        <Route path="/staff-scheduler"   element={<StaffScheduler />} />
        <Route path="/staff-attendance"  element={<StaffAttendance />} />
        <Route path="/compliance-tracker" element={<ComplianceTracker />} />
        <Route path="/incident-log"      element={<IncidentLog />} />
        <Route path="/vendor-scorecard"  element={<VendorScorecard />} />
        <Route path="/policy-gap"        element={<PolicyGapAnalyzer />} />
        <Route path="/training-tracker"  element={<TrainingTracker />} />
      </Routes>
    </BrowserRouter>
  );
}
