"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("1fbca9bc-05ab-430b-8a8d-2bf2ac6c2c88");
  }, []);

  return null;
};
