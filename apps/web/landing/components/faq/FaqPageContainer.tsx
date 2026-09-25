import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/lib/ui/components/accordion";
import { Separator } from "@/lib/ui/components/separator";
import { ContactCard } from "@/components/contact/ContactCard";
import { faqCategories } from "@/constants/faq";

export function FaqPageContainer() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-12 md:py-16">
      {/* Page Header */}
      <div className="max-w-2xl mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Help & FAQ
        </h1>
        <p className="text-lg text-secondary leading-relaxed">
          Answers to common questions about accessing and using the internal
          platform.
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-12 max-w-3xl">
        {faqCategories.map((category) => (
          <section key={category.title}>
            <h2 className="text-xl font-semibold tracking-tight mb-4">
              {category.title}
            </h2>
            <Accordion type="single" collapsible className="border border-outline-variant rounded-xl overflow-hidden">
              {category.items.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`${category.title}-${index}`}
                  className="border-outline-variant px-6"
                >
                  <AccordionTrigger className="text-sm font-medium text-left py-4 hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-secondary leading-relaxed pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      <Separator className="bg-outline-variant my-16 max-w-3xl" />

      {/* Contact */}
      <ContactCard />
    </div>
  );
}
