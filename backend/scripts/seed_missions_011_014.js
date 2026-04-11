const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

const missions = [
    {
        id: "listening_mission_11",
        title: "Marine Conservation",
        topic: "Ocean Ecosystems",
        level: "Elite (5*)",
        sprint_data: {
            audio_transcript: `
                Speaker: Good morning, everyone. Welcome to the 'Ocean Shield' project briefing here at the Ocean Park Research Centre. My name is Dr. Sarah Wong, and I've spent the last twenty years studying the delicate marine ecosystems that surround our city. Today, we're focusing on one of Hong Kong's most iconic yet endangered residents: the 'Chinese White Dolphin'. 
                
                If you look at the marine surveys from the past decade, the data is quite alarming. The population of these pink dolphins in the waters around Lantau Island has decreased by roughly 60%. Now, why is this happening? It's not just one thing. It's a combination of habitat loss from coastal development and, crucially, underwater noise pollution from high-speed ferry traffic. Dolphins rely on echolocation to hunt and communicate, and the constant roar of engines is effectively blinding them. 
                
                Because of this, our task force is proposing a 'Ship-Speed Limit Zone' in the high-density habitat area of West Lantau. We are advocating for a speed cap of 10 knots. Current ferries often travel at 3 or 4 times that speed, so this would be a major shift in maritime policy.
                
                Moving on to our community initiatives, the 'Ocean Cleanup' day is officially set for September 24th. We've chosen this date because the tide levels are ideal for accessing the more remote rocky shores. It's a massive operation. We're looking for 40 certified scuba divers to handle underwater debris, and we need at least 100 shore-side volunteers to help sort and bag the waste. 
                
                To give you some perspective on the scale of the problem, during last year's cleanup, we removed 2.5 tonnes of plastic waste from the Lung Kwu Chau beach alone. That's a single beach on a single day. If you want to volunteer, please note that you MUST attend the 'Safety and Marine Life Sensitivity' training session. That will be held this coming Tuesday at 7:00 PM in the main auditorium. 
                
                Finally, for those who want to contribute financially, we're launching the 'Adopt-a-Reef' program. For a donation of $500, citizens can sponsor the restoration of a 1-square-meter patch of local hard corals. These aren't just names on a wall; each donor receives the exact GPS coordinates of their sponsored reef and a quarterly status report with photos of the coral growth. We've already seen great success with this model in other parts of Southeast Asia.
            `,
            tasks: [
                {
                    id: "dolphin_table",
                    type: "TABLE",
                    label: "White Dolphin Status",
                    headers: ["Metric", "Figure/Change", "Location"],
                    rows: [
                        { label: "Population Decrease (10 yrs)", answer: "60%", placeholder: "Percentage?" },
                        { label: "Proposed Speed Limit", answer: "10 knots", placeholder: "Speed?" },
                        { label: "High-Priority Zone", answer: "West Lantau", placeholder: "Where?" }
                    ]
                },
                {
                    id: "cleanup_details",
                    type: "LIST",
                    label: "Coastal Cleanup Day",
                    items: [
                        { label: "Event Date", answer: "September 24th", placeholder: "When?" },
                        { label: "Shore-side staffing", answer: "100 volunteers", placeholder: "How many?" },
                        { label: "Lung Kwu Chau removal", answer: "2.5 tonnes", placeholder: "Amount?" },
                        { label: "Training Time", answer: "Tuesday at 7:00 PM", placeholder: "When?" }
                    ]
                }
            ]
        },
        integrated_data: {
            audio_transcript: `
                Alice: Hi Bob, Cathy. Glad we could finally get together. We need to finalize the 'Ocean Shield' fundraising letter by the end of the day. alumni are expecting it by Monday.
                Bob: I've been looking at Doc 1, the Acoustic Mapping report for Lantau. It's even worse than the public briefings suggest.
                Cathy: You mean the noise levels?
                Bob: Yeah. Hydrophones recorded noise levels 30% above safety thresholds in 80% of the key dolphin habitats. It's constant.
                Cathy: That's why we need to be so firm about the ferry rerouting. If you look at Doc 2, the proposed lanes avoid the core nursery areas entirely. 
                Alice: I agree. Let's make that a key policy point in the letter. But the alumni are usually more interested in the direct action. What about the 'Adopt-a-Reef' program?
                Bob: The $500 per square meter donation model is already working. The funds go directly to the 'Coral Nursery' in Hoi Ha Wan. 
                Cathy: Hoi Ha Wan is a great choice. The survival rate there for nursery-grown corals is currently around 90%, which is very high for the region.
                Alice: Perfect. And I want to include an incentive for our younger alumni who are interested in science. Doc 3 mentions a student survey.
                Cathy: Right. 80% of local students said they wanted more 'hands-on' marine science rather than just lectures. 
                Alice: So let's offer a 'Snorkel with Scientists' day. We could invite the top 5 donors of the month to join Dr. Wong in the field. 
                Bob: That would be a huge draw. People love that kind of access. 
                Alice: Okay, so the letter: mention the 60% dolphin decline, the shipping noise (Doc 1), the $500 reef sponsorship (Doc 2), and the snorkeling incentive for the top donors.
                Cathy: And don't forget to include the cleanup date: September 24th. We need to list it as a volunteer opportunity alongside the donations.
                Bob: Got it. I'll have the first draft of the letter ready for your review by 3 PM.
            `,
            marking_key: [
                "Program Name: Ocean Shield (Conservation Initiative)",
                "Focus: Chinese White Dolphin (Lantau Island)",
                "Problem: 60% population decline due to noise/habitat loss",
                "Regulation: 10-knot speed limit in West Lantau",
                "Cleanup: September 24th (Lantau shore-side 100 people)",
                "Outcome: 2.5 tonnes removed at Lung Kwu Chau (last year)",
                "Fundraiser: Adopt-a-Reef ($500 per sq/meter)",
                "Restoration: Coral Nursery in Hoi Ha Wan (Doc 2)",
                "Incentive: 'Snorkel with Scientists' for 5 top donors (Doc 3)",
                "Stress Factor: Noise Pollution is the #1 threat (Doc 1)",
                "Policy: Mandatory rerouting of high-speed ferry lanes"
            ],
            writing_task: {
                format: "Fundraising Letter",
                instruction: "Write a letter to the school alumni asking for donations to the 'Ocean Shield' project. Explain the crisis facing the White Dolphin, provide the 'Adopt-a-Reef' details, and highlight the upcoming cleanup on September 24th.",
                word_count: "200-250"
            },
            data_file: [
                { id: "doc1", type: "study", title: "Acoustic Mapping Lantau", content: "Hydrophones detected noise levels 30% above safety thresholds in 80% of dolphin habitats. Constant ferry traffic prevents dolphins from communicating and hunting effectively." },
                { id: "doc2", type: "map", title: "Coral Restoration Zones", content: "Hoi Ha Wan (Doc 2) has a current survival rate of 90% for nursery-grown corals. The $500 sponsorship model is now the 'Primary Fund Connector' for the nursery's electricity and nutrient costs." }
            ],
            notetaking_fields: [
                { id: "nt1", label: "Dolphin Concerns", placeholder: "60% decrease, 10 knots, West Lantau..." },
                { id: "nt2", label: "Cleanup & Education", placeholder: "Sept 24th, 100 volunteers, snorkelling..." },
                { id: "nt3", label: "Restoration Funding", placeholder: "Adopt-a-reeef $500, Hoi Ha Wan Nursery..." }
            ]
        }
    },
    {
        id: "listening_mission_12",
        title: "Robotics Competition",
        topic: "STEM & Engineering",
        level: "DSE Standard",
        sprint_data: {
            audio_transcript: `
                Speaker: Welcome, students, teachers, and technology enthusiasts, to the anual 'Victoria Harbour Tech Expo'. It's my absolute pleasure to welcome you to the home of the Inter-School Robotics Challenge. This year, the competition has reached new heights. We've seen a record-breaking number of entries from schools all across the territory. 
                
                Because of the growing sophistication of the teams, we have introduced a brand new, high-difficulty category: 'Autonomous Search & Rescue'. In this challenge, robots aren't remote-controlled; they must think for themselves. They are placed in a 10x10 meter maze filled with complex debris and dynamic obstacles, and they have to locate simulated 'survivors' and return to the start zone. Points aren't just given for speed; they are awarded based on 'Scanning Precision'—how accurately the robot identifies the thermal signatures—and 'Battery Efficiency'—how much power they have left at the end.
                
                Administratively, there are a few things to keep in mind. The registration fee per team has been set at $300 this year; this covers the venue costs and the standardized sensor calibration kits we provided last month.
                
                Technically, we have a very strict rule regarding power. Please ensure your robot uses a 'Modular Battery Pack'. The design must allow the pack to be swapped in 30 seconds or less. This simulates a real-world rescue where you can't wait for a robot to charge. Also, the 'Safety Inspection' is mandatory. It will be held in the Exhibition Hall at 10 AM sharp this coming Saturday. Do not be late! Robots that exceed the '5kg Weight Limit' during this inspection will be disqualified immediately. There is no second chance to trim the weight.
                
                But what's at stake? The rewards are significant. The top three winning teams will each earn a prestigious 'Summer Internship' at the Science Park Robotics Lab, working alongside world-class engineers. This is an incredible opportunity for your CVs. Additionally, we have the 'People's Choice' award, which is voted on by the public visitors. This award is worth $5,000 and focuses on the most innovative and aesthetic robot design. 
                
                Finally, a reminder for the captains: all finalists must submit their detailed 'Technical Blueprint' and source code logic to the portal by 6:00 PM on Friday. This ensures everything is ready for the judges to review before the live heats begin. Good luck to everyone!
            `,
            tasks: [
                {
                    id: "robotics_table",
                    type: "TABLE",
                    label: "Competition Rules",
                    headers: ["Category", "Requirement/Limit", "Deadline/Fee"],
                    rows: [
                        { label: "New Category", answer: "Autonomous Search & Rescue", placeholder: "Target?" },
                        { label: "Registration Fee", answer: "$300", placeholder: "Cost?" },
                        { label: "Weight Limit", answer: "5kg", placeholder: "Max weight?" },
                        { label: "Blueprint Deadline", answer: "6:00 PM Friday", placeholder: "When?" }
                    ]
                },
                {
                    id: "tech_spec_list",
                    type: "LIST",
                    label: "Technical Specs",
                    items: [
                        { label: "Battery Requirement", answer: "Modular (30-sec swap)", placeholder: "Spec?" },
                        { label: "Safety Inspection", answer: "10 AM Saturday", placeholder: "When?" },
                        { label: "Top Prize", answer: "Summer Internship (Science Park)", placeholder: "Award?" }
                    ]
                }
            ]
        },
        integrated_data: {
            audio_transcript: `
                Alice: Hi team, let's gather around the laptop. We need to finalize the 'Robotics Team' press release for the local newspapers. Bob, have you got the latest stats from the Expo committee?
                Bob: Yeah, I've been looking at Doc 2, the 'Common Challenges' FAQ. It's quite interesting. It says that 70% of junior teams actually fail the first round due to poor 'Obstacle Avoidance' routines.
                Cathy: 70%? That's huge. That makes our 'Ultrasonic Sensor' array even more important for the press release. 
                Alice: Right, we should emphasize that. Our array gives the robot a full 360-degree field of view, which is far beyond the standard front-facing sensors most teams are using. 
                Bob: Definitely. And we should lead with the 'Search & Rescue' mission. It makes the tech feel more meaningful than just a game.
                Cathy: I agree. Alice, did you include the Science Park internship? 
                Alice: Absolutely. It's the top prize for the best 3 teams, and it's a huge motivator for us. It's a real-world career path.
                Bob: I also found a great quote in Doc 1 about the educational value. It says that the 'Logical Synthesis' required to code these sensors actually results in a 15% increase in mathematical efficiency for students.
                Cathy: That's a great stat to include for the principal. It proves e-sports and robotics aren't just distractions. 
                Alice: Good point. What about our design? Do we mention the 'People's Choice' award?
                Cathy: We have to! Our design team spent three months working on that outer shell. The $5,000 prize would go a long way towards next year's components.
                Bob: Okay, let's structure the release: The Search & Rescue challenge, our 360-degree ultrasonic array, the 15% academic benefit (Doc 1), the Science Park internship opportunity, and our design for the People's Choice.
                Alice: And I'll add a reminder at the bottom about the 5kg weight constraint. We need to make sure the school knows we passed the safety inspection on Saturday morning.
                Cathy: Perfect. I'll have the draft uploaded to the shared folder by noon.
            `,
            marking_key: [
                "Event: Inter-School Robotics Challenge (Harbour Expo)",
                "Category: Autonomous Search & Rescue (10x10m Maze)",
                "Constraint: Strictly under 5kg (Safety Inspection Sat 10 AM)",
                "Staffing: Mandatory Technical Blueprint submission (Fri 6 PM)",
                "Innovation: Ultrasonic Sensor Array (360-degree FOV)",
                "Benefit: Increases 'Logical Synthesis' Skills (Doc 1)",
                "Award 1: Science Park Lab Summer Internship (Top 3 Teams)",
                "Award 2: $5,000 People's Choice for Design",
                "Rule: 30-second Modular Battery swap (Battery Efficiency)",
                "Trend: 70% of teams struggle with Obstacle Avoidance (Doc 2)"
            ],
            writing_task: {
                format: "Press Release",
                instruction: "Write a press release to the local media about the school's participation in the Robotics Competition. Highlight the new category, the team's technical achievements, and the high-stakes awards at the Science Park.",
                word_count: "200-250"
            },
            data_file: [
                { id: "doc1", type: "article", title: "STEM in the 21st Century", content: "Robotics competitions are more than 'playing with toys'. Data suggests that the 'Logical Synthesis' required to code sensors results in a 15% increase in mathematical efficiency among competitors." },
                { id: "doc2", type: "faq", title: "Common Challenges: Expo", content: "Why do so many robots fail? 70% of the disqualifications in 2024 were due to poor 'Obstacle Avoidance' routines. Modular power supplies were also a frequent fail point." }
            ],
            notetaking_fields: [
                { id: "nt1", label: "Tech Specs", placeholder: "5kg weight, 30-sec battery swap, ultrasonic sensors..." },
                { id: "nt2", label: "Competition Tasks", placeholder: "10x10m maze, autonomous search & rescue..." },
                { id: "nt3", label: "Career & Awards", placeholder: "Science park internship, $5k choice award..." }
            ]
        }
    },
    {
        id: "listening_mission_13",
        title: "Social Media Wellness",
        topic: "Mental Health Awareness",
        level: "DSE Standard",
        sprint_data: {
            audio_transcript: `
                Speaker: Good afternoon, everyone. Thank you for coming. I'm Mr. Chan from the Counselling Department, and I want to welcome you to the 'Digital Balance' seminar. This is a topic that hits very close to home for almost every student in this room. 
                
                Recent territorial surveys of Hong Kong secondary students have yielded some genuinely startling results. On average, a student in our city spends 6.5 hours a day on social media platforms. That's nearly a full working day, every single day. 
                
                This level of consumption is having a measurable impact on your wellbeing. Symptoms of 'Digital Fatigue'—which include chronic eye strain, sleep disruption, and difficulty focusing on long-form reading—now affect a staggering 50% of our student population. You aren't just 'tired'; your brain is being overstimulated by constant notifications and short-form content.
                
                To combat this, the school is launching the 'Offline-Is-Fine' challenge this week. We are asking for volunteers to commit to a 'Digital Blackout' every night. Specifically, you will commit to turning off your devices and placing them in a different room between 9 PM and 7 AM daily for one full week. This target 10-hour window is designed to restore your natural circadian rhythm. 
                
                Additionally, the 'School Wellness Centre' will be offering specialized 'Mindfulness for Gen Z' workshops. These are practical sessions where you'll learn how to manage 'FOMO'—the fear of missing out—and they will be held at 1 PM every Wednesday during the lunch hour.
                
                But how do you know if you're overusing? To help you self-regulate, we've enabled the 'Screen-Time Audit' tool on the school portal. It doesn't just track the hours; it automatically categorizes your usage into three buckets: 'Educational', 'Social', and the dangerous 'Passive Scroll'. 
                
                The goal for this challenge is simple yet effective: students who can show a 20% reduction in their 'Passive Scroll' time over the week will be entered into a lucky draw for a 'Wellness Retreat' pass at a local resort. And don't forget, if you want to be eligible for the draw, you must submit your 'Digital Detox Diary' to the portal by Friday afternoon. Let's reclaim our time together!
            `,
            tasks: [
                {
                    id: "wellness_table",
                    type: "TABLE",
                    label: "Wellness Statistics",
                    headers: ["Metric", "Figure", "Implication"],
                    rows: [
                        { label: "Avg Social Media Usage", answer: "6.5 hours/day", placeholder: "Time?" },
                        { label: "Digital Fatigue rate", answer: "50%", placeholder: "Percentage?" },
                        { label: "Workshops Timing", answer: "1 PM (Wednesdays)", placeholder: "When?" }
                    ]
                },
                {
                    id: "campaign_list",
                    type: "LIST",
                    label: "Offline-Is-Fine Challenge",
                    items: [
                        { label: "Daily Blackout Period", answer: "9 PM to 7 AM", placeholder: "Hours?" },
                        { label: "Target Reduction", answer: "20% (Passive Scroll)", placeholder: "Goal?" },
                        { label: "Draw Prize", answer: "Wellness Retreat pass", placeholder: "Reward?" },
                        { label: "Diary Deadline", answer: "Friday afternoon", placeholder: "When?" }
                    ]
                }
            ]
        },
        integrated_data: {
            audio_transcript: `
                Alice: Hi Bob, Cathy. Thanks for making time. We need to draft the 'Social Media Wellness' student guide for the wellness website. Bob, you looked at the latest report on self-esteem, right?
                Bob: Yeah, Doc 1 is quite heavy. It shows that the 'Comparison Culture' on platforms like Instagram is directly responsible for a 30% drop in self-esteem among teenage girls in just two years. 
                Cathy: 30%? That's devastating. People only post their 'highlight reels', and students feel their normal lives don't measure up.
                Alice: Exactly. That's why we need to encourage 'Authentic Posting'—fewer filters, more reality. And I really like the school's 'Digital Blackout' protocol. 
                Cathy: From 9 PM to 7 AM? 
                Alice: Yes. The study I read says that those ten hours of screen-free time can improve deep sleep quality by up to 40%. It's a game-changer for academic focus.
                Bob: Definitely. But I'm also worried about the 'Passive Scrolling' habit. Doc 2 says it's the #1 cause of digital anxiety. 
                Cathy: What's the alternative?
                Bob: Proactive interaction. Like actually commenting or messaging instead of just scrolling for hours. That's why the 'Screen-Time Audit' tool on the portal is so useful—it reminds you when you're just drifting.
                Alice: Good. Let's make sure the guide explains how to use that audit tool for self-regulation.
                Bob: So, the guide will cover: the 6.5 hour average usage trap, the 9-to-7 blackout rule, the 20% passive scroll reduction target, and the Mindfulness workshops.
                Cathy: And we should include a link to sign up for the workshops at 1 PM on Wednesdays. They're already nearly full!
                Alice: Great. I'll summarize the 'Detox Diary' requirement too. The prospect of a 'Wellness Retreat' might be the only thing that gets some of the Form 6s to put their phones away.
                Bob: True. I'll have the outline ready by the end of the day.
            `,
            marking_key: [
                "Objective: Digital Balance & Mental Health Awareness",
                "Data: 6.5 hours daily average social media usage",
                "Symptom: Digital Fatigue affecting 50% of students",
                "New Rule: Digital Blackout (9 PM - 7 AM)",
                "Action: 'Screen-Time Audit' tool on school portal (Educational focus)",
                "Goal: Reduce 'Passive Scroll' by 20%",
                "Impact: Comparison culture causes 30% drop in self-esteem (Doc 1)",
                "Insight: Passive Scrolling is the #1 cause of anxiety (Doc 2)",
                "Workshop: 'Mindfulness for Gen Z' (Wednesdays, 1 PM)",
                "Deadline: Submit 'Digital Detox Diary' (Friday afternoon)"
            ],
            writing_task: {
                format: "Student Guide",
                instruction: "Write a guide for your classmates titled 'Mastering Your Feed'. Explain the risks of high social media usage, introduce the 'Offline-Is-Fine' challenge, and provide practical tips for digital self-regulation.",
                word_count: "200-250"
            },
            data_file: [
                { id: "doc1", type: "report", title: "The Comparison Trap", content: "Sociological data indicates that 'Curated Life Filters' lead to a 30% reduction in personal satisfaction. Students feel pressure to match 'Influencer Lifestyles', resulting in chronic FOMO." },
                { id: "doc2", type: "memo", title: "Counselor's Corner", content: "Passive scrolling (consuming content without interaction) is a high-anxiety activity. We recommend active engagement (commenting/creating) to shift from 'Passive' to 'Proactive' digital usage." }
            ],
            notetaking_fields: [
                { id: "nt1", label: "Health Impact", placeholder: "6.5 hours usage, 50% fatigue, 30% low self-esteem..." },
                { id: "nt2", label: "Digital Challenge", placeholder: "Blackout 9PM to 7AM, Passive scroll -20%..." },
                { id: "nt3", label: "Tools & Workshops", placeholder: "Screen audit tool, Wed 1PM mindfulness..." }
            ]
        }
    },
    {
        id: "listening_mission_14",
        title: "Sustainable Fashion",
        topic: "Circular Economy",
        level: "Elite (5**)",
        sprint_data: {
            audio_transcript: `
                Speaker: Good afternoon, delegates. Welcome to the final session of our 'Circular Wardrobe' forum. My name is Elena Rossi, and I'm a consultant for the Sustainable Apparel Coalition. I'd like to start with a question: have you ever considered the environmental cost of the shirt you're wearing right now? 
                
                The data is frankly quite shocking. The fashion industry alone accounts for roughly 10% of global carbon emissions—that's more than all international flights and maritime shipping combined. Here in Hong Kong, the situation is even more localized and urgent. Every single day, over 300 tonnes of textiles are sent straight to our landfills. Most of this is 'fast fashion'—items worn once and then discarded. Our mission today is to shift from this linear model of 'take-make-waste' towards a 'Circular Design' philosophy.
                
                As part of this shift, we are hosting this year's 'Revive Fashion Show' on January 15th. This isn't your typical runway. All entries must adhere to strict 'Upcycling' rules: at least 90% of the final garment must be constructed from post-consumer waste—old clothes, discarded upholstery, or even plastic bags. 
                
                If you have registered as a designer, please remember that you MUST attend the 'Fabric Innovation' masterclass. It will be held at 2 PM this coming Sunday in the workshop wing. We'll be teaching you how to revitalize old fabrics without the use of harsh chemicals. 
                
                For the winner of the grand prize, the reward is life-changing: a $30,000 scholarship to the 'Milan Sustainable Fashion Institute', covering both tuition and board for a full semester. It's a gold-standard qualification in the industry. 
                
                A final logistical note regarding the school's new recycling system: the 'Textile Recycling Bin' in the main lobby is for natural fibers only—things like pure cotton, wool, and silk. Anything containing synthetic blends, like polyester or nylon, must be sorted separately and placed in the 'Poly-Clear' container near the science wing. Oh, and for the competitors, please ensure your detailed 'Garment Lifespan' report is submitted to the portal by Thursday at 5:00 PM. We need to see the transparency of your supply chain.
            `,
            tasks: [
                {
                    id: "fashion_table",
                    type: "TABLE",
                    label: "Fashion Impact",
                    headers: ["Metric", "Figure", "Deadline/Constraint"],
                    rows: [
                        { label: "Global Carbon Footprint", answer: "10%", placeholder: "Percentage?" },
                        { label: "HK Daily Textile Waste", answer: "300 tonnes", placeholder: "Amount?" },
                        { label: "Upcycle Requirement", answer: "90% post-consumer waste", placeholder: "Constraint?" },
                        { label: "Report Deadline", answer: "Thursday 5:00 PM", placeholder: "When?" }
                    ]
                },
                {
                    id: "event_list",
                    type: "LIST",
                    label: "Show & Masterclass",
                    items: [
                        { label: "Fashion Show Date", answer: "January 15th", placeholder: "When?" },
                        { label: "Scholarship Value", answer: "$30,000", placeholder: "Prize?" },
                        { label: "Lobby Bin Policy", answer: "Natural Fibers Only", placeholder: "Rule?" },
                        { label: "Innovation Masterclass", answer: "2 PM Sunday", placeholder: "When?" }
                    ]
                }
            ]
        },
        integrated_data: {
            audio_transcript: `
                Alice: Hi Bob, Cathy. Thanks for coming. We need to draft the final blog post for the school's 'Eco-Club' website. The topic is 'The Circular Wardrobe'. Bob, did you find the data on water usage?
                Bob: Yeah, Doc 1 is a real eye-opener. I didn't realize how water-intensive traditional cotton farming is. Did you know it takes 2,700 liters of fresh water just to produce a single cotton T-shirt? 
                Cathy: 2,700 liters? That's enough for one person to drink for three years!
                Alice: Exactly. That's why we need to promote 'Bamboo Fibre' in our blog post. 
                Cathy: Right. Doc 1 says bamboo grows without pesticides and uses 70% less water than cotton. It's the future of sustainable textiles.
                Alice: So let's make that a key recommendation. And we have to mention the Milan Scholarship. 
                Bob: The $30,000 one?
                Alice: Yes. It's the biggest prize we've ever offered. It shows how much the 'Sustainable Fashion Institute' values our students' creativity. 
                Cathy: I'm also really interested in the 'Repair Workshops' trend. Have you seen Doc 2? 
                Bob: The public sentiment survey?
                Cathy: Yeah. It says 75% of young people would actually fix their clothes instead of throwing them away if they just had the basic skills.
                Alice: That's a huge opportunity. Let's announce the 'Button & Stitch' repair corner we're launching in the school lobby. We'll have sewing machines and mentors available every Tuesday.
                Bob: I love it. So, the blog post structure: the environmental toll of fast fashion (10% carbon, 300 tonnes waste), the bamboo alternative (70% water saving), the 'Revive' show rules (90% upcycled), the Milan scholarship, and the invitation to the 'Button & Stitch' corner.
                Cathy: And don't forget to remind everyone about the fabric sorting policy—natural vs synthetic. It's the first step to circularity.
                Alice: Perfect. This is going to be our best blog post yet. Bob, can you have a draft ready by tonight? 
            `,
            marking_key: [
                "Industry: Sustainable Fashion (Circular Economy focus)",
                "Stat: Fashion is 10% global carbon / 300 tonnes daily HK waste",
                "Rule: 90% upcycled materials for 'Revive' Show (Jan 15th)",
                "Impact: Traditional cotton (1 t-shirt = 2,700L water) vs Bamboo (Doc 1)",
                "Solution: Bamboo uses 70% less water (Sustainable Alternative)",
                "Education: Fabric Innovation masterclass (Sunday 2 PM)",
                "Outcome: Repair Workshops (75% interest in 'Button & Stitch') (Doc 2)",
                "Scholarship: $30,000 to Milan Sustainable Fashion Institute",
                "Sorting: Natural Fibers vs Synthetic Blends (Lobby policy)",
                "Insight: Textile longevity is key to reducing landfill pressure"
            ],
            writing_task: {
                format: "Blog Post",
                instruction: "Write a blog post for the school's 'Eco-Club' website. Discuss the environmental toll of fast fashion, the details of the 'Revive' competition, and invite students to the repair workshops.",
                word_count: "200-250"
            },
            data_file: [
                { id: "doc1", type: "chart", title: "H2O Cost of Fashion", content: "1 Cotton Shirt: 2,700 Liters Water.<br/>1 Bamboo Shirt: 810 Liters Water.<br/>Conclusion: Switching to Bamboo saves 70% of freshwater resources per garment." },
                { id: "doc2", type: "survey", title: "Public Repair Sentiment", content: "75% of respondents aged 15-25 would 'Never discard' a damaged garment if they knew how to repair a zipper or a seam. Most cite 'Lack of Sewing Skills' as the primary barrier to circularity." }
            ],
            notetaking_fields: [
                { id: "nt1", label: "Industry Impact", placeholder: "10% carbon, 300 tonnes waste daily..." },
                { id: "nt2", label: "Sustainable Solutions", placeholder: "90% upcycled, 70% water-saving bamboo..." },
                { id: "nt3", label: "Event & Education", placeholder: "Jan 15th show, Milan scholarship, repair workshop..." }
            ]
        }
    }
];

async function seed() {
    console.log("--- Seeding Missions #011 - #014 ---");
    for (const m of missions) {
        try {
            await db.collection('question_bank').doc(m.id).set({
                ...m,
                type: "listening_mission",
                level: m.level || "DSE Standard",
                paper: "Listening",
                subject: "English",
                created_at: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ Success: Seeded ${m.id} (${m.title})`);
        } catch (e) {
            console.error(`❌ Error seeding ${m.id}:`, e);
        }
    }
    console.log("--- Seeding Complete ---");
    process.exit(0);
}

seed();
