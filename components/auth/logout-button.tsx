"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export const LogoutButton = () => {
    const router = useRouter();

    const logout = async () => await authClient.signOut({
        fetchOptions: {
            onSuccess: () => router.push("/login"),
        },
    });

    return (
        <Button variant="ghost" size="icon" onClick={logout} className="text-white/50 hover:text-white ml-2" title="Log Out">
            <LogOut size={18} />
        </Button>
    );
}