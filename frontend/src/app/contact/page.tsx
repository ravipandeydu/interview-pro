'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { ArrowRight, Mail, MapPin, Phone, Send, CheckCircle2, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form'

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log(values)
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email",
      value: "contact@interviewpro.com",
      description: "For general inquiries and support",
      color: "indigo"
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Phone",
      value: "+1 (555) 123-4567",
      description: "Monday to Friday, 9am to 6pm EST",
      color: "purple"
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Office",
      value: "123 Tech Avenue, San Francisco, CA",
      description: "Visit us for in-person demos",
      color: "violet"
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/30 via-background to-violet-900/20 dark:from-indigo-950/50 dark:via-background dark:to-violet-950/40 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <Badge variant="outline" className="px-4 py-1 backdrop-blur-sm bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-medium">
              Contact Us
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
              Get in Touch
            </h1>
            <p className="mx-auto max-w-[700px] text-xl text-foreground/80 leading-relaxed">
              Have questions about InterviewPro? Our team is here to help you find the right solution for your technical hiring needs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl font-semibold text-indigo-950 dark:text-indigo-100">Send us a message</CardTitle>
                <CardDescription className="text-indigo-700/70 dark:text-indigo-300/70">
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-indigo-950 dark:text-indigo-100">Message Sent!</h3>
                    <p className="text-foreground/70 max-w-md">
                      Thank you for reaching out. Our team will review your message and get back to you shortly.
                    </p>
                    <Button 
                      variant="outline" 
                      className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground/80 font-medium">Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your name" 
                                  className="backdrop-blur-sm bg-background/50 border-indigo-500/30 focus:border-indigo-500 focus:ring-indigo-500/30 placeholder:text-foreground/50" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground/80 font-medium">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="your.email@example.com" 
                                  className="backdrop-blur-sm bg-background/50 border-indigo-500/30 focus:border-indigo-500 focus:ring-indigo-500/30 placeholder:text-foreground/50" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80 font-medium">Subject</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="What is your message about?" 
                                className="backdrop-blur-sm bg-background/50 border-indigo-500/30 focus:border-indigo-500 focus:ring-indigo-500/30 placeholder:text-foreground/50" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80 font-medium">Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please provide details about your inquiry..." 
                                className="min-h-[150px] backdrop-blur-sm bg-background/50 border-indigo-500/30 focus:border-indigo-500 focus:ring-indigo-500/30 placeholder:text-foreground/50" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 transition-all duration-300 hover:scale-105"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Information */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-md bg-background/40 border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl font-semibold text-purple-950 dark:text-purple-100">Contact Information</CardTitle>
                <CardDescription className="text-purple-700/70 dark:text-purple-300/70">
                  Multiple ways to reach our team
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`p-3 bg-${item.color}-500/10 rounded-xl backdrop-blur-sm border border-${item.color}-500/30`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-foreground/90 font-medium">{item.value}</p>
                        <p className="text-sm text-foreground/70">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-background/40 border border-violet-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl font-semibold text-violet-950 dark:text-violet-100">Business Hours</CardTitle>
                <CardDescription className="text-violet-700/70 dark:text-violet-300/70">
                  When our team is available
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-violet-500/20">
                    <span className="font-medium">Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-violet-500/20">
                    <span className="font-medium">Saturday</span>
                    <span>10:00 AM - 2:00 PM EST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="backdrop-blur-md bg-background/40 border border-indigo-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden mb-16">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl font-semibold text-indigo-950 dark:text-indigo-100">Frequently Asked Questions</CardTitle>
            <CardDescription className="text-indigo-700/70 dark:text-indigo-300/70">
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">How quickly can I get started with InterviewPro?</h3>
                <p className="text-foreground/70">You can sign up and start using the platform immediately. Our onboarding process takes less than 10 minutes to complete.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Do you offer custom enterprise solutions?</h3>
                <p className="text-foreground/70">Yes, we provide tailored enterprise solutions with dedicated support, custom integrations, and enhanced security features.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Is there a free trial available?</h3>
                <p className="text-foreground/70">We offer a 14-day free trial with full access to all features so you can evaluate if InterviewPro is right for your team.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">How does your pricing work?</h3>
                <p className="text-foreground/70">Our pricing is based on the number of active users and interviews conducted monthly. Contact our sales team for a custom quote.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-6 mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
            Ready to transform your technical hiring?
          </h2>
          <p className="mx-auto max-w-[600px] text-lg text-foreground/80">
            Join hundreds of companies using InterviewPro to find and hire the best technical talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="backdrop-blur-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 transition-all duration-300 hover:scale-105" asChild>
              <Link href="/register" className="flex items-center gap-2">Get Started <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button variant="outline" size="lg" className="backdrop-blur-sm bg-background/50 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all duration-300 hover:scale-105" asChild>
              <Link href="/about">Learn About Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}