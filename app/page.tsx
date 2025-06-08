"use client";
import Link from "next/link";
import Card from "./components/AtomCard";
import {anton} from "./font/fonts";
import React, {useMemo} from "react";
import {useVerifyUser} from "./lib/hooks/useVerifyUser";
import {usePaintings} from "./hooks/usePaintings";

function Auction() {
    const {userId, isLoading: userLoading} = useVerifyUser();
    const {paintings, loading: paintingsLoading} = usePaintings(userId);

    const isLoading = userLoading || paintingsLoading;

    // Distribute paintings into 5 columns for a masonry-like layout
    const columns = useMemo(() => {
        const cols: Array<typeof paintings> = [[], [], [], [], []];

        paintings.forEach((painting, index) => {
            const colIndex = index % 5;
            cols[colIndex].push(painting);
        });

        return cols;
    }, [paintings]);

    if (isLoading) {
        return <div className="px-12 py-8">Loading...</div>;
    }

    return (
        <>
            <div className="px-12">
                <p className={`${anton.className} text-[#878787] text-3xl pt-8`}>
                    Your Holdings
                </p>

                <div className="flex gap-4 pt-8">
                    {columns.map((column, columnIndex) => (
                        <div key={columnIndex} className="flex-1 flex flex-col gap-6">
                            {column.map((painting) => (
                                <Link
                                    key={painting.painting_id}
                                    href={`/basement/${painting.painting_id}`}
                                >
                                    <Card
                                        image={
                                            painting.image && painting.image[0]
                                                ? painting.image[0]
                                                : ""
                                        }
                                        name={painting.name}
                                        category={painting.category}
                                    />
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Auction;
