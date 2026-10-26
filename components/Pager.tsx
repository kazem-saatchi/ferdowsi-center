import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { formatNumber } from "@/utils/formatNumber";
import { labels } from "@/utils/label";

/** Previous / "page X of Y" / next. Renders nothing for a single page.
 *  In RTL the previous page is to the right, so the chevrons point outward. */
function Pager({
  page,
  totalPages,
  onPageChange,
  disableNext = false,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Extra guard for server paging, e.g. while placeholder data is shown. */
  disableNext?: boolean;
}) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-4">
      <PaginationContent className="gap-3">
        <PaginationItem>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(page - 1, 1))}
            disabled={page <= 1}
          >
            <ChevronRight className="h-4 w-4" />
            {labels.previous}
          </Button>
        </PaginationItem>
        <PaginationItem aria-current="page" className="text-sm">
          {labels.page} {formatNumber(page)} {labels.of}{" "}
          {formatNumber(totalPages)}
        </PaginationItem>
        <PaginationItem>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
            disabled={disableNext || page >= totalPages}
          >
            {labels.next}
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default Pager;
