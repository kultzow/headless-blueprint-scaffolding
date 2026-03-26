import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      {product.featuredImage?.node && (
        <img
          src={product.featuredImage.node.sourceUrl}
          alt={product.featuredImage.node.altText || product.name}
          className="w-full aspect-square object-cover rounded mb-2 group-hover:opacity-90"
        />
      )}
      <p className="font-medium">{product.name}</p>
      {product.price && <p className="text-sm text-muted-foreground">{product.price}</p>}
    </Link>
  );
}

function CategoryCarousel({ products }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback((api) => {
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    update(emblaApi);
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    return () => {
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi, update]);

  const btnBase = "absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full transition-colors";
  const btnActive = "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer";
  const btnDisabled = "bg-muted text-muted-foreground cursor-default";

  return (
    <div className="relative px-12 pt-4">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex -ml-4">
          {products.map((product) => (
            <div key={product.id} className="pl-4 min-w-0 shrink-0 grow-0 basis-1/4">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canPrev}
        className={`${btnBase} left-0 ${canPrev ? btnActive : btnDisabled}`}
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canNext}
        className={`${btnBase} right-0 ${canNext ? btnActive : btnDisabled}`}
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ProductCategoryAccordion({ categoryMap, categories }) {
  const [isDesktop] = useState(() => window.innerWidth >= 768);
  const [defaultOpen] = useState(() => window.innerWidth >= 768 ? categories : []);

  return (
    <Accordion type="multiple" defaultValue={defaultOpen} className="w-full">
      {categories.map((category) => (
        <AccordionItem key={category} value={category}>
          <AccordionTrigger className="text-xl font-semibold">{category}</AccordionTrigger>
          <AccordionContent>
            {isDesktop ? (
              <CategoryCarousel products={categoryMap[category]} />
            ) : (
              <div className="grid grid-cols-2 gap-6 pt-4">
                {categoryMap[category].map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
