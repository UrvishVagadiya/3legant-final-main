"use client";

import React, { useEffect, useState } from "react";
import ButtonText from "../ui/ButtonText";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface Article {
  id: number;
  img: string;
  title: string;
  date: string;
}

const Artical = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("blogs")
        .select("id, title, img, date")
        .order("date", { ascending: false })
        .limit(3);

      if (data && !error) {
        setArticles(data);
      }
      setLoading(false);
    };

    fetchArticles();
  }, []);

  return (
    <div className="px-3 sm:px-5 md:px-10 lg:px-40 my-10 flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium">
          Articles
        </h2>
        <ButtonText text="More Articles" linkTo={"blogs"} />
      </div>
      <div className="flex flex-col md:flex-row gap-8 md:gap-4 justify-between w-full">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center w-full">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          articles.map((article) => (
            <Link
              href={`/blogs/${article.id}`}
              key={article.id}
              className={`flex flex-col md:flex-row md:items-center md:gap-8 flex-1`}
            >
              <div className="w-full">
                <img
                  className="w-full h-80 object-cover mt-3 rounded-sm"
                  src={article.img}
                  alt={article.title}
                />
                <h3 className="my-3 text-base font-medium line-clamp-2">
                  {article.title}
                </h3>
                <div>
                  <ButtonText text="Read More" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Artical;
