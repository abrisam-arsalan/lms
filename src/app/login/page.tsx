import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import LoginPage from "./login-client";

// force-dynamic: HTML login TIDAK boleh diprerender/dicache (akibatnya tema
// baru tak muncul berbulan-bulan di browser pengguna setelah rilis).
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Masuk — LMS SMPN 5 Tegal",
  cacheControl: "no-store",
};

export default async function LoginRoute() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");
  return <LoginPage />;
}
