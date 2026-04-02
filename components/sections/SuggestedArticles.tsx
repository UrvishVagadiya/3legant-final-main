import Link from "next/link";
import ButtonText from "@/components/ui/ButtonText";

interface Article {
  id: number;
  img: string;
  title: string;
  date: string;
}

const SuggestedArticles = ({ articles }: { articles: Article[] }) => (
  <div className="border-t border-gray-200 pt-10 md:pt-16">
    <div className="flex justify-between items-center mb-8 md:mb-10">
      <h2 className="text-[22px] md:text-3xl font-medium text-[#141718]">
        You might also like
      </h2>
      <div className="hidden sm:block">
        <ButtonText text="More Articles" linkTo="blogs" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {articles.map((article) => (
        <Link
          href={`/blogs/${article.id}`}
          key={article.id}
          className="flex flex-col group"
        >
          <div className="overflow-hidden bg-[#F3F5F7] rounded w-full aspect-4/3 md:aspect-square mb-4">
            <img
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={article.img}
              alt={article.title}
            />
          </div>
          <h3 className="font-medium text-[15px] md:text-base text-[#141718] mb-1 leading-snug">
            {article.title}
          </h3>
          <p className="text-xs md:text-sm text-[#6C7275] font-medium">
            {new Date(article.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </Link>
      ))}
    </div>

    <div className="sm:hidden mt-8 flex justify-center">
      <ButtonText text="More Articles" linkTo="blogs" />
    </div>
  </div>
);

export default SuggestedArticles;
