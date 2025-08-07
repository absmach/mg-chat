import Link from "next/link";
import Loginform from "./_components/login-form";

export default function Login() {
    const basePath = process.env.MG_UI_BASE_PATH || "";

    return (
        <div className="text-black mt-7 w-96">
            <h1 className="font-bold text-center text-2xl">Chat App</h1>
            <h2 className="mt-5 text-center text-2xl text-black font-bold leading-9 tracking-tight">
               Sign In
            </h2>
            <div className="mt-4">
                <Loginform basePath={basePath} />
            </div>
        </div>
    );
}
