import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, BookOpen, Star } from "lucide-react";

interface SuccessStory {
  id: string;
  title: string;
  content: string;
  program_name: string | null;
  amount_received: string | null;
  created_at: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string | null;
  created_at: string;
}

const Community = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storyForm, setStoryForm] = useState({
    title: "",
    content: "",
    program_name: "",
    amount_received: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStories();
    fetchResources();
  }, []);

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from("success_stories")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setStories(data);
    }
  };

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setResources(data);
    }
  };

  const submitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to share your story",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("success_stories").insert({
      user_id: user.id,
      ...storyForm,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit your story",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Your story has been submitted for review",
      });
      setStoryForm({
        title: "",
        content: "",
        program_name: "",
        amount_received: "",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Community Hub</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Connect, learn, and share your funding journey
          </p>

          <Tabs defaultValue="stories" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stories">Success Stories</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="share">Share Your Story</TabsTrigger>
            </TabsList>

            <TabsContent value="stories" className="space-y-6">
              <div className="grid gap-6">
                {stories.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No success stories yet. Be the first to share!
                    </CardContent>
                  </Card>
                ) : (
                  stories.map((story) => (
                    <Card key={story.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Star className="h-5 w-5 text-yellow-500" />
                              {story.title}
                            </CardTitle>
                            {story.program_name && (
                              <CardDescription>
                                Program: {story.program_name}
                                {story.amount_received && ` • Received: ${story.amount_received}`}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{story.content}</p>
                        <p className="text-sm text-muted-foreground mt-4">
                          {new Date(story.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {resources.length === 0 ? (
                  <Card className="md:col-span-2">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No resources available yet
                    </CardContent>
                  </Card>
                ) : (
                  resources.map((resource) => (
                    <Card key={resource.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          {resource.title}
                        </CardTitle>
                        <CardDescription>{resource.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">{resource.description}</p>
                        {resource.url && (
                          <Button asChild variant="outline">
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              View Resource
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="share">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Share Your Success Story
                  </CardTitle>
                  <CardDescription>
                    Inspire others by sharing your funding journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitStory} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Story Title</Label>
                      <Input
                        id="title"
                        value={storyForm.title}
                        onChange={(e) =>
                          setStoryForm({ ...storyForm, title: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="program">Program Name (Optional)</Label>
                      <Input
                        id="program"
                        value={storyForm.program_name}
                        onChange={(e) =>
                          setStoryForm({ ...storyForm, program_name: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount">Amount Received (Optional)</Label>
                      <Input
                        id="amount"
                        value={storyForm.amount_received}
                        onChange={(e) =>
                          setStoryForm({ ...storyForm, amount_received: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Your Story</Label>
                      <Textarea
                        id="content"
                        value={storyForm.content}
                        onChange={(e) =>
                          setStoryForm({ ...storyForm, content: e.target.value })
                        }
                        rows={8}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Story"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
