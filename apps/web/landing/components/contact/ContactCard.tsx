import Link from "next/link";
import { Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/components/card";
import { Button } from "@/lib/ui/components/button";

export function ContactCard() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold tracking-tight mb-6">
        Need More Help?
      </h2>
      <Card className="border-outline-variant rounded-xl">
        <CardHeader className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="size-5 text-primary" />
            <CardTitle className="text-base font-semibold">
              Contact Your Administrator
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0 space-y-4">
          <p className="text-sm text-secondary leading-relaxed">
            For account issues, access requests, or technical problems,
            reach out to your department administrator or system manager.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href={`${process.env.NEXT_PUBLIC_PORTAL_URL || ""}/signin`}>
              Sign In to Portal
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
