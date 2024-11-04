import type { Database } from "@midday/supabase/types";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { cookies } from 'next/headers'

const currency = "USD";

export async function Ticker() {
  const cookieStore = await cookies()
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
  // const client = createServerClient<Database>(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.SUPABASE_SERVICE_KEY!,
  //   {
  //     cookies: {
  //       get: (name: string) => cookieStore.get(name)?.value,
  //       set: (name: string, value: string, options: any) => {},
  //       remove: (name: string, options: any) => {},
  //     },
  //     cookieOptions: {
  //       secure: process.env.NODE_ENV === "production",
  //     },
  //   }
  // );

  const [
    { data: totalSum },
    { count: businessCount },
    { count: transactionCount },
  ] = await Promise.all([
    client.rpc("calculate_total_sum", {
      target_currency: currency,
    }),
    client.from("teams").select("id", { count: "exact", head: true }).limit(1),
    client
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .limit(1),
  ]);

  return (
    <div className="text-center flex flex-col mt-[120px] md:mt-[280px] mb-[120px] md:mb-[250px] space-y-4 md:space-y-10">
      <span className="font-medium font-mono text-center text-[40px] md:text-[80px] lg:text-[100px] xl:text-[130px] 2xl:text-[160px] md:mb-2 text-stroke leading-none">
        {Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
          maximumFractionDigits: 0,
        }).format(totalSum ?? 0)}
      </span>
      <span className="text-[#878787]">
        Through our system{" "}
        <Link href="/open-startup" className="underline">
          {Intl.NumberFormat("en-US", {
            maximumFractionDigits: 0,
          }).format(transactionCount ?? 0)}
        </Link>{" "}
        transactions across{" "}
        <Link href="/open-startup" className="underline">
          {Intl.NumberFormat("en-US", {
            maximumFractionDigits: 0,
          }).format(businessCount ?? 0)}
        </Link>{" "}
        businesses.
      </span>
    </div>
  );
}
