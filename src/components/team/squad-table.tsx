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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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
                {Object.entries(player.ratings).map(([pos, rating]) => (
                  <TableCell key={pos} className="text-center">
                    <Badge variant={getRatingBadgeVariant(rating)}>
                      {rating}
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
