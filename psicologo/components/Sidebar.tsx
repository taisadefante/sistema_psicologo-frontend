import { useState, useEffect } from "react";
import {
  FaBars,
  FaHome,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import Link from "next/link";
import styles from "../styles/Sidebar.module.css";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
      <button className={styles.toggle} onClick={() => setIsOpen(!isOpen)}>
        <FaBars />
      </button>
      <nav>
        <ul>
          <li>
            <Link href="/">
              <FaHome /> Home
            </Link>
          </li>
          <li>
            <Link href="/patients">
              <FaUser /> Pacientes
            </Link>
          </li>
          <li>
            <Link href="/appointments">
              <FaCalendarAlt /> Consultas
            </Link>
          </li>
          <li>
            <Link href="/payments">
              <FaMoneyBillWave /> Pagamentos
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
