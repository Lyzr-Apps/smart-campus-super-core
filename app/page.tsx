'use client'

import { useState } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, BookOpen, Users, TrendingUp, Bell, RefreshCw, Clock, AlertTriangle, CheckCircle2, Target } from 'lucide-react'

// TypeScript Interfaces from actual test responses
interface TimetableEntry {
  day: string
  time: string
  course: string
  room: string
}

interface Assignment {
  course: string
  title: string
  status: 'pending' | 'completed'
  deadline: string
}

interface Exam {
  course: string
  type: string
  date: string
  room: string
  grade: string | null
}

interface CourseAttendance {
  attended: number
  total: number
  percentage: number
}

interface PriorityTask {
  rank?: number
  priority?: string
  task: string
  deadline?: string
  urgency: string
  alert?: string
  preparation_status?: string
  time_allocated?: string
}

interface StudyGroup {
  group_id: string
  focus?: string
  topic?: string
  next_meeting?: string
  meeting_time?: string
  availability?: string
  available_seats?: number
  members?: number
  location?: string
}

interface CourseStudyGroups {
  course: string
  groups: StudyGroup[]
}

interface CalendarEvent {
  event: string
  date?: string
  date_time?: string
  time?: string
  location?: string
}

interface Benchmarks {
  your_score_avg: number
  peer_group_avg: number
  percentile: number
  notes: string
}

interface DailyPlanSession {
  time: string
  activity: string
  technique: string
}

interface DailyPlan {
  day: string
  focus: string
  sessions: DailyPlanSession[]
}

interface AcademicCoordinatorResponse {
  lms_data: {
    timetable: TimetableEntry[]
    assignments: Assignment[]
    exams: Exam[]
    attendance: Record<string, CourseAttendance>
    last_sync: string
  }
  study_plan: {
    weekly_plan: {
      week_focus: string
      total_study_hours: number
      breakdown: Record<string, string>
    }
    priority_tasks: PriorityTask[]
    attendance_alert?: {
      status: string
      message: string
      recommended_actions: string[]
    }
  }
  collaboration: {
    peer_updates: Array<{ course: string; recent_activity: string }>
    study_groups: CourseStudyGroups[]
    shared_calendar: CalendarEvent[]
    collaboration_score: number
    recommendations: string[]
  }
  urgent_items: Array<{
    item: string
    due?: string
    percentage?: number
    urgency: string
  }>
  overall_recommendations: string
  sync_timestamp: string
}

interface StudyPlannerResponse {
  daily_plan: DailyPlan[]
  weekly_plan: Record<string, string>
  priority_tasks: PriorityTask[]
  study_techniques: Array<{
    technique: string
    application: string
    benefit: string
  }>
  estimated_hours: {
    total_study_hours: number
    exam_preparation: number
    assignment_work: number
    review_and_buffer: number
    daily_average: number
  }
  recommendations: string
}

interface CollaborationResponse {
  peer_updates: Array<{ course?: string; recent_activity?: string }>
  study_groups: StudyGroup[]
  shared_calendar: CalendarEvent[]
  benchmarks: Benchmarks
  recommendations: string[]
  collaboration_score: number
}

