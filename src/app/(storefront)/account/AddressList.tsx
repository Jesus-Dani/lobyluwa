"use client";

import { useTransition } from "react";
import { Address } from "@prisma/client";
import { deleteAddress } from "@/actions/addresses";
import styles from "./account.module.css";

export function AddressList({ addresses }: { addresses: Address[] }) {
  const [isPending, startTransition] = useTransition();

  if (addresses.length === 0) {
    return <p>No saved addresses yet — you can add one at checkout.</p>;
  }

  return (
    <div className={styles.addressGrid}>
      {addresses.map((address) => (
        <div key={address.id} className={styles.addressCard}>
          <strong>{address.label}</strong>
          <p>{address.recipientName}</p>
          <p>
            {address.street}, {address.city}, {address.state}
          </p>
          <p>{address.phoneNumber}</p>
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                void deleteAddress(address.id);
              })
            }
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
