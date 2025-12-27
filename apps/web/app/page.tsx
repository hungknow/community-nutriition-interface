import "@community-nutrition/ui/styles"
import Link from "next/link"
import { Button } from "@community-nutrition/ui"
import { Heart, Baby, ArrowRight, Activity } from "lucide-react"
import { t } from "./i18n/i18n-server-functions"

export default function Home() {

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center flex flex-col gap-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Heart className="size-12 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {t("home.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mx-auto">
              {t("home.hero.description")}
            </p>
          </div>

          {/* CTA Section */}
          <div className="pt-8 flex flex-col gap-6">
            <p className="text-base text-muted-foreground">
              {t("home.cta.description")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="group" variant="outline">
                <Link href="/child/weight-evaluation">
                  <Baby className="size-5" />
                  {t("home.cta.button")}
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
              <div className="flex justify-center">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Activity className="size-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">
                {t("home.features.healthTracking.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("home.features.healthTracking.description")}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-center">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Baby className="size-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">
                {t("home.features.childHealth.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("home.features.childHealth.description")}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-center">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Heart className="size-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">
                {t("home.features.easyToUse.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("home.features.easyToUse.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
