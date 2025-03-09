import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // ✅ Importando Router para navegação
import {
  FaBars,
  FaHome,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaChartPie,
  FaSignOutAlt,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Sidebar.module.css";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter(); // ✅ Hook para navegação

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    alert("Você saiu do sistema!");
  };

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
      {/* ✅ LOGO CENTRALIZADO */}
      <div className={styles.logoContainer}>
        <Image src="/logo.png" alt="Logo" width={150} height={50} />
      </div>

      <button className={styles.toggle} onClick={() => setIsOpen(!isOpen)}>
        <FaBars />
      </button>

      {/* ✅ MENU */}
      <nav className={styles.menu}>
        <ul>
          <li>
            <Link href="/">
              <FaHome /> {isOpen && "Home"}
            </Link>
          </li>
          <li>
            <Link href="/patients">
              <FaUser /> {isOpen && "Pacientes"}
            </Link>
          </li>
          <li>
            <Link href="/appointments">
              <FaCalendarAlt /> {isOpen && "Consultas"}
            </Link>
          </li>
          <li>
            <Link href="/payments">
              <FaMoneyBillWave /> {isOpen && "Pagamentos"}
            </Link>
          </li>
          <li>
            {/* ✅ Corrigindo a navegação para o Dashboard */}
            <div
              className={styles.link}
              onClick={() => router.push("/dashboard")}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaChartPie /> {isOpen && "Dashboard"}
            </div>
          </li>
        </ul>
      </nav>

      {/* ✅ BOTÃO DE LOGOUT */}
      <div className={styles.logoutContainer}>
        <div className={styles.logout} onClick={handleLogout}>
          <FaSignOutAlt /> {isOpen && "Sair"}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
