import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_DESCRIPTION, APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Match scoring",
    description: "Explainable 0–100 alignment before and after tailoring.",
  },
  {
    title: "Truthful rewrites",
    description: "Bullet-level changes grounded in your real experience.",
  },
  {
    title: "Gap analysis",
    description: "Missing skills and requirements with suggested actions.",
  },
  {
    title: "PDF proof",
    description: "Side-by-side comparison export for review and demos.",
  },
];

export default function PlaceholderWorkflowPage({
  title,
  phase,
  description,
  nextHref,
  nextLabel,
}: {
  title: string;
  phase: string;
  description: string;
  nextHref?: string;
  nextLabel?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="space-y-2">
        <Badge variant="secondary">{phase}</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Placeholder screen</CardTitle>
          <CardDescription>
            {APP_NAME} foundation is ready. This route will be implemented in a
            later phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href={ROUTES.home} className={cn(buttonVariants())}>
            Back to home
          </Link>
          {nextHref && nextLabel ? (
            <Link
              href={nextHref}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              {nextLabel}
            </Link>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16">
      <section className="space-y-6">
        <Badge variant="secondary">Phase 0 foundation</Badge>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {APP_NAME}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            {APP_DESCRIPTION}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.input} className={cn(buttonVariants())}>
            Get started
          </Link>
          <Link
            href={ROUTES.input}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Paste resume + JD
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
