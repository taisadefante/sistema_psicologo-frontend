import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Login.module.css";
import Image from "next/image";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    // ✅ Se o usuário já está autenticado, redireciona para Home
    if (localStorage.getItem("auth") === "true") {
      router.push("/home");
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === "admin" && password === "admin") {
      localStorage.setItem("auth", "true");
      router.push("/home"); // ✅ Agora abre diretamente a página Home
    } else {
      alert("Usuário ou senha inválidos!");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.logoContainer}>
          <Image
            src="/logo.png"
            alt="Logo Psicólogo"
            width={300}
            height={200}
          />
        </div>
        <div className={styles.formContainer}>
          <h2 className={styles.title}>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Usuário"
              className={styles.inputField}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className={styles.btnLogin}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
