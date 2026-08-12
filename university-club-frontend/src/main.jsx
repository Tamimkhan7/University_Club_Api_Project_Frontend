import ReactDOM from "react-dom/client";
import App from "./App";
import AuthProvider from "./context/AuthContext";
import PresenceProvider from "./context/PresenceContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ErrorBoundary>
      <AuthProvider>
        <PresenceProvider>
          <App />
        </PresenceProvider>
      </AuthProvider>
    </ErrorBoundary>
  </BrowserRouter>
);