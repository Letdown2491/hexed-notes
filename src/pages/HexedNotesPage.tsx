import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useHexedNotes } from '@/hooks/useHexedNotes';
import { HexedNoteCard } from '@/components/HexedNoteCard';
import { CreateHexedNoteDialog } from '@/components/CreateHexedNoteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, RefreshCw, Filter } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export function HexedNotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('public');
  const { nostr } = useNostr();
  const { toast } = useToast();

  // Fetch public hexed notes
  const { 
    data: publicNotes, 
    isLoading: isLoadingPublic, 
    refetch: refetchPublic 
  } = useHexedNotes();

  // Fetch user's own hexed notes
  const { 
    data: myNotes, 
    isLoading: isLoadingMy, 
    refetch: refetchMy 
  } = useHexedNotes();

  // Filter notes based on search and difficulty
  const filteredPublicNotes = publicNotes?.filter(note => {
    const matchesSearch = !searchQuery || 
      note.riddle.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.event.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = selectedDifficulty === 'all' || 
      note.riddle.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  }) || [];

  const filteredMyNotes = myNotes?.filter(note => {
    const matchesSearch = !searchQuery || 
      note.riddle.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.event.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = selectedDifficulty === 'all' || 
      note.riddle.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  }) || [];

  const handleRefresh = () => {
    refetchPublic();
    refetchMy();
    toast({
      title: "Notes Refreshed",
      description: "Hexed notes have been updated from the network.",
    });
  };

  const handleSolved = (content: string) => {
    toast({
      title: "Message Decrypted!",
      description: "You successfully solved the riddle and revealed the hidden message.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Hexed Notes</h1>
            <p className="text-muted-foreground">
              Mystical messages locked behind riddles. Solve the spell to reveal the secrets!
            </p>
          </div>
          <div className="flex gap-2">
            <CreateHexedNoteDialog />
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search riddles or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select 
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs for Public vs Personal Notes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="public" className="flex items-center gap-2">
            Public Hexed Notes
            <Badge variant="secondary" className="ml-2">
              {filteredPublicNotes.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="my" className="flex items-center gap-2">
            My Hexed Notes
            <Badge variant="secondary" className="ml-2">
              {filteredMyNotes.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="mt-6">
          {isLoadingPublic ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading hexed notes...</p>
              </div>
            </div>
          ) : filteredPublicNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="text-6xl mb-4">🔮</div>
                <h3 className="text-xl font-semibold mb-2">No Hexed Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedDifficulty !== 'all' 
                    ? 'No notes match your search criteria.' 
                    : 'Be the first to create a hexed note!'
                  }
                </p>
                {!searchQuery && selectedDifficulty === 'all' && (
                  <CreateHexedNoteDialog 
                    trigger={
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Hexed Note
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPublicNotes.map((note) => (
                <HexedNoteCard 
                  key={note.id} 
                  event={note.event} 
                  onSolved={handleSolved}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-6">
          {isLoadingMy ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading your notes...</p>
              </div>
            </div>
          ) : filteredMyNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">Your Hexed Notes</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any hexed notes yet.
                </p>
                <CreateHexedNoteDialog 
                  trigger={
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Hexed Note
                    </Button>
                  }
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMyNotes.map((note) => (
                <HexedNoteCard 
                  key={note.id} 
                  event={note.event} 
                  showSolveButton={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}