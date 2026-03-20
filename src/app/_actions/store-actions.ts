"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  addToWishlist,
  cancelCheckoutOrder,
  confirmCheckoutOrder,
  createCheckoutOrder,
  hidePurchase,
  pauseDownload,
  queueInstall,
  removeFromWishlist,
  reportApp,
  reportDeveloper,
  resolveAppReport,
  resolveDeveloperReport,
  restorePurchases,
  resumeDownload,
  retryDownload,
  signOutDevice,
  submitReview,
  toggleNotification,
  unhidePurchase,
} from "@/lib/store-service";
import { checkoutPlatforms, paymentMethodTypes } from "@/server/commerce/contracts/registry";

const slugActionSchema = z.object({
  slug: z.string().trim().min(1),
  returnPath: z.string().trim().default("/library"),
});

const toggleNotificationSchema = z.object({
  label: z.string().trim().min(1),
  enabled: z.enum(["true", "false"]).optional(),
  returnPath: z.string().trim().default("/account"),
});

const deviceSchema = z.object({
  name: z.string().trim().min(1),
  returnPath: z.string().trim().default("/account"),
});

const reviewSchema = z.object({
  appSlug: z.string().trim().min(1),
  author: z.string().trim().min(1),
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  returnPath: z.string().trim().default("/library"),
});

const appReportSchema = z.object({
  appSlug: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  detail: z.string().trim().optional(),
  returnPath: z.string().trim().default("/ops-console"),
});

const developerReportSchema = z.object({
  developerSlug: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  detail: z.string().trim().optional(),
  returnPath: z.string().trim().default("/ops-console"),
});

const checkoutCreateSchema = z.object({
  appSlug: z.string().trim().min(1),
  countryCode: z.string().trim().length(2),
  currencyCode: z.string().trim().length(3),
  platform: z.enum(checkoutPlatforms),
  preferMerchantOfRecord: z.enum(["true", "false"]).optional(),
});

const checkoutOrderSchema = z.object({
  id: z.string().trim().min(1),
  appSlug: z.string().trim().min(1),
  returnPath: z.string().trim().default("/library"),
  paymentMethod: z.enum(paymentMethodTypes).optional(),
});

const resolveReportSchema = z.object({
  id: z.string().trim().min(1),
  resolutionNote: z.string().trim().optional(),
  returnPath: z.string().trim().default("/ops-console"),
});

function parseFormData<T>(formData: FormData, schema: z.ZodSchema<T>) {
  const values = Object.fromEntries(formData.entries());
  return schema.parse(values);
}

function safePath(pathname: string, fallback: string) {
  return pathname.startsWith("/") ? pathname : fallback;
}

function revalidateStorePaths(paths: string[]) {
  for (const pathname of new Set(paths)) {
    revalidatePath(pathname);
  }
}

export async function addToWishlistAction(formData: FormData) {
  const { slug, returnPath } = parseFormData(formData, slugActionSchema);
  addToWishlist(slug);
  const target = safePath(returnPath, `/apps/${slug}`);
  revalidateStorePaths([target, "/library", "/account"]);
  redirect(target);
}

export async function removeFromWishlistAction(formData: FormData) {
  const { slug, returnPath } = parseFormData(formData, slugActionSchema);
  removeFromWishlist(slug);
  const target = safePath(returnPath, "/library");
  revalidateStorePaths([target, "/library"]);
  redirect(target);
}

export async function queueInstallAction(formData: FormData) {
  const { slug, returnPath } = parseFormData(formData, slugActionSchema);
  queueInstall(slug);
  const target = safePath(returnPath, "/library");
  revalidateStorePaths([target, "/library"]);
  redirect(target);
}

export async function pauseDownloadAction(formData: FormData) {
  const { slug, returnPath } = parseFormData(formData, slugActionSchema);
  pauseDownload(slug);
  const target = safePath(returnPath, "/library");
  revalidateStorePaths([target, "/library"]);
  redirect(target);
}

export async function resumeDownloadAction(formData: FormData) {
  const { slug, returnPath } = parseFormData(formData, slugActionSchema);
  resumeDownload(slug);
  const target = safePath(returnPath, "/library");
  revalidateStorePaths([target, "/library"]);
  redirect(target);
}

export async function retryDownloadAction(formData: FormData) {
  const { slug, returnPath } = parseFormData(formData, slugActionSchema);
  retryDownload(slug);
  const target = safePath(returnPath, "/library");
  revalidateStorePaths([target, "/library"]);
  redirect(target);
}

