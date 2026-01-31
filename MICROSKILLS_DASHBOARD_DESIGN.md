# Micro-Skills Dashboard - Frontend Design Specification

## Overview
Visual design for displaying 47 DSE English micro-skills in an intuitive, actionable dashboard.

---

## Layout Structure

### 1. **Hero Section - Overall Progress**
```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Your English Skill Profile                              │
│                                                              │
│  Overall Level: 4.2 / 5**        Target: 5*                │
│  ████████████████░░░░  84%                                  │
│                                                              │
│  📊 Reading: 4    ✍️ Writing: 3    👂 Listening: 5    💬 Speaking: 4 │
└─────────────────────────────────────────────────────────────┘
```

### 2. **Radar Chart - Visual Overview**
```
        Listening (5)
              ★
             /|\
            / | \
   Reading /  |  \ Speaking
    (4)   ★   |   ★ (4)
           \  |  /
            \ | /
             \|/
              ★
         Writing (3)
```
- **Interactive**: Hover to see micro-skill breakdown
- **Color-coded**: Green (5+), Yellow (4), Orange (3), Red (2-)

### 3. **Tabbed View - Detailed Breakdown**

#### Tab 1: Reading (12 skills)
```
┌─ READING SKILLS ─────────────────────────────────────────┐
│                                                           │
│ Comprehension Skills                                      │
│ ├─ Literal Comprehension        ████████░░ 4.0  ✓ Strong│
│ ├─ Inference                    ██████░░░░ 3.0  ⚠ Work  │
│ ├─ Main Idea Identification     ████████░░ 4.0  ✓ Strong│
│ ├─ Detail Recognition           █████████░ 4.5  ✓ Strong│
│ ├─ Sequencing                   ███████░░░ 3.5  ⚠ Work  │
│ └─ Synthesis                    █████░░░░░ 2.5  ❌ Weak  │
│                                                           │
│ Critical Reading Skills                                   │
│ ├─ Fact vs Opinion              ████████░░ 4.0  ✓ Strong│
│ ├─ Author's Purpose             ██████░░░░ 3.0  ⚠ Work  │
│ └─ ... (6 more)                                          │
│                                                           │
│ [Practice Weak Skills] [View Progress Chart]             │
└───────────────────────────────────────────────────────────┘
```

#### Tab 2: Writing (15 skills)
Similar layout with 3 categories:
- Content & Ideas (3 skills)
- Language & Vocabulary (5 skills)
- Grammar & Sentence Structure (4 skills)
- Organization & Coherence (3 skills)

#### Tab 3: Listening (10 skills)
#### Tab 4: Speaking (10 skills)

### 4. **Priority Focus Section**
```
┌─ 🎯 TOP 3 SKILLS TO IMPROVE ─────────────────────────────┐
│                                                           │
│ 1. 📝 Synthesis (Reading)                    Level: 2.5  │
│    Impact: ████████░░ High                               │
│    Fixability: ██████░░░░ Medium                         │
│    → Practice: "Combine info from multiple texts"        │
│    [Start Drill] [Watch Tutorial]                        │
│                                                           │
│ 2. ✍️ Sentence Variety (Writing)             Level: 3.0  │
│    Impact: ███████░░░ High                               │
│    Fixability: ████████░░ Easy                           │
│    → Practice: "Use complex sentence structures"         │
│    [Start Drill] [Watch Tutorial]                        │
│                                                           │
│ 3. 💬 Spontaneity (Speaking)                 Level: 3.0  │
│    Impact: ██████░░░░ Medium                             │
│    Fixability: █████░░░░░ Hard                           │
│    → Practice: "Think on feet, improvise responses"      │
│    [Start Drill] [Watch Tutorial]                        │
└───────────────────────────────────────────────────────────┘
```

### 5. **Progress Timeline**
```
┌─ 📈 IMPROVEMENT OVER TIME ───────────────────────────────┐
│                                                           │
│  5** ┤                                                    │
│  5*  ┤                                        ●           │
│  5   ┤                              ●                     │
│  4   ┤                    ●                               │
│  3   ┤          ●                                         │
│  2   ┤    ●                                               │
│  1   ┤                                                    │
│      └─────────────────────────────────────────────────   │
│      Jan 1   Jan 8   Jan 15  Jan 22  Jan 29              │
│                                                           │
│  Select Skill: [Inference ▼]  [Show All Skills]          │
└───────────────────────────────────────────────────────────┘
```

### 6. **Skill Heatmap - All 47 Skills at a Glance**
```
┌─ 🔥 SKILL HEATMAP ───────────────────────────────────────┐
│                                                           │
│ Reading:    🟢🟢🟡🟢🟡🔴🟢🟡🟢🟡🟢🟡                    │
│ Writing:    🟡🔴🟢🟡🟡🟢🟡🟡🟢🟡🔴🟡🟢🟡🟡              │
│ Listening:  🟢🟢🟢🟢🟡🟢🟡🟢🟢🟡                        │
│ Speaking:   🟡🟢🟡🟡🟢🟡🔴🟡🟢🟡                        │
│                                                           │
│ 🟢 Strong (4-5**)  🟡 Good (3-4)  🔴 Weak (1-2)          │
│                                                           │
│ [Click any circle to see details]                        │
└───────────────────────────────────────────────────────────┘
```

