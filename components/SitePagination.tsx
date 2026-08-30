import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SitePaginationProps = {
  currentPage: number;
  totalPages: number;
  pathname: string;
  query?: Record<string, string | number | undefined>;
  locale?: string;
};

type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

function paginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = new Set([1, totalPages]);
  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page > 1 && page < totalPages) pages.add(page);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const items: PaginationItem[] = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous && page - previous > 1) items.push(previous === 1 ? "ellipsis-start" : "ellipsis-end");
    items.push(page);
  });
  return items;
}

export default function SitePagination({ currentPage, totalPages, pathname, query = {}, locale = "en" }: SitePaginationProps) {
  if (totalPages <= 1) return null;
  const language = locale === "zh" || locale === "my" ? locale : "en";
  const copy = {
    zh: { label: "分页导航", previous: "上一页", next: "下一页", page: "第 {page} 页", choose: "选择页码", go: "跳转" },
    my: { label: "စာမျက်နှာရွေးချယ်မှု", previous: "ရှေ့စာမျက်နှာ", next: "နောက်စာမျက်နှာ", page: "စာမျက်နှာ {page}", choose: "စာမျက်နှာရွေးရန်", go: "သွားရန်" },
    en: { label: "Pagination", previous: "Previous page", next: "Next page", page: "Page {page}", choose: "Choose page", go: "Go" },
  }[language];
  const safeCurrent = Math.min(Math.max(1, currentPage), totalPages);
  const href = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.set(key, String(value));
    });
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  };

  return (
    <nav className="site-pagination" aria-label={copy.label}>
      <div className="site-pagination-pages">
        <Link className="site-pagination-direction" aria-disabled={safeCurrent === 1} aria-label={copy.previous} href={safeCurrent === 1 ? href(1) : href(safeCurrent - 1)}>
          <ChevronLeft aria-hidden="true" size={18} /><span>{copy.previous}</span>
        </Link>
        <div className="site-pagination-numbers">
          {paginationItems(safeCurrent, totalPages).map((item) => typeof item === "number" ? (
            <Link className="site-pagination-number" aria-current={item === safeCurrent ? "page" : undefined} aria-label={copy.page.replace("{page}", String(item))} href={href(item)} key={item}>{item}</Link>
          ) : <span aria-hidden="true" className="site-pagination-ellipsis" key={item}>…</span>)}
        </div>
        <Link className="site-pagination-direction" aria-disabled={safeCurrent === totalPages} aria-label={copy.next} href={safeCurrent === totalPages ? href(totalPages) : href(safeCurrent + 1)}>
          <span>{copy.next}</span><ChevronRight aria-hidden="true" size={18} />
        </Link>
      </div>
      <form className="site-pagination-jump" action={pathname} method="get">
        {Object.entries(query).map(([key, value]) => value !== undefined && value !== "" ? <input key={key} name={key} type="hidden" value={String(value)} /> : null)}
        <label htmlFor="site-pagination-page">{copy.choose}</label>
        <select id="site-pagination-page" name="page" defaultValue={safeCurrent}>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <option key={page} value={page}>{page} / {totalPages}</option>)}
        </select>
        <button type="submit">{copy.go}</button>
      </form>
    </nav>
  );
}
