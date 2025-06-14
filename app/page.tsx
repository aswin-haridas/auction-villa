"use client";
import Link from "next/link";
import { anton } from "./lib/font/fonts";
import React, { useMemo, useState, useEffect } from "react";
import checkUser from "./lib/utils/checkUser";
import usePaintings from "./lib/hooks/usePainting";
import Loading from "./components/Loading";
import Card from "./components/Card";

function Auction() {
  checkUser();
  const [loading, setLoading] = useState(true);
  const paintings = usePaintings();

  useEffect(() => {
    if (paintings) {
      setLoading(false);
    }
  }, [paintings]);

  const columns = useMemo(() => {
    const columnCount = 3;
    const result: (typeof paintings)[] = Array.from(
      { length: columnCount },
      () => []
    );
    if (paintings && paintings.length > 0) {
      paintings.forEach((painting, index) => {
        result[index % columnCount].push(painting);
      });
    }
    return result;
  }, [paintings]);

  return (
    <>
      <div className="px-12">
        <p className={`${anton.className} text-[#878787] text-3xl pt-8`}>
          Your Holdings
        </p>
        {loading ? (
          <Loading />
        ) : paintings && paintings.length > 0 ? (
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
                        painting.images && painting.images[0]
                          ? painting.images[0]
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
        ) : (
          <p className="text-gray-500 pt-8">No paintings found</p>
        )}
      </div>
    </>
  );
}

export default Auction;
