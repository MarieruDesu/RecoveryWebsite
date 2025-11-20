"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  MapPin,
  Users,
  MessageCircle,
  Heart,
  Search,
  Menu,
  X,
  Phone,
  Shield,
  Zap,
  BookOpen,
  UserCheck,
  LogIn,
  LogOut,
  User,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  EyeOff,
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "volunteer" | "requester" | "visitor"
  phone?: string
  joinDate: string
}

interface HelpRequest {
  id: string
  title: string
  description: string
  location: string
  category: string
  urgency: "low" | "medium" | "high" | "critical"
  timestamp: string
  author: string
  authorId: string
  offers: HelpOffer[]
  comments: Comment[]
  volunteers: VolunteerAssignment[]
  status: "pending" | "approved" | "rejected" | "completed"
  isPrivate: boolean
}

interface HelpOffer {
  id: string
  author: string
  message: string
  timestamp: string
  contact: string
}

interface Comment {
  id: string
  author: string
  message: string
  timestamp: string
}

interface EmergencyAlert {
  id: string
  type: string
  title: string
  message: string
  timestamp: string
  severity: "low" | "medium" | "high"
}

interface EmergencyResource {
  category: string
  items: {
    name: string
    contact: string
    description: string
  }[]
}

interface PreparednessGuide {
  title: string
  description: string
  items: string[]
}

interface VolunteerAssignment {
  id: string
  volunteerId: string
  volunteerName: string
  volunteerContact: string
  skills: string[]
  status: "pending" | "accepted" | "active" | "completed"
  assignedDate: string
  message: string
}

interface Volunteer {
  id: string
  name: string
  email: string
  phone: string
  skills: string[]
  availability: string
  experience: string
  status: "available" | "busy" | "inactive"
  assignedRequests: string[]
  completedTasks: number
  rating: number
  joinDate: string
}

