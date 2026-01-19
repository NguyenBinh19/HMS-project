import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import ScrollToTop from "./utils/ScrollToTop";
import AppRoutes from "./routes/index";
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <AuthContextProvider>
      <BrowserRouter>
      <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </AuthContextProvider>
  );
}

export default App;
