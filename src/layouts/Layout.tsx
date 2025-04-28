import { NavLink, Outlet } from "react-router-dom";
import './Layout.css';

const Layout = () => {
    return (
        <div style={{ display: "flex", height : "100vh"}}>
            <nav style={{ 
                width: "10%", 
                padding: "1%", 
                marginRight: "1rem",
                borderRight: "1px solid #ccc", 
                background: "#f0f0f0", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",

            }}> {/* Main container */}


                <NavLink to="/" style={{marginBottom: "2rem" }}>
                    <img src = "DARYL_transparent.png" alt="Logo" style={{ width: "100px", marginBottom: "1rem" }} />
                </NavLink>
                
                <NavLink 
                    to="/chatbot" 
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                    Chatbot
                </NavLink>
                <NavLink 
                    to="/document" 
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                    Document
                </NavLink>
            </nav>

            <main className="flex-1 p-4">
                <Outlet />
            </main>

        </div>
    )
};

export default Layout;