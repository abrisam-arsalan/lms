"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createHandoffCode } from "@/lib/handoff";

export async function launchCbt(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const code = await createHandoffCode(user.id);
  const cbtBaseUrl = process.env.CBT_BASE_URL ?? "https://ujian.smpn5tegal.sch.id";

  redirect(`${cbtBaseUrl}/sso/portal-handoff?code=${code}`);
}
