import PageTemplate from "@/components/layout/PageTemplate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar, User, BookOpen } from "lucide-react";

const HealthBlogs = () => {
  const featuredBlogs = [
    {
      id: "blog1",
      title: "Understanding Blood Pressure: What the Numbers Mean",
      category: "Heart Health",
      excerpt: "Learn about systolic and diastolic blood pressure readings and what they indicate about your heart health.",
      author: "Dr. James Wilson",
      date: "June 15, 2023",
      readTime: "5 min read"
    },
    {
      id: "blog2",
      title: "The Role of Vitamin D in Immunity and Overall Health",
      category: "Nutrition",
      excerpt: "Discover how Vitamin D affects your immune system and why maintaining optimal levels is crucial for your health.",
      author: "Dr. Emily Chen",
      date: "May 27, 2023",
      readTime: "7 min read"
    },
    {
      id: "blog3",
      title: "Managing Anxiety in Uncertain Times: Practical Strategies",
      category: "Mental Health",
      excerpt: "Effective techniques to help you cope with anxiety and stress during challenging periods in life.",
      author: "Dr. Michael Brooks",
      date: "May 12, 2023",
      readTime: "6 min read"
    }
  ];

  const categories = [
    { id: "heart", name: "Heart Health" },
    { id: "nutrition", name: "Nutrition" },
    { id: "mental", name: "Mental Health" },
    { id: "fitness", name: "Fitness" },
    { id: "child", name: "Child Health" },
    { id: "senior", name: "Senior Care" }
  ];

  const recentBlogs = [
    {
      id: "recent1",
      title: "How Sleep Affects Your Mental Health",
      category: "Mental Health",
      date: "June 2, 2023",
    },
    {
      id: "recent2",
      title: "Incorporating Superfoods Into Your Diet",
      category: "Nutrition",
      date: "May 30, 2023",
    },
    {
      id: "recent3",
      title: "Exercise Tips for Beginners",
      category: "Fitness",
      date: "May 25, 2023",
    },
    {
      id: "recent4",
      title: "Signs of Dehydration You Shouldn't Ignore",
      category: "General Health",
      date: "May 20, 2023",
    }
  ];

  return (
    <PageTemplate title="Health Blogs" subtitle="Expert insights and tips for better health and wellness">
      <div className="space-y-8">
        <section>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <p className="text-gray-600">
              Stay informed with the latest health information, tips, and medical advancements through our expert-written blogs.
            </p>
            <div className="flex w-full md:w-auto">
              <Input placeholder="Search blogs..." className="rounded-r-none" />
              <Button className="bg-medical-500 hover:bg-medical-600 rounded-l-none">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredBlogs.map(blog => (
              <Card key={blog.id} className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="text-xs font-medium text-medical-500 mb-1">
                    {blog.category}
                  </div>
                  <CardTitle className="text-lg">{blog.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <CardDescription className="mb-4">{blog.excerpt}</CardDescription>
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" /> {blog.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> {blog.date}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" /> {blog.readTime}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full text-medical-600 hover:text-medical-700 hover:bg-blue-50">
                    Read Article
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
        
        <section>
          <Tabs defaultValue="all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Browse by Category</h2>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="heart">Heart</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                <TabsTrigger value="mental">Mental</TabsTrigger>
                <TabsTrigger value="fitness">Fitness</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <div className="flex flex-wrap gap-3">
                {categories.map(category => (
                  <Button 
                    key={category.id} 
                    variant="outline" 
                    className="hover:bg-blue-50 hover:text-medical-600"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            {/* Other tab content would go here */}
            <TabsContent value="heart" className="mt-0">
              <p className="text-gray-600 py-2">Showing Heart Health articles</p>
            </TabsContent>
            <TabsContent value="nutrition" className="mt-0">
              <p className="text-gray-600 py-2">Showing Nutrition articles</p>
            </TabsContent>
            <TabsContent value="mental" className="mt-0">
              <p className="text-gray-600 py-2">Showing Mental Health articles</p>
            </TabsContent>
            <TabsContent value="fitness" className="mt-0">
              <p className="text-gray-600 py-2">Showing Fitness articles</p>
            </TabsContent>
          </Tabs>
        </section>
        
        <section className="md:grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Articles</h2>
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex flex-col md:flex-row gap-4 border-b border-gray-100 pb-6">
                <div className="bg-gray-100 h-40 md:h-32 md:w-48 flex-shrink-0 rounded-md"></div>
                <div>
                  <div className="text-xs font-medium text-medical-500 mb-1">
                    {featuredBlogs[item-1].category}
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">{featuredBlogs[item-1].title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{featuredBlogs[item-1].excerpt}</p>
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" /> {featuredBlogs[item-1].author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> {featuredBlogs[item-1].date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-center mt-6">
              <Button variant="outline">Load More Articles</Button>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Posts</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-4">
                {recentBlogs.map(blog => (
                  <li key={blog.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <a href="#" className="hover:text-medical-600">
                      <h3 className="font-medium text-gray-800 mb-1 text-sm">{blog.title}</h3>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{blog.category}</span>
                        <span>{blog.date}</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">Subscribe</h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                Get the latest health articles delivered to your inbox.
              </p>
              <div className="space-y-2">
                <Input placeholder="Your email address" />
                <Button className="w-full bg-medical-500 hover:bg-medical-600">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
};

export default HealthBlogs;
