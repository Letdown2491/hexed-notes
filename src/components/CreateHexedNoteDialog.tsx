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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { useCreateHexedNote } from '@/hooks/useHexedNotes';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content must be less than 2000 characters'),
  riddle: z.string().min(10, 'Riddle must be at least 10 characters').max(200, 'Riddle must be less than 200 characters'),
  answer: z.string().min(1, 'Answer is required').max(100, 'Answer must be less than 100 characters'),
  hint: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  recipientPubkey: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateHexedNoteDialogProps {
  trigger?: React.ReactNode;
}

export function CreateHexedNoteDialog({ trigger }: CreateHexedNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { mutate: createHexedNote, isPending } = useCreateHexedNote();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      riddle: '',
      answer: '',
      hint: '',
      difficulty: 'medium',
      recipientPubkey: '',
    },
  });

  const onSubmit = (data: FormData) => {
    createHexedNote(
      {
        content: data.content,
        riddle: {
          text: data.riddle,
          answer: data.answer,
          hint: data.hint,
          difficulty: data.difficulty,
        },
        recipientPubkey: data.recipientPubkey || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "Hexed Note Created!",
            description: "Your puzzle note has been published to the Nostr network.",
          });
          form.reset();
          setOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Failed to Create Note",
            description: error instanceof Error ? error.message : "An unknown error occurred",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            Create Hexed Note
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Hexed Note</DialogTitle>
          <DialogDescription>
            Create an encrypted note that can only be decrypted by solving a riddle.
            Share the riddle with others and wait for them to solve it!
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the secret message you want to encrypt..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This content will be encrypted and can only be decrypted by solving your riddle.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="riddle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Riddle</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Create a riddle that leads to the answer..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The answer to this riddle will be used to decrypt the message.
                    Make it challenging but solvable!
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What word or phrase unlocks the spell?"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Only those who enter this exact answer (case-insensitive) can reveal the secret message.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Optional Hint</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add a hint to help solve the riddle..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional clue to help others solve your riddle.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy - Simple word puzzles</SelectItem>
                      <SelectItem value="medium">Medium - Requires some thinking</SelectItem>
                      <SelectItem value="hard">Hard - Challenging puzzles</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set the difficulty level for your riddle.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipientPubkey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter recipient's npub or pubkey (for private notes)..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty for a public hexed note that anyone can try to solve.
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
                    Creating...
                  </>
                ) : (
                  'Create Hexed Note'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
