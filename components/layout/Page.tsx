import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/*
 * The frame every admin and user page is built from. Spacing, title style and
 * form width live only here, so changing them changes every page at once.
 *
 *   <Page width="form">
 *     <PageHeader><PageTitle>…</PageTitle></PageHeader>
 *     <PageBody>…</PageBody>
 *     <PageFooter>…</PageFooter>
 *   </Page>
 */

/** Forms stay readable instead of stretching across a wide screen. */
const FORM_WIDTH = "max-w-2xl";

type Width = { width?: "full" | "form" };

export function Page({
  width = "full",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & Width) {
  return (
    <div className={cn(width === "form" && FORM_WIDTH, className)} {...props} />
  );
}

/** A titled block below the page's own, e.g. the form under a picker. */
export const PageSection = Page;

export function PageHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <CardHeader className={cn("p-3 sm:p-6", className)} {...props} />;
}

export const PageTitle = CardTitle;
export const PageDescription = CardDescription;

export function PageBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-3 pt-0 sm:p-6 sm:pt-0", className)} {...props} />;
}

export function PageFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <CardFooter className={cn("p-3 pt-0 sm:p-6 sm:pt-0", className)} {...props} />;
}
