"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("Procesando...");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Cuenta creada correctamente.");
        router.push("/dashboard");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Inicio de sesión correcto.");
      router.push("/dashboard");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="brand">Imperio AI</div>
        <h1>{mode === "signup" ? "Crear cuenta" : "Iniciar sesión"}</h1>
        <p>
          {mode === "signup"
            ? "Crea tu cuenta para empezar a usar tu agente de IA."
            : "Accede a tu panel para gestionar tu agente de IA."}
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Correo
            <input
              type="email"
              placeholder="negocio@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" className="btn btn-primary full">
            {mode === "signup" ? "Crear cuenta" : "Entrar"}
          </button>
        </form>

        {message && <p className="message-ok">{message}</p>}

        <button
          type="button"
          className="btn btn-secondary full"
          style={{ marginTop: "14px" }}
          onClick={() =>
            setMode((prev) => (prev === "signup" ? "login" : "signup"))
          }
        >
          {mode === "signup"
            ? "Ya tengo cuenta"
            : "No tengo cuenta, quiero registrarme"}
        </button>

        <Link href="/" className="back-link">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}