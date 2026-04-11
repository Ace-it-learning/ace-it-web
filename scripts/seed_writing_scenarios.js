const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../backend/data/genre_prompts.json');

const newPrompts = {
    "meta": {
        "description": "HKDSE Writing Lab 'Single-Screen Studio' Scenarios (2024-2026 Trends)",
        "version": "2.0"
    },
    "prompts": {
        "Letter to the Editor": [
            {
                "id": "lte_001",
                "title": "The Rise of Deepfakes",
                "topic": "Cyber-security & Social Ethics",
                "prompt": "Deepfake technology is becoming increasingly sophisticated and accessible. Write a letter to the editor of the Hong Kong Daily expressing your concerns about the impact of deepfakes on social trust and personal security. Suggest measures the government and public should take to address this issue.",
                "genre_blueprint": [
                    "Formal Salutation and Sign-off",
                    "Clear Statement of Purpose in Intro",
                    "Evidence-based arguments on societal impact",
                    "Constructive suggestions for reform",
                    "Persuasive and urgent tone"
                ],
                "checklist": [
                    "Defined what deepfakes are and their risks",
                    "Discussed the impact on social ethics/trust",
                    "Proposed at least two government-level solutions",
                    "Proposed one public-level awareness strategy",
                    "Used appropriate formal letter conventions"
                ]
            },
            {
                "id": "lte_002",
                "title": "Luxury vs. Living Space",
                "topic": "The ethics of 'nano-flats' in the property market",
                "prompt": "Hong Kong's property market is notorious for 'nano-flats'—apartments smaller than a parking space. Write a letter to the editor discussing the ethical implications of developers building such small units and the impact on the mental well-being of residents.",
                "genre_blueprint": [
                    "Formal Salutation",
                    "Strong opening hook regarding HK housing",
                    "Balanced but critical analysis of profit vs. ethics",
                    "Call to action for housing policy changes"
                ],
                "checklist": [
                    "Addressed the physical and mental impact of nano-flats",
                    "Critiqued the role of property developers",
                    "Suggested government intervention or space standards",
                    "Maintained a formal, civic-minded tone"
                ]
            }
        ],
        "Feature Article": [
            {
                "id": "art_001",
                "title": "'Mega-Event' Fatigue",
                "topic": "Balancing tourism with local resident quality of life",
                "prompt": "Hong Kong has hosted numerous 'Mega-Events' to boost tourism. While these benefit the economy, residents often complain about overcrowding and noise. Write a feature article for a local lifestyle magazine titled 'Beyond the Glitz: Reclaiming our Neighborhoods'.",
                "genre_blueprint": [
                    "Catchy Headline",
                    "Engaging Lead-in (Hook)",
                    "Multiple perspectives (Tourists vs. Residents)",
                    "Vivid descriptive language",
                    "Thought-provoking conclusion"
                ],
                "checklist": [
                    "Created a compelling headline",
                    "Balanced economic benefits with social costs",
                    "Included 'quotes' or anecdotes from stakeholders",
                    "Suggested a more sustainable event model",
                    "Used semi-formal, engaging register"
                ]
            },
            {
                "id": "art_002",
                "title": "The Silver Economy",
                "topic": "Tech innovations for HK’s aging population",
                "prompt": "With an aging population, the 'Silver Economy' is booming. Write a feature article exploring how technology (e.g., Gerontech) is transforming the lives of the elderly in Hong Kong and the opportunities it presents for the younger generation.",
                "genre_blueprint": [
                    "Informative Headline",
                    "Positive and forward-looking tone",
                    "Analysis of specific technological tools",
                    "Connection between tech and human care"
                ],
                "checklist": [
                    "Explained the concept of the Silver Economy",
                    "Gave examples of Gerontech (e.g., smart sensors, robots)",
                    "Discussed the career opportunities for youth",
                    "Balanced tech benefits with the importance of human touch"
                ]
            }
        ],
        "Debate Speech": [
            {
                "id": "deb_001",
                "title": "AI Tutors in DSE Prep",
                "topic": "The impact of LLMs on traditional learning",
                "prompt": "Motion: 'Artificial Intelligence tutors will inevitably replace human teachers in DSE preparation.' Write a debate speech arguing AGAINST the motion, focusing on the human elements of education.",
                "genre_blueprint": [
                    "Formal Salutation (Judges, Chairperson, etc.)",
                    "Clear stance in the introduction",
                    "Rebuttal of potential opposing arguments",
                    "Powerful persuasive closing statement"
                ],
                "checklist": [
                    "Defined the role of the teacher beyond data delivery",
                    "Addressed the limitations of AI (empathy, ethics)",
                    "Counter-argued the 'efficiency' argument of AI",
                    "Ended with a strong, memorable appeal"
                ]
            }
        ],
        "Proposal": [
            {
                "id": "prp_001",
                "title": "The 4-Day School Week",
                "topic": "Mental health and productivity reform in HK schools",
                "prompt": "Your school is considering a trial for a 4-day school week to improve student mental health. As the Chairperson of the Student Union, write a proposal to the Principal outlining the benefits and addressing potential academic concerns.",
                "genre_blueprint": [
                    "Title and Subject Heading",
                    "Objective/Rationale section",
                    "Proposed Implementation strategy",
                    "Anticipated challenges and solutions"
                ],
                "checklist": [
                    "Linked the proposal to student burnout statistics",
                    "Explained how the curriculum would be adjusted",
                    "Addressed parent concerns about caretaking/supervision",
                    "Included a timeline or trial period suggestion"
                ]
            },
            {
                "id": "prp_002",
                "title": "Animal-Friendly HK",
                "topic": "Allowing pets on public transport/MTR",
                "prompt": "Hong Kong is often criticized for being unfriendly to pet owners. Write a proposal to the Transport Department suggesting a trial scheme to allow pets on the MTR and buses during off-peak hours.",
                "genre_blueprint": [
                    "Formal Proposal Header",
                    "Evidence-based rationale (e.g., overseas examples)",
                    "Detailed trial conditions (e.g., carriers, hours)",
                    "Hygiene and safety protocols"
                ],
                "checklist": [
                    "Advocated for the benefits to pet owners' well-being",
                    "Proposed strict safety (leash/muzzle/carrier) rules",
                    "Suggested specific off-peak hours for the trial",
                    "Proposed a feedback mechanism for non-pet owners"
                ]
            },
            {
                "id": "prp_003",
                "title": "'Quiet Rooms' in Schools",
                "topic": "Addressing student burnout and exam stress",
                "prompt": "To combat exam stress, you want to propose the creation of 'Quiet Rooms'—dedicated spaces for meditation and rest. Write a proposal to the School Board requesting space and funding for this initiative.",
                "genre_blueprint": [
                    "Formal Header",
                    "Current problem statement (Student Stress)",
                    "Room design and usage policy",
                    "Budgetary requirements"
                ],
                "checklist": [
                    "Described the intended 'sensory-friendly' environment",
                    "Explained how usage would be regulated (to prevent misuse)",
                    "Linked the idea to long-term academic productivity",
                    "Requested a specific startup budget"
                ]
            },
            {
                "id": "prp_004",
                "title": "The Future of HK Canteens",
                "topic": "Replacing 'junk food' with traditional healthy meals",
                "prompt": "School canteens often serve unhealthy fried foods. Write a proposal to the School Management to revitalize the canteen menu with traditional, 'home-style' healthy Cantonese meals.",
                "genre_blueprint": [
                    "Formal Header",
                    "Nutritional analysis of current food",
                    "Proposed sample menu items",
                    "Vendor selection/training plan"
                ],
                "checklist": [
                    "Identified the link between diet and student alertness",
                    "Provided examples of traditional 'healthy' alternatives",
                    "Addressed potential cost or preparation time issues",
                    "Suggested a 'Tasting Day' to gather student buy-in"
                ]
            }
        ],
        "Business Pitch": [
            {
                "id": "pit_001",
                "title": "Reviving the 'Night Vibes'",
                "topic": "Modernizing HK’s traditional night markets",
                "prompt": "The government's 'Night Vibes Hong Kong' campaign needs fresh ideas. You are an entrepreneur pitching a plan to revitalize a traditional night market (e.g., Temple Street) using modern technology and youth-oriented culture. Write your pitch.",
                "genre_blueprint": [
                    "Compelling Vision Statement",
                    "Target Audience Analysis (Youth/Gen Z)",
                    "Unique Selling Proposition (Tech-Integration)",
                    "Monetization and sustainability"
                ],
                "checklist": [
                    "Integrated components like AR/Digital Art into the market",
                    "Suggested ways to support local traditional craftsmen",
                    "Proposed youth-friendly 'Instagrammable' installations",
                    "Addressed crowd management and noise issues"
                ]
            }
        ],
        "Blog Post": [
            {
                "id": "blg_001",
                "title": "The Slasher Generation",
                "topic": "Pros/cons of multi-hyphenate freelance careers",
                "prompt": "More young people in Hong Kong are choosing to be 'Slashers' (e.g., Graphic Designer / Yoga Instructor / Barista). Write a blog post titled 'The Freedom and Fear of the Slash Life' to share your thoughts on this career trend.",
                "genre_blueprint": [
                    "Conversational, relatable title",
                    "Personal voice/anecdotes",
                    "Bullet points for readability",
                    "Call to action (e.g., comments/shares)"
                ],
                "checklist": [
                    "Defined what being a 'Slasher' entails",
                    "Discussed the freedom of schedule vs. financial instability",
                    "Shared a 'hypothetical' or personal routine",
                    "Offered advice for those considering this path"
                ]
            }
        ],
        "Editorial": [
            {
                "id": "edt_001",
                "title": "The Waste Charging Delay",
                "topic": "Government policy vs. public readiness",
                "prompt": "The implementation of the Waste Charging Scheme has been repeatedly delayed. Write an editorial for the school newspaper discussing whether the delay is a sign of practical caution or a failure of environmental leadership.",
                "genre_blueprint": [
                    "Stance-driven Headline",
                    "Strong 'We' voice of the editorial board",
                    "Analysis of the policy's history",
                    "Hard-hitting concluding verdict"
                ],
                "checklist": [
                    "Acknowledge the complexity of waste management",
                    "Argued for or against the delay with clear reasoning",
                    "Advocated for more public education efforts",
                    "Maintained a critical but constructive journalistic tone"
                ]
            }
        ],
        "Social Commentary": [
            {
                "id": "com_001",
                "title": "Digital Loneliness",
                "topic": "The irony of being 'connected' but lonely in HK",
                "prompt": "Despite the constant use of social media, many young Hong Kongers report feeling lonely. Write a social commentary piece for a youth magazine titled '10,000 Followers, 0 Real Friends'.",
                "genre_blueprint": [
                    "Provocative Title",
                    "Sociological analysis of current trends",
                    "Reflective and empathetic tone",
                    "A call for 'Slow Living' or 'Real Connection'"
                ],
                "checklist": [
                    "Analyzed the hollow nature of 'likes' and 'scrolling'",
                    "Linked social media addiction to mental health",
                    "Suggested ways to reclaim face-to-face interaction",
                    "Used irony or metaphors to highlight the digital/real gap"
                ]
            }
        ],
        "Memo": [
            {
                "id": "mem_001",
                "title": "Low-Altitude Economy",
                "topic": "Integrating delivery drones into HK's airspace",
                "prompt": "As a consultant for the Logistics Bureau, write a memo to the Secretary for Transport regarding the feasibility of 'Drone Delivery' in high-density districts like Mong Kok. Focus on safety and noise regulations.",
                "genre_blueprint": [
                    "Standard Memo Format (To, From, Date, Subject)",
                    "Objective, professional language",
                    "Clearly numbered points",
                    "Brief recommendations"
                ],
                "checklist": [
                    "Addressed the unique challenge of 'Skyline Density'",
                    "Proposed specific 'Drone Corridors' or altitudes",
                    "Suggested noise-reduction standards for drone tech",
                    "Outlined a 3-step 'Pilot Program' phase"
                ]
            }
        ],
        "Formal Letter": [
            {
                "id": "fml_001",
                "title": "The End of 'Ding Ding'?",
                "topic": "Preserving the iconic tramways vs. urban speed",
                "prompt": "There are suggestions to remove the Hong Kong Tramways to improve traffic speed in Central. Write a formal letter to the Antiquities and Monuments Office arguing for the preservation of the 'Ding Ding' as a living heritage.",
                "genre_blueprint": [
                    "Formal Salutation",
                    "Historical and cultural rationale",
                    "Refutation of the 'Traffic Efficiency' argument",
                    "Passionate but formal closing"
                ],
                "checklist": [
                    "Highlighted the tram's role in HK's identity since 1904",
                    "Argued that 'Speed' is not the only metric of living",
                    "Suggested modernizing the tram system instead of removal",
                    "Maintained a respectful, high-register tone"
                ]
            }
        ],
        "Argumentative Essay": [
            {
                "id": "arg_001",
                "title": "Esports as a DSE Subject",
                "topic": "Validating gaming as a professional discipline",
                "prompt": "Some argue that Esports should be offered as an elective subject in the DSE curriculum, while others see it as a distraction. Write an argumentative essay discussing both views and giving your own opinion.",
                "genre_blueprint": [
                    "Neutral Title",
                    "Balanced introduction (The Contention)",
                    "Logical body paragraphs (Pros vs. Cons)",
                    "Clear final stance in the conclusion"
                ],
                "checklist": [
                    "Discussed the cognitive and teamwork skills in Esports",
                    "Addressed the risks of sedentary behavior/health",
                    "Compared Esports to traditional Physical Education",
                    "Concluded with a balanced recommendation for curriculum"
                ]
            }
        ],
        "Narrative": [
            {
                "id": "nar_001",
                "title": "Vanishing Neon Signs",
                "topic": "A story told from the perspective of an old neon craftsman",
                "prompt": "Many neon signs in Hong Kong are being removed for safety reasons. Write a narrative story from the perspective of an elderly craftsman who is watching his final sign being taken down. Focus on memory and heritage.",
                "genre_blueprint": [
                    "Atmospheric Title",
                    "First-person perspective ('I')",
                    "Sensory imagery (smell, sound, light)",
                    "Emotional climax and resolution"
                ],
                "checklist": [
                    "Used vivid adjectives to describe the neon glow",
                    "Used flashbacks to the 'Golden Age' of Nathan Road",
                    "Evoked a sense of loss and acceptance",
                    "Ensured a strong narrative voice and arc"
                ]
            }
        ],
        "Report": [
            {
                "id": "rpt_001",
                "title": "Food Waste & AI",
                "topic": "Using tech to solve HK's landfill crisis",
                "prompt": "Your school's Eco-Club used an AI-powered waste tracker for its canteen for one month. Write a report for the School Management summarizing the data and recommending permanent implementation.",
                "genre_blueprint": [
                    "Formal Report Title",
                    "Terms of Reference & Introduction",
                    "Data-driven Findings section",
                    "Recommendations and Conclusion"
                ],
                "checklist": [
                    "Included specific 'stats' (e.g., 30% reduction in waste)",
                    "Explained how the AI tracker functions",
                    "Addressed the cost-effectiveness of the system",
                    "Recommended expanding the system to the staff lounge"
                ]
            }
        ],
        "Review": [
            {
                "id": "rev_001",
                "title": "Canto-pop Global Revival",
                "topic": "Analyzing the cultural impact of new HK music icons",
                "prompt": "Canto-pop is experiencing a 'Second Wave' of global popularity with new icons. Write a review of a recent Canto-pop concert or album, analyzing why it resonates with today's youth.",
                "genre_blueprint": [
                    "Engaging Review Title",
                    "Context of the musical artist/trend",
                    "Critical analysis of performance and lyrics",
                    "Final star-rating or recommendation"
                ],
                "checklist": [
                    "Identified unique themes in modern Canto-pop lyrics",
                    "Commented on the use of visual media and social platforms",
                    "Analyzed the 'Fandom Culture' in Hong Kong",
                    "Evaluated the production quality of the music"
                ]
            }
        ],
        "Leaflet/Guide": [
            {
                "id": "gui_001",
                "title": "Eco-Tourism in Sai Kung",
                "topic": "Balancing 'Instagrammable' spots with nature protection",
                "prompt": "Sai Kung's 'Instagrammable' spots are suffering from littering and erosion. Design a leaflet for visitors titled 'Take Only Photos, Leave Only Footprints: A Guide to Responsible Hiking'.",
                "genre_blueprint": [
                    "Attention-grabbing Header",
                    "Bullet points and short paragraphs",
                    "Directional and instructional tone ('Do's and Don'ts')",
                    "Contact info for reporting issues"
                ],
                "checklist": [
                    "Provided 5 'Golden Rules' for eco-hikers",
                    "Used persuasive language to encourage protection",
                    "Included a section on 'The Hidden Cost of the Perfect Photo'",
                    "Ensured a helpful, informative tone throughout"
                ]
            }
        ]
    }
};

fs.writeFileSync(filePath, JSON.stringify(newPrompts, null, 4));
console.log('Successfully seeded 20 new scenarios into genre_prompts.json');
