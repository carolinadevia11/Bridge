import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, MessageSquare, DollarSign, FileText, Settings, Home, Heart, Users, Trophy, Plus, BookOpen, UserPlus, Scale, AlertTriangle, HelpCircle, Baby, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgressBar from '@/components/ProgressBar';
import QuickActionCard from '@/components/QuickActionCard';
import CalendarView from '@/components/CalendarView';
import MessagingInterface from '@/components/MessagingInterface';
import ExpenseTracker from '@/components/ExpenseTracker';
import DocumentManager from '@/components/DocumentManager';
import EducationalResources from '@/components/EducationalResources';
import OnboardingFlow from '@/components/OnboardingFlow';
import OnboardingExplanation from '@/components/OnboardingExplanation';
import AccountSetup from '@/components/AccountSetup';
import FamilyCodeSetup from '@/components/FamilyCodeSetup';
import ContractUpload from '@/components/ContractUpload';
import UserSettings from '@/components/UserSettings';
import FamilyOnboarding from '@/components/FamilyOnboarding';
import ChildManagement from '@/components/ChildManagement';
import { FamilyProfile, Child } from '@/types/family';
import { authAPI, familyAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface IndexProps {
  onLogout: () => void;
  startOnboarding?: boolean;
  startInSettings?: boolean;
}

const Index: React.FC<IndexProps> = ({ onLogout, startOnboarding = false, startInSettings = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showOnboardingExplanation, setShowOnboardingExplanation] = useState(startOnboarding);
  const [showAccountSetup, setShowAccountSetup] = useState(false);
  const [showFamilyCodeSetup, setShowFamilyCodeSetup] = useState(false);
  const [showContractUpload, setShowContractUpload] = useState(false);
  const [showFamilyOnboarding, setShowFamilyOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(startInSettings);
  const [showChildManagement, setShowChildManagement] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(null);
  const [familyCodeMode, setFamilyCodeMode] = useState<'create' | 'join'>('create');
  const [tempFamilyData, setTempFamilyData] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    familyName?: string;
    parent1_name?: string;
    familyCode?: string;
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);

  // Fetch current user and family profile on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Fetch user profile
          const userProfile = await authAPI.getCurrentUser();
          setCurrentUser({
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: userProfile.email
          });

          // Fetch family profile if exists
          try {
            const family = await familyAPI.getFamily();
            if (family) {
              // Convert backend family data to FamilyProfile format
              // This is a simplified version - you may need to adjust based on your backend structure
              setFamilyProfile(family as FamilyProfile);
            }
          } catch (error) {
            // Family profile doesn't exist yet - that's okay
            console.info('No family profile found yet');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (startInSettings) {
      setShowSettings(true);
    }
  }, [startInSettings]);

  useEffect(() => {
    if (showSettings) {
      if (location.pathname !== '/settings') {
        navigate('/settings', { replace: true });
      }
    } else if (location.pathname === '/settings') {
      navigate('/', { replace: true });
    }
  }, [showSettings, location.pathname, navigate]);

  // Show onboarding explanation (check this first as it's a direct user action)
  if (showOnboardingExplanation) {
    return (
      <OnboardingExplanation 
        onStartJourney={() => {
          setShowOnboardingExplanation(false);
          setShowAccountSetup(true);
        }}
        onCancel={() => {
          // Skip Preview should also start the journey, not go back to dashboard
          setShowOnboardingExplanation(false);
          setShowAccountSetup(true);
        }}
      />
    );
  }

  // Show account setup screen (check this before family onboarding)
  if (showAccountSetup) {
    return (
      <AccountSetup 
        onComplete={(userData) => {
          // Store user data for Family Code setup
          setTempFamilyData({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            familyName: `${userData.lastName} Family`, // Auto-generate family name
            parent1_name: `${userData.firstName} ${userData.lastName}`
          });
          setShowAccountSetup(false);
          setShowFamilyCodeSetup(true);
        }} 
      />
    );
  }

  // Show Family Code Setup
  if (showFamilyCodeSetup) {
    return (
      <FamilyCodeSetup
        mode={familyCodeMode}
        onSuccess={(familyData) => {
          setTempFamilyData(prev => ({ ...prev, ...familyData }));
          setShowFamilyCodeSetup(false);
          setShowContractUpload(true);
        }}
        familyName={tempFamilyData?.familyName}
        parent1Name={tempFamilyData?.parent1_name}
      />
    );
  }

  // Show Contract Upload
  if (showContractUpload) {
    return (
      <ContractUpload
        onComplete={(parsedData) => {
          setShowContractUpload(false);
          setShowFamilyOnboarding(true);
        }}
        onSkip={() => {
          setShowContractUpload(false);
          setShowFamilyOnboarding(true);
        }}
      />
    );
  }

  // Show family onboarding first if no profile exists
  if (!familyProfile && showFamilyOnboarding) {
    return (
      <FamilyOnboarding 
        onComplete={(profile) => {
          setFamilyProfile(profile);
          setShowFamilyOnboarding(false);
          setShowOnboarding(true);
          setIsFirstTime(true);
        }} 
      />
    );
  }

  // Show onboarding flow
  if (showOnboarding && isFirstTime) {
    return (
      <OnboardingFlow 
        onComplete={() => {
          setShowOnboarding(false);
          setIsFirstTime(false);
        }} 
      />
    );
  }

  // Show settings screen
  if (showSettings) {
    return <UserSettings onBack={() => setShowSettings(false)} />;
  }

  // Show child management
  if (showChildManagement && familyProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => setShowChildManagement(false)}>
              ← Back to Dashboard
            </Button>
          </div>
          <ChildManagement
            children={familyProfile.children}
            onAddChild={(child) => {
              setFamilyProfile(prev => prev ? {
                ...prev,
                children: [...prev.children, child]
              } : null);
            }}
            onUpdateChild={(childId, updates) => {
              setFamilyProfile(prev => prev ? {
                ...prev,
                children: prev.children.map(c => 
                  c.id === childId ? { ...c, ...updates } : c
                )
              } : null);
            }}
            onRemoveChild={(childId) => {
              setFamilyProfile(prev => prev ? {
                ...prev,
                children: prev.children.filter(c => c.id !== childId)
              } : null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      <style>{`
        @keyframes bridgette-float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.02);
          }
        }

        @keyframes bridgette-talk {
          0%, 100% {
            transform: scaleY(1);
          }
          10% {
            transform: scaleY(0.95);
          }
          20% {
            transform: scaleY(1.02);
          }
          30% {
            transform: scaleY(0.98);
          }
          40% {
            transform: scaleY(1.01);
          }
          50% {
            transform: scaleY(0.97);
          }
          60% {
            transform: scaleY(1.03);
          }
          70% {
            transform: scaleY(0.96);
          }
          80% {
            transform: scaleY(1.01);
          }
          90% {
            transform: scaleY(0.99);
          }
        }

        @keyframes bridgette-wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-5deg);
          }
          75% {
            transform: rotate(5deg);
          }
        }

        @keyframes bridgette-glow {
          0%, 100% {
            filter: drop-shadow(0 4px 6px rgba(59, 130, 246, 0.3));
          }
          50% {
            filter: drop-shadow(0 8px 12px rgba(59, 130, 246, 0.5));
          }
        }

        .bridgette-animated {
          animation: 
            bridgette-float 3s ease-in-out infinite,
            bridgette-glow 2s ease-in-out infinite;
          transform-origin: center bottom;
        }

        .bridgette-animated:hover {
          animation: 
            bridgette-float 3s ease-in-out infinite,
            bridgette-talk 0.8s ease-in-out infinite,
            bridgette-wave 1s ease-in-out infinite,
            bridgette-glow 2s ease-in-out infinite;
        }

        .bridgette-container {
          position: relative;
        }

        .bridgette-container::before {
          content: '';
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        .speech-bubble {
          position: relative;
          animation: bubble-appear 0.5s ease-out;
        }

        @keyframes bubble-appear {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
       `}</style>

      <header className="bg-white shadow-sm border-b-2 border-bridge-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="/bridge-avatar.png" 
                  alt="Bridge Logo" 
                  className="w-8 h-8"
                />
                <h1 className="text-2xl font-bold text-bridge-black">
                  Bridge
                </h1>
              </div>
              <div className="hidden md:block text-sm text-bridge-black font-medium">
                Fair & Balanced Co-Parenting
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser && (
                <span className="text-sm text-gray-600 hidden md:block">
                  Welcome, <strong>{currentUser.firstName}</strong>
                </span>
              )}
              {familyProfile && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowChildManagement(true)}
                  className="border-green-300 text-green-600 hover:bg-green-50"
                >
                  <Baby className="w-4 h-4 mr-2" />
                  Manage Children ({familyProfile.children.length})
                </Button>
              )}
              {!currentUser && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowOnboardingExplanation(true);
                    setShowAccountSetup(false);
                    setShowFamilyOnboarding(false);
                  }}
                  className="border-bridge-blue text-bridge-blue hover:bg-bridge-blue hover:text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSettings(true)}
                className="border-gray-400 text-bridge-black hover:bg-gray-100"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              {currentUser && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    onLogout();
                    toast({
                      title: "Logged out",
                      description: "You have been logged out successfully.",
                    });
                  }}
                  className="border-red-400 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Family Profile Summary */}
        {familyProfile && (
          <Card className="mb-6 border-2 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Users className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">{familyProfile.familyName || 'Your Family'}</h3>
                    <p className="text-sm text-gray-600">
                      {familyProfile.children.length} {familyProfile.children.length === 1 ? 'child' : 'children'} • 
                      {familyProfile.custodyArrangement === '50-50' ? ' 50/50 custody' : 
                       familyProfile.custodyArrangement === 'primary-secondary' ? ' Primary/Secondary custody' : 
                       ' Custom custody'}
                      {familyProfile.differentTimezones && ' • Different time zones'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {familyProfile.children.map((child) => (
                    <div key={child.id} className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {child.firstName[0]}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white rounded-xl shadow-sm p-1 border-2 border-gray-200">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2 data-[state=active]:bg-bridge-blue data-[state=active]:text-white">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2 data-[state=active]:bg-bridge-green data-[state=active]:text-white">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2 data-[state=active]:bg-bridge-yellow data-[state=active]:text-bridge-black">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center space-x-2 data-[state=active]:bg-bridge-red data-[state=active]:text-white">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center space-x-2 data-[state=active]:bg-bridge-blue data-[state=active]:text-white">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Card className="bg-gradient-to-r from-bridge-blue to-bridge-green border-2 border-bridge-blue overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-6 speech-bubble">
                    <h2 className="text-2xl font-bold mb-3 text-bridge-black">
                      Good morning{currentUser ? `, ${currentUser.firstName}` : ''}! ⚖️
                    </h2>
                    <p className="text-bridge-black mb-4">
                      Bridgette here! I hope you're having a wonderful day. I wanted to let you know that you have 
                      2 upcoming events on your calendar and there's 1 expense that needs your review. 
                      Don't worry - I'm here to help keep everything organized and balanced! 
                    </p>
                    {familyProfile && familyProfile.children.length > 0 && (
                      <div className="bg-white/20 rounded-lg p-3 mb-4">
                        <p className="text-bridge-black text-sm font-medium mb-2">
                          👶 Your children:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {familyProfile.children.map((child) => (
                            <span key={child.id} className="bg-white/30 px-3 py-1 rounded-full text-sm text-bridge-black">
                              {child.firstName}, {child.age}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="bg-white/20 rounded-lg p-3 mb-4">
                      <p className="text-bridge-black text-sm font-medium mb-2">
                        📋 Quick items for your attention:
                      </p>
                      <ul className="text-bridge-black text-sm space-y-1">
                        <li>• Soccer cleats expense pending approval ($85.99)</li>
                        <li>• Document review needed for custody agreement</li>
                      </ul>
                    </div>
                    <Button 
                      onClick={() => setActiveTab('expenses')}
                      className="bg-bridge-red hover:bg-red-600 text-white font-medium"
                    >
                      Review Now
                    </Button>
                  </div>
                  <div className="flex-shrink-0 bridgette-container">
                    <img 
                      src="/bridgette-avatar.png" 
                      alt="Bridgette" 
                      className="w-32 h-32 bridgette-animated cursor-pointer"
                      style={{ mixBlendMode: 'multiply' }}
                      title="Hi! I'm Bridgette, your friendly co-parenting assistant! 👋"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {!familyProfile && (
              <Card className="border-2 border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-bridge-black mb-2">Complete Your Family Setup</h3>
                      <p className="text-bridge-black text-sm">
                        Add information about your family to get personalized organization and support
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowFamilyOnboarding(true)}
                      className="bg-bridge-yellow hover:bg-yellow-400 text-bridge-black border-2 border-gray-400"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Set Up Family Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProgressBar 
                progress={85} 
                title="Co-parenting Balance" 
                subtitle="Great progress this month!"
                showTrophy={false}
              />
              <ProgressBar 
                progress={100} 
                title="January Setup" 
                subtitle="All systems ready!"
                showTrophy={true}
              />
            </div>

            <div>
              <h3 className="text-xl font-bold text-bridge-black mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionCard
                  title="Schedule Event"
                  description="Add to shared calendar"
                  icon={Calendar}
                  color="green"
                  onClick={() => setActiveTab('calendar')}
                />
                <QuickActionCard
                  title="Send Message"
                  description="Communicate securely"
                  icon={MessageSquare}
                  color="yellow"
                  onClick={() => setActiveTab('messages')}
                  badge="2"
                />
                <QuickActionCard
                  title="Review Expense"
                  description="Pending approval needed"
                  icon={DollarSign}
                  color="red"
                  onClick={() => setActiveTab('expenses')}
                  urgent={true}
                  badge="URGENT"
                />
                <QuickActionCard
                  title="View Documents"
                  description="Access agreements"
                  icon={FileText}
                  color="blue"
                  onClick={() => setActiveTab('documents')}
                />
              </div>
            </div>

            <Card className="border-2 border-bridge-blue">
              <CardHeader>
                <CardTitle className="flex items-center text-bridge-black">
                  <Users className="w-5 h-5 mr-2 text-bridge-blue" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-bridge-green">
                    <div className="w-2 h-2 bg-bridge-green rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-bridge-black">
                        Mike confirmed pickup for Saturday at 10am
                      </p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-bridge-red">
                    <div className="w-2 h-2 bg-bridge-red rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-bridge-black">
                        <span className="text-bridge-red font-semibold">PENDING:</span> Soccer cleats expense needs approval ($85.99)
                      </p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                    <Button size="sm" className="bg-bridge-red hover:bg-red-600 text-white">
                      Review
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-bridge-blue">
                    <div className="w-2 h-2 bg-bridge-blue rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-bridge-black">
                        Calendar updated: Emma's dentist appointment
                      </p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-bridge-blue bg-blue-50">
              <CardContent className="p-6">
                <div>
                  <h3 className="font-semibold text-bridge-black mb-2">⚖️ Daily Balance Tip</h3>
                  <p className="text-bridge-black text-sm mb-3">
                    Remember, fair doesn't always mean equal. Consider each parent's circumstances 
                    when making decisions. Focus on what's best for your children's wellbeing.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setActiveTab('resources')}
                    className="border-bridge-blue text-bridge-blue hover:bg-bridge-blue hover:text-white"
                  >
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView familyProfile={familyProfile} />
          </TabsContent>

          <TabsContent value="messages">
            <MessagingInterface />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseTracker />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentManager />
          </TabsContent>

          <TabsContent value="resources">
            <EducationalResources />
          </TabsContent>
        </Tabs>
      </main>

      <div className="fixed bottom-6 right-6">
        <Button 
          className="rounded-full w-16 h-16 bg-bridge-blue hover:bg-blue-600 shadow-lg border-2 border-gray-300"
          onClick={() => {/* Open chat */}}
        >
          <HelpCircle className="w-6 h-6 text-white" />
        </Button>
      </div>
    </div>
  );
};

export default Index;