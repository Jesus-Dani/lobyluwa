"use client";

import { useEffect, useState } from "react";
import { Address } from "@prisma/client";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/money";
import { createAddress } from "@/actions/addresses";
import styles from "./checkout.module.css";

type VariantDetail = {
  id: string;
  size: string;
  color: string;
  product: { name: string; salePrice: number };
};

export function CheckoutForm({
  addresses: initialAddresses,
  defaultPhoneNumber,
}: {
  addresses: Address[];
  defaultPhoneNumber: string;
}) {
  const { items, clear } = useCart();
  const [details, setDetails] = useState<Record<string, VariantDetail>>({});
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(initialAddresses[0]?.id ?? "");
  const [showNewAddress, setShowNewAddress] = useState(initialAddresses.length === 0);
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    recipientName: "",
    phoneNumber: defaultPhoneNumber,
    street: "",
    city: "",
    state: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    fetch(`/api/cart/items?ids=${items.map((i) => i.variantId).join(",")}`)
      .then((res) => res.json())
      .then((data: { variants: VariantDetail[] }) => {
        const map: Record<string, VariantDetail> = {};
        for (const variant of data.variants) map[variant.id] = variant;
        setDetails(map);
      });
  }, [items]);

  const total = items.reduce((sum, item) => {
    const detail = details[item.variantId];
    return sum + (detail ? detail.product.salePrice * item.quantity : 0);
  }, 0);

  async function handlePayNow() {
    setError(null);
    setLoading(true);

    let addressId = selectedAddressId;

    if (showNewAddress) {
      const result = await createAddress(newAddress);
      if (result.error || !result.address) {
        setError(result.error ?? "Could not save address");
        setLoading(false);
        return;
      }
      addressId = result.address.id;
      setAddresses((prev) => [result.address!, ...prev]);
    }

    if (!addressId) {
      setError("Please select or add a delivery address.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        addressId,
        phoneNumberAtCheckout: phoneNumber,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Checkout failed. Please try again.");
      setLoading(false);
      return;
    }

    clear();
    window.location.href = data.authorizationUrl;
  }

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <p>Your cart is empty.</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1>Checkout</h1>
      <div className={styles.layout}>
        <div className={styles.formSection}>
          <section>
            <h2>Delivery Address</h2>
            {addresses.map((address) => (
              <label key={address.id} className={styles.addressOption}>
                <input
                  type="radio"
                  name="address"
                  checked={!showNewAddress && selectedAddressId === address.id}
                  onChange={() => {
                    setSelectedAddressId(address.id);
                    setShowNewAddress(false);
                  }}
                />
                <span>
                  <strong>{address.label}</strong> — {address.recipientName}, {address.street}, {address.city}, {address.state}
                </span>
              </label>
            ))}
            <label className={styles.addressOption}>
              <input type="radio" name="address" checked={showNewAddress} onChange={() => setShowNewAddress(true)} />
              <span>Add a new address</span>
            </label>

            {showNewAddress && (
              <div className={styles.newAddressForm}>
                <input
                  placeholder="Label (e.g. Home, Office)"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                />
                <input
                  placeholder="Recipient name"
                  value={newAddress.recipientName}
                  onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                />
                <input
                  placeholder="Street address"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                />
                <input
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                />
                <input
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                />
                <input
                  placeholder="Contact phone number for this address"
                  value={newAddress.phoneNumber}
                  onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                />
              </div>
            )}
          </section>

          <section>
            <h2>Phone Number</h2>
            <p className={styles.hint}>May differ from your account phone — e.g. if this is a gift.</p>
            <input
              className={styles.phoneInput}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </section>
        </div>

        <div className={styles.summary}>
          <h2>Order Summary</h2>
          {items.map((item) => {
            const detail = details[item.variantId];
            if (!detail) return null;
            return (
              <div key={item.variantId} className={styles.summaryItem}>
                <span>
                  {item.quantity}× {detail.product.name}
                </span>
                <span>{formatNaira(detail.product.salePrice * item.quantity)}</span>
              </div>
            );
          })}
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.payButton} onClick={handlePayNow} disabled={loading}>
            {loading ? "Redirecting to Paystack..." : "Pay Now"}
          </button>
        </div>
      </div>
    </main>
  );
}
