import { CoSplitIcon } from '@/components/CoSplitIcon';
import { ArrowRightIcon, Bars3Icon } from '@heroicons/react/24/outline';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export const LandingHeader: React.FC = () => {
  return (
    <header className="border-border bg-background/90 sticky top-0 z-20 border-b backdrop-blur-md">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12"
      >
        {/* Brand */}
        <a href="/" aria-label="Co-Split home" className="flex items-center gap-2.5">
          <CoSplitIcon />

          <span className="font-heading text-foreground text-lg font-extrabold tracking-tight">Co-Split</span>
        </a>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-6 sm:flex">
          <a href="#home" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
            Home
          </a>

          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Features
          </a>

          <Button render={<a href="#get-started" />} size="default" className="rounded-lg">
            Get Started
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile navigation */}
        <Sheet>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="sm:hidden" aria-label="Open navigation menu" />}
          >
            <Bars3Icon className="h-5 w-5" />
          </SheetTrigger>

          <SheetContent side="right" className="w-[280px] sm:hidden">
            <SheetHeader className="text-left">
              <SheetTitle className="font-heading text-lg font-bold">Co-Split</SheetTitle>

              <SheetDescription>Shared expenses, made simple.</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-2 px-4">
              <SheetClose
                render={
                  <a
                    href="#home"
                    className="text-foreground hover:bg-muted rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                  />
                }
              >
                Home
              </SheetClose>

              <SheetClose
                render={
                  <a
                    href="#features"
                    className="text-foreground hover:bg-muted rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                  />
                }
              >
                Features
              </SheetClose>

              <SheetClose
                render={
                  <a
                    href="#how-it-works"
                    className="text-foreground hover:bg-muted rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                  />
                }
              >
                How it works
              </SheetClose>

              <SheetClose
                render={
                  <a
                    href="#get-started"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors"
                  />
                }
              >
                Get Started
                <ArrowRightIcon className="h-4 w-4" />
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};
