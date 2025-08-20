import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { ArrowLeft, AlertTriangle } from "lucide-react";

// Registration form validation schema
const registrationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  mobile: z.string().min(10, "Valid mobile number is required"),
  countryCode: z.string().default("+91"),
  gender: z.string().min(1, "Gender selection is required"),
  instituteName: z.string().min(1, "Institute name is required"),
  participantType: z.string().min(1, "Participant type is required"),
  domain: z.string().min(1, "Domain is required"),
  course: z.string().optional(),
  courseSpecialization: z.string().optional(),
  graduatingYear: z.number().optional(),
  courseDuration: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to terms and conditions"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const genderOptions = [
  { value: "female", label: "Female", icon: "♀" },
  { value: "male", label: "Male", icon: "♂" },
  { value: "transgender", label: "Transgender", icon: "⚦" },
  { value: "intersex", label: "Intersex", icon: "⚥" },
  { value: "non-binary", label: "Non-binary", icon: "⚨" },
  { value: "prefer-not-to-say", label: "Prefer not to say", icon: "🚫" },
  { value: "others", label: "Others", icon: "🔄" },
];

const participantTypes = ["College Students", "Professional", "School Student", "Fresher"];
const domains = ["Management", "Engineering", "Arts & Science", "Medicine", "Law", "Others"];
const graduatingYears = [2026, 2027, 2028, 2029];
const courseDurations = ["4 Year", "3 Year", "2 Year", "1 Year"];

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/register/:hackathonId");
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedGender, setSelectedGender] = useState("");

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      mobile: "",
      countryCode: "+91",
      gender: "",
      instituteName: "",
      participantType: "",
      domain: "",
      course: "",
      courseSpecialization: "",
      graduatingYear: undefined,
      courseDuration: "",
      location: "",
      agreeToTerms: false,
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      const registrationData = {
        ...data,
        hackathonId: params?.hackathonId || "1",
      };
      return apiRequest("POST", `/api/participants/register`, registrationData);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Welcome to the hackathon! Redirecting to your dashboard...",
      });
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    registrationMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-white text-xl mb-4">Authentication Required</h2>
            <p className="text-slate-300 mb-4">Please log in to register for hackathons.</p>
            <Button onClick={() => navigate("/auth")} className="bg-orange-500 hover:bg-orange-600">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-slate-400 text-slate-200 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Hackathon Registration</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Candidate Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Email<span className="text-red-400">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                            placeholder="your.email@example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mobile */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12">
                      <label className="text-sm font-medium text-white">
                        Mobile<span className="text-red-400">*</span>
                      </label>
                    </div>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center bg-slate-700 border border-slate-600 rounded-md px-3 py-2">
                                <span className="text-orange-400 mr-2">🇮🇳</span>
                                <Input
                                  {...field}
                                  className="border-0 bg-transparent text-slate-300 p-0 focus-visible:ring-0"
                                  placeholder="+91"
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-9">
                      <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                placeholder="9958262272"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* First Name */}
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          First Name<span className="text-red-400">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                            placeholder="Raj"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Last Name */}
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Last Name (if applicable)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Gender */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">
                      Gender<span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {genderOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`border border-slate-600 rounded-lg p-3 text-center cursor-pointer transition-all hover:border-blue-400 ${
                            selectedGender === option.value
                              ? "border-blue-400 bg-blue-500/20"
                              : "bg-slate-700/50"
                          }`}
                          onClick={() => {
                            setSelectedGender(option.value);
                            form.setValue("gender", option.value);
                          }}
                        >
                          <div className="text-2xl mb-1">{option.icon}</div>
                          <div className="text-xs text-white">{option.label}</div>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.gender && (
                      <p className="text-red-400 text-sm">{form.formState.errors.gender.message}</p>
                    )}
                  </div>

                  {/* Institute Name */}
                  <FormField
                    control={form.control}
                    name="instituteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Institute Name<span className="text-red-400">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                            placeholder="Delhi Technological University (DTU), New Delhi"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Type */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">
                      Type<span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {participantTypes.map((type) => (
                        <div
                          key={type}
                          className={`border border-slate-600 rounded-lg p-3 text-center cursor-pointer transition-all hover:border-blue-400 ${
                            form.watch("participantType") === type
                              ? "border-blue-400 bg-blue-500/20"
                              : "bg-slate-700/50"
                          }`}
                          onClick={() => form.setValue("participantType", type)}
                        >
                          <div className="text-sm text-white">{type}</div>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.participantType && (
                      <p className="text-red-400 text-sm">{form.formState.errors.participantType.message}</p>
                    )}
                  </div>

                  {/* Domain */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">
                      Domain<span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {domains.map((domain) => (
                        <div
                          key={domain}
                          className={`border border-slate-600 rounded-lg p-3 text-center cursor-pointer transition-all hover:border-blue-400 ${
                            form.watch("domain") === domain
                              ? "border-blue-400 bg-blue-500/20"
                              : "bg-slate-700/50"
                          }`}
                          onClick={() => form.setValue("domain", domain)}
                        >
                          <div className="text-sm text-white">{domain}</div>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.domain && (
                      <p className="text-red-400 text-sm">{form.formState.errors.domain.message}</p>
                    )}
                  </div>

                  {/* Course */}
                  <FormField
                    control={form.control}
                    name="course"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Course</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="B.Tech/BE (Bachelor of Technology / Bachelor of Engineering)" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="btech-be">B.Tech/BE (Bachelor of Technology / Bachelor of Engineering)</SelectItem>
                              <SelectItem value="mtech-me">M.Tech/ME (Master of Technology / Master of Engineering)</SelectItem>
                              <SelectItem value="bca">BCA (Bachelor of Computer Applications)</SelectItem>
                              <SelectItem value="mca">MCA (Master of Computer Applications)</SelectItem>
                              <SelectItem value="bsc">B.Sc (Bachelor of Science)</SelectItem>
                              <SelectItem value="msc">M.Sc (Master of Science)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Course Specialization */}
                  <FormField
                    control={form.control}
                    name="courseSpecialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Course Specialization</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Computer Science and Engineering" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="cse">Computer Science and Engineering</SelectItem>
                              <SelectItem value="ece">Electronics and Communication Engineering</SelectItem>
                              <SelectItem value="eee">Electrical and Electronics Engineering</SelectItem>
                              <SelectItem value="me">Mechanical Engineering</SelectItem>
                              <SelectItem value="ce">Civil Engineering</SelectItem>
                              <SelectItem value="it">Information Technology</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Graduating Year */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Graduating Year</label>
                    <div className="grid grid-cols-4 gap-3">
                      {graduatingYears.map((year) => (
                        <div
                          key={year}
                          className={`border border-slate-600 rounded-lg p-3 text-center cursor-pointer transition-all hover:border-blue-400 ${
                            form.watch("graduatingYear") === year
                              ? "border-blue-400 bg-blue-500/20"
                              : "bg-slate-700/50"
                          }`}
                          onClick={() => form.setValue("graduatingYear", year)}
                        >
                          <div className="text-sm text-white">{year}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Duration */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Course Duration</label>
                    <div className="grid grid-cols-4 gap-3">
                      {courseDurations.map((duration) => (
                        <div
                          key={duration}
                          className={`border border-slate-600 rounded-lg p-3 text-center cursor-pointer transition-all hover:border-blue-400 ${
                            form.watch("courseDuration") === duration
                              ? "border-blue-400 bg-blue-500/20"
                              : "bg-slate-700/50"
                          }`}
                          onClick={() => form.setValue("courseDuration", duration)}
                        >
                          <div className="text-sm text-white">{duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Location<span className="text-red-400">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                            placeholder="North West Delhi, Delhi, India"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Warning Alert */}
                  <Alert className="border-orange-500/30 bg-orange-500/10">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <AlertDescription className="text-orange-300">
                      Registration CANNOT be cancelled as registration fee is enabled for this opportunity.
                      You can add team members on the next step.
                    </AlertDescription>
                  </Alert>

                  {/* Terms and Conditions */}
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm text-white">
                            By registering for this opportunity, you agree to share the data mentioned in this form
                            or any form henceforth on this opportunity with the organizer of this opportunity for
                            further analysis, processing, and outreach. Your data will also be used by Unstop for
                            providing you regular and constant updates on this opportunity. You also agree to the{" "}
                            <span className="text-blue-400 underline cursor-pointer">privacy policy</span> and{" "}
                            <span className="text-blue-400 underline cursor-pointer">terms of use</span> of Unstop.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-center pt-6">
                    <Button
                      type="submit"
                      disabled={registrationMutation.isPending}
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-12 py-3 text-lg"
                    >
                      {registrationMutation.isPending ? "Registering..." : "Register Now"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}