---

## Interactive Features

### Hover Effects
- **Skill Bar**: Shows exact score, last assessed date, confidence level
- **Radar Chart**: Highlights specific micro-skill
- **Heatmap Circle**: Tooltip with skill name and level

### Click Actions
- **Skill Name**: Opens detailed breakdown with examples
- **"Start Drill" Button**: Launches targeted practice exercise
- **"Watch Tutorial" Button**: Opens video explanation
- **Progress Chart**: Zooms into specific date range

### Filters & Sorting
```
┌─ FILTERS ────────────────────────────────────────────────┐
│ Show: [All Skills ▼] [Weak Only] [Improving] [Declining]│
│ Sort: [Priority ▼] [Alphabetical] [Level] [Last Tested] │
└───────────────────────────────────────────────────────────┘
```

---

## Mobile View Adaptation

### Collapsed View
```
┌─────────────────────────┐
│ 📊 Skill Overview       │
│                         │
│ Overall: 4.2/5**        │
│ ████████████░░░ 84%     │
│                         │
│ 📖 Reading      4.0 ▼   │
│ ✍️ Writing      3.0 ▼   │
│ 👂 Listening    5.0 ▼   │
│ 💬 Speaking     4.0 ▼   │
│                         │
│ [View Details]          │
└─────────────────────────┘
```

### Expandable Sections
Tap to expand each skill category and see micro-skills

---

## Color Scheme

### Skill Levels
- **Level 5**/5**: Gold (#FFD700)
- **Level 5**: Green (#4CAF50)
- **Level 4**: Light Green (#8BC34A)
- **Level 3**: Yellow (#FFC107)
- **Level 2**: Orange (#FF9800)
- **Level 1**: Red (#F44336)

### UI Elements
- **Primary**: Blue (#2196F3)
- **Success**: Green (#4CAF50)
- **Warning**: Orange (#FF9800)
- **Danger**: Red (#F44336)
- **Background**: Light Gray (#F5F5F5)

---

## Data Visualization Libraries

### Recommended Stack
1. **Recharts** - For line charts and bar charts
2. **Chart.js** - For radar chart
3. **D3.js** - For custom heatmap
4. **Framer Motion** - For smooth animations

### Example Code (Radar Chart)
```javascript
import { Radar } from 'react-chartjs-2';

const data = {
  labels: ['Reading', 'Writing', 'Listening', 'Speaking'],
  datasets: [{
    label: 'Current Level',
    data: [4, 3, 5, 4],
    backgroundColor: 'rgba(54, 162, 235, 0.2)',
    borderColor: 'rgb(54, 162, 235)',
  }]
};

<Radar data={data} />
```

---

## User Flow

1. **Land on Dashboard** → See overall progress hero section
2. **Scroll Down** → View radar chart for quick visual
3. **Click Tab** → Dive into specific paper (Reading/Writing/etc.)
4. **Identify Weak Skills** → Red/Orange bars catch attention
5. **Click "Start Drill"** → Begin targeted practice
6. **Return to Dashboard** → See updated progress after practice

---

## Gamification Elements

### Achievements
- 🏆 "Master of Inference" - Reach Level 5 in Inference
- 🎯 "Grammar Guru" - Perfect score in all grammar micro-skills
- 📈 "Rising Star" - Improve 3+ levels in any skill in 1 week

### Progress Badges
```
┌─ BADGES EARNED ──────────────────────────────────────────┐
│ 🥇 Reading Champion    🥈 Writing Warrior    🥉 Listener  │
└───────────────────────────────────────────────────────────┘
```

---

## Accessibility

- **Screen Reader Support**: All charts have text alternatives
- **Keyboard Navigation**: Tab through all interactive elements
- **High Contrast Mode**: Toggle for better visibility
- **Font Size Adjustment**: Zoom in/out without breaking layout

---

## Performance Optimization

- **Lazy Load Charts**: Only render visible tabs
- **Virtualized Lists**: For 47-skill heatmap on mobile
- **Cached Data**: Store micro-skill data in localStorage
- **Progressive Loading**: Show skeleton screens while fetching

---

## Next Steps

1. **Create React Component**: `MicroSkillDashboard.jsx`
2. **Build API Integration**: Fetch micro-skill data from backend
3. **Implement Charts**: Set up Recharts/Chart.js
4. **Add Interactivity**: Click handlers, filters, sorting
5. **Mobile Responsive**: Test on various screen sizes
6. **User Testing**: Get feedback from 5-10 students

Would you like me to start building the React component for this dashboard?
