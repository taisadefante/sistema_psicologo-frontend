import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import Sidebar from "../components/Sidebar";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    <div style={{ display: "flex" }}>
      {isAuthenticated && <Sidebar />}
      <div style={{ flex: 1, paddingLeft: isAuthenticated ? "250px" : "0px" }}>
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
