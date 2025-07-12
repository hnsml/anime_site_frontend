// Registration form component
"use client";

import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuthInput } from "@/components/auth/auth-input";
import { Mail, Lock, User } from "lucide-react";

export function RegisterForm({}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({ 
    name: false, 
    email: false, 
    password: false, 
    confirmPassword: false 
  });
  const { register, loading, error } = useAuth();
  const router = useRouter();

  const isNameValid = name.trim().length >= 2;
  const isEmailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8;
  const isConfirmPasswordValid = confirmPassword === password && password.length > 0;

  const nameError = touched.name && !isNameValid ? "Введіть ім'я (мінімум 2 символи)" : "";
  const emailError = touched.email && !isEmailValid ? "Введіть дійсний e-mail" : "";
  const passwordError = touched.password && !isPasswordValid ? "Пароль повинен містити мінімум 8 символів" : "";
  const confirmPasswordError = touched.confirmPassword && !isConfirmPasswordValid ? "Паролі не співпадають" : "";

  const isFormValid = isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;

  // Clear error when user starts typing
  useEffect(() => {
    if (error && (name || email || password || confirmPassword)) {
      // Clear error when user starts typing (optional)
    }
  }, [name, email, password, confirmPassword, error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ 
      name: true, 
      email: true, 
      password: true, 
      confirmPassword: true 
    });
    
    if (isFormValid) {
      const success = await register(name, email, password);
      if (success) {
        router.push("/");
      }
      // If registration fails, the error will be set in the auth context
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-6">
        <div className="grid gap-3">
          <AuthInput
            icon={User}
            id="name"
            type="text"
            placeholder="Ім'я"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            required
            aria-invalid={touched.name && !isNameValid}
            disabled={loading}
          />
          {nameError && (
            <span className="pl-2 text-xs text-red-500">{nameError}</span>
          )}
        </div>

        <div className="grid gap-3">
          <AuthInput
            icon={Mail}
            id="email"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            required
            aria-invalid={touched.email && !isEmailValid}
            disabled={loading}
          />
          {emailError && (
            <span className="pl-2 text-xs text-red-500">{emailError}</span>
          )}
        </div>

        <div className="grid gap-3">
          <AuthInput
            icon={Lock}
            id="password"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            required
            aria-invalid={touched.password && !isPasswordValid}
            disabled={loading}
          />
          {passwordError && (
            <span className="pl-2 text-xs text-red-500">{passwordError}</span>
          )}
        </div>

        <div className="grid gap-3">
          <AuthInput
            icon={Lock}
            id="confirmPassword"
            type="password"
            placeholder="Підтвердіть пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
            required
            aria-invalid={touched.confirmPassword && !isConfirmPasswordValid}
            disabled={loading}
          />
          {confirmPasswordError && (
            <span className="pl-2 text-xs text-red-500">{confirmPasswordError}</span>
          )}
        </div>
        
        {/* Show authentication error */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}
        
        <div className="flex justify-center">
          <Button
            type="submit"
            size="sm"
            className={cn(
              "hover:text-dark-white bg-blue hover:bg-dark-blue cursor-pointer font-sans text-lg font-semibold text-white",
              "rounded-[3.25rem]",
              "px-0 py-0",
              "h-[3.75rem] w-[7.5rem] md:w-[8.5rem]",
              !isFormValid || loading
                ? "pointer-events-none opacity-60"
                : "",
            )}
            disabled={loading || !isFormValid}
          >
            {loading ? "Реєстрація..." : "Зареєструватися"}
          </Button>
        </div>
      </div>
    </form>
  );
}