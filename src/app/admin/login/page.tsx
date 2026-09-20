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
            We&apos;ll email you a link that signs you in. No password to remember.
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

        {error === "expired" && (
          <p
            role="alert"
            className="m-0 rounded-md border border-admin-highlight-border bg-admin-highlight px-4 py-3 text-[14px]"
          >
            That sign-in link has already been used or has expired. Request a new one below.
          </p>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
