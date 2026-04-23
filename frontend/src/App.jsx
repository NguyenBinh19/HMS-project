import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import ScrollToTop from "./utils/ScrollToTop";
import AppRoutes from "./routes/index";
import GlobalChatWidget from "./components/chat/GlobalChatWidget.jsx";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";

function App() {
    return (
        <BrowserRouter>
            <AuthContextProvider>
                <ScrollToTop />
                <AppRoutes />
            </AuthContextProvider>
        </BrowserRouter>
    );
}


export default App;