export async function hidePurchaseAction(formData: FormData) {
  const { slug, returnPath } = parseFormData(formData, slugActionSchema);
  hidePurchase(slug);
  const target = safePath(returnPath, "/library");
  revalidateStorePaths([target, "/library"]);
  redirect(target);
}

export async function unhidePurchaseAction(formData: FormData) {
  const { slug, returnPath } = parseFormData(formData, slugActionSchema);
  unhidePurchase(slug);
  const target = safePath(returnPath, "/library");
  revalidateStorePaths([target, "/library"]);
  redirect(target);
}

export async function restorePurchasesAction(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const returnPath =
    typeof values.returnPath === "string" ? values.returnPath : "/library";
  restorePurchases();
  const target = safePath(returnPath, "/library");
  revalidateStorePaths([target, "/library"]);
  redirect(target);
}

export async function toggleNotificationAction(formData: FormData) {
  const { label, enabled, returnPath } = parseFormData(
    formData,
    toggleNotificationSchema,
  );
  toggleNotification({
    label,
    enabled: enabled ? enabled === "true" : undefined,
  });
  const target = safePath(returnPath, "/account");
  revalidateStorePaths([target, "/account"]);
  redirect(target);
}

export async function signOutDeviceAction(formData: FormData) {
  const { name, returnPath } = parseFormData(formData, deviceSchema);
  signOutDevice(name);
  const target = safePath(returnPath, "/account");
  revalidateStorePaths([target, "/account"]);
  redirect(target);
}

export async function submitReviewAction(formData: FormData) {
  const values = parseFormData(formData, reviewSchema);
  submitReview(values);
  const target = safePath(values.returnPath, `/apps/${values.appSlug}`);
  revalidateStorePaths([target, "/library", "/developer-console"]);
  redirect(target);
}

export async function reportAppAction(formData: FormData) {
  const values = parseFormData(formData, appReportSchema);
  reportApp(values);
  const target = safePath(values.returnPath, `/apps/${values.appSlug}`);
  revalidateStorePaths([target, "/ops-console", "/developer-console"]);
  redirect(target);
}

export async function reportDeveloperAction(formData: FormData) {
  const values = parseFormData(formData, developerReportSchema);
  reportDeveloper(values);
  const target = safePath(values.returnPath, `/developers/${values.developerSlug}`);
  revalidateStorePaths([target, "/ops-console", "/developer-console"]);
  redirect(target);
}

export async function createCheckoutOrderAction(formData: FormData) {
  const values = parseFormData(formData, checkoutCreateSchema);
  const order = createCheckoutOrder({
    appSlug: values.appSlug,
    countryCode: values.countryCode,
    currencyCode: values.currencyCode,
    platform: values.platform,
    preferMerchantOfRecord: values.preferMerchantOfRecord === "true",
  });
  revalidateStorePaths([
    `/checkout/${values.appSlug}`,
    "/ops-console",
    "/developer-console",
  ]);
  redirect(
    `/checkout/${values.appSlug}?countryCode=${values.countryCode}&currencyCode=${values.currencyCode}&platform=${values.platform}&order=${order.id}`,
  );
}

export async function confirmCheckoutOrderAction(formData: FormData) {
  const values = parseFormData(formData, checkoutOrderSchema);
  confirmCheckoutOrder({
    id: values.id,
    paymentMethod: values.paymentMethod,
  });
  revalidateStorePaths([
    `/checkout/${values.appSlug}`,
    "/library",
    "/account",
    "/ops-console",
    "/developer-console",
  ]);
  redirect(safePath(values.returnPath, "/library"));
}

export async function cancelCheckoutOrderAction(formData: FormData) {
  const values = parseFormData(formData, checkoutOrderSchema);
  cancelCheckoutOrder(values.id);
  revalidateStorePaths([`/checkout/${values.appSlug}`, "/ops-console"]);
  redirect(`/checkout/${values.appSlug}`);
}

export async function resolveAppReportAction(formData: FormData) {
  const values = parseFormData(formData, resolveReportSchema);
  resolveAppReport(values.id, values.resolutionNote);
  const target = safePath(values.returnPath, "/ops-console");
  revalidateStorePaths([target, "/ops-console", "/developer-console"]);
  redirect(target);
}

export async function resolveDeveloperReportAction(formData: FormData) {
  const values = parseFormData(formData, resolveReportSchema);
  resolveDeveloperReport(values.id, values.resolutionNote);
  const target = safePath(values.returnPath, "/ops-console");
  revalidateStorePaths([target, "/ops-console", "/developer-console"]);
  redirect(target);
}
