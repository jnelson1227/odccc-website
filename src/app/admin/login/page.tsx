import Image from "next/image";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string; error?: string }>;
}) {
  const { denied, error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-fir-900 px-6 py-12">
      <div className="flex w-full max-w-md flex-col gap-7 rounded-[10px] bg-admin-card p-8">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/images/site/odccc-logo.png"
            alt="Oregon Divisional Chainsaw Carving Championship"
            width={296}
            height={197}
            className="h-20 w-auto object-contain"
          />
          <h1 className="display m-0 text-[30px] font-black uppercase leading-none">Site admin</h1>
          <p className="m-0 text-center text-[14px] text-admin-muted">
            Sign in with your email and password. Ask Jill if you don&apos;t have one yet.
          </p>
        </div>

        {denied && (
          <p
            role="alert"
            className="m-0 rounded-md border border-admin-highlight-border bg-admin-highlight px-4 py-3 text-[14px]"
          >
            <strong>{denied}</strong> isn&apos;t on the admin list for this site, so we signed you
            back out. Ask Jill to add you under Admins.
          </p>
        )}

        {error && error !== "missing-code" && (
          <div
            role="alert"
            className="m-0 flex flex-col gap-2 rounded-md border border-admin-highlight-border bg-admin-highlight px-4 py-3 text-[14px] leading-[1.5]"
          >
            <strong>That sign-in link didn&apos;t work.</strong>
            {error === "wrong-browser" ? (
              <span>
                A link only works in the browser that asked for it, and only until a newer one is
                requested. <strong>Sign in with your password instead</strong> — it has none of
                these problems.
              </span>
            ) : (
              <span>
                Links work once and expire after an hour, and some email providers open them
                automatically, which uses them up.{" "}
                <strong>Sign in with your password instead.</strong>
              </span>
            )}
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
