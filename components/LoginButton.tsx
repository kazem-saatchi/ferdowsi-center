"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";

function LoginButton() {
  const [login, setLogin] = useState<boolean>(false);
  return (
    <Button
      className="w-96"
      variant="outline"
      size="lg"
      onClick={() => {
        setLogin(true);
      }}
      disabled={login}
      asChild
    >
      <Link href="/login">
        {login ? "در حال ورود ..." : "ورود به حساب کاربری"}
      </Link>
    </Button>
  );
}

export default LoginButton;
