"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pathname = usePathname();

<Link href="/crm/config_unidades">
  <div
    className={`submenu-item ${
      pathname === "/crm/config_unidades" ? "active" : ""
    }`}
  >
    Cadastro de Unidades
  </div>
</Link>