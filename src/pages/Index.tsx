import { useSeoMeta } from '@unhead/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateHexedNoteDialog } from "@/components/CreateHexedNoteDialog";
import { useNavigate } from 'react-router-dom';
import { Wand2, Lock, BookOpen, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useSeoMeta({
    title: 'Hexed Notes - Mystical Messaging',
    description: 'Create and solve encrypted notes that can only be decrypted by solving riddles. A magical twist on Nostr messaging!',
  });

  const features = [
    {
      icon: <Wand2 className="h-8 w-8 text-purple-600" />,
      title: "Magical Encryption",
      description: "Messages locked behind mystical riddles that only the worthy can solve."
    },
    {
      icon: <Lock className="h-8 w-8 text-blue-600" />,
      title: "Puzzle-Based Security",
      description: "Instead of keys, use your wits to unlock hidden secrets and messages."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-green-600" />,
      title: "Creative Riddles",
      description: "Craft unique puzzles and challenges for friends to solve and enjoy."
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Social Gaming",
      description: "Turn messaging into a fun, interactive experience for the whole community."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6">
              <Wand2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Hexed Notes
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Mystical messages locked behind magical riddles. Solve the spell to reveal the secrets within!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CreateHexedNoteDialog
                trigger={
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Wand2 className="mr-2 h-5 w-5" />
                    Create Your First Hexed Note
                  </Button>
                }
              />
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/hexed-notes')}
              >
                Explore Hexed Notes
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">How Hexed Notes Work</CardTitle>
              <CardDescription className="text-lg">
                Experience the magic of puzzle-based messaging in three simple steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Cast the Spell</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create your secret message and craft a mystical riddle to protect it.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Share the Riddle</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Publish your hexed note to the Nostr network for others to discover.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Solve the Puzzle</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Solve the riddle to unlock the hidden message and reveal the secret!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Magical Journey?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the world of mystical messaging where every note is an adventure waiting to be discovered.
          </p>
          <CreateHexedNoteDialog
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Begin Your Magical Adventure
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
