"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function markRead(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const id = BigInt(String(formData.get("id") ?? "0"));
  await prisma.notification.updateMany({
    where: { id, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifikasi");
  revalidatePath("/dashboard");
}

export async function markAll(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifikasi");
  revalidatePath("/dashboard");
}
