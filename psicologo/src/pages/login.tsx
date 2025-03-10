import { useState } from "react";
import { useRouter } from "next/router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "admin" && password === "admin") {
      localStorage.setItem("auth", "true"); // ✅ Salva autenticação no localStorage
      router.push("/dashboard"); // ✅ Redireciona para o dashboard após login
    } else {
      alert("Usuário ou senha incorretos!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>🔐 Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
