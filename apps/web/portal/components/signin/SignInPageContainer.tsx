import { RedirectToLogin } from "@/components/RedirectToLogin";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function RedirectFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex items-center gap-3 font-sans text-base text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin [animation-duration:0.4s]" />
        Loading...
      </div>
    </div>
  );
}

export function SignInPageContainer() {
  return (
    <Suspense fallback={<RedirectFallback />}>
      <RedirectToLogin />
    </Suspense>
  );
}
