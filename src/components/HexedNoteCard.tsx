import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SolveHexedNoteDialog } from './SolveHexedNoteDialog';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { formatDistanceToNow } from 'date-fns';
import { Ghost, Hourglass, MoonStar, Sparkles } from 'lucide-react';

interface HexedNoteCardProps {
  event: any;
  showSolveButton?: boolean;
  onSolved?: (content: string) => void;
}

export function HexedNoteCard({ event, showSolveButton = true, onSolved }: HexedNoteCardProps) {
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  
  const { author: metadata } = useAuthor(event.pubkey);
  const userName = metadata?.name || genUserName(event.pubkey);
  
  const riddleText = event.tags.find(([t]) => t === 'alt')?.[1] || 'Unknown riddle';
  const riddleHint = event.tags.find(([t]) => t === 'hint')?.[1];
  const difficulty = event.tags.find(([t]) => t === 'difficulty')?.[1] || 'medium';
  const noteId = event.tags.find(([t]) => t === 'd')?.[1] || event.id;
  const isPrivate = event.tags.some(([t]) => t === 'p');

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-gradient-to-r from-emerald-500/30 to-emerald-400/20 text-emerald-200 border-emerald-400/40';
      case 'medium':
        return 'bg-gradient-to-r from-amber-500/30 to-orange-400/20 text-orange-200 border-orange-400/40';
      case 'hard':
        return 'bg-gradient-to-r from-rose-500/30 to-red-500/20 text-red-200 border-red-500/40';
      default:
        return 'bg-slate-800/60 text-slate-200 border-slate-600/60';
    }
  };

  const handleSolved = (content: string) => {
    setIsDecrypted(true);
    setDecryptedContent(content);
    onSolved?.(content);
  };

  return (
    <Card className="w-full border border-purple-500/10 bg-slate-950/70 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <MoonStar className="h-5 w-5 text-purple-400" />
            Hexed Note
          </CardTitle>
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Ghost className="h-3 w-3" />
            {userName}
          </div>
          <div className="flex items-center gap-1">
            <Hourglass className="h-3 w-3" />
            {formatDistanceToNow(new Date(event.created_at * 1000), { addSuffix: true })}
          </div>
          {isPrivate && (
            <Badge variant="secondary" className="text-xs">
              Private
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Riddle Section */}
        <div className="p-4 bg-muted rounded-lg border">
          <h3 className="font-display font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-300" />
            The Spell
          </h3>
          <p className="text-sm mb-2">{riddleText}</p>
          {riddleHint && (
            <div className="mt-2 p-2 bg-muted/50 rounded border-dashed border">
              <p className="text-xs text-muted-foreground mb-1">Secret Hint:</p>
              <p className="text-sm">{riddleHint}</p>
            </div>
          )}
        </div>

        {/* Encrypted Content */}
        {!isDecrypted && (
          <div className="rounded-lg border border-purple-500/20 bg-purple-950/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display font-semibold text-purple-200">Hexed Content</h3>
              <Badge variant="outline" className="border-purple-500/60 text-purple-200">
                Hexed
              </Badge>
            </div>
            <div className="font-mono text-sm text-purple-100 bg-purple-900/50 p-3 rounded border border-purple-500/30">
              [Encrypted - Solve the riddle to unlock]
            </div>
          </div>
        )}

        {/* Decrypted Content */}
        {isDecrypted && decryptedContent && (
          <div className="rounded-lg border border-orange-500/30 bg-orange-950/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display font-semibold text-orange-200">Decoded Message</h3>
              <Badge className="bg-orange-500/20 text-orange-200 border-orange-500/40">
                Unlocked
              </Badge>
            </div>
            <div className="text-sm text-orange-100 whitespace-pre-wrap">
              {decryptedContent}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-2">
          <div className="text-xs text-muted-foreground">
            ID: {noteId.slice(0, 8)}...
          </div>
          
          {showSolveButton && !isDecrypted && (
            <SolveHexedNoteDialog 
              event={event} 
              onSolved={handleSolved}
              trigger={
                <Button variant="outline" size="sm" className="inline-flex items-center">
                  <Sparkles className="h-4 w-4" />{' '}
                  Lift Hex
                </Button>
              }
            />
          )}
          
          {isDecrypted && (
            <Badge className="bg-green-100 text-green-800">
              Spell Cast Successfully!
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
