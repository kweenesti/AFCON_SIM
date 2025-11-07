
'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { placeholderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, Swords, LogIn, UserPlus } from 'lucide-react';
import { PublicLayout } from '@/components/layout/public-layout';

export default function Home() {
  const heroImage = placeholderImages.find((img) => img.id === 'hero-stadium');

  return (
    <PublicLayout>
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8">
            <div className="col-span-1">
              <Card className="overflow-hidden">
                <div className="relative h-64 w-full md:h-96">
                  {heroImage && (
                    <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      data-ai-hint={heroImage.imageHint}
                      fill
                      priority
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-primary-foreground">
                    <h1 className="font-headline text-4xl font-bold md:text-6xl">
                      African Nations Tournament Simulator
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg text-primary-foreground/90">
                      The future of African football is here. Register your
                      federation, build your dream team, and compete for the
                      title.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <Button size="lg" asChild>
                          <Link href="/register">Register Your Team Today</Link>
                        </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
    </PublicLayout>
  );
}