export default function DisasterRecoveryPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "", role: "visitor" as User["role"] })
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "requester" as User["role"],
    phone: "",
  })
  const [showRegister, setShowRegister] = useState(false)

  const [activeTab, setActiveTab] = useState<
    "requests" | "create" | "resources" | "volunteers" | "admin" | "dashboard"
  >("requests")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [volunteerSearchTerm, setVolunteerSearchTerm] = useState("")
  const [selectedSkillFilter, setSelectedSkillFilter] = useState("all")

  const emergencyResources: EmergencyResource[] = [
    {
      category: "Emergency Contacts",
      items: [
        { name: "Emergency Services", contact: "911", description: "Fire, Police, Medical Emergency" },
        { name: "Disaster Hotline", contact: "1-800-DISASTER", description: "24/7 disaster assistance" },
        { name: "Red Cross", contact: "1-800-RED-CROSS", description: "Emergency shelter and aid" },
        { name: "Poison Control", contact: "1-800-222-1222", description: "Poison emergency assistance" },
      ],
    },
    {
      category: "Evacuation Centers",
      items: [
        { name: "Community Center", contact: "Zone 2", description: "Capacity: 200 people, Pet-friendly" },
        { name: "High School Gymnasium", contact: "Zone 1", description: "Capacity: 150 people, Medical station" },
        { name: "Recreation Center", contact: "Zone 3", description: "Capacity: 100 people, Family rooms" },
      ],
    },
    {
      category: "Supply Distribution",
      items: [
        { name: "Food Bank", contact: "Main St & 5th", description: "Daily 9AM-5PM, Free meals" },
        { name: "Water Distribution", contact: "City Park", description: "Daily 8AM-6PM, Bottled water" },
        { name: "Medical Supplies", contact: "Health Center", description: "24/7, First aid & medications" },
      ],
    },
  ]

  const preparednessGuides: PreparednessGuide[] = [
    {
      title: "Emergency Kit Essentials",
      description: "Build a comprehensive emergency kit for your family",
      items: [
        "Water (1 gallon per person per day)",
        "Non-perishable food (3-day supply)",
        "Battery-powered radio",
        "Flashlight and extra batteries",
        "First aid kit",
        "Medications",
        "Important documents",
        "Cash and credit cards",
      ],
    },
    {
      title: "Evacuation Planning",
      description: "Create and practice your family evacuation plan",
      items: [
        "Identify evacuation routes",
        "Choose meeting points",
        "Plan for pets",
        "Keep vehicle fueled",
        "Know shelter locations",
        "Practice the plan regularly",
      ],
    },
    {
      title: "Communication Plan",
      description: "Stay connected with family during emergencies",
      items: [
        "Designate out-of-state contact",
        "Program emergency numbers",
        "Learn text messaging",
        "Keep devices charged",
        "Know local radio stations",
        "Share plan with family",
      ],
    },
  ]

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "shelter", label: "Shelter" },
    { value: "food", label: "Food & Water" },
    { value: "medical", label: "Medical" },
    { value: "volunteers", label: "Volunteers" },
    { value: "supplies", label: "Supplies" },
    { value: "transport", label: "Transportation" },
  ]

  const urgencyColors = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  }

  const filteredRequests = helpRequests.filter((request) => {
    // Role-based filtering
    if (!currentUser) {
      // Visitors can only see public, approved requests
      if (request.isPrivate || request.status !== "approved") return false
    } else if (currentUser.role === "requester") {
      // Requesters can see their own requests and public approved requests
      if (request.authorId !== currentUser.id && (request.isPrivate || request.status !== "approved")) return false
    } else if (currentUser.role === "volunteer") {
      // Volunteers can see approved requests and their assigned requests
      const isAssigned = request.volunteers.some((v) => v.volunteerId === currentUser.id)
      if (!isAssigned && (request.isPrivate || request.status !== "approved")) return false
    }
    // Admins can see all requests

    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || request.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple mock authentication
    const user: User = {
      id: Date.now().toString(),
      name: loginForm.email.split("@")[0],
      email: loginForm.email,
      role: loginForm.role,
      joinDate: new Date().toISOString(),
    }
    setCurrentUser(user)
    setShowLogin(false)
    setLoginForm({ email: "", password: "", role: "visitor" })

    // Set appropriate default tab based on role
    if (user.role === "admin") {
      setActiveTab("admin")
    } else if (user.role === "volunteer") {
      setActiveTab("dashboard")
    } else if (user.role === "requester") {
      setActiveTab("dashboard")
    } else {
      setActiveTab("requests")
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    const user: User = {
      id: Date.now().toString(),
      name: registerForm.name,
      email: registerForm.email,
      role: registerForm.role,
      phone: registerForm.phone,
      joinDate: new Date().toISOString(),
    }
    setCurrentUser(user)
    setShowRegister(false)
    setRegisterForm({ name: "", email: "", password: "", role: "requester", phone: "" })

    if (user.role === "admin") {
      setActiveTab("admin")
    } else if (user.role === "volunteer") {
      setActiveTab("dashboard")
    } else if (user.role === "requester") {
      setActiveTab("dashboard")
    } else {
      setActiveTab("requests")
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setActiveTab("requests")
  }

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    const request: HelpRequest = {
      id: Date.now().toString(),
      title: newRequest.title,
      description: newRequest.description,
      location: newRequest.location,
      category: newRequest.category,
      urgency: newRequest.urgency,
      timestamp: "Just now",
      author: currentUser.name,
      authorId: currentUser.id,
      offers: [],
      comments: [],
      volunteers: [],
      status: "pending", // Requests start as pending for admin approval
      isPrivate: newRequest.isPrivate,
    }
    setHelpRequests([request, ...helpRequests])
    setNewRequest({
      title: "",
      description: "",
      location: "",
      category: "shelter",
      urgency: "medium",
      isPrivate: false,
    })
    setActiveTab("dashboard")
  }

  const approveRequest = (requestId: string) => {
    setHelpRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "approved" } : req)))
  }

  const rejectRequest = (requestId: string) => {
    setHelpRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" } : req)))
  }

  const addOffer = (requestId: string, offer: Omit<HelpOffer, "id" | "timestamp">) => {
    setHelpRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              offers: [
                ...request.offers,
                {
                  ...offer,
                  id: Date.now().toString(),
                  timestamp: "Just now",
                },
              ],
            }
          : request,
      ),
    )
  }

  const addComment = (requestId: string, comment: Omit<Comment, "id" | "timestamp">) => {
    setHelpRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              comments: [
                ...request.comments,
                {
                  ...comment,
                  id: Date.now().toString(),
                  timestamp: "Just now",
                },
              ],
            }
          : request,
      ),
    )
  }

  const addVolunteerToRequest = (
    requestId: string,
    volunteer: Omit<VolunteerAssignment, "id" | "assignedDate" | "status">,
  ) => {
    setHelpRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              volunteers: [
                ...request.volunteers,
                {
                  ...volunteer,
                  id: Date.now().toString(),
                  assignedDate: "Just now",
                  status: "pending",
                },
              ],
            }
          : request,
      ),
    )

    // Update volunteer's assigned requests
    setVolunteers((prev) =>
      prev.map((vol) =>
        vol.id === volunteer.volunteerId
          ? {
              ...vol,
              assignedRequests: [...vol.assignedRequests, requestId],
              status: "busy" as const,
            }
          : vol,
      ),
    )
  }

  const updateVolunteerStatus = (requestId: string, volunteerId: string, newStatus: VolunteerAssignment["status"]) => {
    setHelpRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              volunteers: request.volunteers.map((vol) =>
                vol.volunteerId === volunteerId ? { ...vol, status: newStatus } : vol,
              ),
            }
          : request,
      ),
    )
  }

  const addVolunteer = (
    volunteer: Omit<Volunteer, "id" | "joinDate" | "assignedRequests" | "completedTasks" | "rating">,
  ) => {
    const newVolunteer: Volunteer = {
      ...volunteer,
      id: Date.now().toString(),
      joinDate: "Just now",
      assignedRequests: [],
      completedTasks: 0,
      rating: 5.0,
    }
    setVolunteers((prev) => [newVolunteer, ...prev])
  }

  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    location: "",
    category: "shelter",
    urgency: "medium" as const,
    isPrivate: false,
  })

  useEffect(() => {
    const savedRequests = localStorage.getItem("disaster-recovery-requests")
    const savedVolunteers = localStorage.getItem("disaster-recovery-volunteers")
    const savedUser = localStorage.getItem("disaster-recovery-user")

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error loading saved user:", error)
      }
    }

    if (savedRequests) {
      try {
        const parsedRequests = JSON.parse(savedRequests)
        const requestsWithVolunteers = parsedRequests.map((request: any) => ({
          ...request,
          volunteers: request.volunteers || [],
          offers: request.offers || [],
          comments: request.comments || [],
          status: request.status || "approved",
          isPrivate: request.isPrivate || false,
          authorId: request.authorId || "unknown",
        }))
        setHelpRequests(requestsWithVolunteers)
      } catch (error) {
        console.error("Error loading saved requests:", error)
        setHelpRequests(getDefaultRequests())
      }
    } else {
      setHelpRequests(getDefaultRequests())
    }

    if (savedVolunteers) {
      try {
        setVolunteers(JSON.parse(savedVolunteers))
      } catch (error) {
        console.error("Error loading saved volunteers:", error)
        setVolunteers(getDefaultVolunteers())
      }
    } else {
      setVolunteers(getDefaultVolunteers())
    }
  }, [])

  useEffect(() => {
    if (helpRequests.length > 0) {
      localStorage.setItem("disaster-recovery-requests", JSON.stringify(helpRequests))
    }
  }, [helpRequests])

  useEffect(() => {
    if (volunteers.length > 0) {
      localStorage.setItem("disaster-recovery-volunteers", JSON.stringify(volunteers))
    }
  }, [volunteers])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("disaster-recovery-user", JSON.stringify(currentUser))
    } else {
      localStorage.removeItem("disaster-recovery-user")
    }
  }, [currentUser])

  const getDefaultRequests = (): HelpRequest[] => [
    {
      id: "1",
      title: "Need temporary shelter for family of 4",
      description:
        "Our home was damaged in the recent flooding. We need temporary accommodation for 2 adults and 2 children (ages 8 and 12) for approximately 2-3 weeks while repairs are made.",
      location: "Downtown District, Zone 3",
      category: "shelter",
      urgency: "high",
      timestamp: "2 hours ago",
      author: "Sarah M.",
      authorId: "user1",
      offers: [
        {
          id: "1",
          author: "Mike R.",
          message: "I have a guest house available. Can accommodate your family. Contact me at mike.r@email.com",
          timestamp: "1 hour ago",
          contact: "mike.r@email.com",
        },
      ],
      comments: [
        {
          id: "1",
          author: "Lisa K.",
          message: "I can provide bedding and clothes for the children if needed.",
          timestamp: "30 minutes ago",
        },
      ],
      volunteers: [
        {
          id: "1",
          volunteerId: "vol1",
          volunteerName: "Emma Thompson",
          volunteerContact: "emma.t@email.com",
          skills: ["Housing Assistance", "Family Support"],
          status: "active",
          assignedDate: "1 hour ago",
          message: "I can help coordinate temporary housing and provide family support services.",
        },
      ],
      status: "approved",
      isPrivate: false,
    },
    {
      id: "2",
      title: "Medical supplies needed urgently",
      description:
        "Local clinic is running low on basic medical supplies including bandages, antiseptics, and pain medication. Serving 200+ displaced families.",
      location: "Medical Center, Zone 1",
      category: "medical",
      urgency: "critical",
      timestamp: "4 hours ago",
      author: "Dr. James Wilson",
      authorId: "user2",
      offers: [],
      comments: [],
      volunteers: [
        {
          id: "2",
          volunteerId: "vol2",
          volunteerName: "Dr. Maria Rodriguez",
          volunteerContact: "maria.r@hospital.com",
          skills: ["Medical Support", "Emergency Response"],
          status: "active",
          assignedDate: "2 hours ago",
          message: "I can provide medical expertise and help coordinate supply distribution.",
        },
      ],
      status: "approved",
      isPrivate: false,
    },
    {
      id: "3",
      title: "Food distribution volunteers needed",
      description:
        "We need 10-15 volunteers to help distribute meals to affected families. Shift times: 8AM-12PM and 1PM-5PM daily.",
      location: "Community Center, Zone 2",
      category: "volunteers",
      urgency: "medium",
      timestamp: "6 hours ago",
      author: "Relief Coordinator",
      authorId: "user3",
      offers: [
        {
          id: "2",
          author: "Emma T.",
          message: "I can volunteer for the morning shift. Available all week.",
          timestamp: "3 hours ago",
          contact: "emma.t@email.com",
        },
        {
          id: "3",
          author: "Carlos M.",
          message: "Count me in for afternoon shifts. I have experience in food service.",
          timestamp: "2 hours ago",
          contact: "carlos.m@email.com",
        },
      ],
      comments: [],
      volunteers: [
        {
          id: "3",
          volunteerId: "vol3",
          volunteerName: "Carlos Martinez",
          volunteerContact: "carlos.m@email.com",
          skills: ["Food Service", "Community Outreach"],
          status: "active",
          assignedDate: "2 hours ago",
          message: "Leading the afternoon food distribution team with 5 other volunteers.",
        },
      ],
      status: "approved",
      isPrivate: false,
    },
  ]

  const getDefaultVolunteers = (): Volunteer[] => [
    {
      id: "vol1",
      name: "Emma Thompson",
      email: "emma.t@email.com",
      phone: "(555) 123-4567",
      skills: ["Housing Assistance", "Family Support", "Childcare"],
      availability: "Weekdays",
      experience: "5 years experience in social work and family crisis support",
      status: "busy",
      assignedRequests: ["1"],
      completedTasks: 12,
      rating: 4.9,
      joinDate: "2 weeks ago",
    },
    {
      id: "vol2",
      name: "Dr. Maria Rodriguez",
      email: "maria.r@hospital.com",
      phone: "(555) 234-5678",
      skills: ["Medical Support", "Emergency Response", "Triage"],
      availability: "24/7 Emergency Response",
      experience: "15 years emergency medicine, disaster response certified",
      status: "busy",
      assignedRequests: ["2"],
      completedTasks: 28,
      rating: 5.0,
      joinDate: "1 month ago",
    },
    {
      id: "vol3",
      name: "Carlos Martinez",
      email: "carlos.m@email.com",
      phone: "(555) 345-6789",
      skills: ["Food Service", "Community Outreach", "Translation"],
      availability: "Evenings",
      experience: "Restaurant manager, bilingual Spanish/English",
      status: "busy",
      assignedRequests: ["3"],
      completedTasks: 8,
      rating: 4.8,
      joinDate: "1 week ago",
    },
    {
      id: "vol4",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "(555) 456-7890",
      skills: ["Transportation", "Logistics", "Pet Care"],
      availability: "Flexible",
      experience: "Uber driver, pet owner, logistics coordinator",
      status: "available",
      assignedRequests: [],
      completedTasks: 15,
      rating: 4.7,
      joinDate: "3 weeks ago",
    },
    {
      id: "vol5",
      name: "Michael Chen",
      email: "michael.c@email.com",
      phone: "(555) 567-8901",
      skills: ["Construction", "Repairs", "Heavy Lifting"],
      availability: "Weekends",
      experience: "Construction foreman, 20 years building experience",
      status: "available",
      assignedRequests: [],
      completedTasks: 22,
      rating: 4.9,
      joinDate: "1 month ago",
    },
  ]

  const skillCategories = [
    "Medical Support",
    "Food Service",
    "Housing Assistance",
    "Transportation",
    "Construction",
    "Childcare",
    "Translation",
    "Emergency Response",
    "Community Outreach",
    "Pet Care",
    "Logistics",
    "Repairs",
  ]

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.name.toLowerCase().includes(volunteerSearchTerm.toLowerCase()) ||
      volunteer.skills.some((skill) => skill.toLowerCase().includes(volunteerSearchTerm.toLowerCase())) ||
      volunteer.experience.toLowerCase().includes(volunteerSearchTerm.toLowerCase())
    const matchesSkill = selectedSkillFilter === "all" || volunteer.skills.includes(selectedSkillFilter)
    return matchesSearch && matchesSkill
  })

  const getNavigationTabs = () => {
    const baseTabs = [
      { key: "requests", label: "Requests", icon: MessageCircle },
      { key: "resources", label: "Resources", icon: BookOpen },
    ]

    if (!currentUser) {
      return baseTabs
    }

    const roleTabs = []

    if (currentUser.role === "admin") {
      roleTabs.push(
        { key: "admin", label: "Admin Panel", icon: Settings },
        { key: "volunteers", label: "Volunteers", icon: UserCheck },
      )
    } else if (currentUser.role === "volunteer") {
      roleTabs.push(
        { key: "dashboard", label: "My Assignments", icon: User },
        { key: "volunteers", label: "Volunteers", icon: UserCheck },
      )
    } else if (currentUser.role === "requester") {
      roleTabs.push(
        { key: "create", label: "Request Help", icon: Heart },
        { key: "dashboard", label: "My Requests", icon: User },
      )
    }

    return [...baseTabs, ...roleTabs]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">Disaster Recovery Hub</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-4">
                {getNavigationTabs().map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      activeTab === key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </nav>

              {/* User Actions */}
              <div className="hidden md:flex items-center gap-2">
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {currentUser.role}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{currentUser.name}</span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowLogin(true)}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                    <Button size="sm" onClick={() => setShowRegister(true)}>
                      Register
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {getNavigationTabs().map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key as any)
                      setMobileMenuOpen(false)
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                      activeTab === key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Mobile User Actions */}
              <div className="border-t border-border pt-4">
                {currentUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {currentUser.role}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{currentUser.name}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="w-full bg-transparent">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" onClick={() => setShowLogin(true)} className="w-full">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                    <Button size="sm" onClick={() => setShowRegister(true)} className="w-full">
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Sign in to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    required
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <Input
                    required
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={loginForm.role}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, role: e.target.value as User["role"] }))}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground"
                  >
                    <option value="visitor">Visitor</option>
                    <option value="requester">Help Requester</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Login
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowLogin(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Register</CardTitle>
              <CardDescription>Create a new account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input
                    required
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    required
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
                  <Input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <Input
                    required
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={registerForm.role}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, role: e.target.value as User["role"] }))}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground"
                  >
                    <option value="requester">Help Requester</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Register
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowRegister(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hero Section - Only show for visitors */}
      {!currentUser && (
        <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 text-balance">Community Support in Times of Need</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
              Connect with your community to request help or offer assistance during natural disasters. Together, we can
              rebuild and recover stronger.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Community Support</h3>
                <p className="text-sm text-muted-foreground">Connect with neighbors and volunteers</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Immediate Help</h3>
                <p className="text-sm text-muted-foreground">Get assistance when you need it most</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Local Focus</h3>
                <p className="text-sm text-muted-foreground">Location-based help and resources</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Trusted Network</h3>
                <p className="text-sm text-muted-foreground">Verified community members</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Help Requests Tab */}
        {activeTab === "requests" && (
          <div>
            {/* Search and Filter */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requests by title, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Help Requests */}
            <div className="space-y-6">
              {filteredRequests.map((request) => (
                <HelpRequestCard
                  key={request.id}
                  request={request}
                  onAddOffer={addOffer}
                  onAddComment={addComment}
                  urgencyColors={urgencyColors}
                  volunteers={volunteers}
                  onAddVolunteer={addVolunteerToRequest}
                  onUpdateVolunteerStatus={updateVolunteerStatus}
                  currentUser={currentUser}
                />
              ))}

              {filteredRequests.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">No requests found matching your criteria.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {activeTab === "admin" && currentUser?.role === "admin" && (
          <AdminPanel
            helpRequests={helpRequests}
            volunteers={volunteers}
            onApproveRequest={approveRequest}
            onRejectRequest={rejectRequest}
            onAddVolunteerToRequest={addVolunteerToRequest}
          />
        )}

        {/* User Dashboard */}
        {activeTab === "dashboard" && currentUser && (
          <UserDashboard
            user={currentUser}
            helpRequests={helpRequests}
            volunteers={volunteers}
            onUpdateVolunteerStatus={updateVolunteerStatus}
          />
        )}

        {/* Create Request Tab */}
        {activeTab === "create" && currentUser?.role === "requester" && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Request Help</CardTitle>
                <CardDescription>Describe what assistance you need and our community will help you.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitRequest} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      required
                      value={newRequest.title}
                      onChange={(e) => setNewRequest((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief description of what you need"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      required
                      value={newRequest.description}
                      onChange={(e) => setNewRequest((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide detailed information about your situation and what help you need"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input
                      required
                      value={newRequest.location}
                      onChange={(e) => setNewRequest((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Your location or area where help is needed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={newRequest.category}
                        onChange={(e) => setNewRequest((prev) => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground"
                      >
                        {categories.slice(1).map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Urgency</label>
                      <select
                        value={newRequest.urgency}
                        onChange={(e) => setNewRequest((prev) => ({ ...prev, urgency: e.target.value as any }))}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={newRequest.isPrivate}
                      onChange={(e) => setNewRequest((prev) => ({ ...prev, isPrivate: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="isPrivate" className="text-sm font-medium">
                      Keep this request private (only visible to admins and assigned volunteers)
                    </label>
                  </div>

                  <Button type="submit" className="w-full">
                    Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Emergency Resources</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Essential contacts, locations, and information to help you during emergencies
              </p>
            </div>

            {/* Emergency Contacts & Resources */}
            <div className="resource-grid">
              {emergencyResources.map((section, index) => (
                <Card key={index} className="emergency-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      {section.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="border-l-2 border-primary/20 pl-4">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.contact}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Preparedness Guides */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6 text-center">Disaster Preparedness Guides</h3>
              <div className="resource-grid">
                {preparednessGuides.map((guide, index) => (
                  <Card key={index} className="emergency-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {guide.title}
                      </CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {guide.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Volunteers Tab */}
        {activeTab === "volunteers" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Volunteer Coordination</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Connect volunteers with help requests and coordinate community disaster response efforts
              </p>
            </div>

            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search volunteers by name, skills, or experience..."
                    value={volunteerSearchTerm}
                    onChange={(e) => setVolunteerSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedSkillFilter}
                  onChange={(e) => setSelectedSkillFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
                >
                  <option value="all">All Skills</option>
                  {skillCategories.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="emergency-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Active Volunteers ({filteredVolunteers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {filteredVolunteers.map((volunteer) => (
                        <div key={volunteer.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {volunteer.name}
                                <Badge
                                  className={`text-xs ${
                                    volunteer.status === "available"
                                      ? "bg-green-500 text-white"
                                      : volunteer.status === "busy"
                                        ? "bg-yellow-500 text-white"
                                        : "bg-gray-500 text-white"
                                  }`}
                                >
                                  {volunteer.status.toUpperCase()}
                                </Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground">{volunteer.email}</p>
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-primary font-medium">★ {volunteer.rating}</div>
                              <div className="text-muted-foreground">{volunteer.completedTasks} tasks</div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1 mb-2">
                              {volunteer.skills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">{volunteer.experience}</p>
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Available: {volunteer.availability}</span>
                            {volunteer.assignedRequests.length > 0 && (
                              <span className="text-primary">
                                {volunteer.assignedRequests.length} active assignment(s)
                              </span>
                            )}
                          </div>

                          {volunteer.status === "available" && currentUser?.role === "admin" && (
                            <Button size="sm" className="mt-3 w-full">
                              Assign to Request
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                {(!currentUser || currentUser.role !== "admin") && (
                  <Card className="emergency-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        Become a Volunteer
                      </CardTitle>
                      <CardDescription>Join our community response team</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <VolunteerRegistrationForm onAddVolunteer={addVolunteer} skillCategories={skillCategories} />
                    </CardContent>
                  </Card>
                )}

                <Card className="emergency-card mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      Volunteer Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Volunteers</span>
                        <span className="font-medium">{volunteers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Available Now</span>
                        <span className="font-medium text-green-600">
                          {volunteers.filter((v) => v.status === "available").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Currently Assigned</span>
                        <span className="font-medium text-yellow-600">
                          {volunteers.filter((v) => v.status === "busy").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Tasks Completed</span>
                        <span className="font-medium">{volunteers.reduce((sum, v) => sum + v.completedTasks, 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function HelpRequestCard({
  request,
  onAddOffer,
  onAddComment,
  urgencyColors,
  volunteers,
  onAddVolunteer,
  onUpdateVolunteerStatus,
  currentUser,
}: {
  request: HelpRequest
  onAddOffer: (requestId: string, offer: Omit<HelpOffer, "id" | "timestamp">) => void
  onAddComment: (requestId: string, comment: Omit<Comment, "id" | "timestamp">) => void
  urgencyColors: Record<string, string>
  volunteers: Volunteer[]
  onAddVolunteer: (requestId: string, volunteer: Omit<VolunteerAssignment, "id" | "assignedDate" | "status">) => void
  onUpdateVolunteerStatus: (requestId: string, volunteerId: string, status: VolunteerAssignment["status"]) => void
  currentUser: User | null
}) {
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [showVolunteerForm, setShowVolunteerForm] = useState(false)
  const [offerForm, setOfferForm] = useState({ author: "", message: "", contact: "" })
  const [commentForm, setCommentForm] = useState({ author: "", message: "" })
  const [volunteerForm, setVolunteerForm] = useState({ volunteerId: "", message: "" })

  const requestVolunteers = request.volunteers || []
  const requestOffers = request.offers || []
  const requestComments = request.comments || []
  const availableVolunteers = volunteers?.filter((v) => v.status === "available") || []

  const canInteract =
    currentUser &&
    (currentUser.role === "admin" ||
      request.status === "approved" ||
      request.authorId === currentUser.id ||
      requestVolunteers.some((v) => v.volunteerId === currentUser.id))

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    onAddOffer(request.id, {
      ...offerForm,
      author: currentUser.name,
    })
    setOfferForm({ author: "", message: "", contact: "" })
    setShowOfferForm(false)
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    onAddComment(request.id, {
      ...commentForm,
      author: currentUser.name,
    })
    setCommentForm({ author: "", message: "" })
    setShowCommentForm(false)
  }

  const handleAssignVolunteer = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedVolunteer = volunteers.find((v) => v.id === volunteerForm.volunteerId)
    if (selectedVolunteer) {
      onAddVolunteer(request.id, {
        volunteerId: selectedVolunteer.id,
        volunteerName: selectedVolunteer.name,
        volunteerContact: selectedVolunteer.email,
        skills: selectedVolunteer.skills,
        message: volunteerForm.message,
      })
      setVolunteerForm({ volunteerId: "", message: "" })
      setShowVolunteerForm(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${urgencyColors[request.urgency]} text-white`}>{request.urgency.toUpperCase()}</Badge>
              <Badge variant="outline">{request.category}</Badge>
              <Badge
                className={`text-xs ${
                  request.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : request.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : request.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                }`}
              >
                {request.status.toUpperCase()}
              </Badge>
              {request.isPrivate && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
              {requestVolunteers.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {requestVolunteers.length} volunteer(s) assigned
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground gap-4">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {request.location}
              </span>
              <span>{request.timestamp}</span>
              <span>by {request.author}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">{request.description}</p>

        {requestVolunteers.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Assigned Volunteers ({requestVolunteers.length})
            </h4>
            <div className="space-y-3">
              {requestVolunteers.map((volunteer) => (
                <div key={volunteer.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{volunteer.volunteerName}</span>
                      <Badge
                        className={`ml-2 text-xs ${
                          volunteer.status === "active"
                            ? "bg-green-500 text-white"
                            : volunteer.status === "pending"
                              ? "bg-yellow-500 text-white"
                              : volunteer.status === "completed"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-500 text-white"
                        }`}
                      >
                        {volunteer.status.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{volunteer.assignedDate}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {volunteer.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm mb-2">{volunteer.message}</p>
                  <p className="text-sm text-primary">Contact: {volunteer.volunteerContact}</p>

                  {currentUser &&
                    (currentUser.role === "admin" || currentUser.id === volunteer.volunteerId) &&
                    volunteer.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => onUpdateVolunteerStatus(request.id, volunteer.volunteerId, "active")}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateVolunteerStatus(request.id, volunteer.volunteerId, "completed")}
                        >
                          Mark Complete
                        </Button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offers Section */}
        {requestOffers.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Help Offers ({requestOffers.length})
            </h4>
            <div className="space-y-3">
              {requestOffers.map((offer) => (
                <div key={offer.id} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{offer.author}</span>
                    <span className="text-sm text-muted-foreground">{offer.timestamp}</span>
                  </div>
                  <p className="text-sm mb-2">{offer.message}</p>
                  <p className="text-sm text-primary">Contact: {offer.contact}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        {requestComments.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              Comments ({requestComments.length})
            </h4>
            <div className="space-y-3">
              {requestComments.map((comment) => (
                <div key={comment.id} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm">{comment.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {canInteract && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="default" onClick={() => setShowOfferForm(!showOfferForm)} className="flex-1">
              <Heart className="h-4 w-4 mr-2" />
              Offer Help
            </Button>
            <Button variant="outline" onClick={() => setShowCommentForm(!showCommentForm)} className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
            {currentUser?.role === "admin" && availableVolunteers.length > 0 && (
              <Button variant="secondary" onClick={() => setShowVolunteerForm(!showVolunteerForm)} className="flex-1">
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Volunteer
              </Button>
            )}
          </div>
        )}

        {/* Offer Form */}
        {showOfferForm && canInteract && (
          <form onSubmit={handleSubmitOffer} className="mt-4 space-y-3 p-4 bg-muted/30 rounded-lg">
            <Textarea
              required
              placeholder="Describe how you can help..."
              value={offerForm.message}
              onChange={(e) => setOfferForm((prev) => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
            <Input
              required
              placeholder="Your contact information (email/phone)"
              value={offerForm.contact}
              onChange={(e) => setOfferForm((prev) => ({ ...prev, contact: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Submit Offer
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowOfferForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Comment Form */}
        {showCommentForm && canInteract && (
          <form onSubmit={handleSubmitComment} className="mt-4 space-y-3 p-4 bg-muted/30 rounded-lg">
            <Textarea
              required
              placeholder="Add a comment..."
              value={commentForm.message}
              onChange={(e) => setCommentForm((prev) => ({ ...prev, message: e.target.value }))}
              rows={2}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Add Comment
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCommentForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {showVolunteerForm && currentUser?.role === "admin" && (
          <form
            onSubmit={handleAssignVolunteer}
            className="mt-4 space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Select Volunteer</label>
              <select
                required
                value={volunteerForm.volunteerId}
                onChange={(e) => setVolunteerForm((prev) => ({ ...prev, volunteerId: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground"
              >
                <option value="">Choose a volunteer...</option>
                {availableVolunteers.map((volunteer) => (
                  <option key={volunteer.id} value={volunteer.id}>
                    {volunteer.name} - {volunteer.skills.join(", ")}
                  </option>
                ))}
              </select>
            </div>
            <Textarea
              required
              placeholder="Assignment details and instructions..."
              value={volunteerForm.message}
              onChange={(e) => setVolunteerForm((prev) => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Assign Volunteer
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowVolunteerForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

function AdminPanel({
  helpRequests,
  volunteers,
  onApproveRequest,
  onRejectRequest,
  onAddVolunteerToRequest,
}: {
  helpRequests: HelpRequest[]
  volunteers: Volunteer[]
  onApproveRequest: (requestId: string) => void
  onRejectRequest: (requestId: string) => void
  onAddVolunteerToRequest: (
    requestId: string,
    volunteer: Omit<VolunteerAssignment, "id" | "assignedDate" | "status">,
  ) => void
}) {
  const pendingRequests = helpRequests.filter((req) => req.status === "pending")
  const approvedRequests = helpRequests.filter((req) => req.status === "approved")
  const rejectedRequests = helpRequests.filter((req) => req.status === "rejected")

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Admin Panel</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage help requests, assign volunteers, and oversee disaster recovery operations
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Requests</p>
                <p className="text-2xl font-bold text-green-600">{approvedRequests.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Volunteers</p>
                <p className="text-2xl font-bold text-blue-600">
                  {volunteers.filter((v) => v.status === "available").length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Volunteers</p>
                <p className="text-2xl font-bold text-primary">{volunteers.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
            <CardDescription>Review and approve or reject help requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{request.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {request.location}
                        </span>
                        <span>by {request.author}</span>
                        <span>{request.timestamp}</span>
                        <Badge
                          className={`${request.urgency === "critical" ? "bg-red-500" : request.urgency === "high" ? "bg-orange-500" : request.urgency === "medium" ? "bg-yellow-500" : "bg-green-500"} text-white text-xs`}
                        >
                          {request.urgency.toUpperCase()}
                        </Badge>
                        {request.isPrivate && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => onApproveRequest(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onRejectRequest(request.id)}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest approved requests and volunteer assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvedRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{request.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {request.location} • {request.timestamp}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {request.category}
                  </Badge>
                  {request.volunteers.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">{request.volunteers.length} volunteers</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UserDashboard({
  user,
  helpRequests,
  volunteers,
  onUpdateVolunteerStatus,
}: {
  user: User
  helpRequests: HelpRequest[]
  volunteers: Volunteer[]
  onUpdateVolunteerStatus: (requestId: string, volunteerId: string, status: VolunteerAssignment["status"]) => void
}) {
  if (user.role === "requester") {
    const userRequests = helpRequests.filter((req) => req.authorId === user.id)

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">My Requests</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your help requests and see responses from the community
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{userRequests.length}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {userRequests.filter((r) => r.status === "pending").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Requests</p>
                  <p className="text-2xl font-bold text-green-600">
                    {userRequests.filter((r) => r.status === "approved").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {userRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        className={`${request.status === "approved" ? "bg-green-100 text-green-800" : request.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                      >
                        {request.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{request.category}</Badge>
                      {request.isPrivate && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{request.timestamp}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{request.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-primary">{request.offers.length}</div>
                    <div className="text-xs text-muted-foreground">Offers</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-primary">{request.comments.length}</div>
                    <div className="text-xs text-muted-foreground">Comments</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-primary">{request.volunteers.length}</div>
                    <div className="text-xs text-muted-foreground">Volunteers</div>
                  </div>
                </div>

                {/* Assigned Volunteers */}
                {request.volunteers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Assigned Volunteers:</h4>
                    {request.volunteers.map((volunteer) => (
                      <div key={volunteer.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div>
                          <span className="font-medium text-sm">{volunteer.volunteerName}</span>
                          <Badge
                            className={`ml-2 text-xs ${volunteer.status === "active" ? "bg-green-500 text-white" : volunteer.status === "pending" ? "bg-yellow-500 text-white" : "bg-blue-500 text-white"}`}
                          >
                            {volunteer.status.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{volunteer.volunteerContact}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {userRequests.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">You haven't submitted any help requests yet.</p>
                <Button className="mt-4" onClick={() => (window.location.hash = "create")}>
                  Create Your First Request
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  if (user.role === "volunteer") {
    const assignedRequests = helpRequests.filter((req) => req.volunteers.some((v) => v.volunteerId === user.id))

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">My Assignments</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">View and manage your volunteer assignments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Assignments</p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      assignedRequests.filter((r) =>
                        r.volunteers.some((v) => v.volunteerId === user.id && v.status === "active"),
                      ).length
                    }
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Assignments</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      assignedRequests.filter((r) =>
                        r.volunteers.some((v) => v.volunteerId === user.id && v.status === "pending"),
                      ).length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      assignedRequests.filter((r) =>
                        r.volunteers.some((v) => v.volunteerId === user.id && v.status === "completed"),
                      ).length
                    }
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        <div className="space-y-6">
          {assignedRequests.map((request) => {
            const myAssignment = request.volunteers.find((v) => v.volunteerId === user.id)
            if (!myAssignment) return null

            return (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          className={`${myAssignment.status === "active" ? "bg-green-100 text-green-800" : myAssignment.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
                        >
                          {myAssignment.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{request.category}</Badge>
                        <Badge
                          className={`${request.urgency === "critical" ? "bg-red-500" : request.urgency === "high" ? "bg-orange-500" : request.urgency === "medium" ? "bg-yellow-500" : "bg-green-500"} text-white`}
                        >
                          {request.urgency.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">Assigned {myAssignment.assignedDate}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{request.description}</p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-sm mb-2">Assignment Details:</h4>
                    <p className="text-sm">{myAssignment.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{request.location}</span>
                    </div>
                  </div>

                  {myAssignment.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onUpdateVolunteerStatus(request.id, user.id, "active")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept Assignment
                      </Button>
                    </div>
                  )}

                  {myAssignment.status === "active" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onUpdateVolunteerStatus(request.id, user.id, "completed")}
                        variant="outline"
                      >
                        Mark as Completed
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {assignedRequests.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">You don't have any assignments yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check back later or contact an administrator to get assigned to help requests.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return null
}

function VolunteerRegistrationForm({
  onAddVolunteer,
  skillCategories,
}: {
  onAddVolunteer: (
    volunteer: Omit<Volunteer, "id" | "joinDate" | "assignedRequests" | "completedTasks" | "rating">,
  ) => void
  skillCategories: string[]
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skills: [] as string[],
    availability: "Flexible",
    experience: "",
    status: "available" as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddVolunteer(form)
    setForm({
      name: "",
      email: "",
      phone: "",
      skills: [],
      availability: "Flexible",
      experience: "",
      status: "available",
    })
  }

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Full Name</label>
        <Input
          required
          placeholder="Enter your full name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input
          required
          type="email"
          placeholder="your.email@example.com"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Phone</label>
        <Input
          required
          type="tel"
          placeholder="(555) 123-4567"
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Skills (select all that apply)</label>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
          {skillCategories.map((skill) => (
            <label key={skill} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={form.skills.includes(skill)}
                onChange={() => toggleSkill(skill)}
                className="rounded"
              />
              <span>{skill}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Experience</label>
        <Textarea
          required
          placeholder="Describe any relevant skills, certifications, or experience..."
          rows={3}
          value={form.experience}
          onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Availability</label>
        <select
          value={form.availability}
          onChange={(e) => setForm((prev) => ({ ...prev, availability: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground"
        >
          <option>Weekdays</option>
          <option>Weekends</option>
          <option>Evenings</option>
          <option>24/7 Emergency Response</option>
          <option>Flexible</option>
        </select>
      </div>
      <Button type="submit" className="w-full">
        Register as Volunteer
      </Button>
    </form>
  )
}