// Agent IDs
const AGENT_IDS = {
  ACADEMIC_COORDINATOR: '6988350dab8c2b0ff025872c',
  LMS_SYNC: '698834b829694629a3a3596e',
  STUDY_PLANNER: '698834ceb662c978044a1588',
  COLLABORATION: '698834f2f92870f1ee0acc6a',
  SMART_REMINDER: '69883529b662c978044a158f',
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [academicData, setAcademicData] = useState<AcademicCoordinatorResponse | null>(null)
  const [studyPlanData, setStudyPlanData] = useState<StudyPlannerResponse | null>(null)
  const [collaborationData, setCollaborationData] = useState<CollaborationResponse | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [customMessage, setCustomMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Main sync function - calls Academic Coordinator (manager agent)
  const handleSyncAndPlan = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await callAIAgent(
        'I need to sync my academic data and get my weekly study plan. Also show me upcoming class events and study group opportunities.',
        AGENT_IDS.ACADEMIC_COORDINATOR
      )

      if (result.success && result.response.status === 'success') {
        const data = result.response.result as AcademicCoordinatorResponse
        setAcademicData(data)
      } else {
        setError(result.error || result.response.message || 'Failed to sync data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Get detailed study plan
  const handleGetStudyPlan = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await callAIAgent(
        customMessage || 'Create a study plan for this week. I have exams in Data Structures (Monday) and DBMS (Thursday), plus 3 assignments due by Friday.',
        AGENT_IDS.STUDY_PLANNER
      )

      if (result.success) {
        // Handle markdown-wrapped JSON
        let parsedData = result.response.result
        if (typeof parsedData === 'object' && 'raw_text' in parsedData) {
          const rawText = parsedData.raw_text as string
          const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/)
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[1])
          }
        }
        setStudyPlanData(parsedData as StudyPlannerResponse)
      } else {
        setError(result.error || result.response.message || 'Failed to get study plan')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Get collaboration data
  const handleGetCollaboration = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await callAIAgent(
        'Show me available study groups for Data Structures, upcoming class events this week, and my performance benchmark compared to peers.',
        AGENT_IDS.COLLABORATION
      )

      if (result.success && result.response.status === 'success') {
        setCollaborationData(result.response.result as CollaborationResponse)
      } else {
        setError(result.error || result.response.message || 'Failed to get collaboration data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Urgency color mapping
  const getUrgencyColor = (urgency: string) => {
    const level = urgency.toUpperCase()
    if (level.includes('CRITICAL')) return 'bg-red-500'
    if (level.includes('HIGH')) return 'bg-orange-500'
    if (level.includes('MEDIUM')) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  // Get today's timetable
  const getTodaysTimetable = () => {
    if (!academicData?.lms_data?.timetable) return []
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    return academicData.lms_data.timetable.filter((entry) => entry.day === today)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Smart College Life Manager</h1>
            </div>
            <Button
              onClick={handleSyncAndPlan}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync & Plan
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600">
              <Target className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="study-plan" className="data-[state=active]:bg-blue-600">
              <BookOpen className="h-4 w-4 mr-2" />
              Study Plan
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-600">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="groups" className="data-[state=active]:bg-blue-600">
              <Users className="h-4 w-4 mr-2" />
              Study Groups
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {!academicData && (
              <Card className="bg-slate-800/50 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle>Welcome to Smart College Life Manager</CardTitle>
                  <CardDescription className="text-slate-300">
                    Click &quot;Sync & Plan&quot; to get started with your personalized academic dashboard
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {academicData && (
              <>
                {/* Urgent Items */}
                {academicData.urgent_items && academicData.urgent_items.length > 0 && (
                  <Card className="bg-slate-800/50 border-red-500 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        Urgent Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {academicData.urgent_items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                          <Badge className={getUrgencyColor(item.urgency)}>{item.urgency}</Badge>
                          <div className="flex-1">
                            <p className="font-medium">{item.item}</p>
                            {item.due && (
                              <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(item.due)}
                              </p>
                            )}
                            {item.percentage !== undefined && (
                              <p className="text-sm text-slate-400 mt-1">Attendance: {item.percentage}%</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Today's Timetable */}
                <Card className="bg-slate-800/50 border-slate-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      Today&apos;s Classes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getTodaysTimetable().length > 0 ? (
                      <div className="space-y-3">
                        {getTodaysTimetable().map((entry, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
                            <div className="text-center">
                              <p className="text-sm font-medium text-blue-400">{entry.time}</p>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{entry.course}</p>
                              <p className="text-sm text-slate-400">{entry.room}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-4">No classes scheduled for today</p>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pending Assignments */}
                  <Card className="bg-slate-800/50 border-slate-700 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-yellow-400" />
                        Pending Assignments
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {academicData.lms_data.assignments.filter((a) => a.status === 'pending').length > 0 ? (
                        academicData.lms_data.assignments
                          .filter((a) => a.status === 'pending')
                          .map((assignment, idx) => (
                            <div key={idx} className="p-3 bg-slate-900/50 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium">{assignment.title}</p>
                                  <p className="text-sm text-slate-400">{assignment.course}</p>
                                </div>
                                <Badge className="bg-yellow-500">Pending</Badge>
                              </div>
                              <p className="text-sm text-slate-400 flex items-center gap-1 mt-2">
                                <Clock className="h-3 w-3" />
                                Due: {formatDate(assignment.deadline)}
                              </p>
                            </div>
                          ))
                      ) : (
                        <p className="text-slate-400 text-center py-4">No pending assignments</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Upcoming Exams */}
                  <Card className="bg-slate-800/50 border-slate-700 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-400" />
                        Upcoming Exams
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {academicData.lms_data.exams.filter((e) => !e.grade).length > 0 ? (
                        academicData.lms_data.exams
                          .filter((e) => !e.grade)
                          .map((exam, idx) => (
                            <div key={idx} className="p-3 bg-slate-900/50 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium">{exam.course}</p>
                                  <p className="text-sm text-slate-400">{exam.type}</p>
                                </div>
                                <Badge className="bg-purple-500">{exam.room}</Badge>
                              </div>
                              <p className="text-sm text-slate-400 flex items-center gap-1 mt-2">
                                <Clock className="h-3 w-3" />
                                {formatDate(exam.date)}
                              </p>
                            </div>
                          ))
                      ) : (
                        <p className="text-slate-400 text-center py-4">No upcoming exams</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Attendance Overview */}
                <Card className="bg-slate-800/50 border-slate-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      Attendance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(academicData.lms_data.attendance).map(([course, data]) => (
                        <div key={course} className="p-4 bg-slate-900/50 rounded-lg">
                          <p className="font-medium mb-2">{course}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  data.percentage >= 80 ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${data.percentage}%` }}
                              />
                            </div>
                            <span className={`font-bold ${data.percentage >= 80 ? 'text-green-400' : 'text-red-400'}`}>
                              {data.percentage}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {data.attended}/{data.total} classes
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Study Plan Overview */}
                {academicData.study_plan && (
                  <Card className="bg-slate-800/50 border-slate-700 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-400" />
                        This Week&apos;s Study Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-slate-300">{academicData.study_plan.weekly_plan.week_focus}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-900/50 rounded-lg">
                          <p className="text-sm text-slate-400">Total Study Hours</p>
                          <p className="text-2xl font-bold text-blue-400">
                            {academicData.study_plan.weekly_plan.total_study_hours}h
                          </p>
                        </div>
                        {academicData.study_plan.priority_tasks && academicData.study_plan.priority_tasks.length > 0 && (
                          <div className="p-3 bg-slate-900/50 rounded-lg">
                            <p className="text-sm text-slate-400">Priority Tasks</p>
                            <p className="text-2xl font-bold text-yellow-400">
                              {academicData.study_plan.priority_tasks.length}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Study Plan Tab */}
          <TabsContent value="study-plan" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle>Get Personalized Study Plan</CardTitle>
                <CardDescription className="text-slate-300">
                  Describe your exams, assignments, and deadlines to get a customized study schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="e.g., I have exams in Data Structures (Monday) and DBMS (Thursday), plus 3 assignments due by Friday"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Button onClick={handleGetStudyPlan} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    'Generate Study Plan'
                  )}
                </Button>
              </CardContent>
            </Card>

            {studyPlanData && (
              <>
                {/* Priority Tasks */}
                {studyPlanData.priority_tasks && (
                  <Card className="bg-slate-800/50 border-slate-700 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-red-400" />
                        Priority Tasks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {studyPlanData.priority_tasks.map((task, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                          <Badge className={getUrgencyColor(task.urgency || task.priority || 'MEDIUM')}>
                            {task.urgency || task.priority}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium">{task.task}</p>
                            {task.deadline && (
                              <p className="text-sm text-slate-400 mt-1">Deadline: {task.deadline}</p>
                            )}
                            {task.time_allocated && (
                              <p className="text-sm text-slate-400 mt-1">Time: {task.time_allocated}</p>
                            )}
                            {task.alert && <p className="text-sm text-yellow-400 mt-1">{task.alert}</p>}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Daily Plan */}
                {studyPlanData.daily_plan && (
                  <Card className="bg-slate-800/50 border-slate-700 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        Daily Study Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {studyPlanData.daily_plan.map((day, idx) => (
                        <div key={idx} className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-blue-600">{day.day}</Badge>
                            <p className="text-slate-300 text-sm">{day.focus}</p>
                          </div>
                          <div className="space-y-2 pl-4 border-l-2 border-slate-600">
                            {day.sessions.map((session, sIdx) => (
                              <div key={sIdx} className="p-3 bg-slate-900/50 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <Clock className="h-4 w-4 text-blue-400 mt-1" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-400">{session.time}</p>
                                    <p className="text-sm mt-1">{session.activity}</p>
                                    <p className="text-xs text-slate-400 mt-1">Technique: {session.technique}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Study Techniques */}
                {studyPlanData.study_techniques && (
                  <Card className="bg-slate-800/50 border-slate-700 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-green-400" />
                        Recommended Study Techniques
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studyPlanData.study_techniques.map((tech, idx) => (
                        <div key={idx} className="p-4 bg-slate-900/50 rounded-lg">
                          <p className="font-medium text-green-400">{tech.technique}</p>
                          <p className="text-sm text-slate-300 mt-2">{tech.application}</p>
                          <p className="text-xs text-slate-400 mt-2">Benefit: {tech.benefit}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  Class Calendar & Events
                </CardTitle>
                <CardDescription className="text-slate-300">Shared calendar with class events and important dates</CardDescription>
              </CardHeader>
            </Card>

            {academicData?.collaboration?.shared_calendar && academicData.collaboration.shared_calendar.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {academicData.collaboration.shared_calendar.map((event, idx) => (
                  <Card key={idx} className="bg-slate-800/50 border-slate-700 text-white">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="font-medium">{event.event}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>{event.date || event.date_time ? formatDate(event.date || event.date_time || '') : event.time}</span>
                        </div>
                        {event.location && (
                          <p className="text-sm text-slate-400">{event.location}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {(!academicData?.collaboration?.shared_calendar || academicData.collaboration.shared_calendar.length === 0) && (
              <Card className="bg-slate-800/50 border-slate-700 text-white">
                <CardContent className="py-8 text-center">
                  <p className="text-slate-400">No calendar events available. Sync your data to see upcoming events.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Study Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <div className="flex items-center justify-between">
              <Card className="flex-1 bg-slate-800/50 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    Study Groups
                  </CardTitle>
                  <CardDescription className="text-slate-300">Join study groups for collaborative learning</CardDescription>
                </CardHeader>
              </Card>
              <Button onClick={handleGetCollaboration} disabled={loading} className="ml-4 bg-purple-600 hover:bg-purple-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Refresh Groups'
                )}
              </Button>
            </div>

            {/* From Academic Coordinator */}
            {academicData?.collaboration?.study_groups && academicData.collaboration.study_groups.length > 0 && (
              <div className="space-y-6">
                {academicData.collaboration.study_groups.map((courseGroup, idx) => (
                  <Card key={idx} className="bg-slate-800/50 border-slate-700 text-white">
                    <CardHeader>
                      <CardTitle className="text-lg">{courseGroup.course}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {courseGroup.groups.map((group, gIdx) => (
                        <div key={gIdx} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="font-medium text-purple-400">{group.group_id}</p>
                              <p className="text-sm text-slate-300 mt-1">{group.focus || group.topic}</p>
                            </div>
                            <Badge className="bg-green-600">{group.availability || `${group.available_seats} seats`}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Clock className="h-4 w-4" />
                              <span>{formatDate(group.next_meeting || group.meeting_time || 'TBD')}</span>
                            </div>
                            {(group.members || group.location) && (
                              <div className="text-slate-400">
                                {group.members && <span>{group.members} members</span>}
                                {group.location && <span className="block text-xs mt-1">{group.location}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* From Collaboration Agent */}
            {collaborationData?.study_groups && collaborationData.study_groups.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collaborationData.study_groups.map((group, idx) => (
                  <Card key={idx} className="bg-slate-800/50 border-slate-700 text-white">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-purple-400">{group.group_id}</p>
                          <p className="text-sm text-slate-300 mt-1">{group.topic || group.focus}</p>
                        </div>
                        <Badge className="bg-green-600">{group.available_seats ? `${group.available_seats} seats` : group.availability}</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(group.meeting_time || group.next_meeting || 'TBD')}</span>
                        </div>
                        {group.members && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <Users className="h-4 w-4" />
                            <span>{group.members} members</span>
                          </div>
                        )}
                        {group.location && <p className="text-slate-400">{group.location}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!academicData?.collaboration?.study_groups && !collaborationData?.study_groups && (
              <Card className="bg-slate-800/50 border-slate-700 text-white">
                <CardContent className="py-8 text-center">
                  <p className="text-slate-400">No study groups available. Click &quot;Refresh Groups&quot; to load data.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="flex items-center justify-between">
              <Card className="flex-1 bg-slate-800/50 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Performance Benchmarks
                  </CardTitle>
                  <CardDescription className="text-slate-300">Anonymous comparison with peers</CardDescription>
                </CardHeader>
              </Card>
              <Button onClick={handleGetCollaboration} disabled={loading} className="ml-4 bg-green-600 hover:bg-green-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Refresh Data'
                )}
              </Button>
            </div>

            {collaborationData?.benchmarks && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700 text-white">
                    <CardContent className="pt-6">
                      <p className="text-sm text-slate-400">Your Average Score</p>
                      <p className="text-4xl font-bold text-blue-400 mt-2">{collaborationData.benchmarks.your_score_avg}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700 text-white">
                    <CardContent className="pt-6">
                      <p className="text-sm text-slate-400">Peer Average Score</p>
                      <p className="text-4xl font-bold text-slate-400 mt-2">{collaborationData.benchmarks.peer_group_avg}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700 text-white">
                    <CardContent className="pt-6">
                      <p className="text-sm text-slate-400">Percentile Rank</p>
                      <p className="text-4xl font-bold text-green-400 mt-2">{collaborationData.benchmarks.percentile}th</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700 text-white">
                  <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{collaborationData.benchmarks.notes}</p>
                  </CardContent>
                </Card>

                {collaborationData.recommendations && (
                  <Card className="bg-slate-800/50 border-slate-700 text-white">
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {collaborationData.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 bg-slate-900/50 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
                          <p className="text-slate-300">{rec}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!collaborationData?.benchmarks && (
              <Card className="bg-slate-800/50 border-slate-700 text-white">
                <CardContent className="py-8 text-center">
                  <p className="text-slate-400">No performance data available. Click &quot;Refresh Data&quot; to load benchmarks.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
