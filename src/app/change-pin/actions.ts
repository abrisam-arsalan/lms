"use server";

import { redirect } from "next/navigation";
import { getSessionUser, hashPassword, logAudit } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updatePin(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const newPin = String(formData.get("newPin") ?? "").trim();
  const confirmPin = String(formData.get("confirmPin") ?? "").trim();

  if (!/^\d{6}$/.test(newPin)) {
    redirect("/change-pin?err=pin_invalid");
  }

  if (newPin !== confirmPin) {
    redirect("/change-pin?err=pin_mismatch");
  }

  const passwordHash = await hashPassword(newPin);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      mustChangePin: false,
    },
  });

  await logAudit({
    userId: user.id,
    action: "USER_GANTI_PIN_WAJIB",
    entity: "users",
    entityId: String(user.id),
  });

  redirect("/dashboard");
}
