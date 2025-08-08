import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Copy, Phone, MessageSquare, Megaphone, Globe, User, Play, Loader2, Bot, Calendar, Clock, Target } from "lucide-react";
import { Agent, AGENT_CATEGORIES, MOCK_AGENTS, AgentCallRequest } from "@/types/agent";
import { useInitiateAgentTestCall } from "@/hooks/useAgents";

const AgentLibrary = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [callRequest, setCallRequest] = useState<AgentCallRequest>({
    agent_id: "",
    customer_name: "",
    phone_number: "",
    notes: ""
  });

  // Enhanced call form data (similar to demo call)
  const [enhancedCallData, setEnhancedCallData] = useState({
    customer_name: "",
    phone_number: "",
    vehicle_number: "ABC-123",
    service_type: "Oil Change", 
    service_advisor_name: "John Smith",
    appointment_date: new Date().toISOString().split("T")[0]
  });

  // Live call tracking
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [isLiveTranscriptOpen, setIsLiveTranscriptOpen] = useState(false);
  const [callTranscript, setCallTranscript] = useState<any[]>([]);
  const [callStatus, setCallStatus] = useState<string>("idle");

  const initiateTestCallMutation = useInitiateAgentTestCall();

  // Use mock data for demo
  const agents = MOCK_AGENTS;
  const categories = AGENT_CATEGORIES;
  const agentsLoading = false;
  const agentsError = null;

  // Filter agents based on category and search term
  const filteredAgents = agents.filter(agent => {
    const matchesCategory = selectedCategory === "all" || agent.category.id === selectedCategory;
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.country.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && agent.is_active;
  });

  const copyAgentId = (agentId: string) => {
    navigator.clipboard.writeText(agentId);
    toast({
      title: "Agent ID copied",
      description: `Agent ID ${agentId} has been copied to your clipboard`,
    });
  };

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "MessageSquare":
        return MessageSquare;
      case "Megaphone":
        return Megaphone;
      default:
        return MessageSquare;
    }
  };

  const handleTestCall = (agent: Agent) => {
    setSelectedAgent(agent);
    setEnhancedCallData({
      customer_name: "",
      phone_number: "",
      vehicle_number: "ABC-123",
      service_type: "Oil Change", 
      service_advisor_name: "John Smith",
      appointment_date: new Date().toISOString().split("T")[0]
    });
    setIsCallDialogOpen(true);
  };

  const initiateTestCall = async () => {
    if (!enhancedCallData.customer_name || !enhancedCallData.phone_number) {
      toast({
        title: "Missing information",
        description: "Customer name and phone number are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // For now, simulate the API call
      const simulatedCallId = `test-${Date.now()}`;
      
      toast({
        title: "Test call initiated",
        description: `Test call with ${selectedAgent?.name} has been started. Call ID: ${simulatedCallId}`,
      });
      
      // Set up live call tracking
      setActiveCallId(simulatedCallId);
      setCallStatus("ringing");
      setCallTranscript([]);
      setIsCallDialogOpen(false);
      setIsLiveTranscriptOpen(true);
      
      // Start simulating live transcript
      simulateLiveTranscript(simulatedCallId);
      
    } catch (error) {
      console.error("Error initiating test call:", error);
      toast({
        title: "Call failed",
        description: "There was a problem initiating the test call. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Simulate live transcript for demo purposes
  const simulateLiveTranscript = (callId: string) => {
    const mockTranscriptMessages = [
      { role: "assistant", content: `Hello! This is ${selectedAgent?.name} from your automotive service center. Is this ${enhancedCallData.customer_name}?`, timestamp: 0 },
      { role: "user", content: "Yes, this is me. Thanks for calling.", timestamp: 3 },
      { role: "assistant", content: `Great! I'm calling about your recent ${enhancedCallData.service_type} service. How was your experience with us?`, timestamp: 6 },
      { role: "user", content: "The service was excellent! Very professional and quick.", timestamp: 12 },
      { role: "assistant", content: "That's wonderful to hear! On a scale of 1-10, how likely are you to recommend our service to friends and family?", timestamp: 18 },
      { role: "user", content: "I would definitely give it a 9 out of 10. Very satisfied!", timestamp: 24 },
      { role: "assistant", content: "Fantastic! Would you mind leaving us a review on Google? I can send you a link right after this call.", timestamp: 30 },
      { role: "user", content: "Sure, I'd be happy to do that. You guys deserve it!", timestamp: 35 },
      { role: "assistant", content: "Thank you so much! Is there anything else about your service experience you'd like to share?", timestamp: 40 },
      { role: "user", content: "Nothing else, everything was perfect. Keep up the great work!", timestamp: 45 },
      { role: "assistant", content: "Thank you for your time and feedback. Have a wonderful day!", timestamp: 50 }
    ];

    let messageIndex = 0;
    
    // Update status to "in progress" after 2 seconds
    setTimeout(() => {
      setCallStatus("in_progress");
    }, 2000);

    // Add messages gradually
    const addMessage = () => {
      if (messageIndex < mockTranscriptMessages.length && activeCallId === callId) {
        setCallTranscript(prev => [...prev, mockTranscriptMessages[messageIndex]]);
        messageIndex++;
        
        // Schedule next message (3-6 seconds apart)
        const nextDelay = Math.random() * 3000 + 3000;
        setTimeout(addMessage, nextDelay);
      } else if (messageIndex >= mockTranscriptMessages.length) {
        // Call completed
        setCallStatus("completed");
        toast({
          title: "Test call completed",
          description: "The agent test call has finished successfully!",
        });
      }
    };

    // Start adding messages after 3 seconds
    setTimeout(addMessage, 3000);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (callTranscript.length > 0) {
      const element = document.getElementById('transcript-bottom');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [callTranscript]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header Section */}
            <div className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Agent Library
                  </h1>
                  <p className="text-muted-foreground">
                    Explore and test our AI voice agents. Initiate test calls to evaluate agent performance and capabilities.
                  </p>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-background border-b border-border px-6 py-4 flex-shrink-0">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                {/* Search */}
                <div className="flex-1 max-w-md">
                  <Input
                    placeholder="Search agents by name, language, or country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    className="whitespace-nowrap"
                  >
                    All Agents
                  </Button>
                  {categories.map((category) => {
                    const IconComponent = getIconComponent(category.icon);
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="whitespace-nowrap"
                      >
                        <IconComponent className="h-4 w-4 mr-2" />
                        {category.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
              {/* Category Information */}
              {selectedCategory !== "all" && (
                <div className="mb-6">
                  {categories.filter(cat => cat.id === selectedCategory).map((category) => {
                    const IconComponent = getIconComponent(category.icon);
                    return (
                      <Card key={category.id} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5" />
                            {category.name}
                          </CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Agents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                  <Card key={agent.id} className="hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg mb-2 line-clamp-2 leading-tight">{agent.name}</CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {agent.category.name.split(' ')[0]}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                              <span className="text-lg">{getFlagEmoji(agent.countryCode)}</span>
                              <span>{agent.language}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAgentId(agent.id)}
                          className="h-8 w-8 p-0 flex-shrink-0"
                          title="Copy Agent ID"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription className="text-sm leading-relaxed line-clamp-3">
                        {agent.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0 flex-1 flex flex-col">
                      <div className="space-y-3 flex-1">
                        {/* Agent Details */}
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">ID:</span>
                            <code className="text-xs bg-muted px-1 rounded truncate flex-1">{agent.id}</code>
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">Country:</span>
                            <span className="text-foreground truncate">{agent.country}</span>
                          </div>
                        </div>

                        {/* Capabilities section removed as requested */}

                        {/* Personality */}
                        <div className="text-xs min-h-[40px]">
                          <span className="text-muted-foreground">Personality: </span>
                          <span className="text-foreground line-clamp-2">{agent.personality}</span>
                        </div>
                      </div>

                      {/* Test Call Button - Always at bottom */}
                      <div className="pt-4 flex-shrink-0">
                        <Button
                          onClick={() => handleTestCall(agent)}
                          className="w-full"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Test Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* No results message */}
              {filteredAgents.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No agents found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or category filter.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Test Call Dialog */}
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Test Call</DialogTitle>
            <DialogDescription>
              Initiate a test call with {selectedAgent?.name} to evaluate the agent's performance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selected Agent Info */}
            {selectedAgent && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{selectedAgent.name}</span>
                  <span className="text-lg">{getFlagEmoji(selectedAgent.countryCode)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedAgent.language} • {selectedAgent.category.name}</p>
              </div>
            )}

            {/* Enhanced Call Details Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    placeholder="Enter customer name"
                    value={enhancedCallData.customer_name}
                    onChange={(e) => setEnhancedCallData({...enhancedCallData, customer_name: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <Input
                    id="phone_number"
                    placeholder="+1234567890"
                    value={enhancedCallData.phone_number}
                    onChange={(e) => setEnhancedCallData({...enhancedCallData, phone_number: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="vehicle_number">Vehicle Number</Label>
                  <Input
                    id="vehicle_number"
                    placeholder="ABC-123"
                    value={enhancedCallData.vehicle_number}
                    onChange={(e) => setEnhancedCallData({...enhancedCallData, vehicle_number: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="service_type">Service Type</Label>
                  <Input
                    id="service_type"
                    placeholder="Oil Change"
                    value={enhancedCallData.service_type}
                    onChange={(e) => setEnhancedCallData({...enhancedCallData, service_type: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="service_advisor_name">Service Advisor Name</Label>
                  <Input
                    id="service_advisor_name"
                    placeholder="John Smith"
                    value={enhancedCallData.service_advisor_name}
                    onChange={(e) => setEnhancedCallData({...enhancedCallData, service_advisor_name: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="appointment_date">Appointment Date</Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    value={enhancedCallData.appointment_date}
                    onChange={(e) => setEnhancedCallData({...enhancedCallData, appointment_date: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCallDialogOpen(false)}
              disabled={initiateTestCallMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={initiateTestCall} disabled={initiateTestCallMutation.isPending}>
              {initiateTestCallMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Initiating...
                </>
              ) : (
                <>
                  Start Call
                  <Phone className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live Call Details Panel */}
      <Sheet open={isLiveTranscriptOpen} onOpenChange={setIsLiveTranscriptOpen}>
        <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Live Agent Test Call</span>
              <div className={`w-2 h-2 rounded-full ml-2 ${
                callStatus === "ringing" ? "bg-yellow-500 animate-pulse" :
                callStatus === "in_progress" ? "bg-green-500 animate-pulse" :
                callStatus === "completed" ? "bg-gray-500" : "bg-red-500"
              }`} />
            </SheetTitle>
            <SheetDescription>
              Live test call with {selectedAgent?.name} • Call ID: {activeCallId?.slice(-8)} • Status: {callStatus.replace("_", " ")}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Agent Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Agent Name:</span>
                      <p className="font-medium">{selectedAgent?.name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Language:</span>
                      <p className="font-medium">{selectedAgent?.language || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Category:</span>
                      <p className="font-medium">{selectedAgent?.category.name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Agent ID:</span>
                      <p className="font-medium font-mono text-xs">{selectedAgent?.id || "N/A"}</p>
                    </div>
                  </div>
                </div>
                
                {/* Agent Personality */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-600 font-medium">Personality:</span>
                  <p className="text-sm text-blue-800 mt-1">{selectedAgent?.personality || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Call Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Call Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Customer:</span>
                      <p className="font-medium">{enhancedCallData.customer_name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Phone:</span>
                      <p className="font-medium">{enhancedCallData.phone_number || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Service Type:</span>
                      <p className="font-medium">{enhancedCallData.service_type || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Service Advisor:</span>
                      <p className="font-medium">{enhancedCallData.service_advisor_name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Appointment Date:</span>
                      <p className="font-medium">{enhancedCallData.appointment_date || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Duration:</span>
                      <p className="font-medium">
                        {callTranscript.length > 0 ? 
                          `${Math.floor((callTranscript[callTranscript.length - 1]?.timestamp || 0) / 60)}:${((callTranscript[callTranscript.length - 1]?.timestamp || 0) % 60).toString().padStart(2, '0')}` 
                          : "00:00"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Call Transcript */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Live Call Transcript</span>
                  {callStatus === "in_progress" && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-normal">Recording</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                  {callStatus === "ringing" && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Connecting call...</p>
                      <p className="text-xs text-gray-400 mt-1">Please wait while we establish the connection</p>
                    </div>
                  )}
                  
                  {callTranscript.length === 0 && callStatus === "in_progress" && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm">Waiting for conversation to start...</p>
                      <p className="text-xs text-gray-400 mt-1">The agent will begin speaking shortly</p>
                    </div>
                  )}

                  {callTranscript.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "assistant" ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "assistant"
                            ? "bg-blue-100 text-blue-900 border border-blue-200"
                            : "bg-white text-gray-900 border border-gray-200 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium">
                            {message.role === "assistant" ? selectedAgent?.name || "Agent" : "Customer"}
                          </span>
                          <span className="text-xs opacity-70">
                            {Math.floor(message.timestamp / 60)}:{(message.timestamp % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {callStatus === "completed" && callTranscript.length > 0 && (
                    <div className="text-center py-4 border-t mt-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Call Completed Successfully
                      </Badge>
                    </div>
                  )}

                  {/* Auto-scroll to bottom */}
                  <div id="transcript-bottom" />
                </div>
              </CardContent>
            </Card>

            {/* Call Summary (shown after completion) */}
            {callStatus === "completed" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Call Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Clock className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Total Duration</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        {callTranscript.length > 0 ? 
                          `${Math.floor((callTranscript[callTranscript.length - 1]?.timestamp || 0) / 60)}:${((callTranscript[callTranscript.length - 1]?.timestamp || 0) % 60).toString().padStart(2, '0')}` 
                          : "00:00"
                        }
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Messages</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {callTranscript.length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Test Result:</strong> The agent successfully conducted a {enhancedCallData.service_type} follow-up call 
                      with {enhancedCallData.customer_name}, demonstrating excellent communication skills and proper feedback collection techniques.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
};

export default AgentLibrary;