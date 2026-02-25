"use server";
import { auth, signIn, signOut } from "@/auth";
import { signInFormSchema, signUpFormSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { hashSync } from "bcrypt-ts-edge";
import { Prisma } from "@prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData,
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);

    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: "Invalid email or password" };
  }
}
// Sign user out
export async function signOutUser() {
  await signOut();
}
