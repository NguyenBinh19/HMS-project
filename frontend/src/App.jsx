import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import ScrollToTop from "./utils/ScrollToTop";
import AppRoutes from "./routes/index";
import GlobalChatWidget from "./components/chat/GlobalChatWidget.jsx";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";

function App() {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));

    useEffect(() => {
        const handleStorageChange = () => {
            setUser(JSON.parse(localStorage.getItem("user")));
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return (
        <BrowserRouter>
            <AuthContextProvider>
                <ScrollToTop />
                {user && <GlobalChatWidget />}
                <AppRoutes />
            </AuthContextProvider>
        </BrowserRouter>
    );
}


export default App;
