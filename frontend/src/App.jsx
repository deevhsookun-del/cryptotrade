import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatProvider } from "./chat/ChatContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";

import Landing from "./pages/Landing";
import Learn from "./pages/learn";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import Trade from "./pages/Trade";
import TradeReal from "./pages/TradeReal";
import Deposit from "./pages/Deposit";
import InfoPage from "./pages/InfoPage";


export default function App() {
  return (
    <ChatProvider>
        <BrowserRouter>
          <Navbar />

          <main className="appMain">
            <div className="container">
             <Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/learn" element={<Learn />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />

  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />

  <Route path="/markets" element={<Markets />} />

  {/* Info pages */}
  <Route path="/p/:slug" element={<InfoPage />} />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />

 <Route
  path="/trade"
  element={
    <ProtectedRoute>
      <Trade />
    </ProtectedRoute>
  }
/>

  <Route
    path="/trade-real"
    element={
      <ProtectedRoute>
        <TradeReal />
      </ProtectedRoute>
    }
  />

  <Route
    path="/deposit"
    element={
      <ProtectedRoute>
        <Deposit />
      </ProtectedRoute>
    }
  />

</Routes>

            </div>
          </main>

          <Footer />
          <ChatWidget />
        </BrowserRouter>
      </ChatProvider>
  );
}
