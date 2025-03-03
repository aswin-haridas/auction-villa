interface Bid {
    bid_id: string;
    user_id: string;
    amount: number;
    timestamp: string;
    auction_id: string;
}

interface BidHistoryProps {
    bids: Bid[];
}

const BidHistory: React.FC<BidHistoryProps> = ({ bids }) => {
    const userColors: string[] = ["#1abc9c", "#e67e22"];

    return (
        <div className="flex flex-col justify-start items-start mt-8">
            <div className="w-full h-64 overflow-auto"> {/* Added fixed height and overflow */}
                {bids.length === 0 ? (
                    <p className="text-gray-400">No bids yet</p>
                ) : (
                    bids.map((bid, index) => (
                        <div key={bid.bid_id} className="mb-3">
                            <span
                                style={{ color: userColors[index % userColors.length] }}
                                className="font-bold"
                            >
                                {bid.user_id || "Anonymous"}
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
