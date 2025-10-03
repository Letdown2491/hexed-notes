import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import { useSolveHexedNote } from '@/hooks/useHexedNotes';
import { Loader2, EyeOff } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';

const formSchema = z.object({
  answer: z.string().min(1, 'Answer is required').max(100, 'Answer must be less than 100 characters'),
});

type FormData = z.infer<typeof formSchema>;

interface SolveHexedNoteDialogProps {
  event: NostrEvent;
  trigger?: React.ReactNode;
  onSolved?: (content: string) => void;
}

export function SolveHexedNoteDialog({ event, trigger, onSolved }: SolveHexedNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const { toast } = useToast();
  const { mutate: solveHexedNote, isPending } = useSolveHexedNote();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: '',
    },
  });

  const riddleText = event.tags.find(([t]) => t === 'alt')?.[1] || 'Unknown riddle';
  const riddleHint = event.tags.find(([t]) => t === 'hint')?.[1];
  const difficulty = event.tags.find(([t]) => t === 'difficulty')?.[1] || 'medium';

  const onSubmit = (data: FormData) => {
    solveHexedNote(
      {
        event,
        answer: data.answer,
      },
      {
        onSuccess: (decryptedContent) => {
          toast({
            title: "Riddle Solved!",
            description: "Congratulations! You've decrypted the hexed note.",
          });
          setShowContent(true);
          setDecryptedContent(decryptedContent);
          onSolved?.(decryptedContent);
          form.reset();
        },
        onError: (error) => {
          toast({
            title: "Incorrect Answer",
            description: error instanceof Error ? error.message : "The answer is incorrect. Try again!",
            variant: "destructive",
          });
        },
      }
    );
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setShowContent(false);
      setDecryptedContent(null);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Solve Riddle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Solve the Riddle</DialogTitle>
          <DialogDescription>
            Solve this puzzle to decrypt the hidden message. Think carefully!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Riddle Display */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">The Riddle</h3>
              <Badge className={getDifficultyColor(difficulty)}>
                {difficulty}
              </Badge>
            </div>
            <p className="text-sm mb-2">{riddleText}</p>
            {riddleHint && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Hint:</p>
                <p className="text-sm text-foreground">{riddleHint}</p>
              </div>
            )}
          </div>

          {/* Answer Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Answer</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your answer to the riddle..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                        Be careful - you only get one attempt per session!
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Solving...
                    </>
                  ) : (
                    'Solve Riddle'
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {/* Decrypted Content (shown after solving) */}
          {showContent && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-green-800">Decrypted Message</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContent(false)}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-green-700 whitespace-pre-wrap">
                {decryptedContent}
              </div>
              <div className="mt-2 text-xs text-green-600">
                This message can only be viewed by those who solve the riddle.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
