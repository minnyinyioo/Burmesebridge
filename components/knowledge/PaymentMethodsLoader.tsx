"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PaymentMethods, {
  type PaymentMethod,
} from "@/components/knowledge/PaymentMethods";
export default function PaymentMethodsLoader({ locale }: { locale: string }) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  useEffect(() => {
    let active = true;
    supabase
      .from("knowledge_payment_methods")
      .select(
        "id,name,account_name,account_number,instructions_my,instructions_zh,instructions_en",
      )
      .eq("enabled", true)
      .order("sort_order")
      .then(({ data }) => {
        if (active) setMethods((data || []) as PaymentMethod[]);
      });
    return () => {
      active = false;
    };
  }, []);
  return <PaymentMethods methods={methods} locale={locale} />;
}
