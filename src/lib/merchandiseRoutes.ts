const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isMerchandiseId = (value: unknown): value is string =>
  typeof value === "string" && UUID.test(value);
const root = "/souvenirs";
const bare = (path: string) => path.replace(/^\/(th|en)(?=\/|$)/, "");
export function isMerchandisePath(pathname: string): boolean {
  const path = bare(pathname).replace(/\/$/, "");
  return (
    [root, `${root}/cart`, `${root}/checkout`, `${root}/orders`].includes(
      path,
    ) ||
    ["products", "orders"].some(
      (part) =>
        path.startsWith(`${root}/${part}/`) &&
        isMerchandiseId(path.slice(`${root}/${part}/`.length)),
    )
  );
}
export function merchandiseReturnPath(
  value: string | null | undefined,
): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\#\u0000-\u001f\u007f]/.test(value) ||
    /%(?![0-9a-f]{2})/i.test(value)
  )
    return null;
  const relative = bare(value),
    split = relative.indexOf("?"),
    pathname = split < 0 ? relative : relative.slice(0, split);
  if (
    !isMerchandisePath(pathname) ||
    pathname.includes("%") ||
    pathname.includes("//")
  )
    return null;
  const path = pathname.replace(/\/$/, "");
  const query = new URLSearchParams(split < 0 ? "" : relative.slice(split + 1)),
    result = new URLSearchParams();
  const allowed =
    path === root
      ? ["q", "categoryId", "kind", "page", "intentId"]
      : path.startsWith(`${root}/products/`)
        ? ["intentId"]
        : [];
  for (const key of query.keys())
    if (!allowed.includes(key) || query.getAll(key).length !== 1) return null;
  for (const key of allowed) {
    const text = query.get(key);
    if (text === null) continue;
    if (/[\u0000-\u001f\u007f]/.test(text)) return null;
    if (key === "q") {
      if (text.length > 200) return null;
      if (text.trim()) result.set(key, text.trim());
    } else if (key === "kind") {
      if (!["single", "bundle"].includes(text)) return null;
      result.set(key, text);
    } else if (key === "page") {
      if (
        !/^\d+$/.test(text) ||
        !Number.isSafeInteger(Number(text)) ||
        Number(text) < 1
      )
        return null;
      result.set(key, String(Number(text)));
    } else {
      if (!isMerchandiseId(text)) return null;
      result.set(key, text.toLowerCase());
    }
  }
  return path + (result.size ? `?${result}` : "");
}
export function merchandiseLoginPath(
  returnPath: string,
  reauthenticate = false,
): string {
  return (
    "/login?redirect=" +
    encodeURIComponent(merchandiseReturnPath(returnPath) ?? root) +
    (reauthenticate ? "&reauth=merchandise" : "")
  );
}
export function isMerchandiseReauthentication(search: string): boolean {
  const query = new URLSearchParams(search);
  return (
    query.getAll("reauth").length === 1 &&
    query.get("reauth") === "merchandise" &&
    query.getAll("redirect").length === 1 &&
    merchandiseReturnPath(query.get("redirect")) !== null
  );
}
// Detection only: encoded aliases must also reach the strict validator.
export function targetsMerchandiseNamespace(value: string): boolean {
  if (bare(value).startsWith(root)) return true;
  try {
    return bare(
      decodeURIComponent(new URL(value, "https://internal.invalid").pathname),
    ).startsWith(root);
  } catch {
    return false;
  }
}
// Native Next router in the incumbent SSO callback needs a locale prefix.
// Return null for unrelated destinations so their existing behavior stays intact.
export function merchandiseSsoReturnPath(
  value: string,
  locale: string,
): string | null {
  if (!targetsMerchandiseNamespace(value)) return null;
  return `/${locale === "th" ? "th" : "en"}${merchandiseReturnPath(value) ?? ""}`;
}
