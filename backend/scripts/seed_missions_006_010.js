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
        id: "listening_mission_6",
        title: "Smart City Innovation",
        topic: "IoT & Urban Solutions",
        level: "DSE Standard",
        sprint_data: {
            audio_transcript: `
                Speaker: Good morning, committee members. Let me just get the microphone levels right... okay. Welcome to the 'Smart District' task force monthly review. We're gathered here today to discuss our ongoing initiatives in Kowloon East, specifically focusing on the Kwun Tong and Kai Tak areas. 
                
                Our primary goal, as many of you know, is to solve the crippling 'Parking Crisis' that has plagued this industrial heartland for years. If you look at the transport data from last year, a staggering 45% of traffic congestion in this district was caused by drivers simply searching for parking spaces. Not driving to a destination, mind you, but just circling the block. This leads to frustrated drivers and, more importantly, massive local air pollution.
                
                To combat this, we've invested heavily in IoT infrastructure. While our initial pilot only had 500 sensors, I am pleased to announce that we have now successfully installed 1,200 smart sensors across 15 public car parks. These sensors are state-of-the-art; they can detect the presence of a vehicle with 99.9% accuracy. More importantly, these sensors transmit real-time occupancy data every 3 seconds. This data is fed directly into our central 'Pulse' app.
                
                The official trial run for the public begins on August 5th. We want to ensure the system is robust before the peak holiday season. Through the app, users will be able to reserve a spot up to 30 minutes in advance. We debated making the window longer, maybe an hour, but we decided 30 minutes is the sweet spot to prevent 'ghost bookings'. There is a reservation fee of $10. Now, I've heard some concerns about this cost, but please note that it is fully refundable if the user arrives within the 30-minute window. It's really just a deposit to ensure the spot isn't wasted. 
                
                Looking at our KPIs, we expect this initiative to reduce carbon emissions by roughly 15% in the first quarter of full operation. Furthermore, our 'Smart Lamppost' pilot on Kwun Tong Road, which currently just handles light and traffic counting, will be expanded to include detailed air quality monitoring by September. This will give us the most granular environmental data in Hong Kong's history.
            `,
            tasks: [
                {
                    id: "parking_table",
                    type: "TABLE",
                    label: "Parking Infrastructure",
                    headers: ["Metric", "Quantity/Figure", "Update Frequency"],
                    rows: [
                        { label: "Smart Sensors installed", answer: "1,200", placeholder: "Number?" },
                        { label: "Public Car Parks included", answer: "15", placeholder: "How many?" },
                        { label: "Data Transmission Rate", answer: "Every 3 seconds", placeholder: "Frequency?" },
                        { label: "Trial Start Date", answer: "August 5th", placeholder: "When?" }
                    ]
                },
                {
                    id: "app_details",
                    type: "LIST",
                    label: "Pulse App Features",
                    items: [
                        { label: "Reservation Window", answer: "30 minutes", placeholder: "Time limit?" },
                        { label: "Reservation Fee", answer: "$10 (Refundable)", placeholder: "Cost?" },
                        { label: "Target Emission Reduction", answer: "15%", placeholder: "Environmental impact?" }
                    ]
                }
            ]
        },
        integrated_data: {
            audio_transcript: `
                Alice: Okay team, let's settle down. We have exactly twenty minutes before the District Council presentation, and we need to finalized the 'Smart Parking' proposal. 
                Bob: I've been reviewing the latest driver feedback in Document 2, and Honestly, there's a significant issue we haven't fully addressed.
                Cathy: You mean the 'Digital Literacy' gap?
                Bob: Exactly. While the younger professionals in the CBD love the app, older drivers—who make up a large portion of the commercial vehicle operators here—find the mobile interface intimidating. 60% of them said it's too complicated.
                Cathy: Right, and that's why we suggested the 'Interactive Kiosks'. Alice, did you see the designs? We can place them right at the car park entrances. 
                Alice: I did. And I liked the 'Voice-Guided' interface. It means drivers don't even have to type; they can just speak to the kiosk to find an available spot or set up their Pulse account.
                Bob: That sounds much more accessible. But we need to look at the numbers. Those kiosks aren't cheap.
                Alice: I've already adjusted the budget request. We're asking the Council for an additional $200,000 specifically for the kiosk hardware and the voice-AI licensing. It's a jump, but it's necessary for inclusivity.
                Cathy: I agree. And we have the success of the 'Smart Lamppost' pilot to back us up. Bob, what did Doc 1 say about the traffic flow?
                Bob: It's impressive. In the zones where the lamppost sensors are fully active, there's been a 20% improvement in traffic flow during peak hours. People aren't stopping and starting as much because they know exactly where to go.
                Alice: Perfect. So, our core pitch is: a 15% city-wide emission reduction, the $200,000 funding request for accessibility kiosks, and the September expansion into air quality monitoring. 
                Cathy: And don't forget the 'Auto-Pay' feature. That's a huge selling point for the logistics companies.
                Bob: Right. It uses license plate recognition, similar to the tunnels, so there's no need to queue at the exit or fumble with an Octopus card. 
                Alice: Good point. Let's make that our closing slide. It eliminates the physical bottleneck at the exit, which further reduces idling and pollution.
            `,
            marking_key: [
                "Project: Smart City Innovation (Kowloon East)",
                "Problem: 45% of traffic caused by parking search",
                "Technology: 1,200 IoT sensors in 15 car parks",
                "Solution: 'Pulse' App with 3-second real-time updates",
                "Feature 1: 30-minute advance reservation",
                "Feature 2: Auto-Pay (License plate recognition)",
                "Accessibility: Voice-Guided Kiosks for digital literacy",
                "Expansion: Smart Lampposts for air quality monitoring (September)",
                "Budget Request: $200,000 for kiosk hardware",
                "Environmental Goal: 15% reduction in carbon emissions",
                "Operational Success: 20% improvement in traffic flow (Doc 1)"
            ],
            writing_task: {
                format: "Proposal",
                Instruction: "Write a proposal to the District Council recommending the expansion of the 'Smart District' IoT program. Summarize the benefits of the Pulse app, explain the kiosk solution for older drivers, and justify the $200,000 funding request.",
                word_count: "200-250"
            },
            data_file: [
                { id: "doc1", type: "report", title: "Interim Traffic Study", content: "Neighborhoods with IoT parking sensors saw a 20% reduction in congestion. Average search time for parking dropped from 12 minutes to 4 minutes." },
                { id: "doc2", type: "survey", title: "Driver Feedback Summary", content: "60% of drivers over age 55 find mobile apps 'intimidating'. 85% would prefer a physical kiosk interface at the venue." }
            ],
            notetaking_fields: [
                { id: "nt1", label: "Parking Problem & Tech", placeholder: "45% congestion, 1.2k sensors, 3-sec updates..." },
                { id: "nt2", label: "App & Kiosks", placeholder: "30-min reservation, voice-guided kiosks..." },
                { id: "nt3", label: "Environmental & Budget", placeholder: "15% emission reduction, $200k request..." }
            ]
        }
    },
    {
        id: "listening_mission_7",
        title: "Social Media Ethics",
        topic: "Digital Citizenship",
        level: "DSE Standard",
        sprint_data: {
            audio_transcript: `
                Speaker: Good afternoon, students and teachers. Thank you for joining our weekly assembly. Today's workshop is a critical one, titled 'Navigating the Digital Footprint'. In an era where everything we do is logged and tracked, understanding your online presence is no longer optional—it's a survival skill.
                
                I want to start with some sobering statistics. A recent large-scale study conducted by the Cyber-Safety Alliance found that 75% of hiring managers and recruiters now explicitly screen a candidate's social media accounts as part of the standard background check. They aren't just looking at your LinkedIn; they are looking at your Instagram, your TikTok, and your old Facebook posts. 
                
                Surprisingly, the study also revealed that 1 in 3 applicants are rejected purely due to 'unprofessional online behavior'. This doesn't just mean illegal activities. It includes making aggressive comments in public forums, sharing unverified information that turns out to be false, or even just posting disparaging remarks about former teachers or employers.
                
                To address this, we are launching our 'Ethics in Action' week starting on November 10th. Mark that on your calendars. The centerpiece of this week is the 'Check-Before-You-Post' campaign. We want everyone to adopt the '3-Step Verification rule' before uploading anything to a public profile. 
                
                Step one: Always check the source URL. Is it a legitimate news organization or a random blog with no accountability? Step two: Cross-reference the claim with at least two reputable news sites. If only one obscure site is reporting it, it's likely fake. And step three: Consider the perspective—is the post biased, or is it phrased in a way that's deliberately inflammatory?
                
                During this week, you'll have the opportunity to sign the 'Digital Integrity' pledge. This will be available in the school hall during the lunch break. All participants will receive a 'Cyber-Smart' badge for their uniform and, perhaps more importantly, gain access to an exclusive webinar with a prominent Data Privacy lawyer. That will be held this coming Friday at 4 PM sharp.
            `,
            tasks: [
                {
                    id: "recruitment_table",
                    type: "TABLE",
                    label: "Digital Impact Stats",
                    headers: ["Category", "Percentage", "Implication"],
                    rows: [
                        { label: "Recruiters screening social media", answer: "75%", placeholder: "Percentage?" },
                        { label: "Applicants rejected for behavior", answer: "1 in 3", placeholder: "Ratio?" },
                        { label: "Campaign Start Date", answer: "November 10th", placeholder: "When?" }
                    ]
                },
                {
                    id: "verification_list",
                    type: "LIST",
                    label: "3-Step Verification Rule",
                    items: [
                        { label: "Step 1", answer: "Check the source URL", placeholder: "Action?" },
                        { label: "Step 2", answer: "Cross-reference (2+ sites)", placeholder: "Action?" },
                        { label: "Step 3", answer: "Consider Perspective/Bias", placeholder: "Action?" }
                    ]
                }
            ]
        },
        integrated_data: {
            audio_transcript: `
                Alice: Hi Bob, hi Cathy. Thanks for meeting me during the break. We really need to get the 'Social Media Ethics' guide finished so it can be included in the next printing of the student handbook. 
                Bob: I've been going through the data from Doc 1, the Campus Wellness Audit. It's quite concerning. Cyberbullying reports have increased by 12% among the junior students just in the last semester.
                Cathy: 12%? That's quite a jump. We definitely need a dedicated 'Reporting Protocol' section. 
                Alice: What should the steps be?
                Cathy: I think the most effective method is the 'Mute, Block, and Save' strategy. If a student sees harassment, they should Mute the conversation, Block the individual, and most importantly, Save the Evidence—take screenshots before the messages are deleted.
                Bob: That's solid. But we also need to address the emotional side of it. 
                Alice: You mean the '24-Hour Cool-Down' rule?
                Bob: Precisely. We need to tell students: don't reply to a nasty comment when you're angry. Wait a full day. Usually, the urge to fight back fades, and you avoid escalating the situation.
                Cathy: Good point. And then there's the privacy issue. If you look at Doc 2, it says 40% of our students still have their location settings set to 'public' by default. They are literally broadcasting where they are at all times.
                Alice: That's a massive security risk. Let's add a 'Privacy Audit' checklist to the guide. We should highlight how to disable geolocation and how to enable tag-approval settings so others can't post photos of you without your permission.
                Bob: So, just to recap the guide's structure: the risks of your digital footprint, the 3-Step Verification for news, the 24-hour cool-down, the Reporting Protocol, and the Privacy Audit. 
                Cathy: Sounds comprehensive. Let's aim to have the first draft ready by Wednesday.
            `,
            marking_key: [
                "Theme: Social Media Ethics & Digital Citizenship",
                "Data: 75% of recruiters screen online profiles",
                "Warning: 1 in 3 rejected for unprofessional posts",
                "Procedure: 3-Step Verification (Source, Cross-ref, Bias)",
                "School Rule: 24-Hour Cool-Down before responding to conflict",
                "Privacy Focus: Disabling Geolocation (Doc 2: 40% public risk)",
                "Reporting Routine: Mute, Block, and Save Evidence",
                "Ethics Week: Starts November 10th",
                "Webinar Opportunity: Friday at 4 PM with Privacy Lawyer",
                "Trend: 12% increase in junior cyberbullying cases (Doc 1)"
            ],
            writing_task: {
                format: "Guidebook Entry",
                instruction: "Draft a new entry for the Student Handbook titled 'Social Media & You'. Summarize the professional risks of a digital footprint, provide the 3-step verification rule, and outline the school's 'Safe Reporting' protocol.",
                word_count: "200-250"
            },
            data_file: [
                { id: "doc1", type: "report", title: "Campus Wellness Audit", content: "Surveys indicate a 12% rise in social media harassment incidents among Form 1 and 2 students. 50% of victims do not know how to save evidence for reporting." },
                { id: "doc2", type: "infographic", title: "Privacy Leakage Stats", content: "- Default Public Accounts: 40%<br/>- Location Tagging (Active): 65%<br/>- Strong Passwords Used: Only 30%" }
            ],
            notetaking_fields: [
                { id: "nt1", label: "Digital Risks", placeholder: "75% screening, 1 in 3 rejection, behavior issues..." },
                { id: "nt2", label: "Verification & Reporting", placeholder: "3-step rule, mute/block/save evidence..." },
                { id: "nt3", label: "Privacy & Campaigns", placeholder: "Geolocation risk, Ethics week Nov 10th..." }
            ]
        }
    },
    {
        id: "listening_mission_8",
        title: "E-Sports Tournament",
        topic: "Logistics & Promotion",
        level: "DSE Standard",
        sprint_data: {
            audio_transcript: `
                Speaker: Attention all students! I have some very exciting news to share regarding our extra-curricular calendar. Preparations for the 'Apex Inter-School E-Sports Tournament' are now officially underway. This is by far the largest gaming event we've ever hosted.
                
                I'm thrilled to announce that we have registered 24 schools from across Hong Kong, from Tuen Mun to Hong Kong Island. This means over 200 competitors will be converging on our venue. Speaking of which, the grand final will take place on December 20th. We've managed to book the state-of-the-art Cyberport Arena, which will provide a professional-grade experience for all finalists. 
                
                The tournament will cater to different playstyles, featuring two main categories. First, 'Team Strategy', which focuses on MOBA-style coordination. Second, 'Solo Speedrun', for those who pride themselves on individual mechanical skill and efficiency.
                
                Of course, an event of this scale requires a massive team. Logistically, we are looking for 50 student helpers to handle technical support and event coordination. If you're interested, you must attend the 'Network Stability' briefing this coming Monday at 4:30 PM in the IT lab. Miss that, and you won't be eligible to help.
                
                Once recruited, each helper will be assigned to a specific 'Zone'—there are 4 Zones in total, clearly color-coded. The 'Red Zone' will handle the hardware side, focusing on PC maintenance and troubleshooting. The 'Blue Zone' will be the creative hub, focusing on the shout-casting and the live-streaming production. The 'Green Zone' will be at the front, handling player registration and bracket updates. Finally, the 'Yellow Zone' will be responsible for crowd management and ensuring the spectators follow the safety rules.
                
                Our sponsors have been very generous this year, and the prize pool has been increased to $20,000 in scholarship grants for the top winners. But we want to recognize everyone; all participants will receive a 'Digital Certificate of Participation', which officially recognizes the teamwork and cognitive skills developed through competitive gaming.
            `,
            tasks: [
                {
                    id: "tournament_stats",
                    type: "TABLE",
                    label: "Event Overview",
                    headers: ["Category", "Quantity", "Venue/Date"],
                    rows: [
                        { label: "Registered Schools", answer: "24", placeholder: "Number?" },
                        { label: "Grand Final Date", answer: "December 20th", placeholder: "When?" },
                        { label: "Total Helpers needed", answer: "50", placeholder: "Staffing?" },
                        { label: "Prize Pool", answer: "$20,000", placeholder: "Grant amount?" }
                    ]
                },
                {
                    id: "zone_list",
                    type: "LIST",
                    label: "Helper Zones",
                    items: [
                        { label: "Red Zone", answer: "PC Maintenance", placeholder: "Duty?" },
                        { label: "Blue Zone", answer: "Casting & Live-streaming", placeholder: "Duty?" },
                        { label: "Green Zone", answer: "Player Registration", placeholder: "Duty?" },
                        { label: "Yellow Zone", answer: "Crowd Management", placeholder: "Duty?" }
                    ]
                }
            ]
        },
        integrated_data: {
            audio_transcript: `
                Alice: Hi everyone, let's get started. We have a lot of work to do for the 'Apex Tournament' promotion. Bob, you're in charge of the newsletter article, right?
                Bob: Yeah, I've been brainstorming. I think we need to fight the stereotype that gaming is just a waste of time. I found some great data in Doc 1. 
                Cathy: The cognitive study?
                Bob: Exactly. It shows that 65% of regular e-sports players reported significantly improved 'Strategic Planning' skills, which actually translated to better performance in their academic group projects.
                Alice: That's a great 'Academic Link' to highlight for parents. 
                Cathy: We also need to be responsible about health. Have you seen Doc 2? The 'Health Protocol' is quite strict.
                Alice: What does it mandate?
                Cathy: All players, regardless of how well they're doing, must take a mandatory 15-minute eye-rest for every 2 hours of play. No exceptions. We'll have 'wellness marshals' in the Yellow Zone enforcing this.
                Bob: Good. People need to see we take player wellbeing seriously. What about the prize money?
                Alice: The $20,000 scholarship is being sponsored by 'Tech-Forward HK'. It's a major endorsement. 
                Cathy: And I think we should emphasize the community aspect. The 'Open-to-Public' viewing party in the main hall. We're hoping to fill all 300 seats.
                Bob: I'll include that. And I'll remind students about the 'Network stability' briefing for helpers on Monday. We still need about 15 more people for the registration desks in the Green Zone.
                Alice: Perfect. Let's focus on the 'Inter-School' prestige as well. With 24 schools competing for the 'Innovator's Cup', it's going to be a historic day for the school. 
            `,
            marking_key: [
                "Event: Apex Inter-School E-Sports Tournament",
                "Grand Final: December 20th @ Cyberport Arena",
                "Scale: 24 schools participating",
                "Academic Benefit: 65% improvement in Strategic Planning (Doc 1)",
                "Health Rule: Mandatory 15-minute eye-rest every 2 hours (Doc 2)",
                "Prize: $20,000 scholarship from Tech-Forward HK",
                "Promotion: 'Open-to-Public' Viewing Party in main hall",
                "Staffing: 50 helpers across 4 color-coded Zones",
                "Helper Briefing: Monday at 4:30 PM (Network Stability)",
                "Certification: Digital Certificate for cognitive & teamwork skills"
            ],
            writing_task: {
                format: "Newsletter Article",
                instruction: "Write an article for the school newsletter promoting the E-Sports Grand Final. Explain the scale of the event, the educational benefits of gaming, the player health measures, and how students can get involved as helpers.",
                word_count: "200-250"
            },
            data_file: [
                { id: "doc1", type: "study", title: "Gaming & Cognitive Development", content: "A longitudinal study of 500 inter-school players showed a 65% correlation between competitive strategy gaming and high-level strategic planning skills in academic subjects." },
                { id: "doc2", type: "guideline", title: "Player Wellness Policy", content: "To prevent fatigue and 'Gamer Eye', all official competitions must enforce a 15-minute rest period for every 120 minutes of active gameplay. High-refresh-rate monitors will be used to reduce flicker." }
            ],
            notetaking_fields: [
                { id: "nt1", label: "Scale & Logistics", placeholder: "24 schools, Dec 20th, Cyberport, 50 helpers..." },
                { id: "nt2", label: "Health & Training", placeholder: "15-min eye rest, Monday 4:30 briefing..." },
                { id: "nt3", label: "Academic & Awards", placeholder: "Strategic planning skills, $20k scholarship..." }
            ]
        }
    },
    {
        id: "listening_mission_9",
        title: "Eco-Tourism in Sai Kung",
        topic: "Environmental Stewardship",
        level: "DSE Standard",
        sprint_data: {
            audio_transcript: `
                Speaker: Good morning, everyone. Welcome to the 'Green Sai Kung' guide training session. It's heartening to see so many young people interested in protecting our natural heritage. Today, we're focusing on the crown jewel of our district, the 'Geo-Park Heritage' route. 
                
                For context, the Hong Kong UNESCO Global Geopark is a massive area, spanning over 150 square kilometers. It's not just a park; it's a living geological record. Our primary focus today, and the main stop for the student tours, is the 'Basalt Columns' of High Island. These incredible hexagonal pillars are unique because of their scale and composition. Geologically speaking, they were formed roughly 140 million years ago from a massive volcanic eruption that cooled very slowly and evenly.
                
                As guides, your most important role isn't just reciting facts; it's enforcing 'Zero Impact' tourism. We want these students to enjoy the park without leaving a mark. First, we have a strict 'Carry-In, Carry-Out' policy. Every single candy wrapper or plastic bottle must be taken back to the city for proper disposal. There are no trash bins in the core protection zone.
                
                Second, we must insist on the 'No-Trace Trail' rule. Students must stick strictly to the paved or designated paths. Stepping off the trail for a 'shortcut' or a better photo leads to significant soil erosion and can destroy rare local flora. 
                
                In terms of logistics, our guided tours depart every hour on the hour from the Volcano Discovery Centre. We've found that large groups are disruptive, so each tour is strictly limited to 15 participants. This helps minimize noise pollution and ensures everyone can hear the guide clearly. 
                
                Finally, we have some new tools to help you. The 'Digital Explorer' app uses GPS to trigger educational audio clips automatically when the group reaches key rock formations. It's a great backup if you forget a specific detail. Also, please remind students that the 'Geo-Park Bus' service is not a daily service. It is only available on Saturdays and Sundays, running between 9:00 AM and 6:30 PM. Plan your return trips accordingly!
            `,
            tasks: [
                {
                    id: "geopark_table",
                    type: "TABLE",
                    label: "Geopark Overview",
                    headers: ["Feature", "Detail/Age", "Constraint"],
                    rows: [
                        { label: "Total Geopark Area", answer: "150 sq km", placeholder: "Size?" },
                        { label: "Age of Basalt Columns", answer: "140 million years", placeholder: "Age?" },
                        { label: "Tour Capacity limit", answer: "15 participants", placeholder: "Limit?" },
                        { label: "Departure Point", answer: "Volcano Discovery Centre", placeholder: "Where?" }
                    ]
                },
                {
                    id: "tourism_rules",
                    type: "LIST",
                    label: "Zero Impact Rules",
                    items: [
                        { label: "Rule 1", answer: "Carry-In, Carry-Out (all trash)", placeholder: "Waste rule?" },
                        { label: "Rule 2", answer: "No-Trace Trail (use paved paths)", placeholder: "Erosion rule?" },
                        { label: "Transport Constraint", answer: "Bus only Sat/Sun (9:00-18:30)", placeholder: "Transport timing?" }
                    ]
                }
            ]
        },
                integrated_data: {
            audio_transcript: `
                Alice: Hi Bob, Cathy. Let's finalize the 'Eco-Sai Kung' field trip itinerary. I've gathered the documents. Bob, did you see the coral report?
                Bob: Yeah, Doc 1 is quite enlightening. It says the local coral reefs in Sharp Island are finally showing signs of recovery after years of decline. But they are extremely sensitive to certain chemical sunscreens.
                Cathy: Right, I've seen that research. The chemicals like oxybenzone are toxic to the polyps. We must mandate that every student uses 'Reef-Safe' mineral-based sunblocks only. No spray-on chemical brands allowed.
                Alice: Good. It's a practical lesson in environmental ethics. And I want to include the 'Carbon Offset' tracker we used last year. 
                Cathy: The one where they calculate the footprint of their transport and lunch?
                Alice: Exactly. Students will track their bus distance and meal choices to calculate their 'Carbon Score'. The group with the lowest score wins a small prize.
                Bob: That's a great way to make it interactive. Speaking of meals, we need to address the 'Local Economy' aspect. Look at Doc 2. 
                Alice: The magazine article?
                Bob: Yes. It says 55% of visitors to Sai Kung now explicitly support local seafood restaurants that have committed to using only 'sustainable catch'. 
                Cathy: That's a great initiative. Why don't we book a 'Sustainable Seafood' lunch at the Sai Kung Waterfront? It supports the local fishermen who are following the rules.
                Alice: I love that idea. So, our schedule is: the basalt columns study in the morning (split into small groups of 15), the reef-safe snorkeling at Sharp Island, and then the sustainable lunch.
                Bob: And we need to remind them to take the Geo-Park bus back. Since it's a Saturday trip, it'll be running until 6:30 PM.
                Cathy: Perfect. I'll draft the parent permission letter with these points.
            `,
            marking_key: [
                "Destination: Hong Kong UNESCO Global Geopark (Sai Kung)",
                "Key Feature: 140-million-year-old Basalt Columns",
                "Logistics: Max 15 students per tour (Volcano Centre)",
                "Transport: Weekend-only Geo-Park Bus (9 AM - 6:30 PM)",
                "Conservation: 'Carry-In, Carry-Out' waste policy",
                "Biodiversity Rule: 'Reef-Safe' sunscreen only (Sharp Island recovery)",
                "Sustainability: 'Carbon Offset' tracking exercise",
                "Local Impact: Sustainable Seafood lunch at Waterfront (Doc 2)",
                "Rule: No-Trace Trail (Stick to paved paths)",
                "App: 'Digital Explorer' GPS-triggered audio guide"
            ],
            writing_task: {
                format: "Field Trip Proposal",
                instruction: "Write a proposal for a Science Committee field trip to Sai Kung. Detail the educational focus on geology, the strict conservation rules for students, and the 'Sustainable Lunch' plan to support the local economy.",
                word_count: "200-250"
            },
            data_file: [
                { id: "doc1", type: "warning", title: "Sharp Island Coral Alert", content: "Recent studies show a 25% recovery of 'Platygyra' corals. However, standard chemical sunscreens are toxic to these polyps. Visitors are urged to use mineral-based barriers." },
                { id: "doc2", type: "magazine", title: "The Green Plate: Sai Kung", content: "Sai Kung's 'Blue Fin' initiative has certified 15 waterfront restaurants. 55% of customers now explicitly request 'Sustainable Catch of the Day', reducing overfishing pressure." }
            ],
            notetaking_fields: [
                { id: "nt1", label: "Geopark Features", placeholder: "150 sq km, 140m yr old basalt, High Island..." },
                { id: "nt2", label: "Conservation Rules", placeholder: "Carry-in/Carry-out, Reef-safe sunblock..." },
                { id: "nt3", label: "Logistics & Sustainable Lunch", placeholder: "Max 15 per tour, weekend bus, waterfront lunch..." }
            ]
        }
    },
    {
        id: "listening_mission_10",
        title: "Startup Weekend",
        topic: "Entrepreneurship & Pitching",
        level: "DSE Standard",
        sprint_data: {
            audio_transcript: `
                Speaker: Welcome, everyone, to the annual 'Startup Weekend: Future Makers'. It's incredible to see so much innovative energy in one room. This year, we have 12 student teams who have passed the rigorous screening phase, and they're ready to try and turn their 'Garage Ideas' into viable, scalable businesses.
                
                For those of you new to the format, the event follows the world-renowned '54-Hour Model'. It's a high-pressure sprint. It started last night with the initial ideas, and it will culminate on Sunday evening when teams pitch their final MVPs—that's Minimum Viable Products—to a panel of real-word Venture Capitalists and industry experts.
                
                But what are the judges looking for? To win the coveted $50,000 'Seed Grant', teams must demonstrate excellence across three core criteria. First, 'Scalability'. We don't just want a small shop; we want an idea that can reach 10,000 users within a single year. Second, 'Social Impact'. Does your business solve a genuine community problem in Hong Kong, such as waste reduction or elderly care? And third, 'Technical Feasibility'. Is this something that can actually be built with current, existing technology, or is it just science fiction?
                
                To support you, the 'Founder's Lounge' is available 24/7 for brainstorming and late-night coding sessions. And don't miss the 'Design Thinking' workshop; that starts tomorrow morning at 10 AM right here in the main hall. We also have a team of 5 'Tech Mentors' roaming the venue. They are experts in full-stack development and are here specifically to help you with any coding bugs or API issues.
                
                Finally, a quick administrative reminder: you must submit your final 'Value Proposition' slide to the portal by 2 PM on Saturday. This is non-negotiable, as we need to prepare the pitch deck. Good luck, and may the best innovation win!
            `,
            tasks: [
                {
                    id: "startup_table",
                    type: "TABLE",
                    label: "Competition Framework",
                    headers: ["Component", "Duration/Figure", "Deadline"],
                    rows: [
                        { label: "Contest Model", answer: "54-Hour Model", placeholder: "Format?" },
                        { label: "Competing Teams", answer: "12", placeholder: "How many?" },
                        { label: "Seed Grant amount", answer: "$50,000", placeholder: "Prize?" },
                        { label: "Value Prop Deadline", answer: "2 PM Saturday", placeholder: "When?" }
                    ]
                },
                {
                    id: "criteria_list",
                    type: "LIST",
                    label: "Winning Criteria",
                    items: [
                        { label: "Criterion 1", answer: "Scalability (10k users in a year)", placeholder: "Growth?" },
                        { label: "Criterion 2", answer: "Social Impact (HK Community)", placeholder: "Benefit?" },
                        { label: "Criterion 3", answer: "Technical Feasibility", placeholder: "Execution?" }
                    ]
                }
            ]
        },
        integrated_data: {
            audio_transcript: `
                Alice: Hi Bob, Cathy. I'm just putting the finishing touches on the Startup Weekend summary report for the school board. Do you have a moment to review the key outcomes?
                Bob: Sure. I've been looking at the mentor feedback in Doc 2. There was a very clear trend this year.
                Cathy: Let me guess, Artificial Intelligence?
                Bob: Spot on. 'AI-Driven' startups got 40% more interest and follow-up requests from the mentors than any other category. 
                Cathy: It makes sense. That's why the winning team, 'Food-Save', was so successful. They used an AI algorithm to predict and reduce waste in local bakeries. 
                Alice: Exactly. They really nailed the 'Social Impact' criterion. And they'll be receiving the $50,000 seed grant. Do we know how they plan to spend it?
                Bob: They've been quite specific. The funds will be split between 'Cloud Server' hosting costs and the 'Legal Incorporation' fees required to start a limited company. 
                Cathy: That's a smart use of capital. But beyond the money, I think the networking was the biggest win. Have you seen Doc 1? 
                Alice: The participant survey?
                Cathy: Yes. 70% of founders actually cited 'Mentorship' as being more valuable to their long-term success than the prize money itself. 
                Bob: I'm not surprised. And we should mention that all 12 teams, not just the winner, are getting a 'Founder's Network' perk. 
                Alice: Is that the coworking arrangement?
                Bob: Yes. They've all been granted a free membership to the 'Impact Hub' coworking space for 6 months. It gives them a professional place to continue their work.
                Alice: Great. So the report will cover the 54-hour model, the AI trend, the $50,000 grant allocation, and the Impact Hub membership. 
                Cathy: Don't forget the 'Design Thinking' workshop from Saturday morning. It was the highest-rated session. 
                Alice: Good point. I'll add a paragraph on technical support as well; the 5 tech mentors were busy all weekend!
            `,
            marking_key: [
                "Event: Startup Weekend: Future Makers (54-Hour Model)",
                "Participants: 12 Teams (Final Pitch to VCs)",
                "Winner Focus: 'Food-Save' (AI waste reduction)",
                "Financials: $50,000 Seed Grant for Cloud/Legal costs",
                "Winner Benefit: 6-month membership to 'Impact Hub' (Doc 1)",
                "Trend: 40% increase in AI-driven startups (Doc 2)",
                "Criteria: Scalability, Social Impact, and Feasibility",
                "Staffing: 5 Tech Mentors (Roam hall for coding help)",
                "Insight: 70% of founders value mentorship over cash",
                "Phase: Design Thinking workshop (10 AM Saturday)"
            ],
            writing_task: {
                format: "Executive Summary",
                instruction: "Write an executive summary of the Startup Weekend for the Innovation Bureau. Explain the event's goals, the winning team's solution, how the $50,000 grant will be utilized, and the ongoing support provided to founders.",
                word_count: "200-250"
            },
            data_file: [
                { id: "doc1", type: "survey", title: "Participant Outcome Report", content: "70% of founders stated that networking was the 'Primary Advantage'. All finalists are now eligible for the 'Young Entrepreneur' tax rebate scheme." },
                { id: "doc2", type: "news", title: "Tech-Trends: Cyberport", content: "AI and machine-learning projects saw a 40% surge in mentor engagement. Startups focusing on 'Sustainable Food Supply' are now a priority for government grants." }
            ],
            notetaking_fields: [
                { id: "nt1", label: "Competition Format", placeholder: "54-hour model, 12 teams, VC panel..." },
                { id: "nt2", label: "Winner & Success Tips", placeholder: "Food-Save AI, 70% value mentorship..." },
                { id: "nt3", label: "Funding & Perks", placeholder: "$50k grant, cloud/legal use, Impact Hub..." }
            ]
        }
    }
];

async function seed() {
    console.log("--- Seeding Missions #006 - #010 ---");
    for (const m of missions) {
        try {
            await db.collection('question_bank').doc(m.id).set({
                ...m,
                type: "listening_mission",
                level: "DSE Standard",
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
