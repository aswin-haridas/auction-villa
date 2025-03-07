import { BidHistoryProps } from "../types/auction";

const BidHistory: React.FC<BidHistoryProps> = ({ bids }) => {
  const userColors: string[] = ["#1abc9c", "#e67e22"];

  // No need to sort again if the bids are already sorted from the API
  // But we'll keep this in case the order changes
  const sortedBids = [...bids].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="flex flex-col justify-start items-start mt-8">
      <div className="w-full h-48 overflow-auto">
        {sortedBids.length === 0 ? (
          <p className="text-gray-400">No bids yet</p>
        ) : (
          sortedBids.map((bid, index) => (
            <div key={bid.bid_id || `bid-${index}-${bid.timestamp}`} className="mb-3">
              <span
                style={{ color: userColors[index % userColors.length] }}
                className="font-bold"
              >
                {bid.username}
              </span>
              <span className="text-white"> bid </span>
              <span className="text-yellow-400 font-bold">{bid.amount}u</span>
              <span className="text-gray-400 text-sm ml-2">
                {new Date(bid.timestamp).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BidHistory;
