"use client";

import { useTransition } from "react";
import { setProductStatus } from "@/actions/products";
import styles from "./products.module.css";

export function StatusToggle({ productId, status }: { productId: string; status: "active" | "archived" }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className={status === "active" ? styles.statusActive : styles.statusArchived}
      disabled={isPending}
      onClick={() =>
        startTransition(() => {
          void setProductStatus(productId, status === "active" ? "archived" : "active");
        })
      }
    >
      {status === "active" ? "Active" : "Archived"}
    </button>
  );
}
