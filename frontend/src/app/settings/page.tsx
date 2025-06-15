'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useStore';
import { useUserPreferences, useAccountDeletion } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Bell, Lock, User, Trash2, LogOut, Moon, Sun, Globe } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  
  // User preferences
  const { data: preferences, isLoading, updateUserPreferences } = useUserPreferences();
  
  // Account deletion
  const { deleteAccount, isDeleting } = useAccountDeletion();
  
  // Form states
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    interviewReminders: true,
    marketingEmails: false,
  });
  
  const [displaySettings, setDisplaySettings] = useState({
    theme: 'system',
    language: 'en',
    codeEditorTheme: 'vs-dark',
  });
  
  // Handle notification toggle
  const handleNotificationToggle = (key: string) => {
    setNotificationSettings(prev => {
      const updated = { ...prev, [key]: !prev[key as keyof typeof prev] };
      
      // Update preferences in backend
      updateUserPreferences({
        notifications: updated
      }, {
        onSuccess: () => {
          toast.success('Notification preferences updated');
        },
        onError: () => {
          toast.error('Failed to update notification preferences');
        }
      });
      
      return updated;
    });
  };
  
  // Handle display settings change
  const handleDisplaySettingChange = (key: string, value: string) => {
    setDisplaySettings(prev => {
      const updated = { ...prev, [key]: value };
      
      // Update preferences in backend
      updateUserPreferences({
        display: updated
      }, {
        onSuccess: () => {
          toast.success('Display preferences updated');
        },
        onError: () => {
          toast.error('Failed to update display preferences');
        }
      });
      
      return updated;
    });
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success('Logged out successfully');
  };
  
  // Handle account deletion
  const handleDeleteAccount = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        logout();
        router.push('/login');
        toast.success('Account deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete account');
      }
    });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading settings...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Tabs 
            defaultValue="account" 
            orientation="vertical" 
            className="w-full" 
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="flex flex-col h-auto items-stretch bg-transparent space-y-1">
              <TabsTrigger 
                value="account" 
                className="flex items-center justify-start px-4 py-2 data-[state=active]:bg-muted"
              >
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="flex items-center justify-start px-4 py-2 data-[state=active]:bg-muted"
              >
                <Lock className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex items-center justify-start px-4 py-2 data-[state=active]:bg-muted"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="display" 
                className="flex items-center justify-start px-4 py-2 data-[state=active]:bg-muted"
              >
                <Sun className="h-4 w-4 mr-2" />
                Display
              </TabsTrigger>
            </TabsList>
            {/* Main Content */}
        <div>
          <TabsContent value="account" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your account details and profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={user?.name || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" defaultValue={user?.email || ''} disabled />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Tell us about yourself" 
                      className="min-h-[100px]" 
                      defaultValue={user?.bio || ''}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Profile Visibility</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="public-profile">Public Profile</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see your profile information
                        </p>
                      </div>
                      <Switch id="public-profile" defaultChecked={preferences?.visibility?.publicProfile} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-activity">Activity Status</Label>
                        <p className="text-sm text-muted-foreground">
                          Show when you're active on the platform
                        </p>
                      </div>
                      <Switch id="show-activity" defaultChecked={preferences?.visibility?.showActivity} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="2fa">Enable 2FA</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch id="2fa" defaultChecked={preferences?.security?.twoFactorEnabled} />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Session Management</h3>
                  <Button variant="outline">Sign Out of All Devices</Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="interview-reminders">Interview Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminders before scheduled interviews
                      </p>
                    </div>
                    <Switch 
                      id="interview-reminders" 
                      checked={notificationSettings.interviewReminders}
                      onCheckedChange={() => handleNotificationToggle('interviewReminders')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-emails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about new features and offers
                      </p>
                    </div>
                    <Switch 
                      id="marketing-emails" 
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={() => handleNotificationToggle('marketingEmails')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="display" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize your visual experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select 
                      value={displaySettings.theme} 
                      onValueChange={(value) => handleDisplaySettingChange('theme', value)}
                    >
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center">
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center">
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center">
                            <div className="h-4 w-4 mr-2 flex">
                              <Sun className="h-4 w-4" />
                              <Moon className="h-4 w-4" />
                            </div>
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={displaySettings.language} 
                      onValueChange={(value) => handleDisplaySettingChange('language', value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            English
                          </div>
                        </SelectItem>
                        <SelectItem value="es">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            Spanish
                          </div>
                        </SelectItem>
                        <SelectItem value="fr">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            French
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="code-editor-theme">Code Editor Theme</Label>
                    <Select 
                      value={displaySettings.codeEditorTheme} 
                      onValueChange={(value) => handleDisplaySettingChange('codeEditorTheme', value)}
                    >
                      <SelectTrigger id="code-editor-theme">
                        <SelectValue placeholder="Select code editor theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vs">Visual Studio</SelectItem>
                        <SelectItem value="vs-dark">Visual Studio Dark</SelectItem>
                        <SelectItem value="hc-black">High Contrast Black</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
          </Tabs>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}