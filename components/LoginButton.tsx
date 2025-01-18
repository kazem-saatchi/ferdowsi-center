"use client";

import { useState } from "react";
import { Button } from "./ui/button";

function LoginButton() {
  const [login, setLogin] = useState<boolean>(false);
  return (
    <Button
      size="lg"
      onClick={() => {
        setLogin(true);
      }}
      disabled={login}
    >
      {login ? "در حال ورود ..." : "ورود به حساب کاربری"}
    </Button>
  );
}

export default LoginButton;
