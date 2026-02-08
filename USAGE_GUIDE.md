# Smart College Life Manager - Usage Guide

## Getting Started

### 1. Start the Development Server

```bash
cd /app/nextjs-project
npm run dev
```

The application will be available at `http://localhost:3000`

## How to Use Each Feature

### Dashboard Tab

**Sync Your Academic Data:**
1. Click the "Sync & Plan" button at the top
2. The Academic Coordinator (manager agent) will orchestrate:
   - LMS Sync Agent fetches your timetable, assignments, exams, attendance
   - Study Planner Agent creates your personalized study plan
   - Collaboration Agent pulls peer updates and study groups
3. View your results in organized sections:
   - **Urgent Items** - Color-coded by priority (red=critical, orange=high, yellow=medium)
   - **Today's Timetable** - Classes scheduled for today
   - **Pending Assignments** - Sorted by deadline
   - **Upcoming Exams** - Next exams on your schedule
   - **Attendance Overview** - Progress bars (red if below 80%)
   - **Weekly Study Plan** - Summary with total hours

### Study Plan Tab

**Generate Your Custom Study Plan:**
1. Enter your study requirements in the text box, for example:
   - "Create a study plan for Data Structures exam on Monday and DBMS quiz on Thursday"
   - "I have 3 assignments due Friday, help me plan this week"
2. Click "Generate Study Plan"
3. View your personalized plan:
   - **Priority Tasks** - Most urgent items first
   - **Daily Schedule** - 7-day breakdown with specific time slots
   - **Study Sessions** - Timings, topics, and techniques (Pomodoro, Active Recall, etc.)
   - **Recommended Techniques** - Proven study methods with benefits

### Class Calendar Tab

**View Shared Events:**
1. Switch to the "Class Calendar" tab
2. See all upcoming class events:
   - Assignment deadlines
   - Exam dates
   - Class activities
   - College events
3. Each event shows:
   - Title and type
   - Date and time
   - Location (if available)

### Study Groups Tab

**Find and Join Study Groups:**
1. Navigate to "Study Groups" tab
2. Browse available groups organized by course
3. View group details:
   - Group ID and focus area
   - Meeting schedule
   - Available seats
   - Meeting location
4. Use this information to coordinate with classmates

### Performance Benchmarks Tab

**Track Your Performance:**
1. Click "Performance Benchmarks" tab
2. View anonymous comparisons:
   - **Your Average Score** vs **Peer Average**
   - **Your Percentile** ranking
3. Read personalized recommendations for improvement

## Understanding Agent Responses

### What Happens When You Click "Sync & Plan"?

The **Academic Coordinator (Manager Agent)** coordinates three sub-agents:

1. **LMS Sync Agent** - Connects to your college LMS to fetch:
   - Current timetable
   - Pending assignments
   - Upcoming exams
   - Attendance records

2. **Study Planner Agent** - Analyzes your workload and creates:
   - Daily study schedules
   - Priority task lists
   - Time estimates
   - Study technique suggestions

3. **Collaboration Agent** - Provides:
   - Available study groups
   - Shared class calendar events
   - Performance benchmarks
   - Peer insights

### What Happens When You Generate a Study Plan?

The **Study Planner Agent** creates:
- Detailed 7-day study schedule
- Time-blocked sessions with specific topics
- Recommended study techniques (Pomodoro, Active Recall, Spaced Repetition)
- Priority ordering based on deadlines

## Tips for Best Results

**For Better Study Plans:**
- Be specific about deadlines ("exam on Monday", "assignment due Friday")
- Mention course names
- Include how much time you have available

**Example Queries:**
- "I have Data Structures exam on Monday, DBMS quiz Wednesday, and 2 assignments due Friday. Create a study plan."
- "Plan my week with focus on Database Management and Operating Systems."
- "I'm behind in attendance for 3 courses and have exams next week. Help me prioritize."

## Agent IDs Reference

If you need to call agents directly via API:

- **Academic Coordinator** (Manager): `6988350dab8c2b0ff025872c`
- **LMS Sync Agent**: `698834b829694629a3a3596e`
- **Study Planner Agent**: `698834ceb662c978044a1588`
- **Collaboration Agent**: `698834f2f92870f1ee0acc6a`
- **Smart Reminder Agent**: `69883529b662c978044a158f`

## Troubleshooting

**No data showing after "Sync & Plan"?**
- Check the browser console for errors
- The LMS Sync Agent may need proper LMS API configuration
- Try generating a study plan directly to test the Study Planner Agent

**Study Plan not generating?**
- Make sure you entered a query in the text box
- Check that the query mentions deadlines or specific tasks
- The agent responds better to specific requests

**Loading forever?**
- Check your internet connection
- Agent API calls may take 5-15 seconds
- Refresh the page and try again

## Next Steps

1. Start with the Dashboard - click "Sync & Plan"
2. Generate a custom study plan based on your actual schedule
3. Check study groups for your courses
4. Monitor your performance benchmarks
5. Use the class calendar to stay on top of deadlines

---

Built with Lyzr AI Agent framework
