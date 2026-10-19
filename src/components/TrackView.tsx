"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** ส่ง event view_item เมื่อเปิดหน้าสินค้า */
export default function TrackView({ code, name, brand }: { code: string; name: string; brand: string }) {
  useEffect(() => { track("view_item", { items: [{ item_id: code, item_name: name, item_brand: brand }] }); }, [code, name, brand]);
  return null;
}
