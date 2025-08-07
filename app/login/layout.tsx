import SessionProvider from "@/providers/next-auth-provider";
import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export default async function AuthRootLayout({ children }: Props) {
    return (
        // This added because of Next-Auth doesn't provide way to add base path in signIn, register
        // Refernce https://github.com/nextauthjs/next-auth/issues/9425#issuecomment-1909667358
        // https://github.com/nextauthjs/next-auth/issues/9425#issuecomment-1909749747
        <SessionProvider basePath={process.env.MG_NEXTAUTH_BASE_PATH}>
            <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md overflow-y-auto bg-white text-logincardforeground border rounded-lg p-6 pb-14">
                    {children}
                </div>
            </main>
        </SessionProvider>
    );
}
