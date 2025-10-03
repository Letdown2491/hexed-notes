import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SolveHexedNoteDialog } from './SolveHexedNoteDialog';
import { useHexedNotes } from '@/hooks/useHexedNotes';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { formatDistanceToNow } from 'date-fns';
import { Eye, Lock, Clock, User } from 'lucide-react';

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
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSolved = (content: string) => {
    setIsDecrypted(true);
    setDecryptedContent(content);
    onSolved?.(content);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Hexed Note
          </CardTitle>
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {userName}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
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
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4" />
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
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-800">Encrypted Content</h3>
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                Locked
              </Badge>
            </div>
            <div className="text-sm text-blue-700 font-mono bg-blue-100 p-2 rounded border border-blue-200">
              [Encrypted - Solve the riddle to unlock]
            </div>
          </div>
        )}

        {/* Decrypted Content */}
        {isDecrypted && decryptedContent && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-green-800">Revealed Message</h3>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Unlocked
              </Badge>
            </div>
            <div className="text-sm text-green-700 whitespace-pre-wrap">
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
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Cast Spell
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