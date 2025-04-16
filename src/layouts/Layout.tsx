import { Link, Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <div>
            <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc", background: "#f0f0f0" }}>
                <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
                <Link to="/chatbot" style={{ marginRight: "1rem" }}>Chatbot</Link>
                <Link to="/document" style={{ marginRight: "1rem" }}>Document</Link>
            </nav>

            <main style={{ padding: "1rem" }}>
                <Outlet />
            </main>

        </div>
    )
};

export default Layout;