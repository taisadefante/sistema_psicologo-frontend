import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import Sidebar from "../components/Sidebar";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    setIsAuthenticated(auth === "true");

    if (auth !== "true" && router.pathname !== "/") {
      router.push("/");
    }
  }, [router.pathname]);

  if (!isAuthenticated && router.pathname !== "/") {
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      {isAuthenticated && (
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}
      <div
        style={{
          flex: 1,
          marginLeft: isAuthenticated
            ? isSidebarOpen
              ? "250px"
              : "60px"
            : "0px",
          transition: "margin-left 0.3s ease",
          padding: "20px",
          width: "100%",
        }}
      >
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
