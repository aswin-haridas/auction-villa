"use client";
import Link from "next/link";
import Card from "../components/AtomCard";
import { anton } from "../font/fonts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuctions } from "../services/auction";
import { Auction } from "../types/auction";

function AuctionPage() {
  const router = useRouter();
  const [liveAuctions, setLiveAuctions] = useState<Auction[]>([]);
  const [previousAuctions, setPreviousAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!sessionStorage.getItem("username")) {
      router.push("/auth");
      return;
    }

    // Fetch auctions
    const fetchAuctions = async () => {
      try {
        // Fetch all auctions
        const allAuctions = await getAuctions();

        // Separate live and previous auctions
        const live = allAuctions.filter(
          (auction) =>
            auction.status === "active" &&
            new Date(auction.end_time) > new Date()
        );

        const previous = allAuctions.filter(
          (auction) =>
            auction.status === "closed" ||
            new Date(auction.end_time) <= new Date()
        );

        setLiveAuctions(live);
        setPreviousAuctions(previous);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, [router]);

  if (isLoading) {
    return (
      <div className="px-12 py-8">
        <p className="text-white">Loading auctions...</p>
      </div>
    );
  }

  return (
    <div className="px-12 pb-12">
      {/* Live Auctions Section */}
      <p className={`${anton.className} text-[#878787] text-3xl pt-8`}>
        Live auctions
      </p>
      {liveAuctions.length === 0 ? (
        <p className="text-white mt-4">No live auctions at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-8">
          {liveAuctions.map((item) => (
            <Link key={item.id} href={`/auction/${item.id}`}>
              <Card
                image={item.image[0]}
                name={item.name}
                category={item.category}
              />
            </Link>
          ))}
        </div>
      )}

      {/* Previous Auctions Section */}
      <p className={`${anton.className} text-[#878787] text-3xl pt-12`}>
        Previous auctions
      </p>
      {previousAuctions.length === 0 ? (
        <p className="text-white mt-4">No previous auctions.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-8">
          {previousAuctions.map((item) => (
            <div key={item.id} className="relative">
              <Link href={`/auction/${item.id}`}>
                <Card
                  image={item.image[0]}
                  name={item.name}
                  category={item.category}
                />
              </Link>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2 text-center">
                <p className="text-white text-sm">
                  Winner: {item.winner || "No winner"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuctionPage;
