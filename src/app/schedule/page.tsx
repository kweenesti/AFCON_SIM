import { SchedulerForm } from "@/components/scheduling/scheduler-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/layout/app-shell";

export default function SchedulePage() {
  return (
    <AppShell>
      <main className="container mx-auto p-4 md:p-8">
        <div className="mx-auto max-w-4xl space-y-8">
           <div className="text-center">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">
              Tournament Scheduler
            </h1>
            <p className="mt-2 text-muted-foreground">
              Use our AI-powered tool to generate an optimal match schedule.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Scheduling Assistant</CardTitle>
              <CardDescription>
                Provide the details below to generate a suggested match schedule.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchedulerForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}
