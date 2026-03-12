import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { QuestionnaireForm } from './components/QuestionnaireForm';
import { Impressum } from './pages/Impressum';
import { GlobalNavigation } from './components/GlobalNavigation';
import './App.css';

function App() {
  return (
    <Router>
      <GlobalNavigation />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/questionnaire/:id" element={<QuestionnaireForm />} />
        <Route path="/impressum" element={<Impressum />} />
      </Routes>
    </Router>
  );
}

export default App;

