import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import Sidebar from "../components/Sidebar";
import { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, paddingLeft: "250px" }}>
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
