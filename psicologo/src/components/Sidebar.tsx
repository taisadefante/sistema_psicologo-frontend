import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    router.push("/");
  };

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
      <div className={styles.logoContainer}>
        <Image src="/logo.png" alt="Logo" width={150} height={50} />
      </div>

      <button className={styles.toggle} onClick={() => setIsOpen(!isOpen)}>
        <FaBars />
      </button>

      <nav className={styles.menu}>
        <ul>
          <li>
            <Link href="/home">
              <div className={styles.link}>
                <FaHome /> {isOpen && "Home"}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/pacientes">
              <div className={styles.link}>
                <FaUser /> {isOpen && "Pacientes"}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/consultas">
              <div className={styles.link}>
                <FaCalendarAlt /> {isOpen && "Consultas"}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/pagamentos">
              <div className={styles.link}>
                <FaMoneyBillWave /> {isOpen && "Pagamentos"}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/dashboard">
              <div className={styles.link}>
                <FaChartPie /> {isOpen && "Dashboard"}
              </div>
            </Link>
          </li>
        </ul>
      </nav>

      <div className={styles.logoutContainer}>
        <div className={styles.logout} onClick={handleLogout}>
          <FaSignOutAlt /> {isOpen && "Sair"}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
