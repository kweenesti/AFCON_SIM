'use client';

import type { Player } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface SquadTableProps {
  squad: Player[];
}

export function SquadTable({ squad }: SquadTableProps) {
  const getRatingBadgeVariant = (rating: number) => {
    if (rating >= 85) return 'default';
    if (rating >= 70) return 'secondary';
    return 'outline';
  };

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="text-center">GK</TableHead>
              <TableHead className="text-center">DF</TableHead>

              <TableHead className="text-center">MD</TableHead>
              <TableHead className="text-center">AT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {squad.map((player, index) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{player.name}</span>
                    {player.isCaptain && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Team Captain</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{player.naturalPosition}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getRatingBadgeVariant(player.gkRating)}>
                    {player.gkRating}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getRatingBadgeVariant(player.dfRating)}>
                    {player.dfRating}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getRatingBadgeVariant(player.mdRating)}>
                    {player.mdRating}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getRatingBadgeVariant(player.atRating)}>
                    {player.atRating}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
