import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

export function useVerifyUser() {
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUserId = sessionStorage.getItem("user_id");
        setUserId(storedUserId);
        setIsLoading(false);

        if (!storedUserId) {
            router.push("/auth");
        }
    }, [router]);

    return {userId, isLoading};
}
