
import type { Player, Team } from './types';
import { computeTeamRating } from './generate-players';

// This function uses Math.random() and should only be run on the client or in a server action.
function randNormal(mean = 0, sd = 1) {
    let u = 0, v = 0;
    while(!u) u = Math.random();
    while(!v) v = Math.random();
    return mean + sd * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2*Math.PI*v);
}

function expectedGoals(rating:number){
    return rating/40 * (0.85 + Math.random()*0.3);
}

function sampleGoals(lambda:number){
    return Math.max(0, Math.round(lambda + randNormal(0,1)));
}

function pickScorer(team: Team): Player {
    const players = team.squad;
    const weights = players.map((p: Player)=> (p.atRating * 3) + (p.mdRating * 2) + (p.dfRating * 0.5) + 1 );
    let total=weights.reduce((s:number,w:number)=>s+w,0);
    let r=Math.random()*total;
    for(let i=0;i<weights.length;i++){
      r-=weights[i];
      if(r<0) return players[i];
    }
    return players[0];
}

function assignGoals(count:number, team: Team, arr:any[]){
    for(let i=0;i<count;i++){
      const p = pickScorer(team);
      const minute = Math.floor(Math.random()*90)+1;
      arr.push({ playerName:p.name, minute, teamId:team.id });
    }
}

export function simulateMatch(homeTeam: Team, awayTeam: Team){
  const homeRating = computeTeamRating(homeTeam.squad);
  const awayRating = computeTeamRating(awayTeam.squad);

  const homeXG = expectedGoals(homeRating);
  const awayXG = expectedGoals(awayRating);

  let homeGoals = sampleGoals(homeXG);
  let awayGoals = sampleGoals(awayXG);

  let by="90";

  if(homeGoals === awayGoals){
    const hET = sampleGoals(homeXG * 0.35);
    const aET = sampleGoals(awayXG * 0.35);
    homeGoals += hET;
    awayGoals += aET;
    if(hET !== aET){
      by = "extraTime";
    } else {
      by = "penalties";
      if(Math.random() * (homeRating + awayRating) <= homeRating){
        homeGoals += 1;
      } else {
        awayGoals += 1;
      }
    }
  }

  const goals:any[]=[];

  assignGoals(homeGoals, homeTeam, goals);
  assignGoals(awayGoals, awayTeam, goals);

  return {
    homeScore: homeGoals,
    awayScore: awayGoals,
    goals,
    winnerId: (homeGoals > awayGoals) ? homeTeam.id : awayTeam.id,
    by
  }
}
